import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-expo";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fetchMentions,
  fetchProfile,
  forceRefresh,
  getUserByClerk,
  formatNumber,
  formatDate,
} from "../../lib/api";
import { Tweet, TwitterUser, MentionsResponse, ProfileData } from "../../lib/types";

export default function DashboardTab() {
  const { user: clerkUser } = useUser();
  const [username] = useState("stardroplin");
  const [mentions, setMentions] = useState<MentionsResponse | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [myHandle, setMyHandle] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (force = false) => {
    setError(null);
    try {
      if (force) await forceRefresh(username);
      const [m, p] = await Promise.allSettled([
        fetchMentions(username),
        fetchProfile(username),
      ]);
      if (m.status === "fulfilled") setMentions(m.value);
      else setError("Failed to load mentions");
      if (p.status === "fulfilled" && p.value) setProfile(p.value);
    } catch {
      setError("Failed to load data");
    }
  }, [username]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  useEffect(() => {
    if (!clerkUser?.id) return;
    getUserByClerk(clerkUser.id).then((u) => {
      if (u?.twitter_handle) setMyHandle(u.twitter_handle);
    }).catch(() => {});
  }, [clerkUser?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  }, [loadData]);

  function getUser(authorId: string): TwitterUser | undefined {
    return mentions?.includes?.users?.find((u) => u.id === authorId);
  }

  const filteredTweets = mentions?.data?.filter((t) => {
    const text = t.text.toLowerCase();
    if (!text.includes(`@${username.toLowerCase()}`)) return false;
    if (myHandle) {
      const author = getUser(t.author_id);
      if (author?.username.toLowerCase() !== myHandle.toLowerCase()) return false;
    }
    return true;
  });

  const mentionCount = filteredTweets?.length || 0;
  const totalLikes = filteredTweets?.reduce((s, t) => s + (t.public_metrics?.like_count || 0), 0) || 0;
  const totalReposts = filteredTweets?.reduce((s, t) => s + (t.public_metrics?.retweet_count || 0), 0) || 0;
  const totalReplies = filteredTweets?.reduce((s, t) => s + (t.public_metrics?.reply_count || 0), 0) || 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>@{username}</Text>
        </View>

        {/* Profile card */}
        {profile && (
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              {profile.profile_image_url ? (
                <Image source={{ uri: profile.profile_image_url }} style={styles.profileAvatar} />
              ) : (
                <View style={[styles.profileAvatar, styles.avatarFallback]}>
                  <Text style={styles.avatarText}>{profile.name?.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileHandle}>@{profile.username}</Text>
              </View>
            </View>
            {profile.public_metrics && (
              <View style={styles.profileStats}>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{formatNumber(profile.public_metrics.followers_count)}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{formatNumber(profile.public_metrics.following_count)}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{formatNumber(profile.public_metrics.tweet_count)}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsCard}>
            <Text style={styles.statsCardNum}>{mentionCount}</Text>
            <Text style={styles.statsCardLabel}>Mentions</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsCardNum}>{totalLikes}</Text>
            <Text style={styles.statsCardLabel}>Likes</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsCardNum}>{totalReposts}</Text>
            <Text style={styles.statsCardLabel}>Reposts</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsCardNum}>{totalReplies}</Text>
            <Text style={styles.statsCardLabel}>Replies</Text>
          </View>
        </View>

        {/* Recent mentions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Mentions</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {filteredTweets?.slice(0, 5).map((tweet) => {
            const author = getUser(tweet.author_id);
            return (
              <TouchableOpacity
                key={tweet.id}
                style={styles.tweetCard}
                onPress={() => Linking.openURL(`https://x.com/${author?.username || "x"}/status/${tweet.id}`)}
              >
                <View style={styles.tweetRow}>
                  {author?.profile_image_url ? (
                    <Image source={{ uri: author.profile_image_url }} style={styles.tweetAvatar} />
                  ) : (
                    <View style={[styles.tweetAvatar, styles.avatarFallback]}>
                      <Text style={styles.avatarSmallText}>{author?.name?.charAt(0) || "?"}</Text>
                    </View>
                  )}
                  <View style={styles.tweetContent}>
                    <View style={styles.tweetHeader}>
                      <Text style={styles.tweetName} numberOfLines={1}>{author?.name || "Unknown"}</Text>
                      <Text style={styles.tweetHandle}>@{author?.username}</Text>
                      <Text style={styles.tweetTime}> · {formatDate(tweet.created_at)}</Text>
                    </View>
                    <Text style={styles.tweetText} numberOfLines={3}>{tweet.text}</Text>
                    {tweet.public_metrics && (
                      <View style={styles.tweetMetrics}>
                        <Text style={styles.metricText}>{tweet.public_metrics.reply_count} replies</Text>
                        <Text style={styles.metricText}>{tweet.public_metrics.retweet_count} reposts</Text>
                        <Text style={styles.metricText}>{tweet.public_metrics.like_count} likes</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          {(!filteredTweets || filteredTweets.length === 0) && !error && (
            <Text style={styles.emptyText}>No mentions yet</Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scroll: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: "#666", marginTop: 2 },
  profileCard: {
    marginHorizontal: 20,
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  profileAvatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: { backgroundColor: "#222", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#666" },
  avatarSmallText: { fontSize: 14, fontWeight: "600", color: "#666" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: "700", color: "#fff" },
  profileHandle: { fontSize: 14, color: "#666", marginTop: 1 },
  profileStats: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    justifyContent: "space-around",
  },
  stat: { alignItems: "center" },
  statNum: { fontSize: 18, fontWeight: "700", color: "#fff" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 2 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 16,
  },
  statsCardNum: { fontSize: 24, fontWeight: "700", color: "#fff" },
  statsCardLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 12 },
  errorText: { color: "#ef4444", fontSize: 14, marginBottom: 12 },
  tweetCard: {
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  tweetRow: { flexDirection: "row", gap: 10 },
  tweetAvatar: { width: 36, height: 36, borderRadius: 18 },
  tweetContent: { flex: 1 },
  tweetHeader: { flexDirection: "row", alignItems: "center" },
  tweetName: { fontSize: 14, fontWeight: "600", color: "#fff", flexShrink: 1 },
  tweetHandle: { fontSize: 13, color: "#666", marginLeft: 4 },
  tweetTime: { fontSize: 13, color: "#666" },
  tweetText: { fontSize: 14, color: "#ccc", lineHeight: 20, marginTop: 6 },
  tweetMetrics: { flexDirection: "row", gap: 16, marginTop: 8 },
  metricText: { fontSize: 12, color: "#555" },
  emptyText: { color: "#555", textAlign: "center", paddingVertical: 40 },
});
