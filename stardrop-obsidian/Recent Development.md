# Recent Development

Major features and themes from recent git history.

## Latest Work (March 2026)

### 1. Twitter OAuth Overhaul
- Added OAuth 1.0a user-context auth (Access Token + Secret)
- Added OAuth 2.0 Client ID + Secret
- Added Bearer Token
- Updated backend to use `_authed_get()` with OAuth 1.0a priority
- Updated Terraform with all Twitter credential variables
- Successfully tweeted from CLI: "Hello from Claude Code!"
- Account: @stardroplin (Stardrop)

### 2. Landing Page Restoration
- Restored full pitch deck landing page with:
  - Hero, integrations marquee (24 APIs)
  - Delivery stack, how-it-works
  - Live products (4 verticals)
  - Competitive quadrant + comparison table
  - Pricing tiers (Free / $15 / $40 / $200)
  - Market opportunity ($37B TAM)
- Updated for lucide-react v1.7 (brand icons removed)
- Updated for Clerk v7 API changes
- Added `@clerk/nextjs`, shadcn badge + card components

### 3. Next.js Frontend Scaffolding
- Auto-scaffold Next.js + shadcn + Clerk in new repos
- Vercel deploy integration
- CLAUDE.md with commit workflow baked in

### 4. Mobile App (Expo)
- Tab navigation: Dashboard, Mentions, Projects, Profile
- Clerk Expo auth with SecureStore
- Full API parity with web dashboard

### 5. Inter + Newsreader Fonts
- Adopted talent-matcher style design system
- Clean, monochrome, professional aesthetic

## Previous Major Features

- Twitter mentions tracking with DynamoDB caching
- Clerk authentication (web + mobile)
- GitHub App repo scaffolding
- Session analytics dashboard
- Integrations showcase (24 APIs)
- Competitive landscape section
- Rate-limited refresh (4/min per user)

## Related
- [[Twitter Integration]]
- [[Frontend (Next.js)]]
- [[Mobile App (Expo)]]
