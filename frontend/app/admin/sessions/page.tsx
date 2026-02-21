"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { listSessions, type Session } from "@/lib/api"
import Navbar from "@/components/Navbar"

function formatDuration(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime()
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

export default function SessionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    listSessions()
      .then(setSessions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user, router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          <span className="gradient-text">Sessions</span>
        </h1>
        <p className="mb-8 text-sm text-zinc-500">
          Production sessions reported by CLI users
        </p>

        {loading && <p className="text-zinc-500">Loading sessions...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && sessions.length === 0 && (
          <p className="text-zinc-500">No sessions reported yet.</p>
        )}

        {sessions.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-zinc-400">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Version</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Changes</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Created</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Duration</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.session_id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-white">{s.user_name}</span>
                        <p className="text-xs text-zinc-600">{s.user_email}</p>
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-zinc-300">
                      {s.title}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.status === "active"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-zinc-500/10 text-zinc-400"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-zinc-500 md:table-cell">
                      {s.version}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {s.summary ? (
                        <div className="flex gap-2 text-xs">
                          <span className="text-green-400">+{s.summary.additions}</span>
                          <span className="text-red-400">-{s.summary.deletions}</span>
                          <span className="text-zinc-500">{s.summary.files} files</span>
                        </div>
                      ) : (
                        <span className="text-zinc-600">--</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-zinc-500 lg:table-cell">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-zinc-500 lg:table-cell">
                      {s.completed_at
                        ? formatDuration(new Date(s.created_at), new Date(s.completed_at))
                        : "in progress"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-zinc-600">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} reported
        </p>
      </div>
    </div>
  )
}
