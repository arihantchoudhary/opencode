#!/usr/bin/env bun

import { Script } from "stardrop-script"
import { $ } from "bun"

if (!Script.preview) {
  await $`gh release edit v${Script.version} --draft=false`
}

await $`bun install`

await $`gh release download --pattern "stardrop-linux-*64.tar.gz" --pattern "stardrop-darwin-*64.zip" -D dist`

await import(`../packages/stardrop/script/publish-registries.ts`)
