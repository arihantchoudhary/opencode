"use client";

import { useEffect, useState, useCallback } from "react";
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
  if (diffHrs < 1) return `${Math.floor(diffMs / (1000 * 60))}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
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

  const fetchData = useCallback(async (user: string) => {
    setLoading(true);
    setError(null);
    try {
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

      if (mentionsRes.status === "fulfilled") {
        setMentions(mentionsRes.value);
      } else {
        setError(mentionsRes.reason?.message || "Failed to fetch mentions");
      }

      if (profileRes.status === "fulfilled" && profileRes.value) {
        setProfile(profileRes.value);
      }
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
  const mentionCount = mentions?.data?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Stardrop</h1>
            <p className="text-sm text-muted-foreground">Twitter Mentions Dashboard</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter username..."
              className="w-48"
            />
            <Button type="submit" variant="outline" size="sm">
              Track
            </Button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Profile card */}
        {profile && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile.profile_image_url} />
                  <AvatarFallback className="text-lg">
                    {profile.name?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">{profile.name}</h2>
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  {profile.description && (
                    <p className="text-sm mt-1 max-w-lg">{profile.description}</p>
                  )}
                </div>
                {profile.public_metrics && (
                  <div className="ml-auto flex gap-6 text-center">
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

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Mentions</CardDescription>
              <CardTitle className="text-3xl">{loading ? "—" : mentionCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Likes</CardDescription>
              <CardTitle className="text-3xl">{loading ? "—" : totalLikes}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Reposts</CardDescription>
              <CardTitle className="text-3xl">{loading ? "—" : totalReposts}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Replies</CardDescription>
              <CardTitle className="text-3xl">{loading ? "—" : totalReplies}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Mentions feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Mentions</CardTitle>
                <CardDescription>
                  Posts where @{username} was mentioned
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData(username)}
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <div>
                <TweetSkeleton />
                <Separator />
                <TweetSkeleton />
                <Separator />
                <TweetSkeleton />
              </div>
            )}

            {error && !loading && (
              <div className="p-6 text-center">
                <p className="text-destructive text-sm">Error: {error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => fetchData(username)}
                >
                  Retry
                </Button>
              </div>
            )}

            {!loading && !error && (!mentions?.data || mentions.data.length === 0) && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No mentions found for @{username}</p>
              </div>
            )}

            {!loading && mentions?.data && mentions.data.length > 0 && (
              <div>
                {mentions.data.map((tweet, i) => {
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
                          <AvatarFallback>
                            {user?.name?.charAt(0)?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-sm">
                              {user?.name || "Unknown"}
                            </span>
                            {user?.verified && (
                              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                Verified
                              </Badge>
                            )}
                            <span className="text-muted-foreground text-sm">
                              @{user?.username || "unknown"}
                            </span>
                            <span className="text-muted-foreground text-sm">·</span>
                            <span className="text-muted-foreground text-sm">
                              {formatDate(tweet.created_at)}
                            </span>
                          </div>
                          <p className="text-sm mt-1.5 leading-relaxed whitespace-pre-wrap break-words">
                            {tweet.text}
                          </p>
                          {tweet.public_metrics && (
                            <div className="flex gap-5 mt-2.5 text-muted-foreground text-xs">
                              <span>{tweet.public_metrics.reply_count} replies</span>
                              <span>{tweet.public_metrics.retweet_count} reposts</span>
                              <span>{tweet.public_metrics.like_count} likes</span>
                            </div>
                          )}
                        </div>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
