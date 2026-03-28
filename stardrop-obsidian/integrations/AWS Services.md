# AWS Services

AWS infrastructure used by Stardrop backend.

## Services

### App Runner
- Hosts Python FastAPI backend
- Auto-deploy from GitHub `dev` branch
- Health check at `/health`
- 1 vCPU, 2 GB memory
- Auto-scaling enabled

### DynamoDB
- 3 tables per environment (users, sessions, tweets)
- PAY_PER_REQUEST billing (no provisioned capacity)
- GSIs for email and user-id lookups

### ECR (Elastic Container Registry)
- `stardrop-preview` repository for PR preview images
- Multi-arch Docker images (ARM64 + AMD64)

### IAM
- App Runner instance role
- DynamoDB access policies
- ECR push/pull for preview deployments

### S3 / R2
- Session file storage
- Asset hosting

## Region

All resources in `us-east-1`.

## Related
- [[Terraform]]
- [[Environment Configuration]]
- [[Preview Deployments]]
