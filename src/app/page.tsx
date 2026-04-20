import Image from "next/image";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { MetaTrackedAnchor } from "@/components/meta-tracked-anchor";
import { MetaTrackedLink } from "@/components/meta-tracked-link";
import { MetaViewContent } from "@/components/meta-view-content";

const proofCompanies = [
  {
    name: "ProductLab",
    context:
      "Consumer transaction-data company with 150k+ panelists and 6M+ documents processed.",
  },
  {
    name: "Outperform",
    context:
      "Performance marketing agency with $100M+/year in managed paid media spend.",
  },
];

const proofCards = [
  {
    label: "ProductLab // support",
    title: "Support tickets resolved in minutes, not hours.",
    body: "Deployed across support, fraud detection, and engineering monitoring, with the agent reading the case, pulling context, and routing the right action forward.",
  },
  {
    label: "ProductLab // fraud + monitoring",
    title: "Fraud patterns surfaced and irregularities were caught before traditional alerts.",
    body: "Cross-system signals were turned into one operational brief so the team did not have to wait on fragmented tools to notice the problem.",
  },
  {
    label: "Outperform // ad monitoring",
    title: "$10k+ saved per incident caught early.",
    body: "The agent monitored campaign spend 24/7, flagged anomalies in real time, and removed the need for manual dashboard checks.",
  },
];

