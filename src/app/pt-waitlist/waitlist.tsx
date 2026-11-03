"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";
import { exploreFirstText, firstTextSmsUrl } from "../pt/first-text";
import {
  WAITLIST_CONSENT,
  WAITLIST_REQUEST_TIMEOUT_MS,
  WAITLIST_UTM_KEYS,
  normalizeWaitlistPhone,
} from "@/lib/pt-waitlist";
import type { PhoneCountry } from "./phone-countries";
import {
  collectPtAnalytics,
  inAppBrowser,
  trackLanding,
  trackPtLead,
} from "@/lib/pt-analytics";
import s from "./waitlist.module.css";

/** Until the visitor's IP country arrives (and wherever it's unknown) +1 is preselected: 94% of
 * visitors were in the US (Oct 2026). One tap or a pasted +number changes it. */
export const DEFAULT_COUNTRY: CountryCode = "US";

export type Placement = "hero" | "final" | "dialog";
type Stage = "form" | "listed" | "checking" | "in";

type Signup = {
  countries: PhoneCountry[];
  country: CountryCode | undefined;
  phone: string;
  pending: boolean;
  stage: Stage;
  line: string | null;
  error: string;
  setCountry: (country: CountryCode) => void;
  setPhone: (value: string) => void;
  started: (placement: Placement) => void;
  submit: (event: FormEvent<HTMLFormElement>, placement: Placement) => void;
  open: (placement: string) => void;
  close: () => void;
};

const SignupContext = createContext<Signup | null>(null);

export function WaitlistButton({
  children,
  className,
  placement = "button",
}: {
  children: ReactNode;
  className: string;
  placement?: string;
}) {
  const signup = useContext(SignupContext);
  return (
    <button
      type="button"
      className={className}
      onClick={() => signup?.open(placement)}
      aria-haspopup="dialog"
    >
      {children}
    </button>
  );
}

