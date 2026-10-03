"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
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
import s from "./waitlist.module.css";

const OpenWaitlist = createContext<(() => void) | null>(null);

export function WaitlistButton({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const open = useContext(OpenWaitlist);
  return (
    <button
      type="button"
      className={className}
      onClick={() => open?.()}
      aria-haspopup="dialog"
    >
      {children}
    </button>
  );
}

export function WaitlistProvider({
  children,
  countries,
}: {
  children: ReactNode;
  countries: PhoneCountry[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const submitting = useRef(false);
  const [country, setCountry] = useState<CountryCode>("GR");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  // listed: kept on the waitlist; checking → in: a spot was opened for them.
  const [stage, setStage] = useState<"form" | "listed" | "checking" | "in">(
    "form",
  );
  const [line, setLine] = useState<string | null>(null);
  const joined = stage !== "form";
  const [error, setError] = useState("");
  const selectedCountry = countries.find(
    (option) => option.country === country,
  )!;

  return (
    <OpenWaitlist.Provider value={() => dialog.current?.showModal()}>
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
          {stage === "in" && line ? (
            <>
              <a
                ref={(link) => link?.focus()}
                className={s.submit}
                href={
                  firstTextSmsUrl(line, exploreFirstText(navigator.language)) ??
                  undefined
                }
              >
                Text OVRMN
              </a>
              <p className={s.consent}>
                Or text{" "}
                {parsePhoneNumberFromString(line)?.formatInternational() ?? line}{" "}
                from your iPhone.
              </p>
            </>
          ) : stage === "checking" ? null : joined ? (
            <button
              ref={(button) => button?.focus()}
              type="button"
              className={s.submit}
              onClick={() => dialog.current?.close()}
            >
              Done
            </button>
          ) : (
            <form
              className="ph-no-capture"
              onSubmit={async (event) => {
                event.preventDefault();
                if (submitting.current) return;
                const normalized = normalizeWaitlistPhone(phone, country);
                if (!normalized) {
                  setError("Check your number and selected country.");
                  return;
                }
                submitting.current = true;
                setPending(true);
                setError("");
                try {
                  const query = new URL(window.location.href).searchParams;
                  const response = await fetch("/api/pt-waitlist", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                      phone: normalized,
                      consent: WAITLIST_CONSENT,
                      timezone:
                        Intl.DateTimeFormat().resolvedOptions().timeZone,
                      website: new FormData(event.currentTarget).get("website"),
                      attribution: Object.fromEntries(
                        WAITLIST_UTM_KEYS.map((key) => [key, query.get(key)]),
                      ),
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
                    return;
                  }
                  const result = await response.json();
                  if (result?.ok !== true)
                    throw new Error("signup_not_confirmed");
                  setPhone("");
                  if (typeof result.number === "string") {
                    // A beat of suspense before the spot opens.
                    setLine(result.number);
                    setStage("checking");
                    setTimeout(() => setStage("in"), 1400);
                  } else setStage("listed");
                } catch {
                  setError("Couldn’t confirm your request. Please try again.");
                } finally {
                  submitting.current = false;
                  setPending(false);
                }
              }}
            >
              <label htmlFor="waitlist-phone" className={s.label}>
                Phone number
              </label>
              <div className={s.phoneField}>
                <div className={s.countryPicker}>
                  <span className={s.countryDisplay} aria-hidden="true">
                    <span className={s.flag}>{selectedCountry.flag}</span>
                    <span>+{selectedCountry.callingCode}</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path
                        d="m1 1 4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.25"
                      />
                    </svg>
                  </span>
                  <select
                    id="waitlist-country"
                    name="country"
                    aria-label="Country calling code"
                    className={s.countrySelect}
                    value={country}
                    disabled={pending}
                    onChange={(event) => {
                      setCountry(event.target.value as CountryCode);
                      setError("");
                    }}
                  >
                    {countries.map((option) => (
                      <option key={option.country} value={option.country}>
                        {option.name} (+{option.callingCode}) {option.flag}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  id="waitlist-phone"
                  name="phone"
                  className={`${s.input} ph-mask`}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={selectedCountry.placeholder}
                  value={phone}
                  onChange={(event) => {
                    const value = event.target.value;
                    // Autofill/paste may include a country code even in a local-number field.
                    const international = normalizeWaitlistPhone(value);
                    const parsed = international
                      ? parsePhoneNumberFromString(international)
                      : undefined;
                    if (parsed?.country) {
                      setCountry(parsed.country);
                      setPhone(parsed.formatNational());
                    } else {
                      setPhone(value);
                    }
                    setError("");
                  }}
                  maxLength={48}
                  required
                  disabled={pending}
                  aria-invalid={Boolean(error)}
                  aria-describedby="waitlist-error"
                />
              </div>
              <div className={s.honeypot} aria-hidden="true">
                <label>
                  Website
                  <input
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>
              <p id="waitlist-error" className={s.error} role="alert">
                {error}
              </p>
              <button type="submit" className={s.submit} disabled={pending}>
                {pending ? "Requesting…" : "Request access"}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </OpenWaitlist.Provider>
  );
}
