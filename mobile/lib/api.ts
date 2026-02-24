import { MentionsResponse, ProfileData, UserData } from "./types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchMentions(username: string): Promise<MentionsResponse> {
  const res = await fetch(`${API_BASE}/api/twitter/mentions/${username}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export async function fetchProfile(username: string): Promise<ProfileData | null> {
  const res = await fetch(`${API_BASE}/api/twitter/profile/${username}`);
  if (!res.ok) return null;
  return res.json();
}

export async function forceRefresh(username: string): Promise<void> {
  await fetch(`${API_BASE}/api/twitter/refresh/${username}`, { method: "POST" }).catch(() => {});
}

export async function getUserByClerk(clerkId: string): Promise<UserData | null> {
  const res = await fetch(`${API_BASE}/api/users/by-clerk/${clerkId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function updateTwitterHandle(clerkId: string, handle: string): Promise<void> {
  await fetch(`${API_BASE}/api/users/by-clerk/${clerkId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ twitter_handle: handle }),
  });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) {
    const mins = Math.floor(diffMs / (1000 * 60));
    return `${mins}m`;
  }
  if (diffHrs < 24) return `${diffHrs}h`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
