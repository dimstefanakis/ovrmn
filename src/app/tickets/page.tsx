import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { MetaTrackedAnchor } from "@/components/meta-tracked-anchor";
import { MetaTrackedLink } from "@/components/meta-tracked-link";
import { MetaViewContent } from "@/components/meta-view-content";

export const metadata: Metadata = {
  title: "OVRMN | Support Tickets",
  description:
    "Automate repetitive support tickets, reply with real context, and escalate the tricky ones with the full story attached.",
};

const channels = [
  {
    title: "Email",
    desc: "Handles repetitive support emails, drafts replies, and keeps the thread moving.",
  },
  {
    title: "Chat",
    desc: "Resolves fast questions in chat and escalates when the conversation needs deeper context.",
  },
  {
    title: "Help Desk",
    desc: "Fits into your existing ticket workflow instead of asking the team to learn a new one.",
  },
  {
    title: "Internal Channels",
    desc: "Loops in engineering or ops through Slack with the ticket, context, and likely cause attached.",
  },
];

const capabilities = [
  {
    title: "Reads the Whole Case",
    desc: "New message, past thread, account context, product history, internal docs.",
  },
  {
    title: "Finds the Real Answer",
    desc: "Pulls from your knowledge base, past tickets, recent deploys, CRM, and live product data.",
  },
  {
    title: "Replies or Escalates",
    desc: "Sends the customer response when the answer is clear. Escalates to the right person when it is not, with context attached.",
  },
  {
    title: "Learns Every Resolution",
    desc: "Every correction improves the next reply. Edge cases become standard behavior.",
  },
];

const steps = [
  {
    title: "Discovery",
    body: "We read your past tickets, docs, and team conversations. What your best reps know becomes operational memory.",
  },
  {
    title: "Automation",
    body: "The agent starts handling repetitive tickets across your support channels. Reading context, drafting replies, routing issues, and keeping work moving.",
  },
  {
    title: "Learning",
    body: "When a human needs to step in, it escalates with the answer trail. Every resolution sharpens the next one.",
  },
];

const useCases = [
  {
    label: "Billing & Account Questions",
    title:
      "Invoices, renewals, seat changes, and common plan confusion handled without the back-and-forth.",
  },
  {
    label: "Access & Permissions",
    title:
      "Login issues, invites, exports, setup blockers, and the repetitive tickets your team sees every week.",
  },
  {
    label: "Product Issues & Escalation",
    title:
      "Bug reports triaged, likely causes assembled, and engineering looped in with the right context.",
  },
];

