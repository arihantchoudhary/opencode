import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from "react-native";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

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
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [users, setUsers] = useState<TwitterUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  async function fetchMentions(paginationToken?: string): Promise<MentionsResponse> {
    const params = new URLSearchParams({ max_results: "20" });
    if (paginationToken) params.set("pagination_token", paginationToken);
    const res = await fetch(`${API_BASE}/api/twitter/mentions?${params}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  async function loadInitial() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMentions();
      setTweets(data.data || []);
      setUsers(data.includes?.users || []);
      setNextToken(data.meta?.next_token || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchMentions();
      setTweets(data.data || []);
      setUsers(data.includes?.users || []);
      setNextToken(data.meta?.next_token || null);
    } catch {
      // keep existing data on refresh failure
    } finally {
      setRefreshing(false);
    }
  }, []);

  async function loadMore() {
    if (!nextToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchMentions(nextToken);
      setTweets((prev) => [...prev, ...(data.data || [])]);
      setUsers((prev) => [...prev, ...(data.includes?.users || [])]);
      setNextToken(data.meta?.next_token || null);
    } catch {
      // silently fail on load more
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadInitial();
  }, []);

  function getUser(authorId: string): TwitterUser | undefined {
    return users.find((u) => u.id === authorId);
  }

  function openTweet(tweet: Tweet) {
    const user = getUser(tweet.author_id);
    Linking.openURL(`https://x.com/${user?.username || "x"}/status/${tweet.id}`);
  }

  function renderTweet({ item }: { item: Tweet }) {
    const user = getUser(item.author_id);
    return (
      <TouchableOpacity style={styles.tweetCard} onPress={() => openTweet(item)}>
        <View style={styles.tweetRow}>
          {user?.profile_image_url ? (
            <Image source={{ uri: user.profile_image_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
          <View style={styles.tweetContent}>
            <View style={styles.tweetHeader}>
              <Text style={styles.name} numberOfLines={1}>
                {user?.name || "Unknown"}
              </Text>
              <Text style={styles.handle} numberOfLines={1}>
                @{user?.username || "unknown"}
              </Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.time}>{formatDate(item.created_at)}</Text>
            </View>
            <Text style={styles.tweetText}>{item.text}</Text>
            {item.public_metrics && (
              <View style={styles.metrics}>
                <Text style={styles.metric}>
                  {item.public_metrics.reply_count} replies
                </Text>
                <Text style={styles.metric}>
                  {item.public_metrics.retweet_count} reposts
                </Text>
                <Text style={styles.metric}>
                  {item.public_metrics.like_count} likes
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading mentions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadInitial}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stardrop</Text>
        <Text style={styles.subtitle}>Posts mentioning @stardroplin</Text>
      </View>
      <FlatList
        data={tweets}
        keyExtractor={(item) => item.id}
        renderItem={renderTweet}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No mentions found yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  title: { fontSize: 28, fontWeight: "bold" },
  subtitle: { fontSize: 14, color: "#737373", marginTop: 4 },
  tweetCard: { paddingHorizontal: 16, paddingVertical: 12 },
  tweetRow: { flexDirection: "row", gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: {
    backgroundColor: "#e5e5e5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "600", color: "#737373" },
  tweetContent: { flex: 1 },
  tweetHeader: { flexDirection: "row", alignItems: "center", gap: 4 },
  name: { fontWeight: "600", fontSize: 14, flexShrink: 1 },
  handle: { fontSize: 14, color: "#737373", flexShrink: 1 },
  dot: { fontSize: 14, color: "#737373" },
  time: { fontSize: 14, color: "#737373" },
  tweetText: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  metrics: { flexDirection: "row", gap: 16, marginTop: 8 },
  metric: { fontSize: 12, color: "#737373" },
  separator: { height: 1, backgroundColor: "#e5e5e5" },
  footer: { padding: 16, alignItems: "center" },
  loadingText: { marginTop: 12, color: "#737373" },
  errorText: { color: "#ef4444", marginBottom: 12 },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  retryText: { fontWeight: "500" },
  emptyText: { color: "#737373" },
});
