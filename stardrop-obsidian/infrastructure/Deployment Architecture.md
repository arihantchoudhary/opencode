# Deployment Architecture

Complete production deployment topology for Stardrop.

## Services Map

| Service | Platform | URL Pattern |
|---------|----------|-------------|
| Stardrop CLI | npm | `npm i -g stardrop` |
| Desktop App | GitHub Releases | macOS/Linux/Windows binaries |
| Web App | Cloudflare Pages | `stardrop.dev` |
| Docs Site | Cloudflare Pages | `docs.stardrop.dev` |
| API Server | Cloudflare Workers | `api.stardrop.dev` |
| Frontend Dashboard | Vercel | `stardrop-frontend.vercel.app` |
| Backend API | AWS App Runner | Auto-generated URL |
| Mobile App | Expo | App Store / Play Store |

## Development

| Command | Purpose |
|---------|---------|
| `bun install` | Install all dependencies |
| `bun dev` | Run Stardrop locally |
| `bun dev serve` | Start API server (port 4096) |
| `bun dev web` | Start web UI |
| `cd frontend && bun dev` | Start Next.js dashboard |
| `cd backend && uvicorn app.main:app` | Start FastAPI backend |

## Production Pipeline

```
Push to dev
  → GitHub Actions typecheck
  → SST deploy to Cloudflare (staging)
  → App Runner auto-deploy (backend)
  → Vercel auto-deploy (frontend)

Push to production
  → Same pipeline with production secrets
  → Desktop builds via publish.yml
  → npm publish
```

## Related
- [[Terraform]]
- [[SST Config]]
- [[GitHub Actions Overview]]
- [[Environment Configuration]]
