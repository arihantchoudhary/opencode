# Cerebras Infrastructure

This directory contains Terraform configuration for Cerebras usage tracking infrastructure on AWS.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.0
- AWS CLI configured with appropriate credentials
- AWS IAM permissions for DynamoDB

## Quick Start

### 1. Initialize Terraform

```bash
cd infra
terraform init
```

### 2. Review the Plan

```bash
terraform plan
```

### 3. Apply Configuration

```bash
terraform apply
```

This will create:

- `dev-cerebras-users` - Users table
- `dev-cerebras-api-keys` - API Keys table
- `dev-cerebras-usage-sessions` - Usage Sessions table (90-day TTL)
- `dev-cerebras-usage-events` - Usage Events table (30-day TTL)

## Environments

To deploy to different environments:

```bash
# Development (default)
terraform apply

# Staging
terraform apply -var="environment=staging"

# Production
terraform apply -var="environment=prod"
```

## Table Structure

### Users Table

- **PK**: `USER#<userId>`
- **SK**: `METADATA`
- **GSI1**: Email lookup index

### API Keys Table

- **PK**: `USER#<userId>`
- **SK**: `APIKEY#<keyId>`
- **GSI1**: Key authentication lookup

### Usage Sessions Table

- **PK**: `USER#<userId>`
- **SK**: `SESSION#<timestamp>#<sessionId>`
- **GSI1**: Time-range queries
- **TTL**: 90 days

### Usage Events Table

- **PK**: `SESSION#<sessionId>`
- **SK**: `EVENT#<timestamp>#<eventId>`
- **GSI1**: User events lookup
- **TTL**: 30 days

## Outputs

After applying, you'll see the table names:

```bash
terraform output
```

Example:

```
users_table_name = "dev-cerebras-users"
api_keys_table_name = "dev-cerebras-api-keys"
usage_sessions_table_name = "dev-cerebras-usage-sessions"
usage_events_table_name = "dev-cerebras-usage-events"
```

## Cost Estimation

All tables use **PAY_PER_REQUEST** billing (on-demand):

- **Users**: ~$0.00 per month (low traffic)
- **API Keys**: ~$0.00 per month (low traffic)
- **Usage Sessions**: ~$1-5 per month (depends on usage)
- **Usage Events**: ~$5-20 per month (depends on event volume)

Data automatically expires via TTL, keeping costs low.

## Remote State (Optional)

For team collaboration, configure S3 backend in `main.tf`:

```hcl
backend "s3" {
  bucket = "cerebras-terraform-state"
  key    = "infrastructure/terraform.tfstate"
  region = "us-east-1"
}
```

## Clean Up

To destroy all resources:

```bash
terraform destroy
```

## Next Steps

1. Deploy the FastAPI backend
2. Configure environment variables with table names
3. Implement API key authentication in the CLI
4. Add usage tracking middleware
