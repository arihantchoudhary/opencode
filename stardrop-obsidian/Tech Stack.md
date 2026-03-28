# Tech Stack

Complete technology inventory for the Stardrop platform.

## Core

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Bun | 1.3.5 |
| Language | TypeScript | 5.8.2 |
| Package Manager | Bun workspaces | — |
| Monorepo | Turbo | 2.5.6 |
| HTTP Server | Hono | 4.10.7 |
| AI/LLM SDK | Vercel AI SDK | 5.0.119 |

## Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| Web Framework | SolidJS | 1.9.10 |
| Dashboard SSR | Next.js | 16.2.1 |
| Static Docs | Astro | 5.7.13 |
| Desktop | Tauri | 2.x |
| Mobile | Expo + React Native | 54 / 0.81.5 |
| UI Components | Kobalte + shadcn | 0.13.11 / 4.1.1 |
| Styling | Tailwind CSS | 4.1.11 |
| Icons | Lucide React | 1.7.0 |
| Auth | Clerk | 7.0.7 |
| React | React | 19.2.4 |

## Backend

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | FastAPI | 0.115.0 |
| Server | Uvicorn | 0.30.0 |
| AWS SDK | Boto3 | 1.35.0 |
| Validation | Pydantic | 2.9.0 |
| HTTP Client | Requests | 2.32.0 |
| OAuth | requests-oauthlib | 2.0.0 |
| JWT | PyJWT | 2.9.0 |

## Infrastructure

| Layer | Technology |
|-------|-----------|
| Compute | AWS App Runner, Cloudflare Workers |
| Database | DynamoDB, PlanetScale (MySQL) |
| Storage | Cloudflare R2, AWS S3 |
| CDN | Cloudflare |
| Frontend Host | Vercel, Cloudflare Pages |
| IaC | Terraform, SST |
| CI/CD | GitHub Actions (28 workflows) |
| Containers | Docker (Alpine, multi-arch) |
| Registry | AWS ECR |
| Monitoring | Datadog (planned) |

## Testing

| Layer | Technology | Version |
|-------|-----------|---------|
| E2E | Playwright | 1.51.0 |
| Lint | ESLint | 9.x |
| Format | Prettier | 3.6.2 |

## LLM Providers (21)

Anthropic, OpenAI, Google Gemini, Google Vertex AI, Azure OpenAI, AWS Bedrock, Mistral, Groq, DeepInfra, Cerebras, Cohere, Together AI, Perplexity, X.AI, OpenRouter, GitHub Copilot, GitLab Duo, Ollama, LM Studio, and custom OpenAI-compatible endpoints.

## Related
- [[Architecture Overview]]
- [[Provider System]]
- [[Deployment Architecture]]
