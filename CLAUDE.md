# OpenCode

## Workflow

- **Commit and push every prompt.** After completing work for each user message, stage the relevant changes, commit, and push to the current branch. Do not wait for the user to ask.
- Co-author all commits with:
  ```
  Co-Authored-By: Stardrop <rosemaryrunner@icloud.com>
  ```

## Repo Scaffold

Every new repo created from the Stardrop dashboard gets:
- `frontend/` — full Next.js + shadcn + Clerk project with landing page and dashboard
- `CLAUDE.md` with instructions to deploy via `npx vercel --prod --yes` and update README with the live URL
- Commit-every-prompt workflow and Rosemary co-author baked in

## Vercel Deployment

Scaffolded repos instruct Stardrop/Claude Code to deploy using the Vercel CLI:
```
cd frontend && npx vercel --prod --yes
```
After deploy, the permanent URL (`https://<project>.vercel.app`) goes in the README.
Subsequent pushes auto-deploy via Vercel's GitHub integration.
