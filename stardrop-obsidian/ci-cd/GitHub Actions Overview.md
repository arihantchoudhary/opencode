# GitHub Actions Overview

28 CI/CD workflows in `.github/workflows/`.

## Core Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `stardrop.yml` | `@stardrop-cli` mention, `/sd` command, `stardrop` label | Autonomous AI agent on GitHub |
| `stardrop-preview.yml` | PRs from `stardrop-cli` | Per-PR preview environments |
| `publish.yml` | Push to `dev` or manual dispatch | npm + Tauri desktop releases |
| `deploy.yml` | Push to `dev` or `production` | SST deploy to Cloudflare |
| `test.yml` | PR/push | CI testing + typecheck |
| `pr-standards.yml` | PR events | PR quality enforcement |
| `review.yml` | PR events | Automated code review |

## Operational Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `daily-issues-recap.yml` | Cron (daily) | Issue metrics summary |
| `daily-pr-recap.yml` | Cron (daily) | PR metrics summary |
| `docs-update.yml` | Push | Auto-update documentation |
| `stats.yml` | Push | Repository statistics |

## Publishing Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `publish-vscode.yml` | Manual | VSCode extension publish |
| `publish-github-action.yml` | Manual | GitHub Action publish |
| `nix-desktop.yml` | Release | Nix package definition |

## Related
- [[Stardrop Agent Workflow]]
- [[Publish Pipeline]]
- [[Preview Deployments]]
