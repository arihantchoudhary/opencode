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
} from "../../lib/api";
import { Tweet, TwitterUser, MentionsResponse } from "../../lib/types";

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
    return (
      <TouchableOpacity
        style={styles.tweetCard}
        onPress={() => Linking.openURL(`https://x.com/${author?.username || "x"}/status/${item.id}`)}
        onLongPress={() => dismissTweet(item)}
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
            <Text style={styles.tweetText}>{item.text}</Text>
            {item.public_metrics && (
              <View style={styles.metrics}>
                <Text style={styles.metric}>{item.public_metrics.reply_count} replies</Text>
                <Text style={styles.metric}>{item.public_metrics.retweet_count} reposts</Text>
                <Text style={styles.metric}>{item.public_metrics.like_count} likes</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
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

      <Text style={styles.hint}>Long press a post to remove it</Text>

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
  tweetText: { fontSize: 14, color: "#ccc", lineHeight: 20, marginTop: 6 },
  metrics: { flexDirection: "row", gap: 16, marginTop: 8 },
  metric: { fontSize: 12, color: "#555" },
  emptyText: { color: "#555", textAlign: "center", paddingVertical: 60, fontSize: 15 },
});
