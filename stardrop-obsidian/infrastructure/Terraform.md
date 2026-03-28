# Terraform

AWS infrastructure as code for Stardrop backend.

## Resources

### App Runner (`apprunner.tf`)

| Setting | Value |
|---------|-------|
| Service name | `stardrop-backend-{env}` |
| Runtime | Python 3.11 |
| Build | `pip3 install --target . -r requirements.txt` |
| Start | `python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000` |
| CPU | 1024 (1 vCPU) |
| Memory | 2048 MB |
| Health check | `GET /health` every 10s |
| Auto-deploy | Enabled (watches GitHub branch) |
| Source | `arihantchoudhary/stardrop` `/backend` directory |

### DynamoDB (`dynamodb.tf`)

| Table | Key | GSI | Billing |
|-------|-----|-----|---------|
| `stardrop-users-{env}` | `user_id` | `email-index` | PAY_PER_REQUEST |
| `stardrop-sessions-{env}` | `session_id` | `user-id-index` | PAY_PER_REQUEST |
| `stardrop-tweets-{env}` | `cache_key` | — | PAY_PER_REQUEST |

### IAM (`iam.tf`)

| Role | Purpose |
|------|---------|
| `apprunner_instance` | App Runner service execution |
| DynamoDB policy | CRUD + Query + Scan on all 3 tables |

## Environment Variables (passed to App Runner)

```
DYNAMODB_TABLE_NAME
DYNAMODB_SESSIONS_TABLE_NAME
DYNAMODB_TWEETS_TABLE_NAME
AWS_REGION (us-east-1)
ENVIRONMENT
CORS_ORIGINS
GITHUB_APP_ID
GITHUB_APP_PRIVATE_KEY
TWITTER_BEARER_TOKEN
TWITTER_ACCESS_TOKEN
TWITTER_ACCESS_TOKEN_SECRET
TWITTER_API_KEY
TWITTER_API_KEY_SECRET
TWITTER_OAUTH2_CLIENT_ID
TWITTER_OAUTH2_CLIENT_SECRET
```

## Related
- [[Environment Configuration]]
- [[Deployment Architecture]]
- [[AWS Services]]
