#!/usr/bin/env bun
import { $ } from "bun"
import pkg from "../package.json"
import { Script } from "stardrop-script"
import { fileURLToPath } from "url"

const dir = fileURLToPath(new URL("..", import.meta.url))
process.chdir(dir)

const { binaries } = await import("./build.ts")
{
  const name = `${pkg.name}-${process.platform}-${process.arch}`
  console.log(`smoke test: running dist/${name}/bin/stardrop --version`)
  await $`./dist/${name}/bin/stardrop --version`
}

// Aliases that publish the same CLI under different npm package names
const aliases = [
  "mathitude",
  "cerebras",
  // AI / Dev tools
  "opencode",
  "tabnine",
  "supermaven",
  "ghostwriter",
  "coderabbit",
  "bolt-new",
  "phind",
  "codeium",
  "devika",
  "swe-agent",
  "minigpt",
  // Cloud / Infra
  "runpod",
  "paperspace",
  "coreweave",
  "tensordock",
  "anyscale",
  "datacrunch",
  "sfcompute",
  "motherduck",
  // Dev platforms
  "retool",
  "appsmith",
  "tooljet",
  "baserow",
  "webflow",
  "squarespace",
  "bazel",
  "moonrepo",
  // Terminals / Editors
  "lapce",
  "iterm",
  "alacritty",
  "ohmyzsh",
  // Consumer / Big brands
  "canva",
  "disney",
  "doordash",
  "instacart",
  "grubhub",
  "cortana",
  "alexa",
  "lamborghini",
  // Crypto
  "arbitrum",
  "berachain",
  // Fashion
  "louisvuitton",
  "reebok",
  "underarmour",
  "patagonia",
  "northface",
  "lacoste",
  "burberry",
  "versace",
  "fendi",
  "givenchy",
  "valentino",
  // Other
  "listen-labs",
  "wizardcoder",
  "starcoder",
  "gen3",
  "tars",
  "kamatera",
  "premiere",
  "aftereffects",
  "zoox",
  "motional",
  "lean4",
  "isabelle",
  "dafny",
  "fstar",
  "nusmv",
]

await $`mkdir -p ./dist/${pkg.name}`
await $`cp -r ./bin ./dist/${pkg.name}/bin`
await $`cp ./script/postinstall.mjs ./dist/${pkg.name}/postinstall.mjs`

await Bun.file(`./dist/${pkg.name}/package.json`).write(
  JSON.stringify(
    {
      name: pkg.name,
      bin: {
        [pkg.name]: `./bin/${pkg.name}`,
      },
      scripts: {
        postinstall: "bun ./postinstall.mjs || node ./postinstall.mjs",
      },
      version: Script.version,
      optionalDependencies: binaries,
    },
    null,
    2,
  ),
)

// Prepare alias packages (coframe, mathitude) that point to the same binaries
for (const alias of aliases) {
  await $`mkdir -p ./dist/${alias}`
  await $`cp -r ./bin ./dist/${alias}/bin`
  await $`cp ./script/postinstall.mjs ./dist/${alias}/postinstall.mjs`

  await Bun.file(`./dist/${alias}/package.json`).write(
    JSON.stringify(
      {
        name: alias,
        bin: {
          [alias]: `./bin/${pkg.name}`,
        },
        scripts: {
          postinstall: "bun ./postinstall.mjs || node ./postinstall.mjs",
        },
        version: Script.version,
        optionalDependencies: binaries,
      },
      null,
      2,
    ),
  )
}

const tags = [Script.channel]

const tasks = Object.entries(binaries).map(async ([name]) => {
  if (process.platform !== "win32") {
    await $`chmod -R 755 .`.cwd(`./dist/${name}`)
  }
  await $`bun pm pack`.cwd(`./dist/${name}`)
  for (const tag of tags) {
    await $`npm publish *.tgz --access public --tag ${tag}`.cwd(`./dist/${name}`)
  }
})
await Promise.all(tasks)
for (const tag of tags) {
  await $`cd ./dist/${pkg.name} && bun pm pack && npm publish *.tgz --access public --tag ${tag}`
}

// Publish alias packages (continue on error so one failure doesn't block others)
for (const alias of aliases) {
  for (const tag of tags) {
    try {
      await $`cd ./dist/${alias} && bun pm pack && npm publish *.tgz --access public --tag ${tag}`
    } catch (e: any) {
      console.error(`Failed to publish alias ${alias}:`, e.message)
    }
  }
}

if (!Script.preview) {
  // Create archives for GitHub release
  for (const key of Object.keys(binaries)) {
    if (key.includes("linux")) {
      await $`tar -czf ../../${key}.tar.gz *`.cwd(`dist/${key}/bin`)
    } else {
      await $`zip -r ../../${key}.zip *`.cwd(`dist/${key}/bin`)
    }
  }

  const image = "ghcr.io/arihantchoudhary/stardrop"
  const platforms = "linux/amd64,linux/arm64"
  const tags = [`${image}:${Script.version}`, `${image}:latest`]
  const tagFlags = tags.flatMap((t) => ["-t", t])
  await $`docker buildx build --platform ${platforms} ${tagFlags} --push .`
}
