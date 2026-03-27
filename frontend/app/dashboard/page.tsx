"use client";

import { useEffect, useState, useCallback } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  AtSign,
  Heart,
  Repeat2,
  MessageCircle,
  RefreshCw,
  Search,
  Twitter,
  Star,
  Settings,
  TrendingUp,
  X,
  ExternalLink,
  Github,
  BarChart2,
  FolderGit2,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Terminal,
  Users,
  Calendar,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  conversation_id?: string;
  referenced_tweets?: Array<{ type: "replied_to" | "quoted" | "retweeted"; id: string }>;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    impression_count?: number;
  };
}

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
  verified?: boolean;
}

interface MentionsResponse {
  data?: Tweet[];
  includes?: { users?: TwitterUser[]; tweets?: Tweet[] };
  meta?: { next_token?: string; result_count?: number };
}

interface ThreadData {
  data: Tweet[];
  includes: { users: TwitterUser[] };
  conversation_id: string;
}

interface Project {
  repo_url: string;
  repo_name: string;
  full_name: string;
  tweet_id: string;
  tweet_text: string;
  tweet_author: string;
  tweet_url: string;
  created_at: string;
}

interface Session {
  session_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  title: string;
  project_id: string;
  directory: string;
  version: string;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  summary?: Record<string, unknown>;
}

