import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Twitter, Github, Terminal, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Star className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold">Stardrop</span>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton>
                <Button variant="ghost" size="sm">Sign in</Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Get started</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="sm">
                  Dashboard <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground mb-6">
            <Zap className="h-3 w-3" />
            Launching now
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
            Tweet an idea.
            <br />
            <span className="text-muted-foreground">Ship it with AI.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg">
            Stardrop turns tweets into working code. See an idea on Twitter,
            create a GitHub repo with one tap, and let Claude Code build it out
            — all from your phone.
          </p>
          <div className="mt-8 flex gap-3">
            <SignedOut>
              <SignUpButton>
                <Button size="lg">
                  Join the launch <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </SignUpButton>
              <SignInButton>
                <Button variant="outline" size="lg">Sign in</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg">
                  Go to dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background mb-3">
                <Twitter className="h-4 w-4" />
              </div>
              <h3 className="font-medium mb-1">1. Find an idea</h3>
              <p className="text-sm text-muted-foreground">
                Browse your Twitter mentions and replies. When you see an idea worth building, tap &ldquo;Create Repo.&rdquo;
              </p>
            </div>
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background mb-3">
                <Github className="h-4 w-4" />
              </div>
              <h3 className="font-medium mb-1">2. Repo is created</h3>
              <p className="text-sm text-muted-foreground">
                A GitHub repo is created instantly with the tweet in the README and a CLAUDE.md with build instructions.
              </p>
            </div>
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background mb-3">
                <Terminal className="h-4 w-4" />
              </div>
              <h3 className="font-medium mb-1">3. AI builds it</h3>
              <p className="text-sm text-muted-foreground">
                Clone the repo, run <code className="text-xs bg-muted px-1 py-0.5 rounded">stardrop</code>, and Claude Code reads the CLAUDE.md and builds the entire project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Install */}
      <section className="border-t">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Get started</h2>
          <p className="text-muted-foreground mb-6">Install the Stardrop CLI and start building from ideas.</p>
          <div className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm max-w-lg">
            <span className="text-zinc-500">$</span> curl -fsSL https://stardrop.dev/install | bash
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Requires <a href="https://claude.ai" className="underline" target="_blank" rel="noopener noreferrer">Claude Code</a> installed locally. Stardrop uses your Claude subscription to build projects.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Stardrop</span>
          <span>Tweet → Repo → Ship</span>
        </div>
      </footer>
    </div>
  );
}
