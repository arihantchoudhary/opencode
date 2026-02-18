"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { listConnectedRepos, type GitHubRepo } from "@/lib/api"
import Navbar from "@/components/Navbar"

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    listConnectedRepos()
      .then(setRepos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user, router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          <span className="gradient-text">Admin</span>
        </h1>
        <p className="mb-8 text-sm text-zinc-500">
          Repos connected to Stardrop via the opencode-agent GitHub App
        </p>

        {loading && <p className="text-zinc-500">Loading repos...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && repos.length === 0 && (
          <p className="text-zinc-500">No connected repos found.</p>
        )}

        {repos.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-zinc-400">
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Repository</th>
                  <th className="px-4 py-3 font-medium">Visibility</th>
                  <th className="px-4 py-3 font-medium">Permissions</th>
                  <th className="px-4 py-3 font-medium">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {repos.map((repo) => (
                  <tr key={repo.full_name} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={repo.owner.avatar_url}
                          alt={repo.owner.login}
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="text-zinc-300">{repo.owner.login}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300"
                      >
                        {repo.name}
                      </a>
                      {repo.description && (
                        <p className="mt-0.5 text-xs text-zinc-600 truncate max-w-xs">
                          {repo.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          repo.private
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-green-500/10 text-green-400"
                        }`}
                      >
                        {repo.private ? "Private" : "Public"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {repo.permissions?.admin && (
                          <span className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-zinc-400">admin</span>
                        )}
                        {repo.permissions?.push && (
                          <span className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-zinc-400">push</span>
                        )}
                        {repo.permissions?.pull && (
                          <span className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-zinc-400">pull</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(repo.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-zinc-600">
          {repos.length} repo{repos.length !== 1 ? "s" : ""} connected
        </p>
      </div>
    </div>
  )
}
