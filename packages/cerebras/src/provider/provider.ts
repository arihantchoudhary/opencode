import z from "zod"
import fuzzysort from "fuzzysort"
import { Config } from "../config/config"
import { mergeDeep, sortBy } from "remeda"
import { NoSuchModelError, type LanguageModel, type Provider as SDK } from "ai"
import { Log } from "../util/log"
import { BunProc } from "../bun"
import { Plugin } from "../plugin"
import { ModelsDev } from "./models"
import { NamedError } from "@cerebras-ai/util/error"
import { Auth } from "../auth"
import { Instance } from "../project/instance"
import { Flag } from "../flag/flag"
import { iife } from "@/util/iife"

// Direct imports for bundled providers
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

export namespace Provider {
  const log = Log.create({ service: "provider" })

  const BUNDLED_PROVIDERS: Record<string, (options: any) => SDK> = {
    "@ai-sdk/openai-compatible": createOpenAICompatible,
  }

  type CustomLoader = (provider: ModelsDev.Provider) => Promise<{
    autoload: boolean
    getModel?: (sdk: any, modelID: string, options?: Record<string, any>) => Promise<any>
    options?: Record<string, any>
  }>

  type Source = "env" | "config" | "custom" | "api"

  const CUSTOM_LOADERS: Record<string, CustomLoader> = {
    async cerebras(input) {
      // Cerebras-specific optimizations for GLM 4.6 and other models
      const hasKey = await (async () => {
        if (input.env.some((item) => process.env[item])) return true
        if (await Auth.get(input.id)) return true
        return false
      })()

      return {
        autoload: hasKey,
        options: {
          headers: {
            "X-Client": "cerebras",
            "X-Client-Version": "1.0",
          },
          // Enable Cerebras-specific features
          // Note: These options are passed through to the SDK
          fetch: async (url: RequestInfo | URL, init?: RequestInit) => {
            // Add request deduplication and caching headers
            const headers = new Headers(init?.headers)
            headers.set("Cache-Control", "no-cache")

            return fetch(url, {
              ...init,
              headers,
            })
          },
        },
      }
    },
  }

