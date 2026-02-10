export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <a href="/" className="text-xl font-bold tracking-tight">
              <span className="gradient-text">Stardrop</span>
            </a>
            <div className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
              <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
              <a href="#docs" className="transition-colors hover:text-white">Docs</a>
              <a href="#blog" className="transition-colors hover:text-white">Blog</a>
              <a href="#careers" className="transition-colors hover:text-white">Careers</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#login" className="hidden text-sm text-zinc-400 transition-colors hover:text-white sm:block">
              Login
            </a>
            <a
              href="#get-started"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Get started
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-glow relative flex min-h-screen flex-col items-center justify-center px-6 pt-16 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-block rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-sm text-violet-300">
            AI augmentation, not automation
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Turn your tickets into{" "}
            <span className="gradient-text">production changes</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Stardrop is a workflow-native, context-aware agent that plugs into your backlog as a collaborator.
            Assign tickets, get reviewable PRs and staged deployments — humans always have the final say.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#get-started"
              className="rounded-full bg-violet-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-violet-500"
            >
              Start for free
            </a>
            <a
              href="#how-it-works"
              className="rounded-full border border-white/10 px-8 py-3 text-base font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Hero visual placeholder */}
        <div className="mx-auto mt-20 w-full max-w-5xl overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-white/10" />
            <div className="h-3 w-3 rounded-full bg-white/10" />
            <div className="h-3 w-3 rounded-full bg-white/10" />
            <span className="ml-3 text-xs text-zinc-500">stardrop agent</span>
          </div>
          <div className="p-8 font-mono text-sm leading-relaxed text-zinc-500">
            <p><span className="text-violet-400">$</span> stardrop assign <span className="text-zinc-300">TICKET-142</span> <span className="text-zinc-600">&quot;Fix checkout layout on mobile&quot;</span></p>
            <p className="mt-2 text-zinc-600">Reading ticket context...</p>
            <p className="text-zinc-600">Analyzing codebase &amp; design tokens...</p>
            <p className="text-zinc-600">Implementing changes in 3 files...</p>
            <p className="text-zinc-600">Running test suite... <span className="text-green-500">14/14 passed</span></p>
            <p className="mt-2 text-zinc-300">PR <span className="text-violet-400">#247</span> created &middot; staged at <span className="text-violet-400">preview-142.stardrop.dev</span></p>
            <p className="text-zinc-600">Awaiting human review...</p>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="border-t border-white/5 px-6 py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Your team is paying a <span className="gradient-text">coordination tax</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-400">
            Engineers, PMs, and designers spend disproportionate time on maintenance, ticket management, and low-leverage execution — leaving little room for the high-value innovation that actually moves the product forward.
          </p>
          <div className="mx-auto mt-16 grid max-w-3xl gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-left">
              <div className="mb-3 text-3xl font-bold text-violet-400">60%</div>
              <p className="text-sm text-zinc-500">of engineering time spent on maintenance &amp; coordination, not building</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-left">
              <div className="mb-3 text-3xl font-bold text-violet-400">3x</div>
              <p className="text-sm text-zinc-500">more experiments your team could run if freed from repetitive execution</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-left">
              <div className="mb-3 text-3xl font-bold text-violet-400">40-60%</div>
              <p className="text-sm text-zinc-500">reduction in ticket cycle time with Stardrop in early pilots</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="border-t border-white/5 px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              From ticket to production in minutes
            </h2>
            <p className="mx-auto max-w-xl text-lg text-zinc-400">
              Assign a ticket to Stardrop like you would a teammate. It handles the rest.
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Assign a ticket",
                desc: "From GitHub Projects, Linear, Trello, or any backlog — assign the ticket to Stardrop like a team member.",
              },
              {
                step: "02",
                title: "Context synthesis",
                desc: "Stardrop reads the ticket, your codebase, docs, and history. It may ask clarifying questions or propose solutions.",
              },
              {
                step: "03",
                title: "Implement & test",
                desc: "It spins up a code session, implements the change, runs your test suite, and creates a PR with staged deployment.",
              },
              {
                step: "04",
                title: "Human review",
                desc: "Diffs, test results, screenshots, and a rollback plan — presented for your approval. You always have the final say.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="card-glow rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all"
              >
                <div className="mb-4 text-sm font-mono text-violet-400">{item.step}</div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-white/5 px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Stardrop does the <span className="gradient-text">90%</span> so your team can focus on the <span className="gradient-text">10%</span>
            </h2>
            <p className="mx-auto max-w-xl text-lg text-zinc-400">
              The grunt work that slows you down, automated. The creative decisions that matter, yours.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Reclaim Your Time */}
            <div className="card-glow group rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">Reclaim your time</h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                Automate tedious tasks — fixing layout glitches, responding to common support tickets, sending promotional emails — so you can focus on what moves the needle.
              </p>
            </div>

            {/* Seamless Sync */}
            <div className="card-glow group rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">Seamless synchronization</h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                No more miscommunications or forgotten updates. Stardrop is aware of your changes and keeps Jira, documents, and data in sync across your team.
              </p>
            </div>

            {/* Rapid Iteration */}
            <div className="card-glow group rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">Rapid iteration</h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                UI improvements, split testing, and feature experiments at your fingertips. You are no longer tied down by a lack of technical expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section className="border-t border-white/5 px-6 py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Plugs into <span className="gradient-text">your workflow</span>
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-lg text-zinc-400">
            Stardrop is platform-agnostic. It sits at the intersection of your project management layer and your code layer.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              "GitHub",
              "Linear",
              "Trello",
              "Jira",
              "Figma",
              "Slack",
              "Vercel",
              "AWS",
            ].map((name) => (
              <div
                key={name}
                className="rounded-xl border border-white/5 bg-white/[0.02] px-6 py-3 text-sm text-zinc-400"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & Security ── */}
      <section className="border-t border-white/5 px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Trust is our <span className="gradient-text">primary product</span>
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-zinc-400">
                Stardrop operates in a sandboxed environment with a strict human-in-the-loop protocol. The final merge or publish button is always pressed by a human.
              </p>
              <ul className="space-y-4">
                {[
                  "Sandboxed execution environment",
                  "Full codebase context reduces hallucinations",
                  "Rollback plans with every deployment",
                  "SOC2 compliance & SSO for enterprise",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-400">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
              <div className="space-y-4 font-mono text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-zinc-400">Human review required before merge</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-zinc-400">Sandboxed code execution</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-zinc-400">Full test suite validation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-zinc-400">Staged deployment preview</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-zinc-400">One-click rollback plan</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-zinc-400">Private VPC deployment available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-white/5 px-6 py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Stop paying the coordination tax.
            <br />
            <span className="gradient-text">Start shipping what matters.</span>
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-zinc-400">
            Free trial tied to one repo. Install the GitHub app in minutes. Your team will see results on day one.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#get-started"
              className="rounded-full bg-violet-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-violet-500"
            >
              Get started for free
            </a>
            <a
              href="#demo"
              className="rounded-full border border-white/10 px-8 py-3 text-base font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
            >
              Book a demo
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="mb-4 text-lg font-bold">
                <span className="gradient-text">Stardrop</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-500">
                The shooting star you can hold in your hands. It amplifies your capabilities to make your wishes come true.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-zinc-300">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="#pricing" className="transition-colors hover:text-white">Pricing</a></li>
                <li><a href="#docs" className="transition-colors hover:text-white">Documentation</a></li>
                <li><a href="#changelog" className="transition-colors hover:text-white">Changelog</a></li>
                <li><a href="#integrations" className="transition-colors hover:text-white">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-zinc-300">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="#blog" className="transition-colors hover:text-white">Blog</a></li>
                <li><a href="#careers" className="transition-colors hover:text-white">Careers</a></li>
                <li><a href="#about" className="transition-colors hover:text-white">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-zinc-300">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="#privacy" className="transition-colors hover:text-white">Privacy</a></li>
                <li><a href="#terms" className="transition-colors hover:text-white">Terms</a></li>
                <li><a href="#security" className="transition-colors hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/5 pt-8 text-center text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} Stardrop. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
