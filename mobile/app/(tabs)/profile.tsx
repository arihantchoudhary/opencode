import { useEffect, useState, useCallback } from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getUserByClerk,
  updateTwitterHandle,
  updateUserSettings,
  fetchMentions,
  forceRefresh,
  formatNumber,
} from "../../lib/api";
import { TwitterUser, MentionsResponse } from "../../lib/types";

export default function ProfileTab() {
  const { user: clerkUser } = useUser();
  const { signOut } = useAuth();
  const [twitterHandle, setTwitterHandle] = useState("");
  const [inputHandle, setInputHandle] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [dismissedCount, setDismissedCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshRemaining, setRefreshRemaining] = useState(4);
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [mentions, setMentions] = useState<MentionsResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const username = "stardroplin";

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

  useEffect(() => {
    if (!clerkUser?.id) return;
    setLoadingUser(true);
    getUserByClerk(clerkUser.id).then((u) => {
      if (u?.twitter_handle) { setTwitterHandle(u.twitter_handle); setInputHandle(u.twitter_handle); }
      if (u?.dismissed_tweet_ids?.length) setDismissedCount(u.dismissed_tweet_ids.length);
    }).catch(() => {}).finally(() => setLoadingUser(false));
  }, [clerkUser?.id]);

  useEffect(() => {
    setLoadingAnalytics(true);
    fetchMentions(username).then(setMentions).catch(() => {}).finally(() => setLoadingAnalytics(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const refreshData = await forceRefresh(username, clerkUser?.id || undefined);
      if (refreshData?.rate_limit) setRefreshRemaining(refreshData.rate_limit.remaining);
      const data = await fetchMentions(username);
      setMentions(data);
    } catch (err: any) {
      if (err?.rateLimited) {
        setRefreshRemaining(0);
        if (err.detail?.reset_at) {
          const resetAt = new Date(err.detail.reset_at);
          setRefreshCooldown(Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / 1000)));
        }
      }
    } finally { setRefreshing(false); }
  }, [clerkUser?.id]);

  async function handleSave() {
    const trimmed = inputHandle.trim().replace(/^@/, "");
    if (!trimmed || !clerkUser?.id) return;
    setSaving(true);
    try { await updateTwitterHandle(clerkUser.id, trimmed); setTwitterHandle(trimmed); Alert.alert("Saved", `Twitter handle set to @${trimmed}`); }
    catch { Alert.alert("Error", "Failed to save. Try again."); }
    finally { setSaving(false); }
  }

  function handleResetDismissed() {
    if (dismissedCount === 0 || !clerkUser?.id) return;
    Alert.alert("Reset Dismissed Posts", `Unhide all ${dismissedCount} dismissed posts?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", onPress: async () => {
        await updateUserSettings(clerkUser.id, { dismissed_tweet_ids: [] }).catch(() => {});
        setDismissedCount(0);
        Alert.alert("Done", "All dismissed posts have been restored.");
      }},
    ]);
  }

  function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  }

  const filteredTweets = mentions?.data?.filter((t) => t.text.toLowerCase().includes(`@${username.toLowerCase()}`));
  const totalLikes = filteredTweets?.reduce((s, t) => s + (t.public_metrics?.like_count || 0), 0) || 0;
  const totalReposts = filteredTweets?.reduce((s, t) => s + (t.public_metrics?.retweet_count || 0), 0) || 0;
  const totalReplies = filteredTweets?.reduce((s, t) => s + (t.public_metrics?.reply_count || 0), 0) || 0;
  const totalImpressions = filteredTweets?.reduce((s, t) => s + (t.public_metrics?.impression_count || 0), 0) || 0;

  const mentionerCounts: Record<string, { user: TwitterUser; count: number }> = {};
  filteredTweets?.forEach((t) => {
    const u = mentions?.includes?.users?.find((u) => u.id === t.author_id);
    if (u) { if (!mentionerCounts[u.id]) mentionerCounts[u.id] = { user: u, count: 0 }; mentionerCounts[u.id].count++; }
  });
  const topMentioners = Object.values(mentionerCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}>
        <View style={styles.header}><Text style={styles.title}>Profile</Text></View>

        {/* User info */}
        <View style={styles.card}>
          <View style={styles.userRow}>
            {clerkUser?.imageUrl ? <Image source={{ uri: clerkUser.imageUrl }} style={styles.userAvatar} /> : (
              <View style={[styles.userAvatar, styles.avatarFallback]}><Text style={styles.avatarText}>{clerkUser?.firstName?.charAt(0)?.toUpperCase() || "?"}</Text></View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{clerkUser?.fullName || clerkUser?.firstName || "User"}</Text>
              <Text style={styles.userEmail}>{clerkUser?.primaryEmailAddress?.emailAddress || ""}</Text>
              {twitterHandle ? <Text style={styles.userHandle}>@{twitterHandle}</Text> : null}
            </View>
          </View>
        </View>

        {/* Engagement Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Engagement Summary</Text>
          <Text style={styles.cardDesc}>Across all {filteredTweets?.length || 0} mentions of @{username}</Text>
          {loadingAnalytics ? <ActivityIndicator style={{ marginTop: 16 }} color="#fff" /> : (
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsRow}><View style={styles.analyticsItem}><Text style={styles.analyticsIconRed}>{"\u2665"}</Text><Text style={styles.analyticsLabel}>Likes</Text></View><Text style={styles.analyticsValue}>{totalLikes}</Text></View>
              <View style={styles.analyticsDivider} />
              <View style={styles.analyticsRow}><View style={styles.analyticsItem}><Text style={styles.analyticsIconGreen}>{"\ud83d\udd01"}</Text><Text style={styles.analyticsLabel}>Reposts</Text></View><Text style={styles.analyticsValue}>{totalReposts}</Text></View>
              <View style={styles.analyticsDivider} />
              <View style={styles.analyticsRow}><View style={styles.analyticsItem}><Text style={styles.analyticsIconBlue}>{"\ud83d\udcac"}</Text><Text style={styles.analyticsLabel}>Replies</Text></View><Text style={styles.analyticsValue}>{totalReplies}</Text></View>
              <View style={styles.analyticsDivider} />
              <View style={styles.analyticsRow}><View style={styles.analyticsItem}><Text style={styles.analyticsIconPurple}>{"\ud83d\udcc8"}</Text><Text style={styles.analyticsLabel}>Impressions</Text></View><Text style={styles.analyticsValue}>{formatNumber(totalImpressions)}</Text></View>
            </View>
          )}
        </View>

        {/* Top Mentioners */}
        {topMentioners.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Top Mentioners</Text>
            <Text style={styles.cardDesc}>Users who mention @{username} most</Text>
            <View style={{ marginTop: 14 }}>
              {topMentioners.map((m, i) => (
                <View key={m.user.id} style={styles.mentionerRow}>
                  <Text style={styles.mentionerRank}>{i + 1}</Text>
                  {m.user.profile_image_url ? <Image source={{ uri: m.user.profile_image_url }} style={styles.mentionerAvatar} /> : <View style={[styles.mentionerAvatar, styles.avatarFallback]}><Text style={styles.mentionerAvatarText}>{m.user.name?.charAt(0)}</Text></View>}
                  <View style={styles.mentionerInfo}><Text style={styles.mentionerName} numberOfLines={1}>{m.user.name}</Text><Text style={styles.mentionerHandle}>@{m.user.username}</Text></View>
                  <View style={styles.mentionerBadge}><Text style={styles.mentionerBadgeText}>{m.count}</Text></View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Twitter handle */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Twitter Handle</Text>
          <Text style={styles.cardDesc}>Set your Twitter username to filter mentions to only show your posts</Text>
          {loadingUser ? <ActivityIndicator style={{ marginTop: 16 }} color="#fff" /> : (
            <>
              <View style={styles.handleRow}>
                <Text style={styles.atSign}>@</Text>
                <TextInput style={styles.handleInput} placeholder="username" placeholderTextColor="#444" value={inputHandle} onChangeText={setInputHandle} autoCapitalize="none" autoCorrect={false} />
              </View>
              <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.saveBtnText}>{twitterHandle ? "Update Handle" : "Save Handle"}</Text>}
              </TouchableOpacity>
              {twitterHandle ? <Text style={styles.savedText}>Currently set to @{twitterHandle}</Text> : null}
            </>
          )}
        </View>

        {/* Feed Preferences */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Feed Preferences</Text>
          <View style={styles.prefRow}>
            <View style={styles.prefInfo}><Text style={styles.prefLabel}>Dismissed posts</Text><Text style={styles.prefDesc}>{dismissedCount} posts hidden from your feed</Text></View>
            {dismissedCount > 0 && <TouchableOpacity style={styles.resetBtn} onPress={handleResetDismissed}><Text style={styles.resetBtnText}>Reset</Text></TouchableOpacity>}
          </View>
        </View>

        {/* Data & Cache */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data & Cache</Text>
          <Text style={styles.cardDesc}>Mentions are cached for 15 minutes to save API calls</Text>
          <TouchableOpacity style={[styles.forceRefreshBtn, refreshRemaining === 0 && styles.forceRefreshBtnDisabled]} onPress={onRefresh} disabled={refreshing || refreshRemaining === 0}>
            {refreshing ? <ActivityIndicator color="#fff" size="small" /> : (
              <Text style={styles.forceRefreshBtnText}>{refreshRemaining === 0 ? `Rate limited (${refreshCooldown}s)` : `Force Refresh (${refreshRemaining}/4 left)`}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}><Text style={styles.signOutText}>Sign Out</Text></TouchableOpacity>
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scroll: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  card: { marginHorizontal: 20, backgroundColor: "#111", borderRadius: 16, padding: 18, marginBottom: 12 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  userAvatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: { backgroundColor: "#222", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontWeight: "700", color: "#666" },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: "700", color: "#fff" },
  userEmail: { fontSize: 14, color: "#666", marginTop: 2 },
  userHandle: { fontSize: 14, color: "#1d9bf0", marginTop: 2 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  cardDesc: { fontSize: 13, color: "#666", marginTop: 4, lineHeight: 18 },
  analyticsGrid: { marginTop: 14 },
  analyticsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  analyticsItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  analyticsIconRed: { fontSize: 16, color: "#ef4444" },
  analyticsIconGreen: { fontSize: 16, color: "#22c55e" },
  analyticsIconBlue: { fontSize: 16, color: "#3b82f6" },
  analyticsIconPurple: { fontSize: 16, color: "#a855f7" },
  analyticsLabel: { fontSize: 14, color: "#ccc" },
  analyticsValue: { fontSize: 16, fontWeight: "700", color: "#fff" },
  analyticsDivider: { height: 1, backgroundColor: "#1a1a1a" },
  mentionerRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  mentionerRank: { fontSize: 13, color: "#555", width: 16 },
  mentionerAvatar: { width: 32, height: 32, borderRadius: 16 },
  mentionerAvatarText: { fontSize: 13, fontWeight: "600", color: "#555" },
  mentionerInfo: { flex: 1 },
  mentionerName: { fontSize: 14, fontWeight: "600", color: "#fff" },
  mentionerHandle: { fontSize: 12, color: "#666" },
  mentionerBadge: { backgroundColor: "#1a1a1a", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  mentionerBadgeText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  handleRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#000", borderRadius: 10, marginTop: 14, borderWidth: 1, borderColor: "#222" },
  atSign: { color: "#555", fontSize: 16, paddingLeft: 14, fontWeight: "600" },
  handleInput: { flex: 1, color: "#fff", fontSize: 16, paddingVertical: 12, paddingHorizontal: 6 },
  saveBtn: { backgroundColor: "#fff", borderRadius: 10, padding: 14, alignItems: "center", marginTop: 12 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#000", fontWeight: "700", fontSize: 15 },
  savedText: { color: "#4ade80", fontSize: 13, marginTop: 8, textAlign: "center" },
  prefRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, marginTop: 8 },
  prefInfo: { flex: 1, paddingRight: 12 },
  prefLabel: { fontSize: 14, fontWeight: "600", color: "#fff" },
  prefDesc: { fontSize: 12, color: "#666", marginTop: 2 },
  resetBtn: { backgroundColor: "#1a1a1a", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  resetBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  forceRefreshBtn: { backgroundColor: "#1a1a1a", borderRadius: 10, padding: 14, alignItems: "center", marginTop: 14 },
  forceRefreshBtnDisabled: { opacity: 0.5 },
  forceRefreshBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  signOutBtn: { marginHorizontal: 20, backgroundColor: "#111", borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8, borderWidth: 1, borderColor: "#1a1a1a" },
  signOutText: { color: "#ef4444", fontWeight: "600", fontSize: 15 },
});