  const state = Instance.state(async () => {
    using _ = log.time("state")
    const config = await Config.get()
    let database = await ModelsDev.get()

    // Remove Anthropic provider, keep everything else
    database = Object.fromEntries(
      Object.entries(database).filter(
        ([providerID]) => providerID !== "anthropic" && !providerID.startsWith("anthropic/"),
      ),
    )

    const disabled = new Set(config.disabled_providers ?? [])
    const enabled = config.enabled_providers ? new Set(config.enabled_providers) : null

    function isProviderAllowed(providerID: string): boolean {
      // Block Anthropic
      if (providerID === "anthropic" || providerID.startsWith("anthropic/")) return false
      if (enabled && !enabled.has(providerID)) return false
      if (disabled.has(providerID)) return false
      return true
    }

    const providers: {
      [providerID: string]: {
        source: Source
        info: ModelsDev.Provider
        getModel?: (sdk: any, modelID: string, options?: Record<string, any>) => Promise<any>
        options: Record<string, any>
      }
    } = {}
    const models = new Map<
      string,
      {
        providerID: string
        modelID: string
        info: ModelsDev.Model
        language: LanguageModel
        npm?: string
      }
    >()
    const sdk = new Map<number, SDK>()
    // Maps `${provider}/${key}` to the provider’s actual model ID for custom aliases.
    const realIdByKey = new Map<string, string>()

    log.info("init")

    function mergeProvider(
      id: string,
      options: Record<string, any>,
      source: Source,
      getModel?: (sdk: any, modelID: string, options?: Record<string, any>) => Promise<any>,
    ) {
      const provider = providers[id]
      if (!provider) {
        const info = database[id]
        if (!info) return
        if (info.api && !options["baseURL"]) options["baseURL"] = info.api
        providers[id] = {
          source,
          info,
          options,
          getModel,
        }
        return
      }
      provider.options = mergeDeep(provider.options, options)
      provider.source = source
      provider.getModel = getModel ?? provider.getModel
    }

    const configProviders = Object.entries(config.provider ?? {})

    for (const [providerID, provider] of configProviders) {
      const existing = database[providerID]
      const parsed: ModelsDev.Provider = {
        id: providerID,
        npm: provider.npm ?? existing?.npm,
        name: provider.name ?? existing?.name ?? providerID,
        env: provider.env ?? existing?.env ?? [],
        api: provider.api ?? existing?.api,
        models: existing?.models ?? {},
      }

      for (const [modelID, model] of Object.entries(provider.models ?? {})) {
        const existing = parsed.models[model.id ?? modelID]
        const name = iife(() => {
          if (model.name) return model.name
          if (model.id && model.id !== modelID) return modelID
          return existing?.name ?? modelID
        })
        const parsedModel: ModelsDev.Model = {
          id: modelID,
          name,
          release_date: model.release_date ?? existing?.release_date,
          attachment: model.attachment ?? existing?.attachment ?? false,
          reasoning: model.reasoning ?? existing?.reasoning ?? false,
          temperature: model.temperature ?? existing?.temperature ?? false,
          tool_call: model.tool_call ?? existing?.tool_call ?? true,
          cost:
            !model.cost && !existing?.cost
              ? {
                  input: 0,
                  output: 0,
                  cache_read: 0,
                  cache_write: 0,
                }
              : {
                  cache_read: 0,
                  cache_write: 0,
                  ...existing?.cost,
                  ...model.cost,
                },
          options: {
            ...existing?.options,
            ...model.options,
          },
          limit: model.limit ??
            existing?.limit ?? {
              context: 0,
              output: 0,
            },
          modalities: model.modalities ??
            existing?.modalities ?? {
              input: ["text"],
              output: ["text"],
            },
          headers: model.headers,
          provider: model.provider ?? existing?.provider,
        }
        if (model.id && model.id !== modelID) {
          realIdByKey.set(`${providerID}/${modelID}`, model.id)
        }
        parsed.models[modelID] = parsedModel
      }

      database[providerID] = parsed
    }

    // load env
    for (const [providerID, provider] of Object.entries(database)) {
      if (disabled.has(providerID)) continue
      const apiKey = provider.env.map((item) => process.env[item]).at(0)
      if (!apiKey) continue
      mergeProvider(
        providerID,
        // only include apiKey if there's only one potential option
        provider.env.length === 1 ? { apiKey } : {},
        "env",
      )
    }

    // load apikeys
    for (const [providerID, provider] of Object.entries(await Auth.all())) {
      if (disabled.has(providerID)) continue
      if (provider.type === "api") {
        mergeProvider(providerID, { apiKey: provider.key }, "api")
      }
    }

    // load custom
    for (const [providerID, fn] of Object.entries(CUSTOM_LOADERS)) {
      if (disabled.has(providerID)) continue
      const result = await fn(database[providerID])
      if (result && (result.autoload || providers[providerID])) {
        mergeProvider(providerID, result.options ?? {}, "custom", result.getModel)
      }
    }

    for (const plugin of await Plugin.list()) {
      if (!plugin.auth) continue
      const providerID = plugin.auth.provider
      if (disabled.has(providerID)) continue
      // Only allow Cerebras plugins
      if (providerID !== "cerebras") continue

      const auth = await Auth.get(providerID)
      if (!auth) continue
      if (!plugin.auth.loader) continue

      const options = await plugin.auth.loader(() => Auth.get(providerID) as any, database[plugin.auth.provider])
      mergeProvider(plugin.auth.provider, options ?? {}, "custom")
    }

    // load config
    for (const [providerID, provider] of configProviders) {
      mergeProvider(providerID, provider.options ?? {}, "config")
    }

    for (const [providerID, provider] of Object.entries(providers)) {
      if (!isProviderAllowed(providerID)) {
        delete providers[providerID]
        continue
      }

      const configProvider = config.provider?.[providerID]
      const filteredModels = Object.fromEntries(
        Object.entries(provider.info.models)
          // Filter out blacklisted models
          .filter(
            ([modelID]) =>
              modelID !== "gpt-5-chat-latest" && !(providerID === "openrouter" && modelID === "openai/gpt-5-chat"),
          )
          // Filter out experimental models
          .filter(
            ([, model]) =>
              ((!model.experimental && model.status !== "alpha") || Flag.CEREBRAS_ENABLE_EXPERIMENTAL_MODELS) &&
              model.status !== "deprecated",
          )
          // Filter by provider's whitelist/blacklist from config
          .filter(([modelID]) => {
            if (!configProvider) return true

            return (
              (!configProvider.blacklist || !configProvider.blacklist.includes(modelID)) &&
              (!configProvider.whitelist || configProvider.whitelist.includes(modelID))
            )
          }),
      )

      provider.info.models = filteredModels

      if (Object.keys(provider.info.models).length === 0) {
        delete providers[providerID]
        continue
      }

      log.info("found", { providerID, npm: provider.info.npm })
    }

    return {
      models,
      providers,
      sdk,
      realIdByKey,
    }
  })

