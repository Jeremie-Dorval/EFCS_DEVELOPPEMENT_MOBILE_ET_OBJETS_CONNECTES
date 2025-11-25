import HeaderActions from "@/app/components/HeaderActions";
import type { Href } from "expo-router";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthContextProvider, useAuth } from "./context/AuthContext";
import { PokemonContextProvider } from "./context/PokemonContext";

function MainLayout() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === undefined) return;

    const root = String((segments as unknown as string[])[0] ?? "");
    const inTabs = root === "(tabs)";
    const inAuth = root === "(auth)";

    // Non connecté -> redirige vers /login
    if (isAuthenticated === false && inTabs) {
      router.replace("/login" as Href);
      return;
    }

    // Connecté -> si on est DANS le groupe d'auth, on sort vers /deck
    if (isAuthenticated === true && inAuth) {
      router.replace("/deck" as Href);
      return;
    }

  }, [isAuthenticated, segments, router]);

  if (isAuthenticated === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#4F86A8" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        headerRight: () => <HeaderActions />,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Accueil" }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="pokemon" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <PokemonContextProvider>
        <MainLayout />
      </PokemonContextProvider>
    </AuthContextProvider>
  );
}
