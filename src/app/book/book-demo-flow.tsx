"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Check, LoaderCircle, ArrowRight } from "lucide-react";
import {
  TEAM_OPTIONS,
  TEAM_SIZE_OPTIONS,
  TOOL_OPTIONS,
  type BookDemoFieldErrors,
  type TeamOption,
  type TeamSizeOption,
  type ToolOption,
  validateBookDemoSubmission,
} from "@/lib/book-demo";
import {
  collectBookDemoAttribution,
  trackMetaLead,
} from "@/lib/meta-browser";

type FormState = {
  workEmail: string;
  companyName: string;
  team: TeamOption | "";
  tools: ToolOption[];
  teamSize: TeamSizeOption | "";
  bottleneck: string;
};

const INITIAL_STATE: FormState = {
  workEmail: "",
  companyName: "",
  team: "",
  tools: [],
  teamSize: "",
  bottleneck: "",
};

export function BookDemoFlow() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<BookDemoFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [isSuccess]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setSubmitError("");
  }

  function toggleTool(tool: ToolOption) {
    setForm((current) => {
      const exists = current.tools.includes(tool);
      return {
        ...current,
        tools: exists
          ? current.tools.filter((entry) => entry !== tool)
          : [...current.tools, tool],
      };
    });
    setErrors((current) => ({ ...current, tools: undefined, form: undefined }));
    setSubmitError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    const validation = validateBookDemoSubmission(form);

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    const eventId = createEventId();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      trackMetaLead(eventId, {
        companyName: validation.data.companyName,
        team: validation.data.team,
        teamSize: validation.data.teamSize,
        tools: validation.data.tools,
      });

      const response = await fetch("/api/book-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validation.data,
          eventId,
          pageUrl: window.location.href,
          referrer: document.referrer || undefined,
          attribution: collectBookDemoAttribution(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; ok?: boolean }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "The booking form didn’t go through. Please try once more."
        );
      }

      setIsSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "The booking form didn’t go through. Please try once more."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <main className="relative min-h-screen bg-[#050505] text-[#f5f5f5]">
        <BookBackground />
        <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 py-12">
          <div className="w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-12">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 font-mono text-[10px] tracking-[0.28em] uppercase text-emerald-200">
              <Check className="h-3.5 w-3.5" />
              Signal Received
            </div>

            <h1 className="font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">
              We’ve got it. We’ll be in touch.
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-white/70">
              We’ll use <span className="text-white font-medium">{form.workEmail}</span> to
              follow up with next steps.
            </p>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 font-mono text-[11px] tracking-[0.22em] uppercase text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                href="/"
              >
                Back to site
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#050505] text-[#f5f5f5]">
      <BookBackground />
      <div className="relative mx-auto flex w-full max-w-3xl flex-col px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-16 flex items-center justify-between">
          <Link
            className="inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.28em] uppercase text-white/78"
            href="/"
          >
            <span className="h-2.5 w-2.5 bg-white" />
            ovrmn
          </Link>
        </header>

        <section className="mx-auto w-full max-w-xl">
          <div className="mb-12">
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Book a demo
            </h1>
            <p className="mt-4 text-lg text-white/60">
              Tell us a bit about your team and we’ll show you how OVRMN fits in.
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Core Fields */}
              <div className="grid gap-6">
                <FieldWrapper error={errors.workEmail} label="Work Email" required>
                  <input
                    className="w-full border-b border-white/20 bg-transparent py-2 font-sans text-lg text-white outline-none placeholder:text-white/20 focus:border-white transition-colors"
                    onChange={(e) => setField("workEmail", e.target.value)}
                    placeholder="you@company.com"
                    type="email"
                    value={form.workEmail}
                  />
                </FieldWrapper>

                <FieldWrapper error={errors.companyName} label="Company Name" required>
                  <input
                    className="w-full border-b border-white/20 bg-transparent py-2 font-sans text-lg text-white outline-none placeholder:text-white/20 focus:border-white transition-colors"
                    onChange={(e) => setField("companyName", e.target.value)}
                    placeholder="Acme Inc."
                    type="text"
                    value={form.companyName}
                  />
                </FieldWrapper>
              </div>

              {/* Optional Context */}
              <div className="grid gap-6 sm:grid-cols-2 pt-4">
                <FieldWrapper error={errors.team} label="Primary Team">
                  <select
                    className="w-full border-b border-white/20 bg-transparent py-2 font-sans text-lg text-white outline-none focus:border-white appearance-none transition-colors"
                    onChange={(e) => setField("team", e.target.value as TeamOption)}
                    value={form.team}
                  >
                    <option className="bg-[#050505]" value="">Select a team</option>
                    {TEAM_OPTIONS.map((opt) => (
                      <option className="bg-[#050505]" key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>

                <FieldWrapper error={errors.teamSize} label="Team Size">
                  <select
                    className="w-full border-b border-white/20 bg-transparent py-2 font-sans text-lg text-white outline-none focus:border-white appearance-none transition-colors"
                    onChange={(e) => setField("teamSize", e.target.value as TeamSizeOption)}
                    value={form.teamSize}
                  >
                    <option className="bg-[#050505]" value="">Select size</option>
                    {TEAM_SIZE_OPTIONS.map((opt) => (
                      <option className="bg-[#050505]" key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>
              </div>

              <div className="pt-4">
                <label className="mb-4 block font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
                  Daily Tools
                </label>
                <div className="flex flex-wrap gap-2">
                  {TOOL_OPTIONS.map((tool) => {
                    const active = form.tools.includes(tool);
                    return (
                      <button
                        className={`rounded-full border px-4 py-1.5 text-xs transition-all ${
                          active
                            ? "border-white bg-white text-black"
                            : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/30"
                        }`}
                        key={tool}
                        onClick={() => toggleTool(tool)}
                        type="button"
                      >
                        {tool}
                      </button>
                    );
                  })}
                </div>
                {errors.tools && (
                  <p className="mt-2 text-xs text-[#ff9f9f]">{errors.tools}</p>
                )}
              </div>

              <FieldWrapper error={errors.bottleneck} label="Operational Bottleneck">
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-base text-white outline-none placeholder:text-white/20 focus:border-white/30 transition-colors"
                  onChange={(e) => setField("bottleneck", e.target.value)}
                  placeholder="Tell us about your biggest challenge..."
                  value={form.bottleneck}
                />
              </FieldWrapper>
            </div>

            {submitError && (
              <p className="text-sm text-[#ff9f9f]">{submitError}</p>
            )}

            <button
              className="group flex h-14 w-full items-center justify-center gap-3 rounded-full bg-white px-8 font-mono text-[11px] tracking-[0.25em] uppercase text-black transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Sending
                </>
              ) : (
                <>
                  Send Request
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function FieldWrapper({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
        {label}
        {required && <span className="text-[#ff9f9f]">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-[#ff9f9f]">{error}</p>}
    </div>
  );
}

function createEventId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ovrmn_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function BookBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,255,130,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_40%)]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:64px_64px]" />
    </div>
  );
}
