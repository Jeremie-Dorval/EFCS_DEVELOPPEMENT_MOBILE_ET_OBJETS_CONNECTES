import type { PokemonListItem } from "@/types/pokemon";
import { fetchPokemonPage } from "@/utils/pokeapi";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Alert } from "react-native";

const LIMIT = 20;
const keyOf = (p: Pick<PokemonListItem, "id" | "name">) => `${p.id}-${p.name}`;

type Ctx = {
  data: PokemonListItem[];
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
};

const PokemonListCtx = createContext<Ctx | null>(null);

export const PokemonContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => { // https://www.dhiwise.com/post/understanding-react-propswithchildren-a-comprehensive-guide
  const [data, setData] = useState<PokemonListItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (reset: boolean) => {
    if (loading) return;
    setLoading(true);
    try {
      const nextOffset = reset ? 0 : offset;
      const page = await fetchPokemonPage(nextOffset, LIMIT);
      setData((prev) => {
        const base = reset ? [] : prev;
        const map = new Map<string, PokemonListItem>(base.map((p) => [keyOf(p), p]));
        for (const p of page) map.set(keyOf(p), p);
        return Array.from(map.values());
      });
      setOffset(nextOffset + page.length);
    } catch (e: any) {
      Alert.alert("Erreur réseau", e?.message ?? "Impossible de charger les Pokémon.");
    } finally {
      setLoading(false);
    }
  }, [loading, offset]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }, [load]);

  const loadMore = useCallback(async () => {
    await load(false);
  }, [load]);

  const value = useMemo<Ctx>(() => ({
    data, loading, refreshing, refresh, loadMore
  }), [data, loading, refreshing, refresh, loadMore]);

  return <PokemonListCtx.Provider value={value}>{children}</PokemonListCtx.Provider>;
};

export const usePokemonList = () => {
  const ctx = useContext(PokemonListCtx);
  if (!ctx) throw new Error("usePokemonList doit être utilisé dans <PokemonContextProvider />");
  return ctx;
};
