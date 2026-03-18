# STARDROP — Menlo Inception Pitch Deck

**Total time: 5:00 | Demo: 1:30 | Speaking slides: 3:30**

---

## SLIDE 1 — TITLE (15 sec)

### STARDROP

**Describe it. We build it.**

Web apps. Mobile apps. Companion apps for hardware products.
Multi-agent AI that turns plain-English wishes into production software — built, deployed, and monitored.

*City Intelligence, Inc. | arihant@berkeley.edu | @stardrop*

---

## SLIDE 2 — FOUNDER (30 sec)

### Arihant Choudhary — Founder & CEO

- **Education**: BS UC Berkeley + MS Stanford, Computer Science — graduated a year early from both programs, self-funded
- **Engineering**: 7 years. Cerebras Systems (Series H, AI chips), Intel Corporation
- **Research**: 3 papers in 3 consecutive years — ACM SIGCSE 2024, ACM SIGCSE 2025, ICML 2026
- **Builder**: Solo-founded City Intelligence, Inc. 1.5 years ago. Shipped 4+ production apps across healthcare, travel, events, and hardware — each with real users and live AWS infrastructure
- **Managed**: Teams up to 10 engineers

> **Why me**: I don't just write code — I architect multi-agent AI systems, deploy them on AWS, wire up Datadog monitoring, and hand clients a working business. I've done this at Cerebras-scale infrastructure and at startup speed. 3 top-venue publications prove I can push the frontier; 4 shipped products prove I can ship.

---

## SLIDE 3 — THE PROBLEM (30 sec)

### The Week Four Crisis

**>30% of early-stage startups now build MVPs in under a week with vibe coding.**

But these apps collapse when real users show up.

- Single-agent tools (Lovable, Bolt, Replit) generate **prototypes, not products**
- No domain intelligence — same generic output whether you're building a travel app or a clinical triage system
- No multi-API orchestration — the moment you need LinkedIn + Stripe + a database, you're on your own
- No deployment — they give you code, not a running product on AWS with monitoring
- **30M+ SMBs need specialized tools but cannot afford $50K-$500K custom development**

> The gap: Tools that non-developers can use BUT that produce production-grade, domain-aware, **deployed and monitored** applications. **Nobody sits here today.**

---

## SLIDE 4 — MARKET SIZE (20 sec)

### $37B Opportunity

| Metric | Value | Source |
|--------|-------|--------|
| Vibe coding market (2024) | **$3.9B** | Congruence Market Insights |
| Projected (2032) | **$37B** (32.5% CAGR) | Congruence Market Insights |
| Multi-agent share | **~50%** of vibe coding market | Congruence Market Insights |
| Citizen developer growth | **30% annual** adoption increase | Congruence Market Insights |
| Underserved SMBs | **30M+** need tools, can't afford custom dev | Mordor Intelligence |

**Our beachhead**: SMBs and non-technical professionals in healthcare, events, travel, and finance who need domain-specific apps — not another landing page builder.

---

## SLIDE 5 — SOLUTION & COMPETITIVE LANDSCAPE (40 sec)

### Stardrop: The Only Player in the Gap

**Competitive positioning map:**

```
                    Low Complexity ←————————→ High Complexity
                    (Landing pages, CRUD)     (Multi-API, domain logic, AI pipelines)

  High Tech     │  Cursor                    Traditional Dev Agencies
  Skill         │  Windsurf                  ($50K-$500K+)
  Required      │  GitHub Copilot
  (Devs)        │
                │
  Low Tech      │  Lovable, Bolt             ★ STARDROP ★
  Skill         │  Replit, Base44            (The only player)
  Required      │  v0
  (Non-devs)    │
```

### What Competitors Ship vs. What We Ship

