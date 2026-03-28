# Specs Index

Architecture specifications and roadmaps in `/specs/`.

## Specifications

| File | Topic | Summary |
|------|-------|---------|
| `01-persist-payload-limits.md` | Session Payloads | Optimize session data persistence, handle large payloads |
| `02-cache-eviction.md` | Caching | Eviction strategies for session and model caches |
| `03-request-throttling.md` | Rate Limiting | Request throttling for API endpoints and LLM calls |
| `04-scroll-spy-optimization.md` | TUI Performance | Optimize terminal UI scrolling and rendering |
| `05-modularize-and-dedupe.md` | Code Organization | Break monolithic files into modules, remove duplication |
| `06-app-i18n-audit.md` | Internationalization | Audit and fix i18n coverage in web app |
| `07-ui-i18n-audit.md` | Internationalization | Audit and fix i18n in UI component library |
| `08-app-e2e-smoke-suite.md` | Testing | End-to-end smoke test suite with Playwright |
| `perf-roadmap.md` | Performance | Performance improvement roadmap |
| `project.md` | Multi-Project | Multi-project/workspace architecture and API schema |

## Key Themes

1. **Performance** — Payload limits, caching, throttling, scroll optimization
2. **Quality** — Testing, code organization, deduplication
3. **Internationalization** — Full i18n audit across app and UI packages
4. **Scale** — Multi-project workspaces, session management at scale

## Related
- [[Architecture Overview]]
- [[Core Engine]]
- [[App]]