export default function TicketsPage() {
  const bgPath = "/bg.webp";
  const portraitPath = "/alexander.webp";
  const supportFlowVideoPath = "/support-flow-web.mp4";
  const supportFlowPosterPath = "/support-flow-poster.jpg";

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-black selection:bg-white selection:text-black">
      <MetaViewContent
        contentCategory="Landing page"
        contentName="OVRMN tickets page"
      />

      <nav className="fixed top-0 z-40 w-full border-b border-white/[0.05] bg-black/20 px-6 py-6 backdrop-blur-md md:px-12">
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-white" />
            <span className="font-mono text-xs tracking-[0.15em] uppercase">
              ovrmn
            </span>
          </div>
          <div className="hidden justify-self-center gap-12 font-mono text-[10px] tracking-[0.15em] uppercase text-white/60 md:flex">
            <a href="#channels" className="transition-colors hover:text-white">
              Channels
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-white">
              How It Works
            </a>
            <a href="#use-cases" className="transition-colors hover:text-white">
              What It Handles
            </a>
          </div>
          <MetaTrackedLink
            className="group justify-self-end flex items-center gap-2 border border-white/20 px-5 py-2 font-mono text-[10px] tracking-wider uppercase transition-all hover:bg-white hover:text-black"
            customData={{
              content_category: "Navigation",
              content_name: "Book a demo - tickets",
            }}
            eventName="InitiateCheckout"
            href="/book"
          >
            Get Free Pilot
            <ArrowUpRight className="h-3 w-3" />
          </MetaTrackedLink>
        </div>
      </nav>

      <section className="relative flex h-screen max-h-[900px] min-h-[700px] flex-col items-center justify-center overflow-hidden px-6 text-center md:px-12">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <Image
            src={bgPath}
            alt="Intelligence Observatory"
            fill
            priority
            sizes="100vw"
            className="object-cover grayscale contrast-110 opacity-80"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div
            className="reveal-up flex items-center gap-4 font-mono text-[10px] tracking-[0.2em] uppercase text-white/70"
            style={{ animationDelay: "100ms" }}
          >
            <div className="h-2 w-2 bg-white" />
            <span>Support tickets, automated</span>
          </div>

          <h1
            className="reveal-up mt-6 font-serif text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-6xl xl:text-7xl"
            style={{ animationDelay: "300ms" }}
          >
            Resolve support tickets in seconds. <br />
            <span className="italic font-light opacity-80">
              Escalate the hard ones with context.
            </span>
          </h1>

          <p
            className="reveal-up mt-6 max-w-2xl text-lg font-light leading-relaxed text-white/80 md:text-xl"
            style={{ animationDelay: "500ms" }}
          >
            ovrmn learns from your past tickets, docs, Slack threads, and
            product data. Then it handles repetitive tickets automatically and
            routes the tricky ones to the right person with the full story.
          </p>

          <div
            className="reveal-up mt-10 flex flex-col items-center gap-6 sm:flex-row"
            style={{ animationDelay: "700ms" }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                <MetaTrackedLink
                  className="inline-flex h-16 min-w-[240px] items-center justify-center border border-white bg-white px-8 font-mono text-[10px] tracking-[0.15em] uppercase text-black transition-all hover:bg-transparent hover:text-white"
                  customData={{
                    content_category: "Hero",
                    content_name: "Get your free pilot - tickets",
                  }}
                  eventName="InitiateCheckout"
                  href="/book"
                >
                  Get Your Free Pilot
                </MetaTrackedLink>
                <a
                  className="hidden h-16 items-center gap-4 px-8 font-mono text-[10px] tracking-[0.15em] uppercase text-white/60 transition-all hover:text-white sm:flex"
                  href="#how-it-works"
                >
                  See How It Works
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/30">
                Built on your ticket history. Pay only if it works.
              </span>
            </div>
          </div>
        </div>

        <div
          className="reveal-up absolute bottom-12 left-1/2 -translate-x-1/2 text-center"
          style={{ animationDelay: "900ms" }}
        >
          <div className="mb-2 font-mono text-[9px] tracking-[0.2em] uppercase text-white/40">
            Email / Chat / Help Desk / Slack / Custom
          </div>
          <div className="mx-auto h-px w-32 bg-white/20" />
        </div>
      </section>

      <section
        id="channels"
        className="border-y border-white/[0.05] bg-black px-6 py-32 md:px-12 md:py-40"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,520px)] xl:items-start">
            <div className="max-w-4xl">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">
                Channels
              </span>
              <h2 className="mt-8 font-serif text-5xl leading-tight md:text-7xl">
                Works inside the channels <br />
                <span className="italic font-light text-white/70">
                  you already support.
                </span>
              </h2>
              <p className="mt-10 max-w-2xl text-xl font-light leading-relaxed text-white/70 md:text-2xl">
                ovrmn does not ask your team to move support into a new tool. It
                reads incoming tickets where they already arrive, replies in the
                right place, and pulls in the right people when a human needs to
                step in.
              </p>
              <p className="mt-8 font-mono text-[10px] tracking-[0.18em] uppercase text-white/35">
                No new inbox. No new workflow.
              </p>
            </div>

            <div className="grid gap-px bg-white/[0.05] sm:grid-cols-2">
              {channels.map((channel) => (
                <div
                  key={channel.title}
                  className="group bg-black p-8 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="mb-5 font-mono text-[10px] tracking-[0.18em] uppercase text-white/35">
                    {channel.title}
                  </div>
                  <p className="max-w-xs text-base font-light leading-relaxed text-white/70">
                    {channel.desc}
                  </p>
                  <div className="mt-8 h-px w-8 bg-white/20 transition-all duration-500 group-hover:w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="thesis"
        className="border-y border-white/[0.05] bg-black px-6 py-60 md:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-24 lg:grid-cols-2 lg:items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-[3/4] w-full max-w-lg overflow-hidden border border-white/[0.1] bg-white/[0.02]">
                <Image
                  src={portraitPath}
                  alt="Portrait of support operator"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover grayscale contrast-125"
                />
                <div className="pointer-events-none absolute inset-0 dither-bg opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>
              <div className="absolute -bottom-6 -right-6 border border-white/10 bg-black px-6 py-3 font-mono text-[9px] tracking-[0.2em] uppercase text-white/60">
                Support Architecture // [ALPHA-V]
              </div>
            </div>

            <div className="order-1 space-y-12 lg:order-2">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">
                Thesis
              </span>
              <h2 className="max-w-3xl font-serif text-4xl leading-tight md:text-6xl lg:text-7xl">
                Your team already solved these tickets. <br />
                <span className="italic font-light">ovrmn makes it repeatable.</span>
              </h2>
              <div className="max-w-xl space-y-8">
                <p className="text-xl font-light leading-relaxed text-white/70 md:text-2xl">
                  Most support teams already have the answers. They are buried in
                  past tickets, internal docs, Slack threads, and in the heads
                  of your best reps. ovrmn turns that into an agent that can
                  actually reply, route, and follow through.
                </p>
                <p className="text-xl font-light leading-relaxed text-white/70 md:text-2xl">
                  Your team stops spending the day answering the same questions
                  and forwarding the same threads. Humans stay on the nuanced
                  tickets. The repetitive work gets absorbed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="bg-black px-6 py-60 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex w-full flex-col items-start gap-12 border-b border-white/[0.1] pb-24 text-center lg:text-left">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">
              Capabilities
            </span>
            <h2 className="font-serif text-5xl leading-tight md:text-8xl">
              What it actually does
            </h2>
          </div>

          <div className="mt-32 grid gap-24 md:grid-cols-2">
            {capabilities.map((item) => (
              <div
                key={item.title}
                className="group space-y-8 border-l border-white/10 pl-12 transition-colors hover:border-white"
              >
                <h3 className="font-serif text-3xl md:text-4xl">{item.title}</h3>
                <p className="max-w-md text-xl font-light leading-relaxed text-white/60">
                  {item.desc}
                </p>
                <div className="h-px w-8 bg-white/20 transition-all duration-500 group-hover:w-24" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex w-full min-h-[760px] items-center overflow-hidden border-t border-white/[0.05] bg-black px-6 py-32 md:min-h-[820px] md:px-12 md:py-36">
        <div className="absolute inset-0 z-0 h-full w-full opacity-80">
          <Image
            src="/forest.webp"
            alt="The Forest"
            fill
            sizes="100vw"
            priority
            className="object-cover object-center grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/20 to-black/60" />
          <div className="absolute inset-0 dither-bg opacity-20" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="grid gap-16 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,440px)] xl:items-start">
            <div className="max-w-4xl">
              <span
                className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/60"
                id="how-it-works"
              >
                How It Works
              </span>
              <h2 className="mt-8 font-serif text-5xl leading-tight md:text-7xl">
                Live in one week. <br />
                <span className="italic font-light opacity-80">
                  Backlog starts shrinking immediately.
                </span>
              </h2>

              <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="flex flex-col gap-4 border-l border-white/10 pl-6"
                  >
                    <span className="font-mono text-[10px] text-white/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h4 className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/80">
                      {step.title}
                    </h4>
                    <p className="text-sm font-light leading-relaxed text-white/60">
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full xl:justify-self-end">
              <div className="relative mx-auto w-full max-w-[440px]">
                <div className="absolute inset-0 translate-x-5 translate-y-5 border border-white/[0.06] bg-black/20" />
                <div className="relative border border-white/[0.14] bg-black/60 p-3 backdrop-blur-sm">
                  <div className="mb-3 flex items-center justify-between border border-white/[0.08] px-3 py-2">
                    <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/50">
                      Support Flow
                    </span>
                  </div>

                  <div className="relative aspect-square overflow-hidden border border-white/[0.08] bg-black">
                    <video
                      aria-label="Support flow product demonstration"
                      autoPlay
                      className="h-full w-full object-cover"
                      loop
                      muted
                      playsInline
                      poster={supportFlowPosterPath}
                      preload="metadata"
                    >
                      <source src={supportFlowVideoPath} type="video/mp4" />
                    </video>

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/55 to-transparent p-4">
                      <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/45">
                        Tickets • knowledge base • response • escalation
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 max-w-sm font-mono text-[10px] leading-relaxed tracking-[0.14em] uppercase text-white/35">
                    Real support flow. One agent reading the ticket, pulling
                    context, replying to the customer, and escalating
                    engineering when needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="use-cases"
        className="relative w-full border-t border-white/[0.1] bg-black px-6 py-32 md:px-12 md:py-48"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-12 border-b border-white/[0.1] pb-16 md:flex-row">
            <div>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">
                What It Handles
              </span>
              <h2 className="mt-6 font-serif text-4xl italic font-light md:text-6xl">
                Put it to work.
              </h2>
            </div>
          </div>

          <div className="mt-16 grid gap-px bg-white/[0.05] md:grid-cols-3">
            {useCases.map((item) => (
              <div
                key={item.label}
                className="group cursor-pointer bg-black p-16 transition-colors hover:bg-white/[0.02]"
              >
                <span className="mb-8 block font-mono text-[10px] uppercase tracking-widest text-white/30">
                  {item.label}
                </span>
                <h4 className="font-serif text-2xl leading-snug text-white/80 transition-all duration-500 group-hover:text-white group-hover:italic">
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex w-full min-h-[720px] flex-col items-center justify-center overflow-hidden bg-black px-6 py-28 text-center md:min-h-[760px] md:px-12 md:py-36">
        <div className="absolute inset-0 z-0 h-full w-full">
          <Image
            src="/mountains.webp"
            alt="Mountains"
            fill
            sizes="100vw"
            priority
            className="object-cover object-bottom grayscale contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/30" />
          <div className="absolute inset-0 dither-bg opacity-15" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-16 h-24 w-[1px] bg-white/20" />

          <h2 className="max-w-5xl font-serif text-6xl leading-tight md:text-8xl">
            You already solved these tickets once. <br />
            <span className="italic font-light text-white/60">
              ovrmn solves them every time.
            </span>
          </h2>

          <div className="mt-24 flex flex-col items-center gap-6">
            <MetaTrackedLink
              className="inline-flex h-20 min-w-[320px] items-center justify-center bg-white px-12 font-mono text-xs tracking-[0.2em] uppercase text-black transition-all hover:bg-neutral-200"
              customData={{
                content_category: "Closing CTA",
                content_name: "Get your free pilot - tickets",
              }}
              eventName="InitiateCheckout"
              href="/book"
            >
              Get Your Free Pilot
            </MetaTrackedLink>
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/30">
              We build it on your support history. You only pay if it works.
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.1] bg-black px-6 pb-20 pt-40 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-32 md:flex-row">
            <div className="space-y-12">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-white" />
                <span className="font-mono text-sm font-medium tracking-[0.2em] uppercase text-white">
                  ovrmn
                </span>
              </div>
              <p className="max-w-xs text-[10px] font-light uppercase tracking-[0.15em] text-white/40">
                Your sharpest support operator. Never sleeps. Never quits.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-24 md:gap-40">
              <div className="space-y-10">
                <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/80">
                  Connect
                </h5>
                <ul className="space-y-6 font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
                  <li>
                    <MetaTrackedAnchor
                      className="transition-colors hover:text-white"
                      customData={{
                        content_category: "Footer",
                        content_name: "Direct email - tickets",
                      }}
                      eventName="Contact"
                      href="mailto:admin@senec.ai"
                    >
                      admin@senec.ai
                    </MetaTrackedAnchor>
                  </li>
                </ul>
              </div>
              <div className="space-y-10">
                <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/80">
                  Company
                </h5>
                <ul className="space-y-6 font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
                  <li>
                    <a href="#channels" className="transition-colors hover:text-white">
                      Channels
                    </a>
                  </li>
                  <li>
                    <a
                      href="#how-it-works"
                      className="transition-colors hover:text-white"
                    >
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a href="#use-cases" className="transition-colors hover:text-white">
                      What It Handles
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-48 flex flex-col items-center justify-between border-t border-white/[0.05] pt-16 md:flex-row">
            <div className="mb-12 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 md:mb-0">
              OVRMN // AI TEAMMATES // 2026
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
