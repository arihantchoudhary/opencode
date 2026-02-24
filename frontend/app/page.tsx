"use client";

import { useEffect, useState, useCallback } from "react";
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
  includes?: { users?: TwitterUser[] };
  meta?: { next_token?: string; result_count?: number };
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

  const fetchData = useCallback(async (user: string, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      // If force refresh, call the refresh endpoint first to bust the cache
      if (forceRefresh) {
        await fetch(`${API_BASE}/api/twitter/refresh/${user}`, { method: "POST" }).catch(() => {});
      }

      const [mentionsRes, profileRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/twitter/mentions/${user}`).then((r) => {
          if (!r.ok) throw new Error(`${r.status}`);
          return r.json() as Promise<MentionsResponse>;
        }),
        fetch(`${API_BASE}/api/twitter/profile/${user}`).then((r) => {
          if (!r.ok) return null;
          return r.json() as Promise<ProfileData>;
        }),
      ]);

      if (mentionsRes.status === "fulfilled") setMentions(mentionsRes.value);
      else setError(mentionsRes.reason?.message || "Failed to fetch mentions");

      if (profileRes.status === "fulfilled" && profileRes.value) setProfile(profileRes.value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

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

  function getUser(authorId: string): TwitterUser | undefined {
    return mentions?.includes?.users?.find((u) => u.id === authorId);
  }

  const totalLikes = mentions?.data?.reduce((sum, t) => sum + (t.public_metrics?.like_count || 0), 0) || 0;
  const totalReposts = mentions?.data?.reduce((sum, t) => sum + (t.public_metrics?.retweet_count || 0), 0) || 0;
  const totalReplies = mentions?.data?.reduce((sum, t) => sum + (t.public_metrics?.reply_count || 0), 0) || 0;
  const totalImpressions = mentions?.data?.reduce((sum, t) => sum + (t.public_metrics?.impression_count || 0), 0) || 0;
  const mentionCount = mentions?.data?.length || 0;

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
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={`https://x.com/${username}`} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                      <span>@{username}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          {profile && (
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.profile_image_url} />
                <AvatarFallback>{profile.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile.name}</p>
                <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
              </div>
            </div>
          )}
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchData(username, true)}
            disabled={loading}
            title="Force refresh from Twitter"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </header>

        {/* Main content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Page title */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {activeView === "dashboard" && "Dashboard"}
              {activeView === "mentions" && "Mentions"}
              {activeView === "analytics" && "Analytics"}
            </h2>
            <p className="text-muted-foreground">
              {activeView === "dashboard" && `Overview for @${username}`}
              {activeView === "mentions" && `Posts mentioning @${username}`}
              {activeView === "analytics" && `Engagement analytics for @${username}`}
            </p>
          </div>

          {/* Dashboard view */}
          {activeView === "dashboard" && (
            <>
              {/* Profile banner */}
              {profile && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
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
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchData(username, true)}>
                        Retry
                      </Button>
                    </div>
                  )}
                  {!loading && !error && (!mentions?.data || mentions.data.length === 0) && (
                    <div className="p-12 text-center">
                      <AtSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No mentions found for @{username}</p>
                    </div>
                  )}
                  {!loading && mentions?.data?.slice(0, 5).map((tweet, i) => {
                    const user = getUser(tweet.author_id);
                    return (
                      <div key={tweet.id}>
                        {i > 0 && <Separator />}
                        <a
                          href={`https://x.com/${user?.username || "x"}/status/${tweet.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex gap-3 p-4 hover:bg-muted/50 transition-colors"
                        >
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src={user?.profile_image_url} />
                            <AvatarFallback className="text-xs">
                              {user?.name?.charAt(0)?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-sm">{user?.name || "Unknown"}</span>
                              <span className="text-muted-foreground text-sm">@{user?.username || "unknown"}</span>
                              <span className="text-muted-foreground text-xs">· {formatDate(tweet.created_at)}</span>
                            </div>
                            <p className="text-sm mt-1 leading-relaxed whitespace-pre-wrap break-words line-clamp-2">
                              {tweet.text}
                            </p>
                            {tweet.public_metrics && (
                              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{tweet.public_metrics.reply_count}</span>
                                <span className="flex items-center gap-1"><Repeat2 className="h-3 w-3" />{tweet.public_metrics.retweet_count}</span>
                                <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{tweet.public_metrics.like_count}</span>
                              </div>
                            )}
                          </div>
                        </a>
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
                <CardTitle>All Mentions</CardTitle>
                <CardDescription>{mentionCount} posts mentioning @{username}</CardDescription>
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
                {!loading && !error && (!mentions?.data || mentions.data.length === 0) && (
                  <div className="p-12 text-center">
                    <AtSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No mentions found</p>
                  </div>
                )}
                {!loading && mentions?.data?.map((tweet, i) => {
                  const user = getUser(tweet.author_id);
                  return (
                    <div key={tweet.id}>
                      {i > 0 && <Separator />}
                      <a
                        href={`https://x.com/${user?.username || "x"}/status/${tweet.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-3 p-4 hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={user?.profile_image_url} />
                          <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-sm">{user?.name || "Unknown"}</span>
                            {user?.verified && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Verified</Badge>}
                            <span className="text-muted-foreground text-sm">@{user?.username || "unknown"}</span>
                            <span className="text-muted-foreground text-xs">· {formatDate(tweet.created_at)}</span>
                          </div>
                          <p className="text-sm mt-1.5 leading-relaxed whitespace-pre-wrap break-words">{tweet.text}</p>
                          {tweet.public_metrics && (
                            <div className="flex gap-5 mt-2.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{tweet.public_metrics.reply_count} replies</span>
                              <span className="flex items-center gap-1"><Repeat2 className="h-3 w-3" />{tweet.public_metrics.retweet_count} reposts</span>
                              <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{tweet.public_metrics.like_count} likes</span>
                            </div>
                          )}
                        </div>
                      </a>
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
                    const userMentions = mentions.data?.filter((t) => t.author_id === user.id).length || 0;
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
