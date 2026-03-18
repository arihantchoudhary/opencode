import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  ArrowRight,
  Twitter,
  Github,
  Terminal,
  Zap,
  Cloud,
  Activity,
  Shield,
  Layers,
  Brain,
  Smartphone,
  Globe,
  ExternalLink,
  Check,
  X,
} from "lucide-react";

const PRODUCTS = [
  {
    name: "theTravelGPT",
    domain: "Travel",
    tag: "AI Pipeline",
    tagColor: "bg-blue-600",
    description:
      "GPT-4 itinerary generation + Mapbox maps + Foursquare autocomplete + email delivery. 550+ destinations. $2K paid client who switched FROM Lovable.",
    infra: "Vercel, FastAPI",
    url: "https://www.thetravelgpt.com/",
    testimonial:
      '"Stardrop turned my vision into a production-ready platform and elevated the website far beyond its original scope."',
    testimonialAuthor: "Jason Rosenbaum, Owner",
  },
  {
    name: "Selecta",
    domain: "Events / VC",
    tag: "Data Enrichment",
    tagColor: "bg-green-600",
    description:
      "LinkedIn & GitHub profile scraping + multi-criteria AI ranking for event guest selection. Built for Inception Studio.",
    infra: "Vercel, Clerk OAuth",
    url: "https://john-whaley-app.vercel.app/linkedin",
  },
  {
    name: "Canopy",
    domain: "Healthcare",
    tag: "Domain Logic",
    tagColor: "bg-amber-600",
    description:
      "Matches cancer patients with non-medical support by diagnosis, treatment stage, and location. 2,000+ providers, 500+ sites.",
    infra: "AWS App Runner + ECR + DynamoDB",
    url: "https://github.com/City-Intelligence-Inc/cancer-app",
  },
  {
    name: "Hunchie",
    domain: "Hardware / IoT",
    tag: "IoT Companion",
    tagColor: "bg-zinc-700",
    description:
      "Bluetooth-connected posture tracking with onboarding flow. Proves Stardrop handles physical product software, not just SaaS.",
    infra: "Netlify, BLE",
    url: "https://chic-stroopwafel-d56d4f.netlify.app/onboarding",
    testimonial:
      '"I would pay for this. I really liked the cute hedgehog and UI and how super intuitive everything is."',
    testimonialAuthor: "User feedback",
  },
];

