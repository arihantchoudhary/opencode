import { MentionsResponse, ProfileData, ThreadData, UserData } from "./types";

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

export async function fetchDashboard(username: string): Promise<{ mentions?: MentionsResponse; profile?: ProfileData; stats?: { mention_count: number; total_likes: number; total_reposts: number; total_replies: number; total_impressions: number } } | null> {
  const res = await fetch(`${API_BASE}/api/twitter/dashboard/${username}`);
  if (!res.ok) return null;
  return res.json();
}

export async function forceRefresh(username: string, clerkId?: string): Promise<{ status: string; result_count: number; rate_limit: { remaining: number; limit: number; window_seconds: number } } | null> {
  const url = clerkId
    ? `${API_BASE}/api/twitter/refresh/${username}?clerk_id=${clerkId}`
    : `${API_BASE}/api/twitter/refresh/${username}`;
  const res = await fetch(url, { method: "POST" });
  if (res.status === 429) {
    const err = await res.json().catch(() => null);
    throw { rateLimited: true, detail: err?.detail };
  }
  if (!res.ok) return null;
  return res.json();
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

export async function updateUserSettings(clerkId: string, data: Record<string, unknown>): Promise<void> {
  await fetch(`${API_BASE}/api/users/by-clerk/${clerkId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function loadThread(conversationId: string): Promise<ThreadData | null> {
  const res = await fetch(`${API_BASE}/api/twitter/thread/${conversationId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createRepo(body: {
  name: string;
  description: string;
  tweet_text: string;
  tweet_id: string;
  tweet_author: string;
  tweet_url: string;
  clerk_id: string;
}): Promise<{ html_url: string; full_name: string; name: string }> {
  const res = await fetch(`${API_BASE}/admin/create-repo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to create repo");
  }
  return res.json();
}

export async function updateProjectLinks(
  clerkId: string,
  repoName: string,
  links: { frontend_url?: string; backend_url?: string },
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/users/by-clerk/${clerkId}/projects/${encodeURIComponent(repoName)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(links),
    },
  );
  if (!res.ok) throw new Error("Failed to update project links");
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