  export async function list() {
    return state().then((state) => state.providers)
  }

  async function getSDK(provider: ModelsDev.Provider, model: ModelsDev.Model) {
    return (async () => {
      using _ = log.time("getSDK", {
        providerID: provider.id,
      })
      const s = await state()
      const pkg = model.provider?.npm ?? provider.npm ?? provider.id
      const options = { ...s.providers[provider.id]?.options }
      if (pkg.includes("@ai-sdk/openai-compatible") && options["includeUsage"] === undefined) {
        options["includeUsage"] = true
      }

      const key = Bun.hash.xxHash32(JSON.stringify({ pkg, options }))
      const existing = s.sdk.get(key)
      if (existing) return existing

      const customFetch = options["fetch"]

      options["fetch"] = async (input: any, init?: BunFetchRequestInit) => {
        // Preserve custom fetch if it exists, wrap it with timeout logic
        const fetchFn = customFetch ?? fetch
        const opts = init ?? {}

        if (options["timeout"] !== undefined && options["timeout"] !== null) {
          const signals: AbortSignal[] = []
          if (opts.signal) signals.push(opts.signal)
          if (options["timeout"] !== false) signals.push(AbortSignal.timeout(options["timeout"]))

          const combined = signals.length > 1 ? AbortSignal.any(signals) : signals[0]

          opts.signal = combined
        }

        return fetchFn(input, {
          ...opts,
          // @ts-ignore see here: https://github.com/oven-sh/bun/issues/16682
          timeout: false,
        })
      }

      // Special case: google-vertex-anthropic uses a subpath import
      const bundledKey = provider.id === "google-vertex-anthropic" ? "@ai-sdk/google-vertex/anthropic" : pkg
      const bundledFn = BUNDLED_PROVIDERS[bundledKey]
      if (bundledFn) {
        log.info("using bundled provider", { providerID: provider.id, pkg: bundledKey })
        const loaded = bundledFn({
          name: provider.id,
          ...options,
        })
        s.sdk.set(key, loaded)
        return loaded as SDK
      }

      let installedPath: string
      if (!pkg.startsWith("file://")) {
        installedPath = await BunProc.install(pkg, "latest")
      } else {
        log.info("loading local provider", { pkg })
        installedPath = pkg
      }

      const mod = await import(installedPath)

      const fn = mod[Object.keys(mod).find((key) => key.startsWith("create"))!]
      const loaded = fn({
        name: provider.id,
        ...options,
      })
      s.sdk.set(key, loaded)
      return loaded as SDK
    })().catch((e) => {
      throw new InitError({ providerID: provider.id }, { cause: e })
    })
  }

  export async function getProvider(providerID: string) {
    return state().then((s) => s.providers[providerID])
  }

