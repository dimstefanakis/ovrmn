"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Check, LoaderCircle, ArrowRight, ArrowLeft } from "lucide-react";
import {
  TEAM_OPTIONS,
  TEAM_SIZE_OPTIONS,
  TOOL_OPTIONS,
  type BookDemoFieldErrors,
  type TeamOption,
  type TeamSizeOption,
  type ToolOption,
  validateBookDemoSubmission,
  isValidEmail,
  isWorkEmail,
} from "@/lib/book-demo";
import {
  collectBookDemoAttribution,
  trackMetaCompleteRegistration,
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

type StepKey = keyof FormState;

const STEP_ORDER: StepKey[] = [
  "workEmail",
  "companyName",
  "team",
  "teamSize",
  "tools",
  "bottleneck",
];

const INITIAL_STATE: FormState = {
  workEmail: "",
  companyName: "",
  team: "",
  tools: [],
  teamSize: "",
  bottleneck: "",
};

const STEP_LABELS: Record<StepKey, string> = {
  workEmail: "Work Email",
  companyName: "Company Name",
  team: "Primary Team",
  teamSize: "Team Size",
  tools: "Daily Tools",
  bottleneck: "Operational Bottleneck",
};

const STEP_PROMPTS: Record<StepKey, string> = {
  workEmail: "What's your work email?",
  companyName: "What company are you with?",
  team: "Which team is this for?",
  teamSize: "How large is the team?",
  tools: "What tools do they use?",
  bottleneck: "Any specific bottleneck to solve?",
};

export function BookDemoFlow() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<BookDemoFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const currentStep = STEP_ORDER[stepIndex];
  const progress = ((stepIndex + 1) / STEP_ORDER.length) * 100;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [isSuccess, stepIndex]);

  const validateStep = useCallback((step: StepKey): string | undefined => {
    if (step === "workEmail") {
      if (!form.workEmail.trim()) return "Required";
      if (!isValidEmail(form.workEmail)) return "Invalid email";
      if (!isWorkEmail(form.workEmail)) return "Work email required";
    }
    if (step === "companyName") {
      if (!form.companyName.trim()) return "Required";
    }
    return undefined;
  }, [form]);

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

  const submitForm = useCallback(async () => {
    const validation = validateBookDemoSubmission(form);

    if (!validation.success) {
      setErrors(validation.errors);
      const firstErrorStep = STEP_ORDER.find((step) => validation.errors[step]);

      if (firstErrorStep) {
        setStepIndex(STEP_ORDER.indexOf(firstErrorStep));
      }

      return;
    }

    const eventId = createEventId();
    setIsSubmitting(true);
    setSubmitError("");

    try {
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

      trackMetaLead(eventId, {
        companyName: validation.data.companyName,
        team: validation.data.team,
        teamSize: validation.data.teamSize,
        tools: validation.data.tools,
      });
      trackMetaCompleteRegistration(eventId, {
        companyName: validation.data.companyName,
        email: validation.data.workEmail,
        team: validation.data.team,
        teamSize: validation.data.teamSize,
        tools: validation.data.tools,
      });
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
  }, [form]);

  const goNext = useCallback(() => {
    const error = validateStep(currentStep);
    if (error) {
      setErrors((prev) => ({ ...prev, [currentStep]: error }));
      return;
    }

    if (stepIndex < STEP_ORDER.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      void submitForm();
    }
  }, [currentStep, stepIndex, submitForm, validateStep]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  }, [stepIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !isSubmitting && !isSuccess) {
        if ((e.target as HTMLElement).tagName !== "TEXTAREA") {
          e.preventDefault();
          goNext();
        }
      }
      if (e.key === "Enter" && e.shiftKey && !isSubmitting && !isSuccess) {
        e.preventDefault();
        goBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goBack, isSubmitting, isSuccess]);

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
      
      {/* Progress Bar */}
      <div className="fixed left-0 top-0 z-50 h-1 w-full bg-white/5">
        <div 
          className="h-full bg-white transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-auto flex items-center justify-between">
          <Link
            className="inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.28em] uppercase text-white/78"
            href="/"
          >
            <span className="h-2.5 w-2.5 bg-white" />
            ovrmn
          </Link>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
            {String(stepIndex + 1).padStart(2, '0')} / {String(STEP_ORDER.length).padStart(2, '0')}
          </div>
        </header>

        <section className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-12">
          <div key={currentStep} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6 flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
              <span>{STEP_LABELS[currentStep]}</span>
              {["workEmail", "companyName"].includes(currentStep) && (
                <span className="text-[#ff9f9f]">* required</span>
              )}
            </div>
            
            <h1 className="font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              {STEP_PROMPTS[currentStep]}
            </h1>

            <div className="mt-12">
              {renderStepContent(currentStep)}
              {errors[currentStep] && (
                <p className="mt-4 animate-in fade-in slide-in-from-top-2 text-sm text-[#ff9f9f]">
                  {errors[currentStep]}
                </p>
              )}
            </div>

            <div className="mt-16 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <button
                  className="group flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 font-mono text-[10px] tracking-[0.2em] uppercase text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:opacity-20"
                  disabled={stepIndex === 0 || isSubmitting}
                  onClick={goBack}
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back
                </button>
                <button
                  className="group flex h-12 items-center justify-center gap-3 rounded-full bg-white px-8 font-mono text-[10px] tracking-[0.2em] uppercase text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  disabled={isSubmitting}
                  onClick={goNext}
                  type="button"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : stepIndex === STEP_ORDER.length - 1 ? (
                    <>
                      Finish
                      <Check className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>

              <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30">
                Press <span className="text-white/60">Enter</span> to continue
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-auto pt-12">
          {submitError && (
            <p className="mb-4 text-center text-sm text-[#ff9f9f]">{submitError}</p>
          )}
        </footer>
      </div>
    </main>
  );

  function renderStepContent(step: StepKey) {
    switch (step) {
      case "workEmail":
        return (
          <input
            autoFocus
            className="w-full border-b border-white/20 bg-transparent py-4 font-sans text-2xl text-white outline-none placeholder:text-white/10 focus:border-white transition-colors sm:text-4xl"
            onChange={(e) => setField("workEmail", e.target.value)}
            placeholder="you@company.com"
            type="email"
            value={form.workEmail}
          />
        );
      case "companyName":
        return (
          <input
            autoFocus
            className="w-full border-b border-white/20 bg-transparent py-4 font-sans text-2xl text-white outline-none placeholder:text-white/10 focus:border-white transition-colors sm:text-4xl"
            onChange={(e) => setField("companyName", e.target.value)}
            placeholder="Acme Inc."
            type="text"
            value={form.companyName}
          />
        );
      case "team":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            {TEAM_OPTIONS.map((opt) => (
              <button
                className={`flex h-16 items-center rounded-2xl border px-6 text-left transition-all ${
                  form.team === opt
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/[0.08]"
                }`}
                key={opt}
                onClick={() => setField("team", opt)}
                type="button"
              >
                <span className="font-sans text-lg">{opt}</span>
              </button>
            ))}
          </div>
        );
      case "teamSize":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            {TEAM_SIZE_OPTIONS.map((opt) => (
              <button
                className={`flex h-16 items-center rounded-2xl border px-6 text-left transition-all ${
                  form.teamSize === opt
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/[0.08]"
                }`}
                key={opt}
                onClick={() => setField("teamSize", opt)}
                type="button"
              >
                <span className="font-sans text-lg">{opt}</span>
              </button>
            ))}
          </div>
        );
      case "tools":
        return (
          <div className="flex flex-wrap gap-3">
            {TOOL_OPTIONS.map((tool) => {
              const active = form.tools.includes(tool);
              return (
                <button
                  className={`rounded-full border px-6 py-3 text-sm transition-all ${
                    active
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/[0.08]"
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
        );
      case "bottleneck":
        return (
          <textarea
            autoFocus
            className="min-h-[160px] w-full rounded-[2rem] border border-white/10 bg-white/5 p-8 font-sans text-xl text-white outline-none placeholder:text-white/10 focus:border-white/30 transition-colors"
            onChange={(e) => setField("bottleneck", e.target.value)}
            placeholder="Tell us about your biggest challenge... (optional)"
            value={form.bottleneck}
          />
        );
      default:
        return null;
    }
  }
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,255,130,0.06),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.03),transparent_40%)]" />
      <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:64px_64px]" />
    </div>
  );
}
