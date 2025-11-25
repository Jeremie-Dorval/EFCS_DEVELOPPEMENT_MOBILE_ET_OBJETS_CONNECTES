import type { PokemonListItem } from "@/types/pokemon";
import React from "react";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import PokemonCard from "./PokemonCard";

const keyOf = (p: Pick<PokemonListItem, "id" | "name">) => `${p.id}-${p.name}`;

const ROW_SPACING = 10;

type Props = {
  data: PokemonListItem[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
};

export default function PokemonGrid({ data, loading, refreshing, onRefresh, onEndReached }: Props) {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(it) => keyOf(it)}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 24 }}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: ROW_SPACING }}
        renderItem={({ item }) => <PokemonCard item={item} />}
        onEndReachedThreshold={0.5}
        onEndReached={onEndReached}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null}
      />
    </View>
  );
}