  export async function getModel(providerID: string, modelID: string) {
    const key = `${providerID}/${modelID}`
    const s = await state()
    if (s.models.has(key)) return s.models.get(key)!

    log.info("getModel", {
      providerID,
      modelID,
    })

    const provider = s.providers[providerID]
    if (!provider) {
      const availableProviders = Object.keys(s.providers)
      const matches = fuzzysort.go(providerID, availableProviders, { limit: 3, threshold: -10000 })
      const suggestions = matches.map((m) => m.target)
      throw new ModelNotFoundError({ providerID, modelID, suggestions })
    }

    const info = provider.info.models[modelID]
    if (!info) {
      const availableModels = Object.keys(provider.info.models)
      const matches = fuzzysort.go(modelID, availableModels, { limit: 3, threshold: -10000 })
      const suggestions = matches.map((m) => m.target)
      throw new ModelNotFoundError({ providerID, modelID, suggestions })
    }

    const sdk = await getSDK(provider.info, info)

    try {
      const keyReal = `${providerID}/${modelID}`
      const realID = s.realIdByKey.get(keyReal) ?? info.id
      const language = provider.getModel
        ? await provider.getModel(sdk, realID, provider.options)
        : sdk.languageModel(realID)
      log.info("found", { providerID, modelID })
      s.models.set(key, {
        providerID,
        modelID,
        info,
        language,
        npm: info.provider?.npm ?? provider.info.npm,
      })
      return {
        modelID,
        providerID,
        info,
        language,
        npm: info.provider?.npm ?? provider.info.npm,
      }
    } catch (e) {
      if (e instanceof NoSuchModelError)
        throw new ModelNotFoundError(
          {
            modelID: modelID,
            providerID,
          },
          { cause: e },
        )
      throw e
    }
  }

  export async function getSmallModel(providerID: string) {
    const cfg = await Config.get()

    if (cfg.small_model) {
      const parsed = parseModel(cfg.small_model)
      return getModel(parsed.providerID, parsed.modelID)
    }

    const provider = await state().then((state) => state.providers[providerID])
    if (provider) {
      let priority = [
        "claude-haiku-4-5",
        "claude-haiku-4.5",
        "3-5-haiku",
        "3.5-haiku",
        "gemini-2.5-flash",
        "gpt-5-nano",
      ]
      // claude-haiku-4.5 is considered a premium model in github copilot, we shouldn't use premium requests for title gen
      if (providerID === "github-copilot") {
        priority = priority.filter((m) => m !== "claude-haiku-4.5")
      }
      if (providerID.startsWith("opencode")) {
        priority = ["gpt-5-nano"]
      }
      for (const item of priority) {
        for (const model of Object.keys(provider.info.models)) {
          if (model.includes(item)) return getModel(providerID, model)
        }
      }
    }

    // Check if opencode provider is available before using it
    const opencodeProvider = await state().then((state) => state.providers["opencode"])
    if (opencodeProvider && opencodeProvider.info.models["gpt-5-nano"]) {
      return getModel("opencode", "gpt-5-nano")
    }

    return undefined
  }

  const priority = ["gpt-5", "claude-sonnet-4", "big-pickle", "gemini-3-pro"]
  export function sort(models: ModelsDev.Model[]) {
    return sortBy(
      models,
      [(model) => priority.findIndex((filter) => model.id.includes(filter)), "desc"],
      [(model) => (model.id.includes("latest") ? 0 : 1), "asc"],
      [(model) => model.id, "desc"],
    )
  }

  export async function defaultModel() {
    const cfg = await Config.get()
    if (cfg.model) return parseModel(cfg.model)

    const provider = await list()
      .then((val) => Object.values(val))
      .then((x) => x.find((p) => !cfg.provider || Object.keys(cfg.provider).includes(p.info.id)))
    if (!provider) throw new Error("no providers found")
    const [model] = sort(Object.values(provider.info.models))
    if (!model) throw new Error("no models found")
    return {
      providerID: provider.info.id,
      modelID: model.id,
    }
  }

  export function parseModel(model: string) {
    const [providerID, ...rest] = model.split("/")
    return {
      providerID: providerID,
      modelID: rest.join("/"),
    }
  }

  export const ModelNotFoundError = NamedError.create(
    "ProviderModelNotFoundError",
    z.object({
      providerID: z.string(),
      modelID: z.string(),
      suggestions: z.array(z.string()).optional(),
    }),
  )

  export const InitError = NamedError.create(
    "ProviderInitError",
    z.object({
      providerID: z.string(),
    }),
  )
}
