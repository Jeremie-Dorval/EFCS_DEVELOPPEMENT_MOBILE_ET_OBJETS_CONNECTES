import { COLORS } from "@/app/_styles/theme";
import { Stack } from "expo-router";
import React from "react";

export default function ChallengeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.BACKGROUND },
      }}
    >
      <Stack.Screen name="create" />
    </Stack>
  );
}
