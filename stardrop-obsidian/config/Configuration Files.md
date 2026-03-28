# Configuration Files

Key configuration files across the Stardrop monorepo.

## Root

| File | Purpose |
|------|---------|
| `package.json` | Bun workspace root, Turbo config |
| `tsconfig.json` | TypeScript base config |
| `.editorconfig` | Editor formatting rules |
| `sst.config.ts` | SST infrastructure config |
| `CLAUDE.md` | Commit workflow + co-author instructions |
| `AGENTS.md` | Coding style guide |
| `CONTRIBUTING.md` | Contribution guidelines |

## Stardrop Self-Config (`.opencode/`)

| Path | Purpose |
|------|---------|
| `opencode.jsonc` | Main config (provider, MCP, tools) |
| `env.d.ts` | TypeScript environment types |
| `agent/triage.md` | Issue triage agent (Haiku model) |
| `agent/docs.md` | Documentation agent |
| `agent/duplicate-pr.md` | PR duplicate detector |
| `skill/bun-file-io/SKILL.md` | Bun file I/O patterns |
| `tool/github-triage.ts` | Issue triage tool |
| `tool/github-pr-search.ts` | PR search tool |

## Backend

| File | Purpose |
|------|---------|
| `backend/.env` | Environment variables (gitignored) |
| `backend/app/config.py` | Pydantic settings loader |
| `backend/requirements.txt` | Python dependencies |

## Frontend

| File | Purpose |
|------|---------|
| `frontend/package.json` | Next.js 16 + Clerk + shadcn |
| `frontend/next.config.ts` | Next.js configuration |
| `.vercel/project.json` | Vercel project linking |

## Infrastructure

| File | Purpose |
|------|---------|
| `terraform/variables.tf` | All Terraform variable definitions |
| `terraform/terraform.tfvars` | Environment-specific values |
| `infra/secret.ts` | SST secret management |
| `infra/stage.ts` | Environment/stage config |

## CI/CD

| File | Purpose |
|------|---------|
| `.github/workflows/*.yml` | 28 GitHub Actions workflows |
| `packages/slack/.env.example` | Slack bot env template |

## Related
- [[Environment Configuration]]
- [[Plugin System]]
- [[Core Engine]]
