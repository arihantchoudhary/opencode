import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { tokenCache } from "../lib/tokenCache";

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    const inTabs = segments[0] === "(tabs)";
    if (isSignedIn && !inTabs) {
      router.replace("/(tabs)");
    } else if (!isSignedIn && inTabs) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, segments]);

  return <Slot />;
}

export default function RootLayout() {
  if (!CLERK_KEY) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Configuration Error</Text>
        <Text style={styles.errorText}>
          Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please set it in your EAS
          environment variables and rebuild.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <AuthGate />
      </ClerkLoaded>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: { color: "#ef4444", fontSize: 20, fontWeight: "700", marginBottom: 12 },
  errorText: { color: "#999", fontSize: 16, textAlign: "center", lineHeight: 24 },
});