/** Shared signup state: the hero form, the closing form and the dialog all show the same request. */
export function WaitlistProvider({
  children,
  countries,
}: {
  children: ReactNode;
  countries: PhoneCountry[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const submitting = useRef(false);
  const startedOnce = useRef(false);
  const leadEvent = useRef<{ phone: string; id: string } | null>(null);
  // The page is static, so the server renders +1; the IP country (Vercel) then preselects the picker,
  // unless the visitor has already chosen a code or started typing. It's always visible and changeable.
  const [country, setCountryState] = useState<CountryCode | undefined>(DEFAULT_COUNTRY);
  const touched = useRef(false);
  const [phone, setPhoneState] = useState("");
  const [pending, setPending] = useState(false);
  // listed: kept on the waitlist; checking → in: a spot was opened for them.
  const [stage, setStage] = useState<Stage>("form");
  const [line, setLine] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/geo", { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { country?: unknown } | null) => {
        const guess = body?.country;
        if (touched.current || typeof guess !== "string") return;
        if (countries.some((option) => option.country === guess)) setCountryState(guess as CountryCode);
      })
      .catch(() => {
        /* Offline, blocked or aborted: +1 stays. */
      });
    return () => controller.abort();
  }, [countries]);

  const signup: Signup = {
    countries,
    country,
    phone,
    pending,
    stage,
    line,
    error,
    setCountry(next) {
      touched.current = true;
      setCountryState(next);
      setError("");
      trackLanding("signup_country_changed", { country: next });
    },
    setPhone(value) {
      if (value) touched.current = true;
      // Autofill/paste may include a country code even in a local-number field.
      const international = normalizeWaitlistPhone(value);
      const parsed = international
        ? parsePhoneNumberFromString(international)
        : undefined;
      if (parsed?.country) {
        if (parsed.country !== country)
          trackLanding("signup_country_changed", { country: parsed.country, via: "number" });
        setCountryState(parsed.country);
        setPhoneState(parsed.formatNational());
      } else {
        setPhoneState(value);
      }
      setError("");
    },
    started(placement) {
      if (startedOnce.current) return;
      startedOnce.current = true;
      trackLanding("signup_form_started", { placement });
    },
    open(placement) {
      trackLanding("landing_cta_clicked", { placement });
      dialog.current?.showModal();
    },
    close() {
      dialog.current?.close();
    },
    async submit(event, placement) {
      event.preventDefault();
      if (submitting.current) return;
      const normalized = normalizeWaitlistPhone(phone, country);
      if (!normalized) {
        const reason = !country && !/^\s*(?:\+|00)/.test(phone) ? "no_country" : "invalid_number";
        setError(
          reason === "no_country"
            ? "Choose your country code."
            : "Check your number and selected country.",
        );
        trackLanding("signup_validation_failed", { placement, reason });
        return;
      }
      submitting.current = true;
      setPending(true);
      setError("");
      try {
        if (leadEvent.current?.phone !== normalized) {
          leadEvent.current = { phone: normalized, id: crypto.randomUUID() };
        }
        const query = new URL(window.location.href).searchParams;
        const response = await fetch("/api/pt-waitlist", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            phone: normalized,
            consent: WAITLIST_CONSENT,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            website: new FormData(event.currentTarget).get("website"),
            attribution: Object.fromEntries(
              WAITLIST_UTM_KEYS.map((key) => [key, query.get(key)]),
            ),
            analytics: collectPtAnalytics(leadEvent.current.id),
          }),
          signal: AbortSignal.timeout(WAITLIST_REQUEST_TIMEOUT_MS),
        });
        if (!response.ok) {
          setError(
            response.status === 400
              ? "Check your number and selected country."
              : response.status === 429
                ? "A few too many attempts. Try again in a little while."
                : "We couldn’t save your request. Please try again.",
          );
          trackLanding("signup_submit_failed", { placement, status: response.status });
          return;
        }
        const result = await response.json();
        if (result?.ok !== true) throw new Error("signup_not_confirmed");
        if (typeof result.leadEventId === "string") trackPtLead(result.leadEventId);
        setPhoneState("");
        if (typeof result.number === "string") {
          // A beat of suspense before the spot opens.
          setLine(result.number);
          setStage("checking");
          trackLanding("signup_access_granted", { placement });
          setTimeout(() => setStage("in"), 1400);
        } else {
          setStage("listed");
          trackLanding("signup_listed", { placement });
        }
      } catch {
        setError("Couldn’t confirm your request. Please try again.");
        trackLanding("signup_submit_failed", { placement, status: "network" });
      } finally {
        submitting.current = false;
        setPending(false);
      }
    },
  };

  return (
    <SignupContext.Provider value={signup}>
      {children}
      <dialog
        ref={dialog}
        className={s.dialog}
        aria-labelledby="waitlist-title"
        aria-describedby="waitlist-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className={s.panel}>
          <span className={s.grabber} aria-hidden="true" />
          <button
            type="button"
            className={s.close}
            aria-label="Close"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
          <h2 id="waitlist-title">
            {stage === "in"
              ? "You’re in."
              : stage === "checking"
                ? "Checking for a spot…"
                : stage === "listed"
                  ? "You’re on the list."
                  : "What’s your number?"}
          </h2>
          <p id="waitlist-description" className={s.description}>
            {stage === "in"
              ? "A spot just opened up. Text OVRMN to get started."
              : stage === "checking"
                ? "One moment."
                : stage === "listed"
                  ? "We’ll text you when your spot is ready."
                  : "We’re opening access to a few people at a time."}
          </p>
          <SignupBody placement="dialog" />
        </div>
      </dialog>
    </SignupContext.Provider>
  );
}

/** The form on the page itself. Same words as the dialog, one tap shorter. */
export function PhoneForm({ placement }: { placement: Exclude<Placement, "dialog"> }) {
  const signup = useContext(SignupContext);
  if (!signup) return null;
  const { stage } = signup;
  return (
    <div className={s.inline} data-stage={stage} aria-live="polite">
      {stage === "form" ? null : (
        <div className={s.inlineStatus}>
          <p className={s.inlineTitle}>
            {stage === "in"
              ? "You’re in."
              : stage === "checking"
                ? "Checking for a spot…"
                : "You’re on the list."}
          </p>
          <p className={s.description}>
            {stage === "in"
              ? "A spot just opened up. Text OVRMN to get started."
              : stage === "checking"
                ? "One moment."
                : "We’ll text you when your spot is ready."}
          </p>
        </div>
      )}
      <SignupBody placement={placement} />
      {stage === "form" ? (
        <p className={s.note}>We’re opening access to a few people at a time.</p>
      ) : null}
    </div>
  );
}