const PRICING = [
  {
    name: "FREE",
    price: "$0",
    period: "/mo",
    features: [
      '1 wish/month',
      'Single-agent AI',
      'stardrop.dev subdomain',
      '"Built with Stardrop" badge',
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "STAR",
    price: "$15",
    period: "/mo",
    features: [
      '5 wishes/month',
      'Multi-agent orchestration',
      'Priority build queue',
      'Custom domain',
    ],
    cta: "Start building",
    highlight: false,
    note: "vs. Bolt & Lovable Pro at $25/mo",
  },
  {
    name: "CONSTELLATION",
    price: "$40",
    period: "/mo",
    features: [
      'Unlimited wishes',
      'External API integrations',
      'Collaboration (invite teammates)',
      'Analytics dashboard',
    ],
    cta: "Go unlimited",
    highlight: true,
  },
  {
    name: "SUPERNOVA",
    price: "$200",
    period: "/mo",
    features: [
      'Team workspace (10 seats)',
      'White-label option',
      'Domain-specific AI config',
      'AWS deploy + Datadog monitoring',
      'Priority support',
    ],
    cta: "Contact us",
    highlight: false,
    note: "vs. dev agencies at $50K+",
  },
];

const COMPARISON = [
  { dimension: "App Complexity", them: "2/10", us: "9/10", themLabel: "Simple CRUD, MVPs", usLabel: "Multi-API AI pipelines" },
  { dimension: "Domain Intelligence", them: "1/10", us: "9/10", themLabel: "No industry awareness", usLabel: "Clinical triage, VC ranking, travel logic" },
  { dimension: "AI Depth", them: "3/10", us: "8/10", themLabel: "Single LLM wrapper", usLabel: "Multi-agent, best model per task" },
  { dimension: "Deployment", them: "0/10", us: "9/10", themLabel: "Code only, no deploy", usLabel: "AWS + Datadog + CI/CD + domain" },
  { dimension: "Ease of Use", them: "8/10", us: "9/10", themLabel: "User architects the logic", usLabel: "Describe the outcome, not the app" },
  { dimension: "Production Ready", them: "3/10", us: "8/10", themLabel: "Prototypes need rebuild", usLabel: "Deployed with real user bases" },
];

const DELIVERY_STEPS = [
  { icon: Terminal, label: "Code", sub: "Multi-agent builds your app" },
  { icon: Layers, label: "Docker", sub: "Containerized for deploy" },
  { icon: Cloud, label: "AWS", sub: "App Runner + ECR + DynamoDB" },
  { icon: Activity, label: "Datadog", sub: "Monitoring & alerts" },
  { icon: Github, label: "CI/CD", sub: "GitHub Actions pipeline" },
  { icon: Globe, label: "Domain", sub: "Custom domain + SSL" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Star className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold">Stardrop</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#products" className="hover:text-foreground transition-colors">Products</a>
            <a href="#comparison" className="hover:text-foreground transition-colors">vs. Competitors</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
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
      <section className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground mb-6">
            <Zap className="h-3 w-3" />
            40+ apps shipped from tweets
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
            Describe it on Twitter.
            <br />
            <span className="text-muted-foreground">We build it.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg">
            Multi-agent AI that turns plain-English wishes into production
            software — built, deployed on AWS, and monitored with Datadog.
            Web apps. Mobile apps. Companion apps for hardware.
          </p>
          <div className="mt-8 flex gap-3">
            <SignedOut>
              <SignUpButton>
                <Button size="lg">
                  Start building <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </SignUpButton>
              <a href="https://twitter.com/stardrop" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg">
                  <Twitter className="mr-1.5 h-4 w-4" /> Tag @stardrop
                </Button>
              </a>
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

      {/* Integrations Marquee */}
      <section className="border-t border-b bg-muted/20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center mb-4">We integrate with the tools you already use — and build AI into your apps</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
            {[
              { name: "OpenAI / GPT-4", category: "ai" },
              { name: "Anthropic / Claude", category: "ai" },
              { name: "Google Gemini", category: "ai" },
              { name: "Cerebras", category: "ai" },
              { name: "ElevenLabs", category: "ai" },
              { name: "Mailgun", category: "email" },
              { name: "AWS SES", category: "email" },
              { name: "Stripe", category: "payments" },
              { name: "Mapbox", category: "maps" },
              { name: "Foursquare", category: "maps" },
              { name: "AWS App Runner", category: "infra" },
              { name: "AWS DynamoDB", category: "infra" },
              { name: "AWS S3", category: "infra" },
              { name: "Clerk Auth", category: "auth" },
              { name: "Supabase", category: "db" },
              { name: "GitHub API", category: "dev" },
              { name: "Twitter / X API", category: "social" },
              { name: "LinkedIn API", category: "social" },
              { name: "Datadog", category: "monitoring" },
              { name: "Vercel", category: "infra" },
              { name: "Cloudflare", category: "infra" },
              { name: "Discord", category: "social" },
              { name: "Firecrawl", category: "data" },
              { name: "Mem0", category: "ai" },
            ].map((integration) => (
              <span
                key={integration.name}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium transition-colors hover:bg-background ${
                  integration.category === "ai"
                    ? "border-violet-200 text-violet-700 dark:border-violet-800 dark:text-violet-400"
                    : integration.category === "email"
                    ? "border-rose-200 text-rose-700 dark:border-rose-800 dark:text-rose-400"
                    : integration.category === "payments"
                    ? "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400"
                    : integration.category === "maps"
                    ? "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400"
                    : integration.category === "infra"
                    ? "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                    : integration.category === "auth"
                    ? "border-cyan-200 text-cyan-700 dark:border-cyan-800 dark:text-cyan-400"
                    : integration.category === "monitoring"
                    ? "border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-400"
                    : integration.category === "social"
                    ? "border-sky-200 text-sky-700 dark:border-sky-800 dark:text-sky-400"
                    : integration.category === "data"
                    ? "border-teal-200 text-teal-700 dark:border-teal-800 dark:text-teal-400"
                    : "border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                }`}
              >
                {integration.name}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-4">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> AI/ML</span>
            {" "}<span className="inline-flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-rose-500" /> Email</span>
            {" "}<span className="inline-flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-green-500" /> Payments</span>
            {" "}<span className="inline-flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Maps</span>
            {" "}<span className="inline-flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Infrastructure</span>
            {" "}<span className="inline-flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> Social</span>
            {" "}<span className="inline-flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-orange-500" /> Monitoring</span>
          </p>
        </div>
      </section>

      {/* Delivery Stack */}
      <section className="border-t bg-zinc-950 text-zinc-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">What we actually deliver</h2>
          <p className="text-zinc-400 mb-8 max-w-lg">
            Competitors hand you code. We hand you a <span className="text-white font-medium">running business</span>.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {DELIVERY_STEPS.map((step, i) => (
              <div key={step.label} className="relative">
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg border border-zinc-800 bg-zinc-900">
                  <step.icon className="h-5 w-5 text-zinc-300" />
                  <span className="text-sm font-medium">{step.label}</span>
                  <span className="text-xs text-zinc-500">{step.sub}</span>
                </div>
                {i < DELIVERY_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2.5 text-zinc-600">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background mb-3">
                <Twitter className="h-4 w-4" />
              </div>
              <h3 className="font-medium mb-1">1. Describe your wish</h3>
              <p className="text-sm text-muted-foreground">
                Tag <strong>@stardrop</strong> on X with your app idea, or use the dashboard. Plain English — no technical knowledge needed.
              </p>
            </div>
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background mb-3">
                <Brain className="h-4 w-4" />
              </div>
              <h3 className="font-medium mb-1">2. Multi-agent AI builds it</h3>
              <p className="text-sm text-muted-foreground">
                Our orchestration engine assigns the best AI model per task — planning, coding, testing, integration — not a single LLM wrapper.
              </p>
            </div>
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background mb-3">
                <Cloud className="h-4 w-4" />
              </div>
              <h3 className="font-medium mb-1">3. Deployed & monitored</h3>
              <p className="text-sm text-muted-foreground">
                Your app ships to AWS with Datadog monitoring, GitHub Actions CI/CD, custom domain, and SSL — not a prototype, a running product.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products / Traction */}
      <section id="products" className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Live products</h2>
              <p className="text-2xl font-bold">4 verticals. Each showcasing a different capability.</p>
            </div>
            <Badge variant="outline" className="hidden md:inline-flex">40+ more from tweets</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {PRODUCTS.map((product) => (
              <Card key={product.name} className="overflow-hidden">
                <CardContent className="pt-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${product.tagColor}`}>
                          {product.tag}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{product.domain} &middot; {product.infra}</p>
                    </div>
                    <a href={product.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                  {product.testimonial && (
                    <div className="bg-muted/50 rounded-md p-3 text-sm italic border-l-2 border-primary">
                      {product.testimonial}
                      <span className="block text-xs text-muted-foreground mt-1 not-italic">— {product.testimonialAuthor}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-6 text-center">
            Plus 40+ apps created from tweet mentions: golf tee-time finder, dessert recipe app, campus parking finder, social gym tracker, Indian e-reader, leetcode feed, Stanford lecture finder, and more.
          </p>
        </div>
      </section>

      {/* Competitive Landscape */}
      <section id="comparison" className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Competitive landscape</h2>
          <p className="text-2xl font-bold mb-8">The only player in the gap</p>

          {/* Quadrant */}
          <div className="grid grid-cols-2 gap-0 border rounded-lg overflow-hidden mb-10 max-w-2xl mx-auto">
            <div className="p-5 border-r border-b bg-background">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">High skill + Low complexity</p>
              <p className="text-sm text-muted-foreground">Cursor, Windsurf, GitHub Copilot</p>
            </div>
            <div className="p-5 border-b bg-background">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">High skill + High complexity</p>
              <p className="text-sm text-muted-foreground">Traditional Dev Agencies<br /><span className="text-xs">($50K-$500K+)</span></p>
            </div>
            <div className="p-5 border-r bg-background">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Low skill + Low complexity</p>
              <p className="text-sm text-muted-foreground">Lovable, Bolt, Replit, Base44, v0</p>
            </div>
            <div className="p-5 bg-primary/5 border-2 border-primary">
              <p className="text-[10px] text-primary uppercase tracking-wider mb-2 font-semibold">Low skill + High complexity</p>
              <p className="text-lg font-bold flex items-center gap-1.5">
                <Star className="h-4 w-4" /> STARDROP
              </p>
              <p className="text-xs text-muted-foreground">The only player</p>
            </div>
          </div>

          {/* Comparison table */}
          <div className="rounded-lg border overflow-hidden max-w-3xl mx-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-950 text-zinc-100">
                  <th className="text-left p-3 font-medium">Dimension</th>
                  <th className="text-center p-3 font-medium">Lovable / Bolt / Replit</th>
                  <th className="text-center p-3 font-medium">Stardrop</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.dimension} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                    <td className="p-3 font-medium">{row.dimension}</td>
                    <td className="p-3 text-center">
                      <span className="text-muted-foreground">{row.them}</span>
                      <span className="block text-xs text-muted-foreground">{row.themLabel}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-semibold">{row.us}</span>
                      <span className="block text-xs text-muted-foreground">{row.usLabel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* What competitors ship vs what we ship */}
      <section className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-2xl font-bold mb-8 text-center">What you get with competitors vs. Stardrop</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="border-destructive/20">
              <CardContent className="pt-0">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <X className="h-4 w-4 text-destructive" /> Lovable / Bolt / Replit
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><X className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" /> Generic React template code</li>
                  <li className="flex items-start gap-2"><X className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" /> Their hosted sandbox</li>
                  <li className="flex items-start gap-2"><X className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" /> No monitoring</li>
                  <li className="flex items-start gap-2"><X className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" /> No CI/CD</li>
                  <li className="flex items-start gap-2"><X className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" /> Basic email/pass auth</li>
                  <li className="flex items-start gap-2"><X className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" /> theirsite.lovable.app</li>
                  <li className="flex items-start gap-2"><X className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" /> You&apos;re on your own after</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary/30 bg-primary/[0.02]">
              <CardContent className="pt-0">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Stardrop
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> Domain-specific, multi-API codebase</li>
                  <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> <strong>Your own AWS</strong> (App Runner, ECR, DynamoDB)</li>
                  <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> <strong>Datadog + CloudWatch</strong> dashboards</li>
                  <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> <strong>GitHub Actions</strong> auto-deploy</li>
                  <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> Clerk / OAuth (Google, LinkedIn, GitHub)</li>
                  <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> Your custom domain, SSL configured</li>
                  <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> Monitoring alerts, infra maintained</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Pricing</h2>
          <p className="text-2xl font-bold mb-8">Undercut competitors. Deliver 10x more.</p>
          <div className="grid md:grid-cols-4 gap-4">
            {PRICING.map((tier) => (
              <Card
                key={tier.name}
                className={tier.highlight ? "border-primary shadow-md relative" : ""}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Most popular</Badge>
                  </div>
                )}
                <CardContent className="pt-0">
                  <h3 className="text-sm font-semibold tracking-wider mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">{tier.period}</span>
                  </div>
                  <ul className="space-y-2 text-sm mb-6">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {tier.note && (
                    <p className="text-xs text-muted-foreground mb-4 italic">{tier.note}</p>
                  )}
                  <SignedOut>
                    <SignUpButton>
                      <Button
                        className="w-full"
                        variant={tier.highlight ? "default" : "outline"}
                        size="sm"
                      >
                        {tier.cta}
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <Button
                        className="w-full"
                        variant={tier.highlight ? "default" : "outline"}
                        size="sm"
                      >
                        {tier.cta}
                      </Button>
                    </Link>
                  </SignedIn>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Market */}
      <section className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Market opportunity</h2>
          <p className="text-2xl font-bold mb-8">$37B by 2032</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-6 rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <p className="text-3xl font-bold text-blue-600">$37B</p>
              <p className="text-sm font-medium mt-1">TAM by 2032</p>
              <p className="text-xs text-muted-foreground mt-1">32.5% CAGR</p>
            </div>
            <div className="text-center p-6 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <p className="text-3xl font-bold text-green-600">$18.5B</p>
              <p className="text-sm font-medium mt-1">SAM</p>
              <p className="text-xs text-muted-foreground mt-1">~50% multi-agent share</p>
            </div>
            <div className="text-center p-6 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
              <p className="text-3xl font-bold text-amber-600">30M+</p>
              <p className="text-sm font-medium mt-1">Underserved SMBs</p>
              <p className="text-xs text-muted-foreground mt-1">Can&apos;t afford $50K+ agencies</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Sources: Congruence Market Insights, Mordor Intelligence
          </p>
        </div>
      </section>

      {/* Install / CTA */}
      <section className="border-t bg-zinc-950 text-zinc-100">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to build?</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Tag @stardrop on X with your app idea, or sign up and describe what you want. We&apos;ll build, deploy, and monitor it.
          </p>
          <div className="flex gap-3 justify-center mb-10">
            <SignedOut>
              <SignUpButton>
                <Button size="lg" variant="secondary">
                  Get started <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" variant="secondary">
                  Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
            <a href="https://twitter.com/stardrop" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Twitter className="mr-1.5 h-4 w-4" /> @stardrop
              </Button>
            </a>
          </div>
          <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm max-w-lg mx-auto text-left">
            <span className="text-zinc-500">$</span> curl -fsSL https://stardrop.dev/install | bash
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            Or install the CLI to build locally with your own Claude subscription.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>City Intelligence, Inc.</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/stardrop-cli/stardrop-cli" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              <Github className="h-3.5 w-3.5" />
            </a>
            <a href="https://twitter.com/stardrop" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              <Twitter className="h-3.5 w-3.5" />
            </a>
            <span>Describe it on Twitter. We build it.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
