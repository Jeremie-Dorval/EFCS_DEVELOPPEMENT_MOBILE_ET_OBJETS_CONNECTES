import HeaderActions from "@/app/components/HeaderActions";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Image, StyleSheet } from "react-native";

const Icon = ({ src, focused }: { src: any; focused: boolean }) => (
  <Image source={src} style={{ width: 24, height: 24, resizeMode: "contain", opacity: focused ? 1 : 0.85 }} />
);

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="deck"
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#4F86A8" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        headerRight: () => <HeaderActions />,
        headerRightContainerStyle: { paddingRight: 20 },

        // --- Tabbar glossy ---
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.7)",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: 64,
        },
        tabBarLabelStyle: { fontWeight: "700", fontSize: 12 },
        tabBarBackground: () => (
          <LinearGradient
            colors={["#1e3c72", "#2a5298"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="deck"
        options={{
          title: "Deck",
          tabBarIcon: ({ focused }) => <Icon src={require("../../assets/images/deck.png")} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="exchange"
        options={{
          title: "Exchange",
          tabBarIcon: ({ focused }) => <Icon src={require("../../assets/images/exchange.png")} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused }) => <Icon src={require("../../assets/images/profil.png")} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