function SignupBody({ placement }: { placement: Placement }) {
  const signup = useContext(SignupContext)!;
  const { countries, country, phone, pending, stage, line, error } = signup;
  const [copied, setCopied] = useState(false);
  const id = (name: string) => `${placement}-${name}`;
  const selectedCountry = countries.find((option) => option.country === country);

  if (stage === "checking")
    return (
      <div className={s.checking} role="status">
        <span />
        <span />
        <span />
      </div>
    );

  if (stage === "listed")
    return placement === "dialog" ? (
      <button
        ref={(button) => button?.focus()}
        type="button"
        className={s.submit}
        onClick={signup.close}
      >
        Done
      </button>
    ) : null;

  if (stage === "in" && line) {
    const formatted = parsePhoneNumberFromString(line)?.formatInternational() ?? line;
    const webview = inAppBrowser(navigator.userAgent);
    return (
      <div className={s.handoff}>
        <a
          ref={(link) => {
            if (placement === "dialog") link?.focus();
          }}
          className={s.submit}
          href={firstTextSmsUrl(line, exploreFirstText(navigator.language)) ?? undefined}
          onClick={() => trackLanding("text_ovrmn_clicked", { placement, in_app_browser: webview })}
        >
          <MessagesGlyph />
          Text OVRMN
        </a>
        <p className={s.consent}>
          Or text{" "}
          <button
            type="button"
            className={s.copy}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(formatted);
                setCopied(true);
                trackLanding("line_number_copied", { placement, in_app_browser: webview });
              } catch {
                /* The number stays visible to type by hand. */
              }
            }}
          >
            {formatted}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>{" "}
          from your iPhone.
        </p>
        {webview ? (
          <p className={s.consent}>
            If Messages doesn’t open from here, open this page in Safari.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      className={`${s.form} ph-no-capture`}
      onSubmit={(event) => signup.submit(event, placement)}
    >
      <label htmlFor={id("phone")} className={s.label}>
        Phone number
      </label>
      <div className={s.row}>
        <div className={s.phoneField}>
          <div className={s.countryPicker}>
            <span className={s.countryDisplay} aria-hidden="true">
              {selectedCountry ? (
                <>
                  <span className={s.flag}>{selectedCountry.flag}</span>
                  <span>+{selectedCountry.callingCode}</span>
                </>
              ) : (
                <span>Code</span>
              )}
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="m1 1 4 4 4-4" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </span>
            <select
              id={placement === "dialog" ? "waitlist-country" : id("country")}
              name="country"
              aria-label="Country calling code"
              className={s.countrySelect}
              value={country ?? ""}
              disabled={pending}
              aria-invalid={Boolean(error) && !country}
              aria-describedby={id("error")}
              onFocus={() => signup.started(placement)}
              onChange={(event) => signup.setCountry(event.target.value as CountryCode)}
            >
              <option value="" disabled>
                Choose country code
              </option>
              {countries.map((option) => (
                <option key={option.country} value={option.country}>
                  {option.name} (+{option.callingCode}) {option.flag}
                </option>
              ))}
            </select>
          </div>
          <input
            id={id("phone")}
            name="phone"
            className={`${s.input} ph-mask`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={selectedCountry?.placeholder ?? "Phone number"}
            value={phone}
            onFocus={() => signup.started(placement)}
            onChange={(event) => signup.setPhone(event.target.value)}
            maxLength={48}
            required
            disabled={pending}
            aria-invalid={Boolean(error)}
            aria-describedby={id("error")}
          />
        </div>
        <button type="submit" className={s.submit} disabled={pending}>
          {pending ? "Requesting…" : "Request access"}
        </button>
      </div>
      <div className={s.honeypot} aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p id={id("error")} className={s.error} role="alert">
        {error}
      </p>
    </form>
  );
}

function MessagesGlyph() {
  return (
    <span className={s.glyph} aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M16 6C9.4 6 4 10.1 4 15.2c0 3.1 2 5.8 5 7.5L7.8 27l5.5-2.7c.9.2 1.8.3 2.7.3 6.6 0 12-4.2 12-9.4S22.6 6 16 6Z"
          fill="white"
        />
      </svg>
    </span>
  );
}
