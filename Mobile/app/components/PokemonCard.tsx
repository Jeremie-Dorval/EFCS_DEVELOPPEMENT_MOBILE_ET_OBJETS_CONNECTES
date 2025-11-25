import type { PokemonListItem } from "@/types/pokemon";
import { artworkUrl } from "@/utils/pokeapi";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

type Props = {
  item: PokemonListItem;
  style?: ViewStyle;
};

function pad3(n: number) {
  return n.toString().padStart(3, "0");
}

// Palette de dégradés (choisie en fonction de l’id pour varier visuellement) fait par chatGPT: prompt "generate 8 nice color gradients in hex format for pokemon cards"
const PALETTES: [string, string][] = [
  ["#A18CD1", "#FBC2EB"],
  ["#F6D365", "#FDA085"],
  ["#84FAB0", "#8FD3F4"],
  ["#A1C4FD", "#C2E9FB"],
  ["#FBD3E9", "#BB377D"],
  ["#FDEB71", "#F8D800"],
  ["#CFDEF3", "#E0EAFC"],
  ["#74EBD5", "#ACB6E5"],
];
const paletteFor = (id: number) => PALETTES[id % PALETTES.length];

export default function PokemonCard({ item, style }: Props) {
  const [c1, c2] = paletteFor(item.id);

  return (
    <Link href={{ pathname: "/pokemon/[id]", params: { id: item.id } }} asChild>
      <TouchableOpacity activeOpacity={0.9} style={[s.cardWrap, style]}>
        <LinearGradient colors={[c1, c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
          {/* Badge ID */}
          <View style={s.badge}>
            <Text style={s.badgeText}>#{pad3(item.id)}</Text>
          </View>

          {/* Cercle décoratif derrière l’image */}
          <View style={s.circle} />

          <Image source={{ uri: artworkUrl(item.id) }} style={s.img} />
          <Text style={s.name}>{item.name}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Link>
  );
}

const s = StyleSheet.create({
  cardWrap: {
    flex: 1,
    flexBasis: "48%",
    maxWidth: "48%",
  },
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    minHeight: 180,
    alignItems: "center",
    justifyContent: "flex-end",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  img: {
    width: 120,
    height: 120,
    transform: [{ translateY: 6 }],
  },
  name: {
    marginTop: 10,
    fontWeight: "800",
    textTransform: "capitalize",
    fontSize: 16,
    color: "#1a1a1a",
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255,255,255,0.28)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  badgeText: {
    fontWeight: "700",
    color: "#1b1b1b",
  },
  circle: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
});
