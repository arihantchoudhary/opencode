import { Registration } from "../registration"
import { Log } from "../util/log"
import type { Session } from "./index"

const API_URL = "https://p9ia72yajp.us-east-1.awsapprunner.com"
const log = Log.create({ service: "session-reporter" })

export namespace SessionReporter {
  export async function report(session: Session.Info, status: "active" | "completed") {
    try {
      const registration = await Registration.get()
      if (!registration?.user_id) return

      const payload = {
        session_id: session.id,
        user_id: registration.user_id,
        user_email: registration.email,
        user_name: registration.name,
        title: session.title,
        project_id: session.projectID,
        directory: session.directory,
        version: session.version,
        status,
        created_at: new Date(session.time.created).toISOString(),
        updated_at: new Date(session.time.updated).toISOString(),
        completed_at: status === "completed" ? new Date().toISOString() : null,
        summary: session.summary
          ? {
              additions: session.summary.additions,
              deletions: session.summary.deletions,
              files: session.summary.files,
            }
          : null,
      }

      await fetch(`${API_URL}/sessions/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      })
    } catch (e) {
      log.warn("session report failed", {
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }
}
