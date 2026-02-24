import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, AtSign, TrendingUp, Shield } from "lucide-react";

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
            <Star className="h-3 w-3" />
            Now in beta
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
            Track every mention.
            <br />
            <span className="text-muted-foreground">Understand your reach.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg">
            Stardrop monitors Twitter mentions for any account and gives you a
            clean dashboard with engagement analytics — all in real time.
          </p>
          <div className="mt-8 flex gap-3">
            <SignedOut>
              <SignUpButton>
                <Button size="lg">
                  Get started free <ArrowRight className="ml-1.5 h-4 w-4" />
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

      {/* Features */}
      <section className="border-t bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background mb-3">
                <AtSign className="h-4 w-4" />
              </div>
              <h3 className="font-medium mb-1">Mention Tracking</h3>
              <p className="text-sm text-muted-foreground">
                See every post that mentions your account, with author details, timestamps, and engagement metrics.
              </p>
            </div>
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background mb-3">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="font-medium mb-1">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track total likes, reposts, replies, and impressions across all your mentions in one place.
              </p>
            </div>
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background mb-3">
                <Shield className="h-4 w-4" />
              </div>
              <h3 className="font-medium mb-1">Smart Caching</h3>
              <p className="text-sm text-muted-foreground">
                Results are cached to minimize API usage. Force refresh anytime to pull the latest data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Stardrop</span>
          <span>Built with Next.js, shadcn/ui, and the Twitter API</span>
        </div>
      </footer>
    </div>
  );
}
