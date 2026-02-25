import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-expo";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fetchMentions,
  forceRefresh,
  getUserByClerk,
  formatDate,
  formatNumber,
  loadThread as loadThreadApi,
  createRepo as createRepoApi,
} from "../../lib/api";
import { Tweet, TwitterUser, MentionsResponse, ThreadData, Project } from "../../lib/types";

export default function MentionsTab() {
  const { user: clerkUser } = useUser();
  const [username] = useState("stardroplin");
  const [mentions, setMentions] = useState<MentionsResponse | null>(null);
  const [myHandle, setMyHandle] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [expandedTweetId, setExpandedTweetId] = useState<string | null>(null);
  const [threadData, setThreadData] = useState<ThreadData | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [creatingRepo, setCreatingRepo] = useState<string | null>(null);
  const [createdRepoUrl, setCreatedRepoUrl] = useState<Record<string, string>>({});

  const loadData = useCallback(async (force = false) => {
    try {
      if (force) await forceRefresh(username);
      const data = await fetchMentions(username);
      setMentions(data);
    } catch {
      // keep existing
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
      if (u?.dismissed_tweet_ids?.length) setDismissedIds(new Set(u.dismissed_tweet_ids));
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

  function getUserFromThread(authorId: string): TwitterUser | undefined {
    return threadData?.includes?.users?.find((u) => u.id === authorId) || getUser(authorId);
  }

  async function handleLoadThread(conversationId: string) {
    setThreadLoading(true);
    try {
      const data = await loadThreadApi(conversationId);
      if (data) setThreadData(data);
    } catch {
      // ignore
    } finally {
      setThreadLoading(false);
    }
  }

  async function handleCreateRepo(tweet: Tweet) {
    if (!clerkUser?.id) return;
    setCreatingRepo(tweet.id);
    try {
      const author = getUser(tweet.author_id);
      const name = tweet.text.slice(0, 50).replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "new-repo";
      const tweetUrl = `https://x.com/${author?.username || "x"}/status/${tweet.id}`;
      const data = await createRepoApi({
        name,
        description: tweet.text.slice(0, 200),
        tweet_text: tweet.text,
        tweet_id: tweet.id,
        tweet_author: author?.username || "",
        tweet_url: tweetUrl,
        clerk_id: clerkUser.id,
      });
      setCreatedRepoUrl((prev) => ({ ...prev, [tweet.id]: data.html_url }));
      Alert.alert("Repo Created", `${data.full_name}`, [
        { text: "Open", onPress: () => Linking.openURL(data.html_url) },
        { text: "OK" },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to create repo");
    } finally {
      setCreatingRepo(null);
    }
  }

  function dismissTweet(tweet: Tweet) {
    const author = getUser(tweet.author_id);
    Alert.alert(
      "Remove post",
      `Remove this post by @${author?.username || "unknown"} from your feed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => setDismissedIds((prev) => new Set(prev).add(tweet.id)),
        },
      ]
    );
  }

  const filteredTweets = mentions?.data?.filter((t) => {
    if (dismissedIds.has(t.id)) return false;
    const text = t.text.toLowerCase();
    if (!text.includes(`@${username.toLowerCase()}`)) return false;
    if (myHandle && !showAll) {
      const author = getUser(t.author_id);
      if (author?.username.toLowerCase() !== myHandle.toLowerCase()) return false;
    }
    if (searchText) {
      if (!text.includes(searchText.toLowerCase())) return false;
    }
    return true;
  });

  function renderTweet({ item }: { item: Tweet }) {
    const author = getUser(item.author_id);
    const isExpanded = expandedTweetId === item.id;
    const hasThread = item.conversation_id && item.conversation_id !== item.id;

    return (
      <View style={styles.tweetCard}>
        <TouchableOpacity
          onPress={() => {
            setExpandedTweetId(isExpanded ? null : item.id);
            if (!isExpanded) setThreadData(null);
          }}
          onLongPress={() => dismissTweet(item)}
          activeOpacity={0.7}
        >
          <View style={styles.tweetRow}>
            {author?.profile_image_url ? (
              <Image source={{ uri: author.profile_image_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarText}>{author?.name?.charAt(0) || "?"}</Text>
              </View>
            )}
            <View style={styles.tweetContent}>
              <View style={styles.tweetHeader}>
                <Text style={styles.name} numberOfLines={1}>{author?.name || "Unknown"}</Text>
                <Text style={styles.handle}>@{author?.username}</Text>
                <Text style={styles.time}> · {formatDate(item.created_at)}</Text>
              </View>
              {hasThread && (
                <Text style={styles.threadIndicator}>↩ In a thread</Text>
              )}
              <Text style={[styles.tweetText, isExpanded && styles.tweetTextExpanded]}
                numberOfLines={isExpanded ? undefined : 3}
              >
                {item.text}
              </Text>
              {/* Twitter-style action bar */}
              <View style={styles.actionBar}>
                <View style={styles.actionItem}>
                  <Text style={styles.actionIcon}>💬</Text>
                  {item.public_metrics?.reply_count ? (
                    <Text style={styles.actionCount}>{item.public_metrics.reply_count}</Text>
                  ) : null}
                </View>
                <View style={styles.actionItem}>
                  <Text style={styles.actionIcon}>🔁</Text>
                  {item.public_metrics?.retweet_count ? (
                    <Text style={styles.actionCount}>{item.public_metrics.retweet_count}</Text>
                  ) : null}
                </View>
                <View style={styles.actionItem}>
                  <Text style={styles.actionIcon}>♥</Text>
                  {item.public_metrics?.like_count ? (
                    <Text style={styles.actionCount}>{item.public_metrics.like_count}</Text>
                  ) : null}
                </View>
                <View style={styles.actionItem}>
                  <Text style={styles.actionIcon}>📊</Text>
                  {item.public_metrics?.impression_count ? (
                    <Text style={styles.actionCount}>{formatNumber(item.public_metrics.impression_count)}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded section */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            {/* Thread context */}
            {hasThread && (!threadData || threadData.conversation_id !== item.conversation_id) && (
              <TouchableOpacity
                style={styles.threadBtn}
                onPress={() => handleLoadThread(item.conversation_id!)}
                disabled={threadLoading}
              >
                {threadLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.threadBtnText}>💬 Load conversation</Text>
                )}
              </TouchableOpacity>
            )}

            {threadData && threadData.conversation_id === item.conversation_id && (() => {
              const contextTweets = threadData.data
                .filter((t) => new Date(t.created_at).getTime() < new Date(item.created_at).getTime() && t.id !== item.id)
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              if (contextTweets.length === 0) return null;
              return (
                <View style={styles.threadContext}>
                  <Text style={styles.threadContextLabel}>Conversation context</Text>
                  {contextTweets.map((t, idx) => {
                    const tu = getUserFromThread(t.author_id);
                    return (
                      <View key={t.id} style={styles.threadTweetRow}>
                        <View style={styles.threadAvatarCol}>
                          {tu?.profile_image_url ? (
                            <Image source={{ uri: tu.profile_image_url }} style={styles.threadAvatar} />
                          ) : (
                            <View style={[styles.threadAvatar, styles.avatarFallback]}>
                              <Text style={styles.threadAvatarText}>{tu?.name?.charAt(0) || "?"}</Text>
                            </View>
                          )}
                          {idx < contextTweets.length - 1 && <View style={styles.threadLine} />}
                        </View>
                        <View style={styles.threadTweetContent}>
                          <View style={styles.threadTweetHeader}>
                            <Text style={styles.threadName}>{tu?.name || "Unknown"}</Text>
                            <Text style={styles.threadHandle}> @{tu?.username}</Text>
                            <Text style={styles.threadTime}> · {formatDate(t.created_at)}</Text>
                          </View>
                          <Text style={styles.threadText}>{t.text}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })()}

            {/* Action buttons */}
            <View style={styles.expandedActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Linking.openURL(`https://x.com/${author?.username || "x"}/status/${item.id}`)}
              >
                <Text style={styles.actionBtnText}>🔗 View on Twitter</Text>
              </TouchableOpacity>

              {createdRepoUrl[item.id] ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnSuccess]}
                  onPress={() => Linking.openURL(createdRepoUrl[item.id])}
                >
                  <Text style={styles.actionBtnTextSuccess}>✓ Repo created ↗</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleCreateRepo(item)}
                  disabled={creatingRepo === item.id}
                >
                  {creatingRepo === item.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.actionBtnText}>⊞ Create GitHub Repo</Text>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDanger]}
                onPress={() => dismissTweet(item)}
              >
                <Text style={styles.actionBtnTextDanger}>✕ Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Mentions</Text>
        <Text style={styles.subtitle}>{filteredTweets?.length || 0} posts mentioning @{username}</Text>
      </View>

      {/* Search + filter bar */}
      <View style={styles.filterBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search mentions..."
          placeholderTextColor="#555"
          value={searchText}
          onChangeText={setSearchText}
        />
        {myHandle ? (
          <TouchableOpacity
            style={[styles.filterBtn, showAll && styles.filterBtnActive]}
            onPress={() => setShowAll(!showAll)}
          >
            <Text style={[styles.filterBtnText, showAll && styles.filterBtnTextActive]}>
              {showAll ? "All" : "Mine"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.hint}>Tap to expand · Long press to remove</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <FlatList
          data={filteredTweets}
          keyExtractor={(item) => item.id}
          renderItem={renderTweet}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No mentions found</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerSection: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: "#666", marginTop: 2 },
  filterBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 4,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  filterBtn: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  filterBtnActive: { backgroundColor: "#fff" },
  filterBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  filterBtnTextActive: { color: "#000" },
  hint: { color: "#333", fontSize: 12, paddingHorizontal: 20, paddingVertical: 6 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  tweetCard: {
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  tweetRow: { flexDirection: "row", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { backgroundColor: "#222", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "600", color: "#555" },
  tweetContent: { flex: 1 },
  tweetHeader: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 14, fontWeight: "600", color: "#fff", flexShrink: 1 },
  handle: { fontSize: 13, color: "#666", marginLeft: 4 },
  time: { fontSize: 13, color: "#666" },
  threadIndicator: { fontSize: 11, color: "#555", marginTop: 2 },
  tweetText: { fontSize: 14, color: "#ccc", lineHeight: 20, marginTop: 6 },
  tweetTextExpanded: {},
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingRight: 20,
  },
  actionItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionIcon: { fontSize: 13, color: "#666" },
  actionCount: { fontSize: 12, color: "#666" },
  // Expanded section
  expandedSection: {
    marginTop: 12,
    marginLeft: 50,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  threadBtn: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  threadBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  threadContext: { marginBottom: 12 },
  threadContextLabel: { fontSize: 11, color: "#555", marginBottom: 8 },
  threadTweetRow: { flexDirection: "row", gap: 8 },
  threadAvatarCol: { alignItems: "center", width: 24 },
  threadAvatar: { width: 24, height: 24, borderRadius: 12 },
  threadAvatarText: { fontSize: 10, fontWeight: "600", color: "#555" },
  threadLine: { width: 2, flex: 1, backgroundColor: "#222", marginTop: 2, borderRadius: 1 },
  threadTweetContent: { flex: 1, paddingBottom: 10 },
  threadTweetHeader: { flexDirection: "row", alignItems: "center" },
  threadName: { fontSize: 12, fontWeight: "600", color: "#ccc" },
  threadHandle: { fontSize: 11, color: "#555" },
  threadTime: { fontSize: 11, color: "#555" },
  threadText: { fontSize: 12, color: "#999", lineHeight: 17, marginTop: 2 },
  // Action buttons
  expandedActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionBtn: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  actionBtnSuccess: { backgroundColor: "#052e16" },
  actionBtnTextSuccess: { color: "#4ade80", fontSize: 12, fontWeight: "600" },
  actionBtnDanger: { backgroundColor: "#1a1a1a" },
  actionBtnTextDanger: { color: "#ef4444", fontSize: 12, fontWeight: "600" },
  emptyText: { color: "#555", textAlign: "center", paddingVertical: 60, fontSize: 15 },
});
