# Preview Deployments

**File**: `.github/workflows/stardrop-preview.yml`

Ephemeral per-PR environments for testing Stardrop changes.

## Trigger

PRs from `stardrop-cli` bot.

## Deploy Job (PR opened/updated)

1. Build Docker image from `packages/stardrop/Dockerfile`
   - Alpine Linux base
   - Multi-arch: ARM64 + AMD64
2. Tag with commit SHA
3. Push to ECR (`stardrop-preview`)
4. Create/update App Runner service (`stardrop-preview-pr-{PR_NUMBER}`)
   - Port: 4096
   - CPU: 1024, Memory: 2048 MB
5. Wait for RUNNING status
6. Post preview URL as PR comment

## Teardown Job (PR closed)

1. Delete App Runner service
2. Clean up ECR images

## IAM

- Role: `stardrop-preview-ecr-access`
- Permissions: ECR push/pull, App Runner manage

## Preview URL Format

```
https://<random-id>.us-east-1.apprunner.amazonaws.com/
```

## Related
- [[Environment Configuration]]
- [[GitHub Actions Overview]]
- [[Terraform]]
