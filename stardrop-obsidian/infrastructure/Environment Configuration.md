# Environment Configuration

## Environments

### DEV
- **Branch**: `dev`
- **Backend**: AWS App Runner (`stardrop-backend-dev`)
- **Frontend**: `http://localhost:3000` (local) / Vercel (deployed)
- **DynamoDB**: `stardrop-users-dev`, `stardrop-sessions-dev`, `stardrop-tweets-dev`
- **CORS**: `http://localhost:3000`

### STAGING (Planned)
- **Branch**: `dev` with `--stage=staging`
- **Pattern**: Same as dev with separate secrets
- **DynamoDB**: `stardrop-*-staging`

### PRODUCTION
- **Branch**: `production`
- **Backend**: AWS App Runner (`stardrop-backend-production`)
- **Frontend**: `https://stardrop-frontend.vercel.app`
- **DynamoDB**: `stardrop-*-production`
- **CORS**: `https://stardrop-frontend.vercel.app`

### PREVIEW (Per-PR)
- **Trigger**: PRs from `stardrop-cli`
- **Service**: `stardrop-preview-pr-{PR_NUMBER}`
- **ECR**: `stardrop-preview` repository
- **Lifecycle**: Created on PR open, destroyed on PR close
- **URL**: Posted as PR comment

## Credential Locations

| Secret | Location |
|--------|----------|
| Backend env vars | `backend/.env` (gitignored) |
| Terraform vars | `terraform/terraform.tfvars` |
| CI/CD secrets | GitHub Actions Secrets |
| SST secrets | `infra/secret.ts` |
| Vercel config | `.vercel/project.json` |

## Related
- [[Terraform]]
- [[SST Config]]
- [[Preview Deployments]]
