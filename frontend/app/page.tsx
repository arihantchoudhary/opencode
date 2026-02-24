"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return `${Math.floor(diffMs / (1000 * 60))}m`;
  if (diffHrs < 24) return `${diffHrs}h`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Home() {
  const [mentions, setMentions] = useState<MentionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  async function fetchMentions(paginationToken?: string) {
    const params = new URLSearchParams({ max_results: "20" });
    if (paginationToken) params.set("pagination_token", paginationToken);

    const res = await fetch(`${API_BASE}/api/twitter/mentions?${params}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json() as Promise<MentionsResponse>;
  }

  useEffect(() => {
    fetchMentions()
      .then((data) => {
        setMentions(data);
        setNextToken(data.meta?.next_token || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function loadMore() {
    if (!nextToken) return;
    setLoadingMore(true);
    try {
      const data = await fetchMentions(nextToken);
      setMentions((prev) => ({
        data: [...(prev?.data || []), ...(data.data || [])],
        includes: {
          users: [
            ...(prev?.includes?.users || []),
            ...(data.includes?.users || []),
          ],
        },
        meta: data.meta,
      }));
      setNextToken(data.meta?.next_token || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }

  function getUser(authorId: string): TwitterUser | undefined {
    return mentions?.includes?.users?.find((u) => u.id === authorId);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight">Stardrop</h1>
          <p className="text-muted-foreground mt-1">
            Posts mentioning{" "}
            <a
              href="https://x.com/stardroplin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-medium hover:underline"
            >
              @stardroplin
            </a>
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Loading mentions...</p>
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (!mentions?.data || mentions.data.length === 0) && (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">No mentions found yet.</p>
          </div>
        )}

        {mentions?.data && (
          <div className="space-y-0">
            {mentions.data.map((tweet, i) => {
              const user = getUser(tweet.author_id);
              return (
                <div key={tweet.id}>
                  {i > 0 && <Separator />}
                  <a
                    href={`https://x.com/${user?.username || "x"}/status/${tweet.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:bg-muted/50 transition-colors px-4 py-4"
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={user?.profile_image_url} />
                        <AvatarFallback>
                          {user?.name?.charAt(0)?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm truncate">
                            {user?.name || "Unknown"}
                          </span>
                          {user?.verified && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              ✓
                            </Badge>
                          )}
                          <span className="text-muted-foreground text-sm truncate">
                            @{user?.username || "unknown"}
                          </span>
                          <span className="text-muted-foreground text-sm">·</span>
                          <span className="text-muted-foreground text-sm whitespace-nowrap">
                            {formatDate(tweet.created_at)}
                          </span>
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                          {tweet.text}
                        </p>
                        {tweet.public_metrics && (
                          <div className="flex gap-4 mt-2 text-muted-foreground text-xs">
                            <span>{tweet.public_metrics.reply_count} replies</span>
                            <span>{tweet.public_metrics.retweet_count} reposts</span>
                            <span>{tweet.public_metrics.like_count} likes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {nextToken && (
          <div className="flex justify-center py-6">
            <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
