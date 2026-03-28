# Provider System

Stardrop integrates with 21 LLM providers through a unified interface built on the Vercel AI SDK.

## Supported Providers

| Provider | Models | Auth Method |
|----------|--------|-------------|
| **Anthropic** | Claude 4.x, Opus, Sonnet, Haiku | API Key |
| **OpenAI** | GPT-4o, o1, o3 | API Key |
| **Google Gemini** | Gemini 2.x | API Key |
| **Google Vertex AI** | Gemini via GCP | Service Account |
| **Azure OpenAI** | GPT-4o via Azure | API Key + Endpoint |
| **AWS Bedrock** | Claude, Titan, etc. | IAM Credentials |
| **Mistral** | Mistral Large, Medium | API Key |
| **Groq** | Llama, Mixtral | API Key |
| **DeepInfra** | Open models | API Key |
| **Cerebras** | Fast inference | API Key |
| **Cohere** | Command R+ | API Key |
| **Together AI** | Open models | API Key |
| **Perplexity** | pplx models | API Key |
| **X.AI** | Grok | API Key |
| **OpenRouter** | Multi-provider proxy | API Key |
| **GitHub Copilot** | GPT-4o via Copilot | OAuth |
| **GitLab Duo** | Claude via GitLab | OAuth |
| **Ollama** | Local models | Local |
| **LM Studio** | Local models | Local |
| **Custom/OpenAI-Compatible** | Any | API Key |

## Key Files

| File | Purpose |
|------|---------|
| `src/provider/provider.ts` | Main registry, model resolution, response transform |
| `src/provider/auth.ts` | OAuth flows, API key management |
| `src/provider/models.ts` | Model catalog with capabilities |
| `src/provider/models-snapshot.ts` | 1.7MB cached model data |

## Provider Architecture

```
User selects model
  → Provider registry resolves provider
  → Auth layer provides credentials
  → Transform layer normalizes request
  → AI SDK sends to provider API
  → Transform layer normalizes response
  → Session receives streamed tokens
```

## Model Selection

- Each provider exposes multiple models
- Models have capability flags (tool use, vision, streaming, etc.)
- Token limits vary per model
- Prompt builder adapts to selected model's context window

## Authentication

- API keys stored in environment or config
- OAuth for GitHub Copilot, GitLab Duo
- IAM credential chains for AWS Bedrock
- Service accounts for Google Vertex AI

## Related
- [[Core Engine]]
- [[Session Architecture]]
- [[Tech Stack]]
