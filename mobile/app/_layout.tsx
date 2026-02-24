import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
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
  return (
    <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <AuthGate />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
