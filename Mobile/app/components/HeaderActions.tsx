import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Platform, Pressable, Text, View } from "react-native";

export default function HeaderActions() {
  const router = useRouter();
  const { isAuthenticated, avatarUri, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {/* Maison */}
      <Pressable onPress={() => router.push("/")} hitSlop={10} style={{ marginRight: 12 }}>
        <Text style={{ fontSize: 20 }}>🏠</Text>
      </Pressable>

      {/* Avatar + menu */}
      <View style={{ position: "relative" }}>
        <Pressable onPress={() => setOpen((v) => !v)} hitSlop={10} style={{ alignItems: "center", justifyContent: "center" }}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={{ width: 28, height: 28, borderRadius: 14 }} />
          ) : (
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.95)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: Platform.OS === "ios" ? 0.5 : 0,
                borderColor: "rgba(0,0,0,0.2)",
              }}
            >
              <Text style={{ fontSize: 14, color: "#333" }}>👤</Text>
            </View>
          )}
        </Pressable>

        {open && (
          <View
            style={{
              position: "absolute",
              top: 36,
              right: 0,
              backgroundColor: "#fff",
              borderRadius: 8,
              overflow: "hidden",
              minWidth: 160,
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  zIndex: 9999,
                },
                android: { elevation: 10 },
              }),
            }}
          >
            {isAuthenticated ? (
              <>
                <Pressable
                  onPress={() => {
                    setOpen(false);
                    router.push("/deck");
                  }}
                  style={{ padding: 12 }}
                >
                  <Text>Deck</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setOpen(false);
                    router.push("/exchange");
                  }}
                  style={{ padding: 12 }}
                >
                  <Text>Exchange</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setOpen(false);
                    router.push("/profil");
                  }}
                  style={{ padding: 12 }}
                >
                  <Text>Profil</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    setOpen(false);
                    await logout();
                    router.replace("/");
                  }}
                  style={{ padding: 12 }}
                >
                  <Text>Déconnexion</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={() => {
                  setOpen(false);
                  router.push("/login");
                }}
                style={{ padding: 12 }}
              >
                <Text>Se connecter</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}