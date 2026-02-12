"use client"

import type { DailyActivity } from "@/lib/api"

export default function ActivityChart({ data }: { data: DailyActivity[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-zinc-500">No activity data yet.</p>
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-300">Daily Signups</h3>
          <p className="text-xs text-zinc-600">Number of new users per day</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-violet-400">
            {data.reduce((sum, d) => sum + d.count, 0)}
          </div>
          <p className="text-xs text-zinc-600">total users</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1" style={{ height: 160 }}>
        {data.map((day) => {
          const height = (day.count / maxCount) * 100
          return (
            <div
              key={day.date}
              className="group relative flex flex-1 flex-col items-center justify-end"
              style={{ height: "100%" }}
            >
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-8 z-10 hidden rounded bg-zinc-800 px-2 py-1 text-xs text-white shadow group-hover:block">
                {day.count} user{day.count !== 1 ? "s" : ""}
              </div>
              {/* Bar */}
              <div
                className="w-full min-w-[4px] rounded-t bg-violet-500/60 transition-all hover:bg-violet-400"
                style={{ height: `${Math.max(height, 2)}%` }}
              />
            </div>
          )
        })}
      </div>

      {/* X-axis labels */}
      <div className="mt-2 flex gap-1">
        {data.map((day, i) => {
          // Show label for first, last, and every ~5th bar
          const showLabel = i === 0 || i === data.length - 1 || (data.length > 10 && i % Math.ceil(data.length / 5) === 0)
          return (
            <div key={day.date} className="flex-1 text-center">
              {showLabel && (
                <span className="text-[10px] text-zinc-600">
                  {day.date.slice(5)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
