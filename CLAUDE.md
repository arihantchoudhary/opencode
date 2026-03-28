# OpenCode

## Workflow

- **Commit and push every prompt.** After completing work for each user message, stage the relevant changes, commit, and push to the current branch. Do not wait for the user to ask.
- Co-author all commits with: `Co-Authored-By: Rosemary <rosemaryrunner@icloud.com>`

## Repo Scaffold

Every new repo created from the Stardrop dashboard gets:
- `frontend/` — full Next.js + shadcn + Clerk project with landing page and dashboard
- Auto-deployed to Vercel (linked to the GitHub repo, builds from `frontend/`)
- README updated with the permanent Vercel URL
- `CLAUDE.md` with commit-every-prompt workflow

## Vercel

Requires `VERCEL_TOKEN` and optionally `VERCEL_TEAM_ID` env vars on the backend.
Projects are created via the Vercel API with `rootDirectory: "frontend"` and auto-deploy on push.
The permanent URL is `https://<project-name>.vercel.app`.
