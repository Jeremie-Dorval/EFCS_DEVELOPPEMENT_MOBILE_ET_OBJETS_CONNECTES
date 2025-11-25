import PokemonGrid from "@/app/components/PokemonGrid";
import { usePokemonList } from "@/app/context/PokemonContext";
import React, { useEffect } from "react";
import { ImageBackground, View } from "react-native";

export default function Home() {
  const { data, loading, refreshing, refresh, loadMore } = usePokemonList();

  useEffect(() => {
    refresh();
  }, []);

  return (
    <ImageBackground
      source={require("../assets/images/ashe.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* voile sur l'image */}
      <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.2)" }}>
        <PokemonGrid
          data={data}
          loading={loading}
          refreshing={refreshing}
          onRefresh={refresh}
          onEndReached={loadMore}
        />
      </View>
    </ImageBackground>
  );
}