interface ProfileData {
  name?: string;
  username?: string;
  profile_image_url?: string;
  description?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) {
    const mins = Math.floor(diffMs / (1000 * 60));
    return `${mins}m ago`;
  }
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatNumber(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function TweetSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export default function Home() {
  const [username, setUsername] = useState("stardroplin");
  const [inputValue, setInputValue] = useState("stardroplin");
  const [mentions, setMentions] = useState<MentionsResponse | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("dashboard");
  const { user: clerkUser } = useUser();
  const [myHandle, setMyHandle] = useState("");
  const [myHandleInput, setMyHandleInput] = useState("");
  const [showAllMentions, setShowAllMentions] = useState(false);
  const [savingHandle, setSavingHandle] = useState(false);
  const [refreshRemaining, setRefreshRemaining] = useState(4);
  const [refreshResetAt, setRefreshResetAt] = useState<Date | null>(null);
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Fetch all sessions
  useEffect(() => {
    setSessionsLoading(true);
    fetch(`${API_BASE}/sessions/?limit=100`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSessions(data);
      })
      .catch((err) => console.error("[Stardrop] Failed to load sessions:", err))
      .finally(() => setSessionsLoading(false));
  }, []);

  // Countdown timer for rate limit cooldown
  useEffect(() => {
    if (!refreshResetAt) return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.ceil((refreshResetAt.getTime() - Date.now()) / 1000));
      setRefreshCooldown(diff);
      if (diff === 0) {
        setRefreshRemaining(4);
        setRefreshResetAt(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshResetAt]);

  // Load twitter_handle from backend when logged in
  useEffect(() => {
    if (!clerkUser?.id) return;
    console.log("[Stardrop] Fetching user settings for clerk_id:", clerkUser.id);
    fetch(`${API_BASE}/api/users/by-clerk/${clerkUser.id}`)
      .then((r) => r.json())
      .then((data) => {
        console.log("[Stardrop] User settings loaded:", data);
        if (data?.twitter_handle) {
          setMyHandle(data.twitter_handle);
          setMyHandleInput(data.twitter_handle);
        }
        if (data?.dismissed_tweet_ids?.length) {
          setDismissedIds(new Set(data.dismissed_tweet_ids));
        }
        if (data?.projects?.length) {
          setUserProjects(data.projects);
        }
      })
      .catch((err) => console.error("[Stardrop] Failed to load user settings:", err));
  }, [clerkUser?.id]);

  async function saveMyHandle() {
    const trimmed = myHandleInput.trim().replace(/^@/, "");
    if (!trimmed || !clerkUser?.id) return;
    setSavingHandle(true);
    console.log("[Stardrop] Saving twitter handle:", trimmed);
    try {
      const res = await fetch(`${API_BASE}/api/users/by-clerk/${clerkUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twitter_handle: trimmed }),
      });
      const data = await res.json();
      console.log("[Stardrop] Handle saved:", data);
      setMyHandle(trimmed);
    } catch (err) {
      console.error("[Stardrop] Failed to save handle:", err);
      setMyHandle(trimmed);
    } finally {
      setSavingHandle(false);
    }
  }

  const fetchData = useCallback(async (user: string, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    console.log("[Stardrop] Fetching dashboard for @" + user, forceRefresh ? "(force refresh)" : "");
    try {
      if (forceRefresh) {
        console.log("[Stardrop] Force refreshing cache...");
        const refreshRes = await fetch(
          `${API_BASE}/api/twitter/refresh/${user}${clerkUser?.id ? `?clerk_id=${clerkUser.id}` : ""}`,
          { method: "POST" },
        ).catch(() => null);
        if (refreshRes?.status === 429) {
          const errData = await refreshRes.json().catch(() => null);
          const detail = errData?.detail;
          setRefreshRemaining(0);
          if (detail?.reset_at) setRefreshResetAt(new Date(detail.reset_at));
          console.log("[Stardrop] Rate limited:", detail?.message);
        } else if (refreshRes?.ok) {
          const refreshData = await refreshRes.json().catch(() => null);
          if (refreshData?.rate_limit) {
            setRefreshRemaining(refreshData.rate_limit.remaining);
          }
        }
      }

      // Try single dashboard endpoint first, fall back to separate calls
      let dashboardOk = false;
      const dashRes = await fetch(`${API_BASE}/api/twitter/dashboard/${user}`);
      if (dashRes.ok) {
        const data = await dashRes.json();
        console.log("[Stardrop] Dashboard endpoint OK:", {
          profile: data.profile?.username,
          tweets: data.mentions?.data?.length || 0,
          stats: data.stats,
        });
        if (data.mentions) setMentions(data.mentions);
        if (data.profile) setProfile(data.profile);
        dashboardOk = true;
      }

      if (!dashboardOk) {
        console.log("[Stardrop] Dashboard endpoint not available, using separate calls...");
        const [mentionsRes, profileRes] = await Promise.allSettled([
          fetch(`${API_BASE}/api/twitter/mentions/${user}`).then(async (r) => {
            if (!r.ok) {
              if (r.status === 404) throw new Error(`Twitter user @${user} not found. Check the username.`);
              if (r.status === 429) throw new Error("Twitter rate limit hit. Try again in a few minutes.");
              const body = await r.json().catch(() => null);
              throw new Error(body?.detail || `Error ${r.status}`);
            }
            return r.json() as Promise<MentionsResponse>;
          }),
          fetch(`${API_BASE}/api/twitter/profile/${user}`).then((r) => {
            if (!r.ok) return null;
            return r.json() as Promise<ProfileData>;
          }),
        ]);

        if (mentionsRes.status === "fulfilled") {
          console.log("[Stardrop] Mentions loaded:", mentionsRes.value?.data?.length || 0, "tweets");
          setMentions(mentionsRes.value);
        } else {
          throw mentionsRes.reason;
        }
        if (profileRes.status === "fulfilled" && profileRes.value) {
          console.log("[Stardrop] Profile loaded:", profileRes.value.username);
          setProfile(profileRes.value);
        }
      }
    } catch (err) {
      console.error("[Stardrop] Dashboard fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [clerkUser?.id]);

  useEffect(() => {
    fetchData(username);
  }, [username, fetchData]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim().replace(/^@/, "");
    if (trimmed && trimmed !== username) {
      setUsername(trimmed);
      setMentions(null);
      setProfile(null);
    }
  }

  const [filterText, setFilterText] = useState("");
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [expandedTweetId, setExpandedTweetId] = useState<string | null>(null);
  const [threadData, setThreadData] = useState<ThreadData | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [creatingRepo, setCreatingRepo] = useState<string | null>(null);
  const [createdRepoUrl, setCreatedRepoUrl] = useState<Record<string, string>>({});
  const [namingRepo, setNamingRepo] = useState<string | null>(null);
  const [repoNameInput, setRepoNameInput] = useState("");
  const [userProjects, setUserProjects] = useState<Project[]>([]);

  function dismissTweet(id: string) {
    setDismissedIds((prev) => {
      const next = new Set(prev).add(id);
      if (clerkUser?.id) {
        fetch(`${API_BASE}/api/users/by-clerk/${clerkUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dismissed_tweet_ids: Array.from(next) }),
        }).catch((err) => console.error("[Stardrop] Failed to persist dismiss:", err));
      }
      return next;
    });
  }

  function getUser(authorId: string): TwitterUser | undefined {
    return mentions?.includes?.users?.find((u) => u.id === authorId);
  }

  function getReferencedTweet(tweetId: string): Tweet | undefined {
    return mentions?.includes?.tweets?.find((t) => t.id === tweetId);
  }

  function getUserFromThread(authorId: string): TwitterUser | undefined {
    return threadData?.includes?.users?.find((u) => u.id === authorId);
  }

  async function loadThread(conversationId: string) {
    setThreadLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/twitter/thread/${conversationId}`);
      if (!res.ok) throw new Error("Failed to load thread");
      const data = await res.json();
      console.log("[Stardrop] Thread loaded:", data.data?.length, "tweets");
      setThreadData(data);
    } catch (err) {
      console.error("[Stardrop] Failed to load thread:", err);
    } finally {
      setThreadLoading(false);
    }
  }

  function slugify(text: string) {
    return text.slice(0, 50).replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "new-repo";
  }

  function startNamingRepo(tweetText: string, tweetId: string) {
    setNamingRepo(tweetId);
    setRepoNameInput(slugify(tweetText));
  }

  async function createRepo(tweetText: string, tweetId: string, authorId: string, customName?: string) {
    setNamingRepo(null);
    setCreatingRepo(tweetId);
    try {
      const name = customName?.trim() ? customName.trim().replace(/[^a-zA-Z0-9-_.]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") : slugify(tweetText);
      const author = getUser(authorId);
      const tweetUrl = `https://x.com/${author?.username || "x"}/status/${tweetId}`;
      const res = await fetch(`${API_BASE}/admin/create-repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: tweetText.slice(0, 200),
          tweet_text: tweetText,
          tweet_id: tweetId,
          tweet_author: author?.username || "",
          tweet_url: tweetUrl,
          clerk_id: clerkUser?.id || "",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Failed to create repo");
      }
      const data = await res.json();
      setCreatedRepoUrl((prev) => ({ ...prev, [tweetId]: data.html_url }));
      setUserProjects((prev) => [{
        repo_url: data.html_url,
        repo_name: data.name,
        full_name: data.full_name,
        tweet_id: tweetId,
        tweet_text: tweetText.slice(0, 280),
        tweet_author: author?.username || "",
        tweet_url: tweetUrl,
        created_at: new Date().toISOString(),
      }, ...prev]);
    } catch (err) {
      console.error("[Stardrop] Failed to create repo:", err);
    } finally {
      setCreatingRepo(null);
    }
  }

  // Filter tweets:
  // - API already returns mentions for the tracked user
  // - If myHandle is set and not showing all, only show tweets authored by the logged-in user
  // - Dismissed tweets are hidden
  const filteredTweets = mentions?.data?.filter((t) => {
    if (dismissedIds.has(t.id)) return false;
    // If user has set their handle, filter to only their tweets (unless showing all)
    if (myHandle && !showAllMentions) {
      const author = getUser(t.author_id);
      if (author?.username.toLowerCase() !== myHandle.toLowerCase()) return false;
    }
    // If there's an additional text filter, apply it
    if (filterText) {
      const text = t.text.toLowerCase();
      return text.includes(filterText.toLowerCase());
    }
    return true;
  });

  const totalLikes = filteredTweets?.reduce((sum, t) => sum + (t.public_metrics?.like_count || 0), 0) || 0;
  const totalReposts = filteredTweets?.reduce((sum, t) => sum + (t.public_metrics?.retweet_count || 0), 0) || 0;
  const totalReplies = filteredTweets?.reduce((sum, t) => sum + (t.public_metrics?.reply_count || 0), 0) || 0;
  const totalImpressions = filteredTweets?.reduce((sum, t) => sum + (t.public_metrics?.impression_count || 0), 0) || 0;
  const mentionCount = filteredTweets?.length || 0;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Star className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Stardrop</p>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeView === "dashboard"}
                    onClick={() => setActiveView("dashboard")}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeView === "mentions"}
                    onClick={() => setActiveView("mentions")}
                  >
                    <AtSign className="h-4 w-4" />
                    <span>Mentions</span>
                    {mentionCount > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {mentionCount}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeView === "analytics"}
                    onClick={() => setActiveView("analytics")}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeView === "sessions"}
                    onClick={() => setActiveView("sessions")}
                  >
                    <Terminal className="h-4 w-4" />
                    <span>Sessions</span>
                    {sessions.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {sessions.length}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeView === "projects"}
                    onClick={() => setActiveView("projects")}
                  >
                    <FolderGit2 className="h-4 w-4" />
                    <span>Projects</span>
                    {userProjects.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {userProjects.length}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeView === "settings"}
                    onClick={() => setActiveView("settings")}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {myHandle && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={`https://x.com/${myHandle}`} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4" />
                        <span>@{myHandle}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={`https://x.com/${username}`} target="_blank" rel="noopener noreferrer">
                      <AtSign className="h-4 w-4" />
                      <span>Tracking @{username}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={clerkUser?.imageUrl} />
              <AvatarFallback>{clerkUser?.firstName?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {clerkUser?.fullName || clerkUser?.firstName || "You"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {myHandle ? `@${myHandle}` : clerkUser?.primaryEmailAddress?.emailAddress || "Set up in Settings"}
              </p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Top bar */}
        <header className="flex h-14 items-center gap-4 border-b px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Track a username..."
                className="pl-8"
              />
            </div>
            <Button type="submit" size="sm">
              Track
            </Button>
          </form>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchData(username, true)}
              disabled={loading || refreshRemaining === 0}
              title={
                refreshRemaining === 0
                  ? `Rate limited — try again in ${refreshCooldown}s`
                  : `Refresh from Twitter (${refreshRemaining}/4 left)`
              }
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {refreshRemaining < 4 && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {refreshRemaining > 0 ? `${refreshRemaining}/4` : `${refreshCooldown}s`}
              </span>
            )}
          </div>
          <Separator orientation="vertical" className="h-6" />
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Main content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Page title */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {activeView === "dashboard" && "Dashboard"}
              {activeView === "mentions" && "Mentions"}
              {activeView === "analytics" && "Analytics"}
              {activeView === "sessions" && "Sessions"}
              {activeView === "projects" && "Projects"}
              {activeView === "settings" && "Settings"}
            </h2>
            <p className="text-muted-foreground">
              {activeView === "dashboard" && `Overview for @${username}`}
              {activeView === "mentions" && `Posts mentioning @${username}`}
              {activeView === "analytics" && `Engagement analytics for @${username}`}
              {activeView === "sessions" && `${sessions.length} agent sessions logged`}
              {activeView === "projects" && `${userProjects.length} repositories created from tweets`}
              {activeView === "settings" && "Configure your Stardrop dashboard"}
            </p>
          </div>

          {/* Dashboard view */}
          {activeView === "dashboard" && (
            <>
              {/* Profile banner */}
              {profile && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.profile_image_url} />
                        <AvatarFallback className="text-lg">
                          {profile.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{profile.name}</h3>
                        <p className="text-sm text-muted-foreground">@{profile.username}</p>
                        {profile.description && (
                          <p className="text-sm mt-1 text-muted-foreground max-w-xl">{profile.description}</p>
                        )}
                      </div>
                      {profile.public_metrics && (
                        <div className="flex gap-8 text-center">
                          <div>
                            <p className="text-2xl font-bold">{formatNumber(profile.public_metrics.followers_count)}</p>
                            <p className="text-xs text-muted-foreground">Followers</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{formatNumber(profile.public_metrics.following_count)}</p>
                            <p className="text-xs text-muted-foreground">Following</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{formatNumber(profile.public_metrics.tweet_count)}</p>
                            <p className="text-xs text-muted-foreground">Posts</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardDescription className="text-sm font-medium">Total Mentions</CardDescription>
                    <AtSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : mentionCount}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardDescription className="text-sm font-medium">Total Likes</CardDescription>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : totalLikes}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardDescription className="text-sm font-medium">Total Reposts</CardDescription>
                    <Repeat2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : totalReposts}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardDescription className="text-sm font-medium">Total Replies</CardDescription>
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : totalReplies}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent mentions preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Mentions</CardTitle>
                      <CardDescription>Latest posts mentioning @{username}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveView("mentions")}>
                      View all
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loading && (
                    <>
                      <TweetSkeleton />
                      <Separator />
                      <TweetSkeleton />
                      <Separator />
                      <TweetSkeleton />
                    </>
                  )}
                  {error && !loading && (
                    <div className="p-6 text-center">
                      <p className="text-sm text-destructive">Error: {error}</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchData(username)}>
                        Retry
                      </Button>
                    </div>
                  )}
                  {!loading && !error && (!filteredTweets || filteredTweets.length === 0) && (
                    <div className="p-12 text-center">
                      <AtSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No mentions found for @{username}</p>
                    </div>
                  )}
                  {!loading && filteredTweets?.slice(0, 5).map((tweet, i) => {
                    const user = getUser(tweet.author_id);
                    const isExpanded = expandedTweetId === tweet.id;
                    const hasThread = tweet.conversation_id && tweet.conversation_id !== tweet.id;
                    return (
                      <div key={tweet.id}>
                        {i > 0 && <Separator />}
                        <div
                          className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${isExpanded ? "bg-muted/30" : ""}`}
                          onClick={() => { setExpandedTweetId(isExpanded ? null : tweet.id); if (!isExpanded) setThreadData(null); }}
                        >
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={user?.profile_image_url} />
                                <AvatarFallback className="text-xs">{user?.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                              </Avatar>
                              {hasThread && <div className="w-0.5 flex-1 bg-border mt-1 rounded-full" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm">{user?.name || "Unknown"}</span>
                                <span className="text-muted-foreground text-sm">@{user?.username || "unknown"}</span>
                                <span className="text-muted-foreground text-sm">· {formatDate(tweet.created_at)}</span>
                              </div>
                              <p className={`text-sm mt-0.5 leading-relaxed whitespace-pre-wrap break-words ${isExpanded ? "" : "line-clamp-3"}`}>
                                {tweet.text}
                              </p>
                              {/* Twitter-style action bar */}
                              <div className="flex justify-between mt-2 max-w-md -ml-1.5">
                                <button className="group/reply flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-blue-500" onClick={(e) => e.stopPropagation()}>
                                  <div className="p-1.5 rounded-full transition-colors group-hover/reply:bg-blue-500/10"><MessageCircle className="h-4 w-4" /></div>
                                  {tweet.public_metrics?.reply_count ? <span>{tweet.public_metrics.reply_count}</span> : null}
                                </button>
                                <button className="group/repost flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-green-500" onClick={(e) => e.stopPropagation()}>
                                  <div className="p-1.5 rounded-full transition-colors group-hover/repost:bg-green-500/10"><Repeat2 className="h-4 w-4" /></div>
                                  {tweet.public_metrics?.retweet_count ? <span>{tweet.public_metrics.retweet_count}</span> : null}
                                </button>
                                <button className="group/like flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-pink-500" onClick={(e) => e.stopPropagation()}>
                                  <div className="p-1.5 rounded-full transition-colors group-hover/like:bg-pink-500/10"><Heart className="h-4 w-4" /></div>
                                  {tweet.public_metrics?.like_count ? <span>{tweet.public_metrics.like_count}</span> : null}
                                </button>
                                <button className="group/views flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-blue-500" onClick={(e) => e.stopPropagation()}>
                                  <div className="p-1.5 rounded-full transition-colors group-hover/views:bg-blue-500/10"><BarChart2 className="h-4 w-4" /></div>
                                  {tweet.public_metrics?.impression_count ? <span>{formatNumber(tweet.public_metrics.impression_count)}</span> : null}
                                </button>
                              </div>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="mt-3 ml-[52px] space-y-3">
                              {hasThread && (!threadData || threadData.conversation_id !== tweet.conversation_id) && (
                                <Button variant="outline" size="sm" disabled={threadLoading} onClick={(e) => { e.stopPropagation(); loadThread(tweet.conversation_id!); }}>
                                  {threadLoading ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Loading thread...</> : <><MessageCircle className="h-3.5 w-3.5 mr-1.5" />Load conversation</>}
                                </Button>
                              )}
                              {threadData && threadData.conversation_id === tweet.conversation_id && (() => {
                                const contextTweets = threadData.data
                                  .filter((t) => new Date(t.created_at).getTime() < new Date(tweet.created_at).getTime() && t.id !== tweet.id)
                                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                                return contextTweets.length > 0 ? (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-2">Conversation context</p>
                                    {contextTweets.map((t, idx) => {
                                      const tu = getUserFromThread(t.author_id) || getUser(t.author_id);
                                      return (
                                        <div key={t.id} className="flex gap-2">
                                          <div className="flex flex-col items-center">
                                            <Avatar className="h-6 w-6 shrink-0"><AvatarImage src={tu?.profile_image_url} /><AvatarFallback className="text-[9px]">{tu?.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback></Avatar>
                                            {idx < contextTweets.length - 1 && <div className="w-0.5 flex-1 bg-border mt-0.5 rounded-full" />}
                                          </div>
                                          <div className="flex-1 min-w-0 pb-3">
                                            <div className="flex items-center gap-1 text-xs">
                                              <span className="font-medium">{tu?.name || "Unknown"}</span>
                                              <span className="text-muted-foreground">@{tu?.username}</span>
                                              <span className="text-muted-foreground">· {formatDate(t.created_at)}</span>
                                            </div>
                                            <p className="text-xs mt-0.5 leading-relaxed whitespace-pre-wrap break-words">{t.text}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : null;
                              })()}
                              <div className="flex items-center gap-2 flex-wrap pt-1">
                                <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                                  <a href={`https://x.com/${user?.username || "x"}/status/${tweet.id}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />View on Twitter
                                  </a>
                                </Button>
                                {namingRepo === tweet.id ? (
                                  <form className="flex items-center gap-1.5" onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); createRepo(tweet.text, tweet.id, tweet.author_id, repoNameInput); }} onClick={(e) => e.stopPropagation()}>
                                    <Input className="h-7 text-xs w-48" value={repoNameInput} onChange={(e) => setRepoNameInput(e.target.value)} placeholder="repo-name" autoFocus />
                                    <Button type="submit" variant="outline" size="sm" className="h-7 text-xs">Create</Button>
                                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setNamingRepo(null)}>Cancel</Button>
                                  </form>
                                ) : (
                                  <Button variant="outline" size="sm" disabled={creatingRepo === tweet.id} onClick={(e) => { e.stopPropagation(); startNamingRepo(tweet.text, tweet.id); }}>
                                    <Github className="h-3.5 w-3.5 mr-1.5" />
                                    {creatingRepo === tweet.id ? "Creating..." : "Create GitHub Repo"}
                                  </Button>
                                )}
                                {createdRepoUrl[tweet.id] && (
                                  <a href={createdRepoUrl[tweet.id]} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                    Repo created ↗
                                  </a>
                                )}
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive ml-auto" onClick={(e) => { e.stopPropagation(); dismissTweet(tweet.id); }}>
                                  <X className="h-3.5 w-3.5 mr-1" />Dismiss
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </>
          )}

          {/* Mentions view — full list */}
          {activeView === "mentions" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>All Mentions</CardTitle>
                    <CardDescription>{mentionCount} posts mentioning @{username}</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      placeholder="Filter mentions..."
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading && (
                  <>
                    <TweetSkeleton /><Separator />
                    <TweetSkeleton /><Separator />
                    <TweetSkeleton /><Separator />
                    <TweetSkeleton />
                  </>
                )}
                {error && !loading && (
                  <div className="p-6 text-center">
                    <p className="text-sm text-destructive">Error: {error}</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchData(username)}>Retry</Button>
                  </div>
                )}
                {!loading && !error && (!filteredTweets || filteredTweets.length === 0) && (
                  <div className="p-12 text-center">
                    <AtSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No mentions found</p>
                  </div>
                )}
                {!loading && filteredTweets?.map((tweet, i) => {
                  const user = getUser(tweet.author_id);
                  const isExpanded = expandedTweetId === tweet.id;
                  const hasThread = tweet.conversation_id && tweet.conversation_id !== tweet.id;
                  return (
                    <div key={tweet.id}>
                      {i > 0 && <Separator />}
                      <div
                        className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${isExpanded ? "bg-muted/30" : ""}`}
                        onClick={() => { setExpandedTweetId(isExpanded ? null : tweet.id); if (!isExpanded) setThreadData(null); }}
                      >
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage src={user?.profile_image_url} />
                              <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                            </Avatar>
                            {hasThread && <div className="w-0.5 flex-1 bg-border mt-1 rounded-full" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-sm">{user?.name || "Unknown"}</span>
                              {user?.verified && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Verified</Badge>}
                              <span className="text-muted-foreground text-sm">@{user?.username || "unknown"}</span>
                              <span className="text-muted-foreground text-sm">· {formatDate(tweet.created_at)}</span>
                            </div>
                            <p className={`text-sm mt-0.5 leading-relaxed whitespace-pre-wrap break-words ${isExpanded ? "" : "line-clamp-3"}`}>{tweet.text}</p>
                            {/* Twitter-style action bar */}
                            <div className="flex justify-between mt-2 max-w-md -ml-1.5">
                              <button className="group/reply flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-blue-500" onClick={(e) => e.stopPropagation()}>
                                <div className="p-1.5 rounded-full transition-colors group-hover/reply:bg-blue-500/10"><MessageCircle className="h-4 w-4" /></div>
                                {tweet.public_metrics?.reply_count ? <span>{tweet.public_metrics.reply_count}</span> : null}
                              </button>
                              <button className="group/repost flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-green-500" onClick={(e) => e.stopPropagation()}>
                                <div className="p-1.5 rounded-full transition-colors group-hover/repost:bg-green-500/10"><Repeat2 className="h-4 w-4" /></div>
                                {tweet.public_metrics?.retweet_count ? <span>{tweet.public_metrics.retweet_count}</span> : null}
                              </button>
                              <button className="group/like flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-pink-500" onClick={(e) => e.stopPropagation()}>
                                <div className="p-1.5 rounded-full transition-colors group-hover/like:bg-pink-500/10"><Heart className="h-4 w-4" /></div>
                                {tweet.public_metrics?.like_count ? <span>{tweet.public_metrics.like_count}</span> : null}
                              </button>
                              <button className="group/views flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-blue-500" onClick={(e) => e.stopPropagation()}>
                                <div className="p-1.5 rounded-full transition-colors group-hover/views:bg-blue-500/10"><BarChart2 className="h-4 w-4" /></div>
                                {tweet.public_metrics?.impression_count ? <span>{formatNumber(tweet.public_metrics.impression_count)}</span> : null}
                              </button>
                            </div>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-3 ml-[52px] space-y-3">
                            {hasThread && (!threadData || threadData.conversation_id !== tweet.conversation_id) && (
                              <Button variant="outline" size="sm" disabled={threadLoading} onClick={(e) => { e.stopPropagation(); loadThread(tweet.conversation_id!); }}>
                                {threadLoading ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Loading thread...</> : <><MessageCircle className="h-3.5 w-3.5 mr-1.5" />Load conversation</>}
                              </Button>
                            )}
                            {threadData && threadData.conversation_id === tweet.conversation_id && (() => {
                              const contextTweets = threadData.data
                                .filter((t) => new Date(t.created_at).getTime() < new Date(tweet.created_at).getTime() && t.id !== tweet.id)
                                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                              return contextTweets.length > 0 ? (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-2">Conversation context</p>
                                  {contextTweets.map((t, idx) => {
                                    const tu = getUserFromThread(t.author_id) || getUser(t.author_id);
                                    return (
                                      <div key={t.id} className="flex gap-2">
                                        <div className="flex flex-col items-center">
                                          <Avatar className="h-6 w-6 shrink-0"><AvatarImage src={tu?.profile_image_url} /><AvatarFallback className="text-[9px]">{tu?.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback></Avatar>
                                          {idx < contextTweets.length - 1 && <div className="w-0.5 flex-1 bg-border mt-0.5 rounded-full" />}
                                        </div>
                                        <div className="flex-1 min-w-0 pb-3">
                                          <div className="flex items-center gap-1 text-xs">
                                            <span className="font-medium">{tu?.name || "Unknown"}</span>
                                            <span className="text-muted-foreground">@{tu?.username}</span>
                                            <span className="text-muted-foreground">· {formatDate(t.created_at)}</span>
                                          </div>
                                          <p className="text-xs mt-0.5 leading-relaxed whitespace-pre-wrap break-words">{t.text}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : null;
                            })()}
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                                <a href={`https://x.com/${user?.username || "x"}/status/${tweet.id}`} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />View on Twitter
                                </a>
                              </Button>
                              {namingRepo === tweet.id ? (
                                <form className="flex items-center gap-1.5" onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); createRepo(tweet.text, tweet.id, tweet.author_id, repoNameInput); }} onClick={(e) => e.stopPropagation()}>
                                  <Input className="h-7 text-xs w-48" value={repoNameInput} onChange={(e) => setRepoNameInput(e.target.value)} placeholder="repo-name" autoFocus />
                                  <Button type="submit" variant="outline" size="sm" className="h-7 text-xs">Create</Button>
                                  <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setNamingRepo(null)}>Cancel</Button>
                                </form>
                              ) : (
                                <Button variant="outline" size="sm" disabled={creatingRepo === tweet.id} onClick={(e) => { e.stopPropagation(); startNamingRepo(tweet.text, tweet.id); }}>
                                  <Github className="h-3.5 w-3.5 mr-1.5" />
                                  {creatingRepo === tweet.id ? "Creating..." : "Create GitHub Repo"}
                                </Button>
                              )}
                              {createdRepoUrl[tweet.id] && (
                                <a href={createdRepoUrl[tweet.id]} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                  Repo created ↗
                                </a>
                              )}
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive ml-auto" onClick={(e) => { e.stopPropagation(); dismissTweet(tweet.id); }}>
                                <X className="h-3.5 w-3.5 mr-1" />Dismiss
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Analytics view */}
          {activeView === "analytics" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Summary</CardTitle>
                  <CardDescription>Across all {mentionCount} mentions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Likes</span>
                    </div>
                    <span className="font-bold">{totalLikes}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Repeat2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Reposts</span>
                    </div>
                    <span className="font-bold">{totalReposts}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Replies</span>
                    </div>
                    <span className="font-bold">{totalReplies}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Impressions</span>
                    </div>
                    <span className="font-bold">{formatNumber(totalImpressions)}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Mentioners</CardTitle>
                  <CardDescription>Users who mention @{username} most</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mentions?.includes?.users?.slice(0, 5).map((user, i) => {
                    const userMentions = filteredTweets?.filter((t) => t.author_id === user.id).length || 0;
                    return (
                      <div key={user.id} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-4">{i + 1}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profile_image_url} />
                          <AvatarFallback className="text-xs">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                        <Badge variant="secondary">{userMentions}</Badge>
                      </div>
                    );
                  })}
                  {(!mentions?.includes?.users || mentions.includes.users.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sessions view */}
          {activeView === "sessions" && (() => {
            const activeSessions = sessions.filter((s) => s.status === "active" || s.status === "running");
            const completedSessions = sessions.filter((s) => s.status === "completed" || s.status === "done");
            const failedSessions = sessions.filter((s) => s.status === "failed" || s.status === "error");
            const todaySessions = sessions.filter((s) => {
              const d = s.created_at?.slice(0, 10);
              return d === new Date().toISOString().slice(0, 10);
            });
            const uniqueUsers = new Set(sessions.map((s) => s.user_id)).size;
            const uniqueProjects = new Set(sessions.filter((s) => s.project_id).map((s) => s.project_id)).size;

            function sessionDuration(s: Session) {
              if (!s.created_at) return null;
              const end = s.completed_at || s.updated_at;
              if (!end) return null;
              const ms = new Date(end).getTime() - new Date(s.created_at).getTime();
              if (ms < 0) return null;
              if (ms < 60000) return `${Math.round(ms / 1000)}s`;
              if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
              return `${(ms / 3600000).toFixed(1)}h`;
            }

            function statusColor(status: string) {
              if (status === "active" || status === "running") return "bg-green-500";
              if (status === "completed" || status === "done") return "bg-gray-400";
              if (status === "failed" || status === "error") return "bg-red-500";
              return "bg-yellow-500";
            }

            function statusIcon(status: string) {
              if (status === "active" || status === "running") return <Play className="h-3.5 w-3.5 text-green-500" />;
              if (status === "completed" || status === "done") return <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />;
              if (status === "failed" || status === "error") return <XCircle className="h-3.5 w-3.5 text-red-500" />;
              return <Clock className="h-3.5 w-3.5 text-yellow-500" />;
            }

            return (
              <div className="space-y-6">
                {/* Stats cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardDescription className="text-sm font-medium">Total Sessions</CardDescription>
                      <Terminal className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{sessionsLoading ? <Skeleton className="h-8 w-16" /> : sessions.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardDescription className="text-sm font-medium">Active Now</CardDescription>
                      <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{sessionsLoading ? <Skeleton className="h-8 w-16" /> : activeSessions.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardDescription className="text-sm font-medium">Today</CardDescription>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{sessionsLoading ? <Skeleton className="h-8 w-16" /> : todaySessions.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardDescription className="text-sm font-medium">Unique Users</CardDescription>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{sessionsLoading ? <Skeleton className="h-8 w-16" /> : uniqueUsers}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Breakdown row */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                          <span className="text-sm">Active</span>
                        </div>
                        <span className="font-semibold">{activeSessions.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                          <span className="text-sm">Completed</span>
                        </div>
                        <span className="font-semibold">{completedSessions.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                          <span className="text-sm">Failed</span>
                        </div>
                        <span className="font-semibold">{failedSessions.length}</span>
                      </div>
                      {sessions.length > 0 && (
                        <div className="pt-2">
                          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                            {activeSessions.length > 0 && (
                              <div className="bg-green-500" style={{ width: `${(activeSessions.length / sessions.length) * 100}%` }} />
                            )}
                            {completedSessions.length > 0 && (
                              <div className="bg-gray-400" style={{ width: `${(completedSessions.length / sessions.length) * 100}%` }} />
                            )}
                            {failedSessions.length > 0 && (
                              <div className="bg-red-500" style={{ width: `${(failedSessions.length / sessions.length) * 100}%` }} />
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Top Projects</CardTitle>
                      <CardDescription>{uniqueProjects} unique projects</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(
                        sessions.reduce<Record<string, number>>((acc, s) => {
                          const key = s.project_id || s.directory || "unknown";
                          acc[key] = (acc[key] || 0) + 1;
                          return acc;
                        }, {}),
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([project, count]) => (
                          <div key={project} className="flex items-center justify-between">
                            <span className="text-sm truncate max-w-[200px]" title={project}>
                              {project.split("/").pop() || project}
                            </span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      {sessions.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">No sessions yet</p>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Top Users</CardTitle>
                      <CardDescription>{uniqueUsers} unique users</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(
                        sessions.reduce<Record<string, { count: number; name: string; email: string }>>((acc, s) => {
                          if (!acc[s.user_id]) acc[s.user_id] = { count: 0, name: s.user_name, email: s.user_email };
                          acc[s.user_id].count++;
                          return acc;
                        }, {}),
                      )
                        .sort((a, b) => b[1].count - a[1].count)
                        .slice(0, 5)
                        .map(([userId, { count, name, email }]) => (
                          <div key={userId} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <Avatar className="h-6 w-6 shrink-0">
                                <AvatarFallback className="text-[10px]">{name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground truncate">{email}</p>
                              </div>
                            </div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      {sessions.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">No sessions yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Session list */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>All Sessions</CardTitle>
                        <CardDescription>Sorted by most recent</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSessionsLoading(true);
                          fetch(`${API_BASE}/sessions/?limit=100`)
                            .then((r) => r.json())
                            .then((data) => { if (Array.isArray(data)) setSessions(data); })
                            .catch((err) => console.error("[Stardrop] Failed to refresh sessions:", err))
                            .finally(() => setSessionsLoading(false));
                        }}
                        disabled={sessionsLoading}
                      >
                        <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${sessionsLoading ? "animate-spin" : ""}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {sessionsLoading && sessions.length === 0 && (
                      <>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex gap-3 p-4">
                            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {!sessionsLoading && sessions.length === 0 && (
                      <div className="p-12 text-center">
                        <Terminal className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No sessions logged yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Sessions will appear here when users run the coding agent</p>
                      </div>
                    )}
                    {sessions.map((session, i) => {
                      const isExpanded = expandedSessionId === session.session_id;
                      const duration = sessionDuration(session);
                      return (
                        <div key={session.session_id}>
                          {i > 0 && <Separator />}
                          <div
                            className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${isExpanded ? "bg-muted/30" : ""}`}
                            onClick={() => setExpandedSessionId(isExpanded ? null : session.session_id)}
                          >
                            <div className="flex gap-3">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarFallback className="text-xs">{session.user_name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm">{session.user_name || "Unknown"}</span>
                                  <span className="text-muted-foreground text-xs">{session.user_email}</span>
                                  <span className="text-muted-foreground text-xs">· {formatDate(session.created_at)}</span>
                                </div>
                                <p className="text-sm mt-0.5 font-medium">{session.title || "Untitled session"}</p>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    {statusIcon(session.status)}
                                    <span className="text-xs capitalize">{session.status}</span>
                                  </div>
                                  {session.project_id && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <FolderGit2 className="h-3 w-3" />
                                      <span className="truncate max-w-[150px]">{session.project_id}</span>
                                    </div>
                                  )}
                                  {duration && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>{duration}</span>
                                    </div>
                                  )}
                                  {session.version && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                      v{session.version}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-start">
                                <div className={`h-2.5 w-2.5 rounded-full mt-1 ${statusColor(session.status)}`} />
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="mt-3 ml-[52px] space-y-3">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Session ID</span>
                                    <p className="font-mono text-xs mt-0.5 truncate">{session.session_id}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Directory</span>
                                    <p className="font-mono text-xs mt-0.5 truncate">{session.directory || "N/A"}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Created</span>
                                    <p className="text-xs mt-0.5">{new Date(session.created_at).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Last Updated</span>
                                    <p className="text-xs mt-0.5">{new Date(session.updated_at).toLocaleString()}</p>
                                  </div>
                                  {session.completed_at && (
                                    <div>
                                      <span className="text-muted-foreground">Completed</span>
                                      <p className="text-xs mt-0.5">{new Date(session.completed_at).toLocaleString()}</p>
                                    </div>
                                  )}
                                </div>
                                {session.summary && Object.keys(session.summary).length > 0 && (
                                  <div>
                                    <span className="text-sm text-muted-foreground">Summary</span>
                                    <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-auto max-h-48 whitespace-pre-wrap">
                                      {JSON.stringify(session.summary, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {/* Projects view */}
          {activeView === "projects" && (
            <div className="space-y-4">
              {userProjects.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FolderGit2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a GitHub repo from any tweet in the Mentions view to get started.
                    </p>
                    <Button variant="outline" onClick={() => setActiveView("mentions")}>
                      View Mentions
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {userProjects.map((project) => (
                    <Card key={project.tweet_id + project.repo_name}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            <a
                              href={project.repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline flex items-center gap-2"
                            >
                              <Github className="h-4 w-4" />
                              {project.full_name}
                            </a>
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {formatDate(project.created_at)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {project.tweet_text}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {project.tweet_author && <span>From @{project.tweet_author}</span>}
                          {project.tweet_url && (
                            <a
                              href={project.tweet_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View tweet
                            </a>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-3.5 w-3.5 mr-1.5" />
                            Open Repo
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings view */}
          {activeView === "settings" && (
            <div className="grid gap-4 max-w-2xl">
              {/* Your Twitter Handle */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Twitter Handle</CardTitle>
                  <CardDescription>
                    Link your Twitter account to filter mentions and only see posts you authored
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">@</span>
                      <Input
                        value={myHandleInput}
                        onChange={(e) => setMyHandleInput(e.target.value)}
                        placeholder="your_username"
                        className="pl-7"
                        onKeyDown={(e) => e.key === "Enter" && saveMyHandle()}
                      />
                    </div>
                    <Button onClick={saveMyHandle} disabled={savingHandle}>
                      {savingHandle ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  {myHandle && (
                    <p className="text-sm text-muted-foreground">
                      Currently set to <span className="font-medium text-foreground">@{myHandle}</span>
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Tracked Account */}
              <Card>
                <CardHeader>
                  <CardTitle>Tracked Account</CardTitle>
                  <CardDescription>
                    The Twitter account whose mentions you&apos;re tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">@</span>
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="stardroplin"
                        className="pl-7"
                      />
                    </div>
                    <Button type="submit">Update</Button>
                  </form>
                  <p className="text-sm text-muted-foreground">
                    Currently tracking <span className="font-medium text-foreground">@{username}</span>
                  </p>
                </CardContent>
              </Card>

              {/* Feed Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Feed Preferences</CardTitle>
                  <CardDescription>
                    Control what shows up in your mentions feed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Show all mentions</p>
                      <p className="text-xs text-muted-foreground">Show mentions from everyone, not just your posts</p>
                    </div>
                    <Button
                      variant={showAllMentions ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowAllMentions(!showAllMentions)}
                    >
                      {showAllMentions ? "On" : "Off"}
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Dismissed posts</p>
                      <p className="text-xs text-muted-foreground">{dismissedIds.size} posts hidden from your feed</p>
                    </div>
                    {dismissedIds.size > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDismissedIds(new Set());
                          if (clerkUser?.id) {
                            fetch(`${API_BASE}/api/users/by-clerk/${clerkUser.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ dismissed_tweet_ids: [] }),
                            }).catch((err) => console.error("[Stardrop] Failed to reset dismissals:", err));
                          }
                        }}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Cache */}
              <Card>
                <CardHeader>
                  <CardTitle>Data &amp; Cache</CardTitle>
                  <CardDescription>
                    Mentions are cached for 15 minutes to save API calls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => { fetchData(username, true); setActiveView("dashboard"); }}
                    disabled={loading || refreshRemaining === 0}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    {refreshRemaining === 0
                      ? `Rate limited (${refreshCooldown}s)`
                      : `Force Refresh (${refreshRemaining}/4 left)`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
