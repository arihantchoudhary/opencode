import { useEffect, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserByClerk, updateTwitterHandle } from "../../lib/api";

export default function ProfileTab() {
  const { user: clerkUser } = useUser();
  const { signOut } = useAuth();
  const [twitterHandle, setTwitterHandle] = useState("");
  const [inputHandle, setInputHandle] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (!clerkUser?.id) return;
    setLoadingUser(true);
    getUserByClerk(clerkUser.id)
      .then((u) => {
        if (u?.twitter_handle) {
          setTwitterHandle(u.twitter_handle);
          setInputHandle(u.twitter_handle);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, [clerkUser?.id]);

  async function handleSave() {
    const trimmed = inputHandle.trim().replace(/^@/, "");
    if (!trimmed || !clerkUser?.id) return;
    setSaving(true);
    try {
      await updateTwitterHandle(clerkUser.id, trimmed);
      setTwitterHandle(trimmed);
      Alert.alert("Saved", `Twitter handle set to @${trimmed}`);
    } catch {
      Alert.alert("Error", "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User info */}
        <View style={styles.card}>
          <View style={styles.userRow}>
            {clerkUser?.imageUrl ? (
              <Image source={{ uri: clerkUser.imageUrl }} style={styles.userAvatar} />
            ) : (
              <View style={[styles.userAvatar, styles.avatarFallback]}>
                <Text style={styles.avatarText}>
                  {clerkUser?.firstName?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {clerkUser?.fullName || clerkUser?.firstName || "User"}
              </Text>
              <Text style={styles.userEmail}>
                {clerkUser?.primaryEmailAddress?.emailAddress || ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Twitter handle */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Twitter Handle</Text>
          <Text style={styles.cardDesc}>
            Set your Twitter username to filter mentions to only show your posts
          </Text>

          {loadingUser ? (
            <ActivityIndicator style={{ marginTop: 16 }} color="#fff" />
          ) : (
            <>
              <View style={styles.handleRow}>
                <Text style={styles.atSign}>@</Text>
                <TextInput
                  style={styles.handleInput}
                  placeholder="username"
                  placeholderTextColor="#444"
                  value={inputHandle}
                  onChangeText={setInputHandle}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {twitterHandle ? "Update Handle" : "Save Handle"}
                  </Text>
                )}
              </TouchableOpacity>
              {twitterHandle ? (
                <Text style={styles.savedText}>
                  Currently set to @{twitterHandle}
                </Text>
              ) : null}
            </>
          )}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

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
  card: {
    marginHorizontal: 20,
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  userRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  userAvatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: { backgroundColor: "#222", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontWeight: "700", color: "#666" },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: "700", color: "#fff" },
  userEmail: { fontSize: 14, color: "#666", marginTop: 2 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  cardDesc: { fontSize: 13, color: "#666", marginTop: 4, lineHeight: 18 },
  handleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#222",
  },
  atSign: { color: "#555", fontSize: 16, paddingLeft: 14, fontWeight: "600" },
  handleInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  saveBtn: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#000", fontWeight: "700", fontSize: 15 },
  savedText: { color: "#4ade80", fontSize: 13, marginTop: 8, textAlign: "center" },
  signOutBtn: {
    marginHorizontal: 20,
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  signOutText: { color: "#ef4444", fontWeight: "600", fontSize: 15 },
});
