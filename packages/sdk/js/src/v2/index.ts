export * from "./client.js"
export * from "./server.js"

import { createStardropClient } from "./client.js"
import { createStardropServer } from "./server.js"
import type { ServerOptions } from "./server.js"

export async function createStardrop(options?: ServerOptions) {
  const server = await createStardropServer({
    ...options,
  })

  const client = createStardropClient({
    baseUrl: server.url,
  })

  return {
    client,
    server,
  }
}
