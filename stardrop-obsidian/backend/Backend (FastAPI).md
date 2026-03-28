# Backend (FastAPI)

Python REST API for Twitter mentions, user management, and GitHub repo scaffolding.

**Framework**: FastAPI | **DB**: DynamoDB | **Deploy**: AWS App Runner

## Route Map

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/health` | Health check |
| `GET` | `/api/users` | List users |
| `POST` | `/api/users` | Create user |
| `GET` | `/api/users/by-clerk/{clerk_id}` | Lookup by Clerk ID |
| `PATCH` | `/api/users/by-clerk/{clerk_id}` | Update user |
| `GET` | `/api/twitter/dashboard/{username}` | Combined mentions + profile + stats |
| `GET` | `/api/twitter/mentions/{username}` | Cached Twitter mentions |
| `GET` | `/api/twitter/profile/{username}` | User profile |
| `POST` | `/api/twitter/refresh/{username}` | Force refresh (rate limited: 4/min) |
| `GET` | `/api/twitter/thread/{conversation_id}` | Thread fetch |
| `GET` | `/admin/repos` | List GitHub repos |
| `POST` | `/admin/scaffold` | Scaffold new repo from template |

## Data Models

### UserCreate
```
email, name, clerk_id, avatar_url, bio,
twitter_handle, auth_provider, signup_source
```

### UserResponse
```
user_id, email, name, clerk_id, avatar_url, bio,
twitter_handle, created_at, updated_at, last_login,
dismissed_tweet_ids, refresh_timestamps, projects
```

## Twitter Integration

- OAuth 1.0a user-context auth (primary)
- Bearer Token fallback (app-only)
- 15-minute DynamoDB cache for mentions
- Decimal conversion for DynamoDB compatibility
- Rate limiting: 4 refreshes per 60 seconds per user

## GitHub App Integration

- App ID: `2888752`
- Auto-scaffolds repos: Next.js + shadcn + Clerk + CLAUDE.md
- Creates repos under `arihantchoudhary` org

## Dependencies

```
fastapi==0.115.0
uvicorn[standard]==0.30.0
boto3==1.35.0
pydantic==2.9.0
pydantic-settings==2.5.0
requests==2.32.0
requests-oauthlib==2.0.0
PyJWT[crypto]==2.9.0
```

## Related
- [[Twitter Integration]]
- [[API Endpoints]]
- [[Terraform]]