export default function Home() {
  const bgPath = "/bg.webp";
  const heroVideoPath = "/shader-lab-2026-04-20T18-58-13.webm";
  const coastPath = "/coast.webp";
  const portraitPath = "/alexander.webp";
  const roadPath = "/road.webp";
  const skyscraperPath = "/skyscraper.webp";
  const supportFlowVideoPath = "/support-flow-web.mp4";
  const supportFlowPosterPath = "/support-flow-poster.jpg";

  return (
    <main className="relative flex min-h-screen flex-col bg-black overflow-hidden selection:bg-white selection:text-black">
      <MetaViewContent
        contentCategory="Landing page"
        contentName="OVRMN homepage"
      />
      {/* Navigation Header - Monastic Minimal */}
      <nav className="fixed top-0 z-40 w-full border-b border-white/[0.05] bg-black/20 px-6 py-6 backdrop-blur-md md:px-12">
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-white" />
            <span className="font-mono text-xs tracking-[0.15em] uppercase">ovrmn</span>
          </div>
          <div className="hidden justify-self-center gap-12 font-mono text-[10px] tracking-[0.15em] uppercase text-white/60 md:flex">
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#teams" className="hover:text-white transition-colors">Teams</a>
          </div>
          <MetaTrackedLink
            className="group justify-self-end flex items-center gap-2 border border-white/20 px-5 py-2 font-mono text-[10px] tracking-wider uppercase transition-all hover:bg-white hover:text-black"
            customData={{
              content_category: "Navigation",
              content_name: "Book Free 7-Day Pilot",
            }}
            eventName="InitiateCheckout"
            href="/book"
          >
            Book Free Pilot
            <ArrowUpRight className="h-3 w-3" />
          </MetaTrackedLink>
        </div>
      </nav>

      {/* SECTION 1 — HERO SECTION — THE ECLIPSE */}
      <section className="relative flex h-screen min-h-[700px] max-h-[900px] flex-col items-center justify-center px-6 md:px-12 overflow-hidden text-center">
        {/* Background Artifacts — Increased visibility */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <video
            aria-hidden="true"
            autoPlay
            className="h-full w-full object-cover grayscale contrast-110 opacity-80"
            loop
            muted
            playsInline
            poster={bgPath}
            preload="auto"
          >
            <source src={heroVideoPath} type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="reveal-up flex items-center gap-4 font-mono text-[10px] tracking-[0.2em] uppercase text-white/70" style={{ animationDelay: "100ms" }}>
            <div className="h-2 w-2 bg-white" />
            <span>Your operations, automated</span>
          </div>

          <h1 className="reveal-up mt-6 font-serif text-4xl leading-[1.1] md:text-5xl lg:text-6xl xl:text-7xl tracking-tight" style={{ animationDelay: "300ms" }}>
            ovrmn learns how you operate. <br />
            <span className="italic font-light opacity-80">Then does the work.</span>
          </h1>

          <p className="reveal-up mt-6 max-w-xl text-lg font-light leading-relaxed text-white/80 md:text-xl" style={{ animationDelay: "500ms" }}>
            ovrmn is only as good as the knowledge behind it. It turns data you already have, tickets, docs, conversations, into operational intelligence it can act on.
          </p>

          <div className="reveal-up mt-10 flex flex-col items-center gap-6 sm:flex-row" style={{ animationDelay: "700ms" }}>
            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                <MetaTrackedLink
                  className="inline-flex h-16 min-w-[240px] items-center justify-center border border-white bg-white px-8 font-mono text-[10px] tracking-[0.15em] uppercase text-black transition-all hover:bg-transparent hover:text-white"
                  customData={{
                    content_category: "Hero",
                    content_name: "Book Free 7-Day Pilot",
                  }}
                  eventName="InitiateCheckout"
                  href="/book"
                >
                  Book Free 7-Day Pilot
                </MetaTrackedLink>
                <a
                  className="hidden sm:flex h-16 items-center gap-4 px-8 font-mono text-[10px] tracking-[0.15em] uppercase text-white/60 transition-all hover:text-white"
                  href="#how-it-works"
                >
                  See How It Works
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/30">Built on your data. Pay only if it works.</span>
            </div>
          </div>
        </div>

        {/* Abstract Metadata */}
        <div className="reveal-up absolute bottom-12 left-1/2 -translate-x-1/2 text-center" style={{ animationDelay: "900ms" }}>
          <div className="font-mono text-[9px] tracking-[0.2em] text-white/40 uppercase mb-2">
            Email / Chat / Slack / Custom
          </div>
          <div className="h-px w-32 bg-white/20 mx-auto" />
        </div>
      </section>

      {/* THESIS SECTION — THE PORTRAIT */}
      <section id="thesis" className="bg-black py-60 px-6 md:px-12 border-y border-white/[0.05]">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-24 lg:grid-cols-2 lg:items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[3/4] w-full max-w-lg bg-white/[0.02] border border-white/[0.1] relative overflow-hidden">
                <Image
                  src={portraitPath}
                  alt="Portrait of Sovereignty"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover grayscale contrast-125"
                />
                <div className="absolute inset-0 dither-bg opacity-40 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>
              <div className="absolute -bottom-6 -right-6 border border-white/10 bg-black px-6 py-3 font-mono text-[9px] tracking-[0.2em] uppercase text-white/60">
                Agent Architecture // [ALPHA-V]
              </div>
            </div>

            <div className="space-y-12 order-1 lg:order-2">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">Thesis</span>
              <h2 className="font-serif text-4xl leading-tight md:text-7xl">
                Your team already knows how. <br />
                <span className="italic font-light">ovrmn makes it repeatable.</span>
              </h2>
              <div className="space-y-8 max-w-xl">
                <p className="text-xl font-light leading-relaxed text-white/70 md:text-2xl">
                  Every business runs on knowledge that lives in people&apos;s heads. Which ticket goes where. What the process is. Who to loop in. ovrmn extracts that knowledge and turns it into automation.
                </p>
                <p className="text-xl font-light leading-relaxed text-white/70 md:text-2xl">
                  It shows up where your team works and picks up the load. Your people stop being expensive routers and start being the operators you hired them to be.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEMS — THE DOMAINS */}
      <section id="capabilities" className="py-60 px-6 md:px-12 bg-black">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-12 border-b border-white/[0.1] pb-24 text-center w-full lg:text-left">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">Capabilities</span>
            <h2 className="font-serif text-5xl leading-tight md:text-8xl">What it actually does</h2>
          </div>

          <div className="mt-32 grid gap-24 md:grid-cols-2">
            {[
              {
                title: "Remembers Everything",
                desc: "Corrected once, remembered forever. Every ticket, every shortcut, every edge case your team handles. The agent absorbs it and never forgets."
              },
              {
                title: "Works Where You Work",
                desc: "It lives where your team already works. No new tool to learn. They just talk to one that actually does things."
              },
              {
                title: "Pulls Real Data",
                desc: "Connected to your project tracker, CRM, data warehouse. The agent reads, writes, and acts on live data. Not cached summaries."
              },
              {
                title: "Teammate, Not Tool",
                desc: "It doesn't wait to be asked. It triages, logs, reports, and escalates. Then tells you what it did and why."
              }
            ].map((sys, i) => (
              <div key={i} className="group border-l border-white/10 pl-12 space-y-8 transition-colors hover:border-white">
                <h3 className="font-serif text-3xl md:text-4xl">{sys.title}</h3>
                <p className="text-xl font-light leading-relaxed text-white/60 max-w-md">{sys.desc}</p>
                <div className="h-px w-8 bg-white/20 group-hover:w-24 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE PROCESS — THE METHOD OF REFINEMENT — THE FOREST */}
      <section className="relative flex w-full min-h-[760px] items-center overflow-hidden border-t border-white/[0.05] bg-black px-6 py-32 md:min-h-[820px] md:px-12 md:py-36">
        <div className="absolute inset-0 z-0 w-full h-full opacity-80">
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
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/60" id="how-it-works">How It Works</span>
              <h2 className="mt-8 font-serif text-5xl leading-tight md:text-7xl">Live in one week. <br /><span className="italic font-light opacity-80">Learning forever.</span></h2>

              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  { title: "Discovery", body: "We read your tickets, docs, and conversations. Everything your team already wrote down. Unstructured knowledge becomes structured operational memory." },
                  { title: "Automation", body: "The agent shows up where your team works and starts moving things. Triaging, routing, reporting, flagging. The same things your team does, without the bottleneck." },
                  { title: "Learning", body: "Every correction sharpens it. Every new ticket teaches it. The agent gets better because it's in the middle of the work, not watching from the side." }
                ].map((step, i) => (
                  <div key={i} className="flex flex-col gap-4 border-l border-white/10 pl-6">
                    <span className="font-mono text-[10px] text-white/30">{String(i + 1).padStart(2, '0')}</span>
                    <h4 className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/80">{step.title}</h4>
                    <p className="text-sm font-light leading-relaxed text-white/60">{step.body}</p>
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
                    Real support flow. One agent reading context, replying to the customer, and escalating engineering in sequence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHIVE — FIELD NOTES FROM THE LAB */}
      <section id="teams" className="relative w-full py-32 md:py-48 px-6 md:px-12 bg-black border-t border-white/[0.1]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-12 border-b border-white/[0.1] pb-16 md:flex-row">
            <div>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">Teams</span>
              <h2 className="mt-6 font-serif text-4xl md:text-6xl italic font-light">Put it to work.</h2>
            </div>
          </div>

          <div className="mt-16 grid gap-px bg-white/[0.05] md:grid-cols-3">
            {[
              { date: "Engineering", title: "Your Monday standup question, answered before standup. Rollout broke something? Flagged. Task needs logging? Done. No SQL required." },
              { date: "Marketing", title: "The Monday morning report is already built. Budget anomaly flagged before anyone asks. The ops brain that runs while your team sleeps." },
              { date: "Support", title: "Resolve tier-1 tickets across every channel. First-response time drops from hours to seconds." }
            ].map((note, i) => (
              <div key={i} className="group bg-black p-16 transition-colors hover:bg-white/[0.02] cursor-pointer">
                <span className="font-mono text-[10px] tracking-widest text-white/30 uppercase mb-8 block">{note.date}</span>
                <h4 className="font-serif text-2xl leading-snug text-white/80 group-hover:text-white group-hover:italic transition-all duration-500">{note.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-black px-6 py-28 md:px-12 md:py-32">
        <div className="absolute inset-x-0 top-0 z-0 h-screen md:inset-0 md:h-auto">
          <Image
            src={roadPath}
            alt="Open road"
            fill
            sizes="100vw"
            className="object-cover object-center grayscale contrast-125 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/65" />
          <div className="absolute inset-0 dither-bg opacity-18" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-8 border-b border-white/[0.1] pb-16">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">
              Field Proof
            </span>
            <h2 className="font-serif text-4xl leading-tight md:text-6xl">
              What the agent is already doing <br />
              <span className="italic font-light text-white/70">
                in production.
              </span>
            </h2>
          </div>

          <div className="mt-14 grid gap-px bg-white/[0.05] md:grid-cols-3">
            {proofCards.map((card) => (
              <div
                key={card.title}
                className="group border border-white/[0.06] bg-black/55 p-10 backdrop-blur-sm transition-colors hover:bg-white/[0.03]"
              >
                <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
                  {card.label}
                </div>
                <h3 className="font-serif text-3xl leading-snug text-white/85 transition-colors group-hover:text-white">
                  {card.title}
                </h3>
                <p className="mt-6 text-base font-light leading-relaxed text-white/65">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-white/[0.05] bg-black px-6 py-24 md:px-12 md:py-28">
        <div className="absolute inset-x-0 top-0 z-0 h-screen md:inset-0 md:h-auto">
          <Image
            src={skyscraperPath}
            alt="City skyline"
            fill
            sizes="100vw"
            className="object-cover object-center grayscale contrast-125 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/65" />
          <div className="absolute inset-0 dither-bg opacity-18" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-3xl">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">
                Trusted In Production
              </span>
              <h2 className="mt-6 font-serif text-4xl leading-tight md:text-6xl">
                Already deployed at <br />
                <span className="italic font-light text-white/70">
                  ProductLab and Outperform.
                </span>
              </h2>
              <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-white/70 md:text-xl">
                Serious operators do not need a philosophy lesson first. They
                need to know the system is already running in production, then
                they want to understand how fast it can go live in their own
                environment.
              </p>
          </div>

          <div className="mt-12 grid gap-px bg-white/[0.05] md:grid-cols-2">
            {proofCompanies.map((company) => (
              <div
                key={company.name}
                className="group border border-white/[0.06] bg-black/45 p-10 backdrop-blur-sm transition-colors hover:bg-white/[0.03]"
              >
                <div className="mb-5 font-mono text-[10px] tracking-[0.18em] uppercase text-white/35">
                  Deployed At
                </div>
                <h3 className="font-serif text-3xl text-white/85 transition-colors group-hover:text-white">
                  {company.name}
                </h3>
                <p className="mt-5 max-w-md text-base font-light leading-relaxed text-white/65">
                  {company.context}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[8px] border border-white/[0.12] bg-white/[0.04] p-6 md:p-10 lg:p-14">
            <div className="pointer-events-none absolute inset-0 z-0">
              <Image
                src={coastPath}
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-center grayscale opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black via-black/82 to-black/55" />
              <div className="absolute inset-0 dither-bg opacity-20" />
            </div>

            <div className="relative z-10 grid min-h-[560px] content-between gap-16">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/45" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">
                    Zero-Setup Pilot
                  </span>
                </div>

                <div className="mt-14 max-w-6xl">
                  <h2 className="font-serif text-5xl leading-[0.95] text-white md:text-7xl lg:text-[96px]">
                    See your processes <br />
                    <span className="italic font-light text-white/55">
                      in one week.
                    </span>
                  </h2>
                  <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-white/62 md:text-2xl">
                    Get started with a cut of your data. In one week, we&apos;ll
                    show you a clear view of your workflows, ready for AI
                    agents.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-[minmax(0,360px)_1fr_auto] md:items-end">
                <MetaTrackedLink
                  className="group inline-flex h-16 w-full items-center justify-between rounded-[8px] border border-white bg-white px-6 font-mono text-[10px] uppercase tracking-[0.16em] text-black transition-colors hover:bg-transparent hover:text-white"
                  customData={{
                    content_category: "Closing CTA",
                    content_name: "Book Free 7-Day Pilot",
                  }}
                  eventName="InitiateCheckout"
                  href="/book"
                >
                  <span className="flex items-center gap-3">
                    <span className="h-2 w-2 bg-black transition-colors group-hover:bg-white" />
                    Book Free Pilot
                  </span>
                  <ArrowUpRight className="h-3 w-3" />
                </MetaTrackedLink>

                <p className="max-w-sm font-mono text-[10px] uppercase leading-relaxed tracking-[0.15em] text-white/35 md:pb-1">
                  Built on your data. Pay only if it works.
                </p>

                <div className="grid h-16 w-16 place-items-center rounded-[8px] border border-white/15 bg-white/[0.06]">
                  <div className="h-3 w-3 bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="bg-black border-t border-white/[0.1] pt-40 pb-20 px-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between gap-32">
            <div className="space-y-12">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-white" />
                <span className="font-mono text-sm font-medium tracking-[0.2em] uppercase text-white">ovrmn</span>
              </div>
              <p className="max-w-xs text-[10px] font-light leading-relaxed text-white/40 uppercase tracking-[0.15em]">
                Your sharpest operator. Never sleeps. Never quits.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-24 md:gap-40">
              <div className="space-y-10">
                <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/80">Connect</h5>
                <ul className="space-y-6 font-mono text-[10px] tracking-[0.15em] text-white/50 uppercase">
                  <li>
                    <MetaTrackedAnchor
                      className="hover:text-white transition-colors"
                      customData={{
                        content_category: "Footer",
                        content_name: "Direct email",
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
                <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/80">Company</h5>
                <ul className="space-y-6 font-mono text-[10px] tracking-[0.15em] text-white/50 uppercase">
                  <li><a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a></li>
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="#teams" className="hover:text-white transition-colors">Teams</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-48 flex flex-col items-center justify-between border-t border-white/[0.05] pt-16 md:flex-row">
            <div className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase mb-12 md:mb-0">
              OVRMN // AI TEAMMATES // 2026
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
