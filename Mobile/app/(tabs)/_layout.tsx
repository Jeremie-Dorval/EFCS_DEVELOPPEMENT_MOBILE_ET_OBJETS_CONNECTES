import { COLORS, GRADIENTS, SPACING, FONT_SIZE, FONT_WEIGHT } from "@/app/_styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import HeaderActions from "@/app/_components/HeaderActions";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface TabIconProps {
  name: IconName;
  focused: boolean;
  color: string;
}

const TabIcon = ({ name, focused, color }: TabIconProps) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
    <Ionicons name={name} size={24} color={color} />
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.BACKGROUND },
        headerTintColor: COLORS.TEXT_PRIMARY,
        headerTitleStyle: { fontWeight: FONT_WEIGHT.BOLD },
        headerShadowVisible: false,
        headerRight: () => <HeaderActions />,
        headerRightContainerStyle: { paddingRight: SPACING.MD },

        // Tabbar style
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: () => (
          <LinearGradient
            colors={GRADIENTS.TAB}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="challenges-received"
        options={{
          title: "Défis reçus",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? "mail-unread" : "mail-unread-outline"} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges-completed"
        options={{
          title: "Complétés",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? "checkmark-done-circle" : "checkmark-done-circle-outline"} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Classement",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? "trophy" : "trophy-outline"} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? "person-circle" : "person-circle-outline"} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    elevation: 0,
    height: 70,
    paddingTop: SPACING.XS,
    paddingBottom: SPACING.SM,
  },
  tabBarLabel: {
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    fontSize: FONT_SIZE.XS,
    marginTop: SPACING.XS,
  },
  iconContainer: {
    padding: SPACING.XS,
    borderRadius: 12,
  },
  iconContainerFocused: {
    backgroundColor: `${COLORS.PRIMARY}20`,
  },
});
