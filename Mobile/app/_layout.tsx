import { COLORS, GRADIENTS } from "@/app/_styles/theme";
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { AuthContextProvider, useAuth } from "./_context/AuthContext";

function MainLayout() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isAuthenticated === undefined) return;

    const root = String((segments as unknown as string[])[0] ?? "");
    const inTabs = root === "(tabs)";
    const inAuth = root === "(auth)";

    console.log("[Auth Navigation]", { isAuthenticated, root, inAuth, inTabs, hasNavigated: hasNavigated.current });

    if (isAuthenticated === false && inTabs) {
      console.log("[Auth] Redirecting to /login");
      hasNavigated.current = true;
      router.replace("/login" as Href);
      return;
    }

    if (isAuthenticated === true && inAuth && !hasNavigated.current) {
      console.log("[Auth] Redirecting to home");
      hasNavigated.current = true;
      router.replace("/(tabs)/challenges-received" as Href);
      return;
    }

    if ((isAuthenticated && inTabs) || (!isAuthenticated && inAuth)) {
      hasNavigated.current = false;
    }
  }, [isAuthenticated, segments, router]);

  if (isAuthenticated === undefined) {
    return (
      <LinearGradient colors={[COLORS.BACKGROUND, '#1a1a2e']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </LinearGradient>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.BACKGROUND },
        headerTintColor: COLORS.TEXT_PRIMARY,
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: COLORS.BACKGROUND },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Jeu de Mémoire",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="challenge"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <MainLayout />
    </AuthContextProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
