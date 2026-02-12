"use client"

import type { User } from "@/lib/api"

export default function UserCard({ user }: { user: User }) {
  return (
    <div className="card-glow rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all">
      <div className="flex items-center gap-4">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="h-12 w-12 rounded-full border border-white/10"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-lg font-medium text-violet-400">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-white">{user.name}</h3>
          <p className="text-sm text-zinc-500">{user.email}</p>
        </div>
      </div>
      {user.bio && (
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">{user.bio}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-600">
        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
        <span>via {user.signup_source}</span>
        {user.reference && <span>Found us: {user.reference}</span>}
      </div>
    </div>
  )
}