| What You Get | Lovable / Bolt / Replit | Stardrop |
|-------------|------------------------|----------|
| **Code** | Generic React template | Domain-specific, multi-API codebase |
| **Deployment** | Their hosted sandbox | **Your own AWS** (App Runner, ECR, DynamoDB) |
| **Monitoring** | None | **Datadog + CloudWatch** dashboards |
| **CI/CD** | None | **GitHub Actions** auto-deploy pipeline |
| **Database** | Supabase template | **DynamoDB / PlanetScale** provisioned & configured |
| **Auth** | Basic email/pass | **Clerk / OAuth** (Google, LinkedIn, GitHub) |
| **Domain** | theirsite.lovable.app | **Your custom domain**, SSL configured |
| **After launch** | You're on your own | Monitoring alerts, infra maintained |

> **We don't hand you code. We hand you a running business.**

### Detailed Comparison

| Dimension | Competitors (avg.) | Stardrop |
|-----------|-------------------|----------|
| **App Complexity** | 2/10 — Simple CRUD, MVPs | **9/10** — Multi-API AI pipelines |
| **Domain Intelligence** | 1/10 — No industry awareness | **9/10** — Clinical triage, VC ranking, travel logic |
| **AI Depth** | 3/10 — Single LLM wrapper | **8/10** — Multi-agent orchestration, best model per task |
| **Ease of Use** | 8/10 — Chat-to-app, but user architects logic | **9/10** — "Wish-driven": describe the outcome, not the app |
| **Integration Breadth** | 2/10 — Supabase, Stripe | **8/10** — LinkedIn, GitHub, Luma, Eventbrite, EHR, Mapbox, Foursquare |
| **Production Readiness** | 3/10 — Prototypes that need rebuild | **8/10** — Deployed on AWS with monitoring |
| **Scalability** | 4/10 — Token caps, single-tenant | **8/10** — Real user bases (2,000+ providers, 500+ sites) |
| **Personalization** | 2/10 — Generic templates | **9/10** — Context engine adapts to domain, data, and logic |

---

## SLIDE 6 — BUSINESS MODEL & GTM (30 sec)

### Pricing: Undercut Competitors, Deliver 10x More

| Tier | Price | Core Features |
|------|-------|---------------|
| **FREE** | $0/mo | 1 wish/month, single-agent, stardrop.dev subdomain, "Built with Stardrop" badge |
| **STAR** | $15/mo | 5 wishes/month, multi-agent orchestration, priority queue, custom domain *(vs. Bolt & Lovable Pro at $25/mo)* |
| **CONSTELLATION** | $40/mo | Unlimited wishes, external API integrations, collaboration, analytics |
| **SUPERNOVA** | $200/mo | Team workspace (10 seats), white-label, domain-specific AI config, dedicated support |

**Future**: Enterprise tier for regulated industries (healthcare, finance) with compliance packages.

### Go-to-Market

**Distribution today**: Users tag **@stardrop** on X/Twitter with an app idea. We build it. Viral loop built in — every "Built with Stardrop" badge is a billboard.

**Proof it works**: 40+ repos created under City-Intelligence-Inc from tweet mentions alone — golf tee-time finders, dessert recipe apps, campus parking finders, gym trackers, Indian e-readers, leetcode feeds. Real people, real wishes, real apps.

**Target customers**:

| Segment | Who | Example Products |
|---------|-----|-----------------|
| **"The Dreamer"** (Consumer) | Gen Z / young millennials (18-30) on X, TikTok, Product Hunt | theTravelGPT, Hunchie |
| **"The Operator"** (Professional) | Mid-career (30-50) in healthcare, finance, events, hospitality. Dept heads, practice managers, solo practitioners. **Not developers.** | Canopy, Selecta |

> **The Operator** is our wedge into high-LTV B2B. They need tools that understand clinical workflows, event logistics, and compliance — not generic templates.

---

## SLIDE 7 — TRACTION (15 sec intro + 1:30 demo)

### Built, Deployed, Monitored — Not Hypothetical

Each product showcases a **different Stardrop capability**:

