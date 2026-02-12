import * as prompts from "@clack/prompts"
import { Registration } from "."
import { Log } from "../util/log"
import { UI } from "../cli/ui"

const API_URL = "https://p9ia72yajp.us-east-1.awsapprunner.com"

const log = Log.create({ service: "registration" })

const REFERENCE_OPTIONS = [
  { label: "Twitter/X", value: "twitter" },
  { label: "GitHub", value: "github" },
  { label: "Friend/colleague", value: "friend" },
  { label: "Blog/article", value: "blog" },
  { label: "YouTube", value: "youtube" },
  { label: "Other", value: "other" },
]

export async function promptRegistration() {
  prompts.intro("Welcome to Stardrop!")

  const name = await prompts.text({
    message: "What's your name?",
    placeholder: "Your name",
    validate: (v) => {
      if (!v || v.trim().length === 0) return "Name is required"
    },
  })
  if (prompts.isCancel(name)) {
    await Registration.set({
      email: "",
      name: "",
      registered_at: new Date().toISOString(),
      skipped: true,
    })
    prompts.outro("Skipped — you can register later.")
    return
  }

  const email = await prompts.text({
    message: "What's your email?",
    placeholder: "you@example.com",
    validate: (v) => {
      if (!v || !v.includes("@")) return "Please enter a valid email"
    },
  })
  if (prompts.isCancel(email)) {
    await Registration.set({
      email: "",
      name: "",
      registered_at: new Date().toISOString(),
      skipped: true,
    })
    prompts.outro("Skipped — you can register later.")
    return
  }

  const reference = await prompts.select({
    message: "How did you hear about Stardrop?",
    options: REFERENCE_OPTIONS,
  })
  if (prompts.isCancel(reference)) {
    await Registration.set({
      email: "",
      name: "",
      registered_at: new Date().toISOString(),
      skipped: true,
    })
    prompts.outro("Skipped — you can register later.")
    return
  }

  const spinner = prompts.spinner()
  spinner.start("Registering...")

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        reference,
        signup_source: "cli",
      }),
      signal: AbortSignal.timeout(10_000),
    })

    if (response.ok) {
      const data = await response.json()
      await Registration.set({
        user_id: data.user_id,
        email,
        name,
        reference,
        registered_at: new Date().toISOString(),
      })
      spinner.stop("Registered!")
    } else {
      const err = await response.json().catch(() => ({}))
      log.warn("registration API error", { status: response.status, err })
      // Still save locally so we don't ask again
      await Registration.set({
        email,
        name,
        reference,
        registered_at: new Date().toISOString(),
      })
      spinner.stop("Registered locally.")
    }
  } catch (e) {
    log.warn("registration failed", {
      error: e instanceof Error ? e.message : String(e),
    })
    await Registration.set({
      email,
      name,
      reference,
      registered_at: new Date().toISOString(),
    })
    spinner.stop("Registered locally.")
  }

  prompts.outro("You're all set!")
}
