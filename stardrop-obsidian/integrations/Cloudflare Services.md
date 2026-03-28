# Cloudflare Services

Cloudflare infrastructure for Stardrop's global edge deployment.

## Services

### Workers
- API server (`api.stardrop.dev`)
- Serverless function execution
- Global edge deployment

### Durable Objects
- `SyncServer` — Persistent real-time state
- Multi-client session sync
- Crash recovery

### R2 Buckets
- Session sharing storage
- File uploads
- Asset storage

### Pages
- Documentation site (`docs.stardrop.dev`)
- Web application hosting
- Automatic preview deploys

### DNS/CDN
- Domain management
- Edge caching
- SSL/TLS

## Deployment via SST

```typescript
// infra/app.ts
new sst.cloudflare.Worker("api", {
  handler: "packages/function/src/api.ts",
  url: true,
  // ...
})
```

## Related
- [[SST Config]]
- [[Function Workers]]
- [[Deployment Architecture]]
