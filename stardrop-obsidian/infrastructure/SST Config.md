# SST Config

Serverless Stack (SST) configuration for Cloudflare-based infrastructure.

**File**: `sst.config.ts` + `infra/`

## Infra Files

| File | Purpose |
|------|---------|
| `infra/app.ts` | API, Web, WebApp deployment |
| `infra/console.ts` | Console/dashboard |
| `infra/enterprise.ts` | Enterprise features |
| `infra/secret.ts` | Secret management |
| `infra/stage.ts` | Environment/stage config |

## Deployment Targets

### Cloudflare Workers (Primary)
- API server
- Durable Objects for real-time sync
- R2 buckets for file storage
- Edge caching via CDN

### Astro Site (Docs)
- Static site generation
- Cloudflare Pages deployment

### Static Site (Web App)
- SolidJS application
- Cloudflare Pages deployment

## Secrets Managed

| Secret | Purpose |
|--------|---------|
| GitHub App credentials | Bot integration |
| Admin secret | API authentication |
| Discord bot token | Support notifications |
| Feishu integration | Enterprise chat |
| Stripe keys | Payment processing |
| PlanetScale credentials | MySQL database |
| Cloudflare API token | DNS/CDN management |

## Stage/Environment Pattern

```
bun sst deploy --stage=dev
bun sst deploy --stage=staging
bun sst deploy --stage=production
```

## Related
- [[Cloudflare Services]]
- [[Environment Configuration]]
- [[Deployment Architecture]]
