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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fetchMentions,
  fetchProfile,
  fetchDashboard,
  forceRefresh,
  getUserByClerk,
  formatNumber,
  formatDate,
  loadThread as loadThreadApi,
  createRepo as createRepoApi,
  updateUserSettings,
} from "../../lib/api";
import { Tweet, TwitterUser, MentionsResponse, ProfileData, ThreadData } from "../../lib/types";

export default function DashboardTab() {
  const { user: clerkUser } = useUser();
  const [username] = useState("stardroplin");
  const [mentions, setMentions] = useState<MentionsResponse | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [myHandle, setMyHandle] = useState("");
  const [showAllMentions, setShowAllMentions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [expandedTweetId, setExpandedTweetId] = useState<string | null>(null);
  const [threadData, setThreadData] = useState<ThreadData | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [creatingRepo, setCreatingRepo] = useState<string | null>(null);
  const [createdRepoUrl, setCreatedRepoUrl] = useState<Record<string, string>>({});
  const [refreshRemaining, setRefreshRemaining] = useState(4);
  const [refreshCooldown, setRefreshCooldown] = useState(0);

  useEffect(() => {
    if (refreshCooldown <= 0) return;
    const timer = setInterval(() => {
      setRefreshCooldown((prev) => {
        if (prev <= 1) { setRefreshRemaining(4); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshCooldown]);

  const loadData = useCallback(async (force = false) => {
    setError(null);
    try {
      if (force) {
        try {
          const refreshData = await forceRefresh(username, clerkUser?.id || undefined);
          if (refreshData?.rate_limit) setRefreshRemaining(refreshData.rate_limit.remaining);
        } catch (err: any) {
          if (err?.rateLimited) {
            setRefreshRemaining(0);
            if (err.detail?.reset_at) {
              const resetAt = new Date(err.detail.reset_at);
              setRefreshCooldown(Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / 1000)));
            }
          }
        }
      }
      const dash = await fetchDashboard(username);
      if (dash) {
        if (dash.mentions) setMentions(dash.mentions);
        if (dash.profile) setProfile(dash.profile);
        return;
      }
      const [m, p] = await Promise.allSettled([fetchMentions(username), fetchProfile(username)]);
      if (m.status === "fulfilled") setMentions(m.value); else setError("Failed to load mentions");
      if (p.status === "fulfilled" && p.value) setProfile(p.value);
    } catch { setError("Failed to load data"); }
  }, [username, clerkUser?.id]);

  useEffect(() => { setLoading(true); loadData().finally(() => setLoading(false)); }, [loadData]);

  useEffect(() => {
    if (!clerkUser?.id) return;
    getUserByClerk(clerkUser.id).then((u) => {
      if (u?.twitter_handle) setMyHandle(u.twitter_handle);
      if (u?.dismissed_tweet_ids?.length) setDismissedIds(new Set(u.dismissed_tweet_ids));
    }).catch(() => {});
  }, [clerkUser?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await loadData(true); setRefreshing(false);
  }, [loadData]);

  function getUser(authorId: string): TwitterUser | undefined {
    return mentions?.includes?.users?.find((u) => u.id === authorId);
  }
  function getUserFromThread(authorId: string): TwitterUser | undefined {
    return threadData?.includes?.users?.find((u) => u.id === authorId) || getUser(authorId);
  }

  async function handleLoadThread(conversationId: string) {
    setThreadLoading(true);
    try { const data = await loadThreadApi(conversationId); if (data) setThreadData(data); } catch {}
    finally { setThreadLoading(false); }
  }

  async function handleCreateRepo(tweet: Tweet) {
    if (!clerkUser?.id) return;
    setCreatingRepo(tweet.id);
    try {
      const author = getUser(tweet.author_id);
      const name = tweet.text.slice(0, 50).replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "new-repo";
      const tweetUrl = `https://x.com/${author?.username || "x"}/status/${tweet.id}`;
      const data = await createRepoApi({ name, description: tweet.text.slice(0, 200), tweet_text: tweet.text, tweet_id: tweet.id, tweet_author: author?.username || "", tweet_url: tweetUrl, clerk_id: clerkUser.id });
      setCreatedRepoUrl((prev) => ({ ...prev, [tweet.id]: data.html_url }));
      Alert.alert("Repo Created", `${data.full_name}`, [{ text: "Open", onPress: () => Linking.openURL(data.html_url) }, { text: "OK" }]);
    } catch (err: any) { Alert.alert("Error", err?.message || "Failed to create repo"); }
    finally { setCreatingRepo(null); }
  }

  function dismissTweet(tweet: Tweet) {
    const author = getUser(tweet.author_id);
    Alert.alert("Remove post", `Remove this post by @${author?.username || "unknown"} from your feed?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => {
        setDismissedIds((prev) => {
          const next = new Set(prev).add(tweet.id);
          if (clerkUser?.id) updateUserSettings(clerkUser.id, { dismissed_tweet_ids: Array.from(next) }).catch(() => {});
          return next;
        });
      }},
    ]);
  }

  const filteredTweets = mentions?.data?.filter((t) => {
    if (dismissedIds.has(t.id)) return false;
    const text = t.text.toLowerCase();
    if (!text.includes(`@${username.toLowerCase()}`)) return false;
    if (myHandle && !showAllMentions) {
      const author = getUser(t.author_id);
      if (author?.username.toLowerCase() !== myHandle.toLowerCase()) return false;
    }
    return true;
  });

  const mentionCount = filteredTweets?.length || 0;
  const totalLikes = filteredTweets?.reduce((s, t) => s + (t.public_metrics?.like_count || 0), 0) || 0;
  const totalReposts = filteredTweets?.reduce((s, t) => s + (t.public_metrics?.retweet_count || 0), 0) || 0;
  const totalReplies = filteredTweets?.reduce((s, t) => s + (t.public_metrics?.reply_count || 0), 0) || 0;
  const totalImpressions = filteredTweets?.reduce((s, t) => s + (t.public_metrics?.impression_count || 0), 0) || 0;

  if (loading) {
    return (<SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color="#fff" /></View></SafeAreaView>);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Dashboard</Text>
              <Text style={styles.subtitle}>@{username}</Text>
            </View>
            <TouchableOpacity style={[styles.refreshBtn, refreshRemaining === 0 && styles.refreshBtnDisabled]} onPress={onRefresh} disabled={refreshing || refreshRemaining === 0}>
              {refreshing ? <ActivityIndicator size="small" color="#fff" /> : (
                <Text style={styles.refreshBtnText}>{refreshRemaining === 0 ? `${refreshCooldown}s` : `\u21bb ${refreshRemaining}/4`}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile card */}
        {profile && (
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              {profile.profile_image_url ? (
                <Image source={{ uri: profile.profile_image_url }} style={styles.profileAvatar} />
              ) : (
                <View style={[styles.profileAvatar, styles.avatarFallback]}><Text style={styles.avatarText}>{profile.name?.charAt(0)}</Text></View>
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileHandle}>@{profile.username}</Text>
              </View>
            </View>
            {profile.description ? <Text style={styles.profileDesc}>{profile.description}</Text> : null}
            {profile.public_metrics && (
              <View style={styles.profileStats}>
                <View style={styles.stat}><Text style={styles.statNum}>{formatNumber(profile.public_metrics.followers_count)}</Text><Text style={styles.statLabel}>Followers</Text></View>
                <View style={styles.stat}><Text style={styles.statNum}>{formatNumber(profile.public_metrics.following_count)}</Text><Text style={styles.statLabel}>Following</Text></View>
                <View style={styles.stat}><Text style={styles.statNum}>{formatNumber(profile.public_metrics.tweet_count)}</Text><Text style={styles.statLabel}>Posts</Text></View>
              </View>
            )}
          </View>
        )}

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsCard}><Text style={styles.statsCardNum}>{mentionCount}</Text><Text style={styles.statsCardLabel}>Mentions</Text></View>
          <View style={styles.statsCard}><Text style={styles.statsCardNum}>{totalLikes}</Text><Text style={styles.statsCardLabel}>Likes</Text></View>
          <View style={styles.statsCard}><Text style={styles.statsCardNum}>{totalReposts}</Text><Text style={styles.statsCardLabel}>Reposts</Text></View>
          <View style={styles.statsCard}><Text style={styles.statsCardNum}>{totalReplies}</Text><Text style={styles.statsCardLabel}>Replies</Text></View>
          <View style={styles.statsCardWide}><Text style={styles.statsCardNum}>{formatNumber(totalImpressions)}</Text><Text style={styles.statsCardLabel}>Impressions</Text></View>
        </View>

        {/* Recent mentions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Mentions</Text>
            {myHandle ? (
              <TouchableOpacity style={[styles.filterToggle, showAllMentions && styles.filterToggleActive]} onPress={() => setShowAllMentions(!showAllMentions)}>
                <Text style={[styles.filterToggleText, showAllMentions && styles.filterToggleTextActive]}>{showAllMentions ? "All" : "Mine"}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); loadData().finally(() => setLoading(false)); }}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {filteredTweets?.slice(0, 5).map((tweet) => {
            const author = getUser(tweet.author_id);
            const hasThread = tweet.conversation_id && tweet.conversation_id !== tweet.id;
            const isExpanded = expandedTweetId === tweet.id;
            return (
              <TouchableOpacity key={tweet.id} style={styles.tweetCard}
                onPress={() => { setExpandedTweetId(isExpanded ? null : tweet.id); if (!isExpanded) setThreadData(null); }}
                onLongPress={() => dismissTweet(tweet)} activeOpacity={0.7}>
                <View style={styles.tweetRow}>
                  {author?.profile_image_url ? (
                    <Image source={{ uri: author.profile_image_url }} style={styles.tweetAvatar} />
                  ) : (
                    <View style={[styles.tweetAvatar, styles.avatarFallback]}><Text style={styles.avatarSmallText}>{author?.name?.charAt(0) || "?"}</Text></View>
                  )}
                  <View style={styles.tweetContent}>
                    <View style={styles.tweetHeader}>
                      <Text style={styles.tweetName} numberOfLines={1}>{author?.name || "Unknown"}</Text>
                      {author?.verified && <Text style={styles.verifiedBadge}>{"\u2713"}</Text>}
                      <Text style={styles.tweetHandle}>@{author?.username}</Text>
                      <Text style={styles.tweetTime}> \u00b7 {formatDate(tweet.created_at)}</Text>
                    </View>
                    {hasThread && <Text style={styles.threadIndicator}>{"\u21a9"} In a thread</Text>}
                    <Text style={styles.tweetText} numberOfLines={isExpanded ? undefined : 3}>{tweet.text}</Text>
                    <View style={styles.actionBar}>
                      <View style={styles.actionItem}><Text style={styles.actionIcon}>{"\ud83d\udcac"}</Text>{tweet.public_metrics?.reply_count ? <Text style={styles.actionCount}>{tweet.public_metrics.reply_count}</Text> : null}</View>
                      <View style={styles.actionItem}><Text style={styles.actionIcon}>{"\ud83d\udd01"}</Text>{tweet.public_metrics?.retweet_count ? <Text style={styles.actionCount}>{tweet.public_metrics.retweet_count}</Text> : null}</View>
                      <View style={styles.actionItem}><Text style={styles.actionIcon}>{"\u2665"}</Text>{tweet.public_metrics?.like_count ? <Text style={styles.actionCount}>{tweet.public_metrics.like_count}</Text> : null}</View>
                      <View style={styles.actionItem}><Text style={styles.actionIcon}>{"\ud83d\udcca"}</Text>{tweet.public_metrics?.impression_count ? <Text style={styles.actionCount}>{formatNumber(tweet.public_metrics.impression_count)}</Text> : null}</View>
                    </View>
                  </View>
                </View>

                {isExpanded && (
                  <View style={styles.expandedSection}>
                    {hasThread && (!threadData || threadData.conversation_id !== tweet.conversation_id) && (
                      <TouchableOpacity style={styles.threadBtn} onPress={() => handleLoadThread(tweet.conversation_id!)} disabled={threadLoading}>
                        {threadLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.threadBtnText}>{"\ud83d\udcac"} Load conversation</Text>}
                      </TouchableOpacity>
                    )}
                    {threadData && threadData.conversation_id === tweet.conversation_id && (() => {
                      const contextTweets = threadData.data.filter((t) => new Date(t.created_at).getTime() < new Date(tweet.created_at).getTime() && t.id !== tweet.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                      if (contextTweets.length === 0) return null;
                      return (
                        <View style={styles.threadContext}>
                          <Text style={styles.threadContextLabel}>Conversation context</Text>
                          {contextTweets.map((t, idx) => {
                            const tu = getUserFromThread(t.author_id);
                            return (
                              <View key={t.id} style={styles.threadTweetRow}>
                                <View style={styles.threadAvatarCol}>
                                  {tu?.profile_image_url ? <Image source={{ uri: tu.profile_image_url }} style={styles.threadAvatar} /> : <View style={[styles.threadAvatar, styles.avatarFallback]}><Text style={styles.threadAvatarText}>{tu?.name?.charAt(0) || "?"}</Text></View>}
                                  {idx < contextTweets.length - 1 && <View style={styles.threadLine} />}
                                </View>
                                <View style={styles.threadTweetContent}>
                                  <View style={styles.threadTweetHeader}><Text style={styles.threadName}>{tu?.name || "Unknown"}</Text><Text style={styles.threadHandle}> @{tu?.username}</Text><Text style={styles.threadTime}> \u00b7 {formatDate(t.created_at)}</Text></View>
                                  <Text style={styles.threadText}>{t.text}</Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      );
                    })()}
                    <View style={styles.expandedActions}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`https://x.com/${author?.username || "x"}/status/${tweet.id}`)}><Text style={styles.actionBtnText}>{"\ud83d\udd17"} View on Twitter</Text></TouchableOpacity>
                      {createdRepoUrl[tweet.id] ? (
                        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSuccess]} onPress={() => Linking.openURL(createdRepoUrl[tweet.id])}><Text style={styles.actionBtnTextSuccess}>{"\u2713"} Repo created {"\u2197"}</Text></TouchableOpacity>
                      ) : (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleCreateRepo(tweet)} disabled={creatingRepo === tweet.id}>
                          {creatingRepo === tweet.id ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.actionBtnText}>{"\u229e"} Create GitHub Repo</Text>}
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={() => dismissTweet(tweet)}><Text style={styles.actionBtnTextDanger}>{"\u2715"} Dismiss</Text></TouchableOpacity>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          {(!filteredTweets || filteredTweets.length === 0) && !error && <Text style={styles.emptyText}>No mentions yet</Text>}
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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: "#666", marginTop: 2 },
  refreshBtn: { backgroundColor: "#111", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: "#1a1a1a" },
  refreshBtnDisabled: { opacity: 0.5 },
  refreshBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  profileCard: { marginHorizontal: 20, backgroundColor: "#111", borderRadius: 16, padding: 16, marginBottom: 16 },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  profileAvatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: { backgroundColor: "#222", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#666" },
  avatarSmallText: { fontSize: 14, fontWeight: "600", color: "#666" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: "700", color: "#fff" },
  profileHandle: { fontSize: 14, color: "#666", marginTop: 1 },
  profileDesc: { fontSize: 13, color: "#999", marginTop: 10, lineHeight: 18 },
  profileStats: { flexDirection: "row", marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#1a1a1a", justifyContent: "space-around" },
  stat: { alignItems: "center" },
  statNum: { fontSize: 18, fontWeight: "700", color: "#fff" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 2 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, gap: 8, marginBottom: 24 },
  statsCard: { flex: 1, minWidth: "45%", backgroundColor: "#111", borderRadius: 14, padding: 16 },
  statsCardWide: { width: "100%", backgroundColor: "#111", borderRadius: 14, padding: 16 },
  statsCardNum: { fontSize: 24, fontWeight: "700", color: "#fff" },
  statsCardLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  section: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  filterToggle: { backgroundColor: "#111", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#1a1a1a" },
  filterToggleActive: { backgroundColor: "#fff" },
  filterToggleText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  filterToggleTextActive: { color: "#000" },
  errorCard: { backgroundColor: "#1a0000", borderRadius: 12, padding: 16, marginBottom: 12, alignItems: "center" },
  errorText: { color: "#ef4444", fontSize: 14, marginBottom: 8 },
  retryBtn: { backgroundColor: "#1a1a1a", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  retryBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  tweetCard: { backgroundColor: "#111", borderRadius: 14, padding: 14, marginBottom: 8 },
  tweetRow: { flexDirection: "row", gap: 10 },
  tweetAvatar: { width: 36, height: 36, borderRadius: 18 },
  tweetContent: { flex: 1 },
  tweetHeader: { flexDirection: "row", alignItems: "center" },
  tweetName: { fontSize: 14, fontWeight: "600", color: "#fff", flexShrink: 1 },
  verifiedBadge: { fontSize: 11, color: "#1d9bf0", marginLeft: 2 },
  tweetHandle: { fontSize: 13, color: "#666", marginLeft: 4 },
  tweetTime: { fontSize: 13, color: "#666" },
  threadIndicator: { fontSize: 11, color: "#555", marginTop: 2 },
  tweetText: { fontSize: 14, color: "#ccc", lineHeight: 20, marginTop: 6 },
  actionBar: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingRight: 20 },
  actionItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionIcon: { fontSize: 13, color: "#666" },
  actionCount: { fontSize: 12, color: "#666" },
  expandedSection: { marginTop: 12, marginLeft: 46, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#1a1a1a" },
  threadBtn: { backgroundColor: "#1a1a1a", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, alignItems: "center", marginBottom: 12 },
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
  expandedActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionBtn: { backgroundColor: "#1a1a1a", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  actionBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  actionBtnSuccess: { backgroundColor: "#052e16" },
  actionBtnTextSuccess: { color: "#4ade80", fontSize: 12, fontWeight: "600" },
  actionBtnDanger: { backgroundColor: "#1a1a1a" },
  actionBtnTextDanger: { color: "#ef4444", fontSize: 12, fontWeight: "600" },
  emptyText: { color: "#555", textAlign: "center", paddingVertical: 40 },
});