| Product | Domain | Stardrop Differentiator | Infra Deployed |
|---------|--------|------------------------|----------------|
| **theTravelGPT** | Travel | **AI pipeline orchestration** — GPT-4 itinerary generation + Mapbox maps + Foursquare autocomplete + email delivery. 550+ destinations, 1,431 curated entries. Client paid $2K. | Vercel + Supabase → FastAPI migration |
| **Selecta** | Events / VC | **Data enrichment + AI ranking** — Pulls LinkedIn & GitHub profiles, scores applicants with multi-criteria AI ranking. Dark-theme UI with Clerk auth. | Vercel, Clerk OAuth, Next.js |
| **Canopy** | Healthcare | **Domain intelligence + full AWS stack** — Matches cancer patients with non-medical support resources based on diagnosis, treatment stage, and location. 2,000+ providers, 500+ sites. | **AWS App Runner + ECR + DynamoDB + Google Sheets sync + Expo mobile** |
| **Hunchie** | Hardware / IoT | **Hardware companion app** — Bluetooth-connected posture tracking with onboarding flow. Proves Stardrop handles physical product integration, not just SaaS. | Netlify, BLE integration |

### Full Delivery Stack (What We Actually Ship)

```
Code → Docker → ECR → AWS App Runner → DynamoDB → Datadog monitoring
  ↓                                                      ↓
GitHub Actions CI/CD                              CloudWatch alerts
  ↓                                                      ↓
Custom domain + SSL                              Honeycomb logging
  ↓
Clerk/OAuth auth + Stripe payments
```

**Not a prototype. A production system with observability.**

### User Testimonials

> *"I initially used Lovable AI but encountered repeated challenges trying to get the AI tools to interpret what I wanted. Stardrop turned my vision into a production-ready platform and elevated the website far beyond its original scope."*
> — **Jason Rosenbaum**, owner of theTravelGPT

> *"I would pay for this. I really really liked the cute hedgehog and UI and also how super intuitive everything is."*
> — Hunchie user feedback

### TravelGPT Pilot Deep-Dive (Paid Engagement)

- **41 tickets completed**, **154 total commits** across frontend, backend, and infrastructure
- Difficulty breakdown: 20 easy (42 commits), 8 medium (29 commits), 13 hard (83 commits)
- Hardest tasks: Curating 1,431 destinations across 50 states + 195 countries (13 iterations), POI geocoding with proximity scoring (11 iterations), travel planner UI (11 iterations)
- **100% ticket completion rate**
- Client switched FROM Lovable AI TO Stardrop mid-project

**[LIVE DEMO — 1:30]**
Walk through all 4 apps showing range: AI pipelines (TravelGPT) → data enrichment (Selecta) → healthcare domain logic (Canopy) → hardware companion (Hunchie).

---

## SLIDE 8 — THE ASK (20 sec)

### What We Need & Where It Goes

| Timeline | Milestone | Spend Allocation | SMART Success Metric |
|----------|-----------|------------------|----------------------|
| **M1-2** (Apr-May 2026) | Platform hardening + onboard first 10 paying users | 30% — compute infra, model costs | 10 STAR/CONSTELLATION subscribers, <2hr avg build time per wish |
| **M3-4** (Jun-Jul 2026) | Launch self-serve portal + SUPERNOVA tier | 25% — eng development, Stripe billing | 50 total paying users, 3 enterprise pilot LOIs signed |
| **M5-6** (Aug-Sep 2026) | Domain expansion (healthcare, finance verticals) | 25% — domain R&D, API integrations | $10K MRR, ≥40% gross margin, 2 case studies with measurable client ROI |
| **M7-9** (Oct-Dec 2026) | Scale GTM + hire 1 engineer, 1 GTM lead | 20% — salaries, marketing | $25K MRR, 200 total users, unit economics proven, seed-ready |

**Key milestones**:
- **M2**: 10 paying subscribers → validates willingness to pay
- **M4**: Self-serve platform live → users build apps without tagging us on X → proves scalability beyond concierge
- **M6**: $10K MRR at 40%+ margin → proves unit economics
- **M9**: $25K MRR, 200 users → seed round readiness

---

## SLIDE 9 — CONCLUSION (15 sec)

### Stardrop — Describe it. We build it.

