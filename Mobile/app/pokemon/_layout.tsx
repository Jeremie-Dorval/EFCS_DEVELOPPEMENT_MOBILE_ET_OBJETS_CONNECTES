import HeaderActions from "@/app/components/HeaderActions";
import { Stack } from "expo-router";

export default function PokemonLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: "#4F86A8" },
      headerTintColor: "#fff",
      headerTitleStyle: { fontWeight: "bold" },
      headerRight: () => <HeaderActions />,
      title: "Détails"
    }} />
  );
}
