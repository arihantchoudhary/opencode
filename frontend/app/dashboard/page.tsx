"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { listUsers, updateUser, type User } from "@/lib/api"
import Navbar from "@/components/Navbar"
import UserCard from "@/components/UserCard"
import UserTable from "@/components/UserTable"

export default function DashboardPage() {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    setName(user.name)
    setBio(user.bio || "")
    listUsers().then(setUsers).catch(() => {})
  }, [user, router])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      const updated = await updateUser(user.user_id, { name, bio })
      setUser(updated)
      setEditing(false)
    } catch {
      // keep editing state on error
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 pt-24 pb-16">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">
          <span className="gradient-text">Dashboard</span>
        </h1>

        {/* Profile section */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-zinc-300">Your profile</h2>
          {editing ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
              <div>
                <label htmlFor="edit-name" className="mb-1 block text-sm text-zinc-400">Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full max-w-sm rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label htmlFor="edit-bio" className="mb-1 block text-sm text-zinc-400">Bio</label>
                <textarea
                  id="edit-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full max-w-sm rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-violet-500/50"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <UserCard user={user} />
              <button
                onClick={() => setEditing(true)}
                className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                Edit profile
              </button>
            </div>
          )}
        </section>

        {/* Users list */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-300">All users</h2>
          <UserTable users={users} />
        </section>
      </div>
    </div>
  )
}
