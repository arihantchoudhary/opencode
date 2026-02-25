import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function OAuthButtons() {
  const router = useRouter();
  const { startOAuthFlow: startGoogle } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startGithub } = useOAuth({ strategy: "oauth_github" });
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuth = useCallback(
    async (provider: "google" | "github") => {
      setLoading(provider);
      try {
        const startFlow = provider === "google" ? startGoogle : startGithub;
        const { createdSessionId, setActive } = await startFlow();
        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          router.replace("/(tabs)");
        }
      } catch (err: unknown) {
        // User cancelled or error — silently ignore cancel
        const clerkErr = err as { errors?: { message: string }[] };
        const msg = clerkErr.errors?.[0]?.message;
        if (msg) console.warn("OAuth error:", msg);
      } finally {
        setLoading(null);
      }
    },
    [startGoogle, startGithub, router]
  );

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity
        style={styles.oauthButton}
        onPress={() => handleOAuth("google")}
        disabled={loading !== null}
      >
        {loading === "google" ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={styles.oauthIcon}>G</Text>
            <Text style={styles.oauthText}>Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.oauthButton}
        onPress={() => handleOAuth("github")}
        disabled={loading !== null}
      >
        {loading === "github" ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={styles.oauthIcon}>GH</Text>
            <Text style={styles.oauthText}>Continue with GitHub</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#222",
  },
  dividerText: {
    color: "#666",
    fontSize: 14,
    paddingHorizontal: 16,
  },
  oauthButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#222",
    gap: 10,
  },
  oauthIcon: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  oauthText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