The only platform where non-developers get production-grade, domain-intelligent applications — built, deployed on AWS, and monitored with Datadog.

**$37B market. Zero direct competitors in our quadrant. 4 flagship products live. 40+ apps created from tweets. Real paying clients.**

| | |
|---|---|
| **Arihant Choudhary** | arihant@berkeley.edu |
| **Company** | City Intelligence, Inc. |
| **X/Twitter** | @stardrop |
| **GitHub** | [github.com/stardrop-cli](https://github.com/stardrop-cli/stardrop-cli) |

*Tag @stardrop with your app idea. We'll build it live.*

---

# SPEAKER NOTES & TIMING GUIDE

| Slide | Duration | Cumulative | Key Point to Land |
|-------|----------|------------|-------------------|
| 1 - Title | 0:15 | 0:15 | "We turn plain-English descriptions into production software — built, deployed, and monitored" |
| 2 - Founder | 0:30 | 0:45 | "Berkeley + Stanford CS, graduated early from both. Cerebras, Intel, 3 top-venue publications. I don't just code — I deploy on AWS with Datadog and hand you a running business" |
| 3 - Problem | 0:30 | 1:15 | "30% of startups vibe-code MVPs in a week, then hit the Week Four Crisis. And nobody deploys or monitors what they build. 30M SMBs are completely locked out" |
| 4 - Market | 0:20 | 1:35 | "$3.9B today, $37B by 2032. Multi-agent already holds 50% share. We're riding that wave" |
| 5 - Solution | 0:40 | 2:15 | "Point to the map. Bottom-right: high complexity, low skill. That's us. And unlike every competitor — we deploy on YOUR AWS with Datadog monitoring. They give you code. We give you a running business" |
| 6 - Business | 0:30 | 2:45 | "$15/mo undercuts Lovable/Bolt at $25. 40+ apps created from tweets already. The Operator segment at $200/mo is our path to real revenue" |
| 7 - Traction | 0:15 + 1:30 demo | 4:30 | "4 apps, 4 verticals, each showcasing a different capability: AI pipelines, data enrichment, healthcare domain logic, hardware companion. All live. All deployed. One client switched FROM Lovable TO us" |
| 8 - Ask | 0:20 | 4:50 | "$10K MRR by month 6, $25K by month 9. Clear milestones tied to spend" |
| 9 - Close | 0:10 | 5:00 | "Tag @stardrop. We'll build it live." |

---

# APPENDIX — MENLO INCEPTION ONE-PAGER

## One-Pager: STARDROP

### Why Now
- **Vibe coding market at inflection**: $3.9B (2024) → $37B by 2032 at 32.5% CAGR (Congruence Market Insights). Multi-agent systems already hold ~50% market share; single-agent competitors sit at 30%
- **Citizen developer explosion**: 30% annual growth in non-developer adoption (Congruence Market Insights) — 30M+ SMBs need specialized software but cannot afford $50K-$500K custom development (Mordor Intelligence)
- **Week Four Crisis**: >30% of startups built MVPs with vibe coding tools, but these prototypes lack deterministic architecture and collapse under real-world usage
- **AI model capability leap**: Multi-agent orchestration across Claude, GPT, and Gemini is now production-viable, enabling "best model per task" workflows that single-agent tools structurally cannot replicate
- **Deployment gap**: Every vibe coding tool stops at code generation. Nobody deploys to AWS, sets up Datadog monitoring, or configures CI/CD pipelines. Stardrop does.

### Needs / Pain Points
1. **Non-developers are locked out of complex app creation** — Lovable, Bolt, and Replit handle landing pages and CRUD apps but break on multi-API workflows, domain-specific logic, and AI pipelines
2. **SMBs overpay for underpowered software** — A healthcare practice manager needing a clinical triage tool faces: $50K+ dev agency or a generic template that doesn't understand medical workflows
3. **Code without deployment is useless** — Competitors give you a React app. You still need someone to deploy it, set up a database, configure monitoring, and maintain it. That's 80% of the work.
4. **Zero domain intelligence** — Every vibe coding tool produces identical generic output regardless of industry

### Target Customers
**"The Dreamer"** (Consumer): Gen Z / young millennials (18-30) on X, TikTok, Product Hunt. Side project builders, hackathon participants. Products: theTravelGPT, Hunchie. LTV: $15-40/mo.

**"The Operator"** (Professional): Mid-career professionals (30-50) in healthcare, finance, events, hospitality. Department heads, practice managers, solo practitioners. Not developers. Need tools that understand their industry's specific logic, data sources, and compliance. Products: Canopy (2,000+ providers), Selecta. LTV: $200+/mo.

### North Star
Anyone — regardless of technical skill — describes a complex, domain-specific application in plain English and receives a production-grade, fully deployed and monitored product. Not code. Not a prototype. A running business on their own infrastructure.

### Competitive Landscape
The market is bifurcated. Low-skill tools (Lovable, Bolt, Replit, v0) handle simple apps but only output code. High-skill tools (Cursor, Windsurf, Copilot) require developers. Complex, deployed apps for non-developers? Only dev agencies at $50K-$500K+. **Stardrop is the only platform in the high-complexity, low-skill quadrant — AND the only one that deploys, monitors, and maintains.**

### Gap / Value Proposition
1. **Full-stack delivery, not just code** — Build → Docker → ECR → AWS App Runner → DynamoDB → Datadog monitoring → GitHub Actions CI/CD → custom domain. Competitors stop at "here's your code"
2. **Domain intelligence** — Context engine adapts to healthcare compliance (Canopy), travel logistics (TravelGPT), event management (Selecta), hardware integration (Hunchie)
3. **Multi-agent orchestration** — Best model per task (planning, coding, testing, integration agents). Not a single LLM wrapper
4. **Proven across 4 verticals** — Each flagship app showcases different capabilities: AI pipelines, data enrichment, domain logic, hardware companion
5. **10x price-performance** — $15/mo vs. competitors at $25/mo. $200/mo vs. dev agencies at $50K+

### Market Size
- **TAM**: $37B vibe coding market by 2032 (32.5% CAGR)
- **SAM**: ~50% multi-agent share = $18.5B by 2032
- **SOM (Year 1)**: 200 paying users → $25K MRR / $300K ARR by M9

### MVPs (Live Today)

**theTravelGPT** — *AI pipeline orchestration*
- GPT-4 itinerary generation + Mapbox interactive maps + Foursquare POI autocomplete + email delivery
- 550+ destinations, 1,431 curated entries across 50 states + 195 countries
- Paid client ($2K). Client switched FROM Lovable to Stardrop. 41 tickets, 154 commits, 100% completion
- [Live](https://www.thetravelgpt.com/)

**Selecta** — *Data enrichment + AI ranking*
- Enriches event applicants with LinkedIn and GitHub data, then intelligently ranks them
- Multi-criteria scoring, dark-theme UI, Clerk authentication
- Built for Inception Studio event curation
- [Live](https://john-whaley-app.vercel.app/linkedin)

**Canopy** — *Healthcare domain intelligence + full AWS deployment*
- Matches cancer patients/carers with non-medical support resources by diagnosis, treatment stage, location
- 2,000+ providers, 500+ sites. Rule-based matching with healthcare-specific logic
- Full AWS stack: App Runner + ECR + DynamoDB + Google Sheets sync
- React Native (Expo) mobile + Next.js web
- [Live](https://github.com/City-Intelligence-Inc/cancer-app)

**Hunchie** — *Hardware companion app*
- Posture tracking with Bluetooth device integration
- Proves Stardrop handles physical product software, not just SaaS
- Mobile-first onboarding with cute hedgehog mascot
- [Live](https://chic-stroopwafel-d56d4f.netlify.app/onboarding)

**+ 40 more apps** created from tweet mentions under City-Intelligence-Inc: golf tee-time finder, dessert recipe app, campus parking finder, social gym tracker, Indian e-reader, leetcode feed, sitar-to-tabla audio processor, Stanford lecture finder, and more.

### Business Models
| Tier | Price | Positioning |
|------|-------|-------------|
| FREE | $0/mo | 1 wish/month. Viral growth: "Built with Stardrop" badge = billboard |
| STAR | $15/mo | 5 wishes, multi-agent. Undercuts Bolt/Lovable Pro ($25/mo) |
| CONSTELLATION | $40/mo | Unlimited wishes, API integrations, collaboration. No competitor equivalent |
| SUPERNOVA | $200/mo | 10 seats, white-label, domain AI config, full AWS deployment + Datadog. vs. dev agencies at $50K+ |

**GTM**: Viral X/Twitter loop → "Built with Stardrop" badge → organic discovery. 40+ apps already created this way. Infrastructure costs: ~$300-1K/mo (serverless). Target: 60-70% gross margin.

### Key Risks / Open Qs
1. **Concierge → self-serve transition** — Currently building via X mentions. Can we ship self-serve by M4 without quality loss?
2. **Vertical vs. horizontal** — Go deep in 2-3 verticals (healthcare, events) or stay horizontal? Vertical = higher LTV, horizontal = larger TAM
3. **Multi-agent cost management** — Can we maintain 60%+ margins as application complexity increases?
4. **Competitor response** — Lovable/Bolt could add multi-agent + deployment. Their single-agent, code-only architecture = 12-18 month rebuild
5. **Enterprise readiness** — SUPERNOVA at $200/mo will need SOC 2, SSO, audit logs for enterprise sales

---

# APPENDIX — APPLICATION REFERENCE

**Applicant**: Arihant Choudhary (arihant@berkeley.edu)
**Company**: City Intelligence, Inc. (founded ~1.5 years ago)
**LinkedIn**: https://www.linkedin.com/in/arihantchoudhary/

**Bio**: Arihant Choudhary is the solo-founder of City Intelligence, Inc, a company offering Software Developmental Services using AI Agents. For 2 years in a row, his work has been published at top journals and conferences including ACM SIGCSE and ICLR. Before founding City, Arihant worked as Engineer for startups ranging from pre-seed to Series H (Cerebras) and also at large corporations (Intel). He self-funded his Bachelor's (UC Berkeley) and Master's (Stanford) in Computer Science and graduated a year early from both programs.

**Stage**: Piloting — running early pilots and engagements
**Location**: California
**Experience**: 7 years full-time professional
**Primary skill**: Engineering
**Management**: Small teams (up to 10)
**Achievement**: 3 papers, 3 years in a row — ACM SIGCSE 2024, ACM SIGCSE 2025, ICML 2026

**Problem statement (1-2 sentences)**: Non-developers and SMBs are locked out of building complex, domain-specific software applications. Stardrop uses multi-agent AI orchestration to turn plain-English descriptions into production-grade apps — built, deployed on AWS with Datadog monitoring, and maintained — the only platform occupying the high-complexity, low-skill-required quadrant that $50K+ dev agencies have monopolized.

**Why Menlo Inception Fund**: Founder-program fit. Arihant has been building City Intelligence for 1.5 years and believes the Menlo process — identifying venture-scale markets, refining customer pain points, and selecting entry strategy — will accelerate the transition from piloting to scalable revenue.

**Why uniquely suited to be a founder**: Self-funded BS (Berkeley) and MS (Stanford) in CS, graduating early from both. Published at top venues 3 years running. Shipped production AI systems at Cerebras and Intel. Already solo-founded City Intelligence and delivered 4+ live production apps across 4 verticals — each with real AWS infrastructure, monitoring, and users — plus 40+ tweet-to-app creations proving the viral distribution model works.

**GitHub orgs**: City-Intelligence-Inc (44 repos), stardrop-cli, arihantchoudhary
**Demo links**: [Selecta](https://john-whaley-app.vercel.app/linkedin) | [theTravelGPT](https://www.thetravelgpt.com/) | [Canopy](https://github.com/City-Intelligence-Inc/cancer-app) | [Hunchie](https://chic-stroopwafel-d56d4f.netlify.app/onboarding)
