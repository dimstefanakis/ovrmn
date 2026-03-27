import Image from "next/image";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { MetaTrackedAnchor } from "@/components/meta-tracked-anchor";
import { MetaTrackedLink } from "@/components/meta-tracked-link";
import { MetaViewContent } from "@/components/meta-view-content";

export default function Home() {
  const bgPath = "/bg.webp";
  const portraitPath = "/alexander.webp";

  return (
    <main className="relative flex min-h-screen flex-col bg-black overflow-hidden selection:bg-white selection:text-black">
      <MetaViewContent
        contentCategory="Landing page"
        contentName="OVRMN homepage"
      />
      {/* Navigation Header - Monastic Minimal */}
      <nav className="fixed top-0 z-40 flex w-full items-center justify-between border-b border-white/[0.05] bg-black/20 px-6 py-6 md:px-12 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 bg-white" />
          <span className="font-mono text-xs tracking-[0.15em] uppercase">ovrmn</span>
        </div>
        <div className="hidden gap-12 font-mono text-[10px] tracking-[0.15em] uppercase text-white/60 md:flex">
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
          <a href="#teams" className="hover:text-white transition-colors">Teams</a>
        </div>
        <MetaTrackedLink
          className="group flex items-center gap-2 border border-white/20 px-5 py-2 font-mono text-[10px] tracking-wider uppercase transition-all hover:bg-white hover:text-black"
          customData={{
            content_category: "Navigation",
            content_name: "Book a demo",
          }}
          eventName="InitiateCheckout"
          href="/book"
        >
          Book a Demo
          <ArrowUpRight className="h-3 w-3" />
        </MetaTrackedLink>
      </nav>

      {/* SECTION 1 — HERO SECTION — THE ECLIPSE */}
      <section className="relative flex h-screen min-h-[700px] max-h-[900px] flex-col justify-center px-6 md:px-12 overflow-hidden">
        {/* Background Artifacts — Increased visibility */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <Image 
            src={bgPath} 
            alt="Intelligence Observatory" 
            fill 
            priority
            sizes="100vw"
            className="object-cover grayscale contrast-110 opacity-80"
          />
          {/* Subtle gradient to ensure left-side text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="reveal-up flex items-center gap-4 font-mono text-[10px] tracking-[0.2em] uppercase text-white/70" style={{ animationDelay: "100ms" }}>
            <div className="h-2 w-2 bg-white" />
            <span>AI Teammates for Every Team</span>
          </div>

          <h1 className="reveal-up mt-6 font-serif text-4xl leading-[1.1] md:text-6xl lg:text-7xl xl:text-8xl tracking-tight" style={{ animationDelay: "300ms" }}>
            Teammates that <br />
            <span className="italic font-light opacity-80">know the playbook.</span>
          </h1>

          <p className="reveal-up mt-6 max-w-xl text-lg font-light leading-relaxed text-white/80 md:text-xl" style={{ animationDelay: "500ms" }}>
            ovrmn deploys AI agents that learn how your team works, plug into the tools you already use, and handle real tasks — from triaging tickets to monitoring rollouts to scheduling reports.
          </p>

          <div className="reveal-up mt-10 flex flex-col items-start gap-6 sm:flex-row" style={{ animationDelay: "700ms" }}>
            <MetaTrackedLink
              className="inline-flex h-16 min-w-[240px] items-center justify-center border border-white bg-white px-8 font-mono text-[10px] tracking-[0.15em] uppercase text-black transition-all hover:bg-transparent hover:text-white"
              customData={{
                content_category: "Hero",
                content_name: "Book a demo",
              }}
              eventName="InitiateCheckout"
              href="/book"
            >
              Book a Demo
            </MetaTrackedLink>
            <a
              className="flex h-16 items-center gap-4 px-8 font-mono text-[10px] tracking-[0.15em] uppercase text-white/60 transition-all hover:text-white"
              href="#how-it-works"
            >
              See How It Works
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Abstract Metadata — Above the fold detail */}
        <div className="reveal-up absolute bottom-12 right-6 md:right-12 text-right" style={{ animationDelay: "900ms" }}>
          <div className="font-mono text-[9px] tracking-[0.2em] text-white/40 uppercase mb-2">
            Slack / Email / Chat / Custom
          </div>
          <div className="h-px w-32 bg-white/20 ml-auto" />
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
                Most AI answers questions. <br />
                <span className="italic font-light">Ours joins the team.</span>
              </h2>
              <div className="space-y-8 max-w-xl">
                <p className="text-xl font-light leading-relaxed text-white/70 md:text-2xl">
                  Other platforms give you a chatbot. ovrmn gives you agents that internalize your processes, learn from every interaction, and operate inside your existing stack — not beside it.
                </p>
                <p className="text-xl font-light leading-relaxed text-white/70 md:text-2xl">
                  They log tasks, query your data, flag anomalies, and handle requests — with the institutional memory of your best operator, available to every team.
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
            <h2 className="font-serif text-5xl leading-tight md:text-8xl">What ovrmn Deploys</h2>
          </div>

          <div className="mt-32 grid gap-24 md:grid-cols-2">
            {[
              {
                title: "Continuous Learning",
                desc: "Every interaction teaches the agent. Your team's workflows, terminology, and edge cases become institutional memory that scales and never goes stale."
              },
              {
                title: "Works Where You Work",
                desc: "Slack, email, dashboards, or custom platforms. Agents operate inside the tools your team already uses — no new interfaces to learn."
              },
              {
                title: "Deep Integrations",
                desc: "Proprietary connectors to your project tracker, CRM, data warehouse, and internal tools. Agents act on real data — not just surface-level answers."
              },
              {
                title: "Teammate, Not Tool",
                desc: "Agents triage tickets, log tasks, pull reports, and flag anomalies. They escalate to humans with full context. They work with your team, not around it."
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
      <section className="relative w-full h-[70vh] min-h-[600px] max-h-[850px] flex items-center px-6 md:px-12 bg-black border-t border-white/[0.05] overflow-hidden">
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
          <div className="max-w-4xl">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/60" id="how-it-works">The Process</span>
            <h2 className="mt-8 font-serif text-5xl leading-tight md:text-7xl">Live in one week. <br /><span className="italic font-light opacity-80">Learning forever.</span></h2>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: "Connect", body: "We plug into your existing systems — Slack, Asana, your data warehouse, CRM, helpdesk. No migration, no setup workshops." },
                { title: "Learn", body: "The agent ingests your team's historical data, docs, and processes to build operational memory from day one." },
                { title: "Deploy", body: "Go live across your channels. The agent handles real tasks, escalates when uncertain, and operates transparently." }
              ].map((step, i) => (
                <div key={i} className="flex flex-col gap-4 border-l border-white/10 pl-6">
                  <span className="font-mono text-[10px] text-white/30">{String(i + 1).padStart(2, '0')}</span>
                  <h4 className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/80">{step.title}</h4>
                  <p className="text-sm font-light leading-relaxed text-white/60">{step.body}</p>
                </div>
              ))}
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
              <h2 className="mt-6 font-serif text-4xl md:text-6xl italic font-light">Works across teams. Any size.</h2>
            </div>
          </div>

          <div className="mt-16 grid gap-px bg-white/[0.05] md:grid-cols-3">
            {[
              { date: "Engineering", title: "Log tasks by talking to Slack. Monitor rollouts for anomalies. Query internal data without writing SQL." },
              { date: "Marketing", title: "Schedule reports, track campaign performance, flag underspending. An ops brain that never sleeps." },
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

      {/* CLOSING — THE FINAL CALL — THE MOUNTAINS */}
      <section className="relative w-full h-[80vh] min-h-[700px] max-h-[900px] flex flex-col items-center justify-center px-6 text-center bg-black overflow-hidden">
        <div className="absolute inset-0 z-0 w-full h-full">
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
          <div className="h-24 w-[1px] bg-white/20 mb-16" />
          
          <h2 className="max-w-5xl font-serif text-6xl leading-tight md:text-8xl">
            Knowledge is the moat. <br />
            <span className="italic font-light text-white/60">We make it operational.</span>
          </h2>

          <div className="mt-24">
            <MetaTrackedLink
              className="inline-flex h-20 min-w-[320px] items-center justify-center bg-white px-12 font-mono text-xs tracking-[0.2em] uppercase text-black hover:bg-neutral-200 transition-all"
              customData={{
                content_category: "Closing CTA",
                content_name: "Book a demo",
              }}
              eventName="InitiateCheckout"
              href="/book"
            >
              Book a Demo
            </MetaTrackedLink>
          </div>
        </div>
      </section>

      {/* FOOTER — INSTITUTIONAL */}
      <footer className="bg-black border-t border-white/[0.1] pt-40 pb-20 px-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between gap-32">
            <div className="space-y-12">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-white" />
                <span className="font-mono text-sm font-medium tracking-[0.2em] uppercase text-white">ovrmn</span>
              </div>
              <p className="max-w-xs text-[10px] font-light leading-relaxed text-white/40 uppercase tracking-[0.15em]">
                AI teammates that learn, integrate, and operate — across every team.
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
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a></li>
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
