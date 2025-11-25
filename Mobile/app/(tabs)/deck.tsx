import { useAuth } from "@/app/context/AuthContext";
import { db } from "@/firebaseConfig";
import type { DeckEntry } from "@/types/pokemon";
import {
  artworkUrl,
  fetchBaseExperience,
  fetchNextEvolutionId,
  fetchPokemonDetail,
} from "@/utils/pokeapi";
import { LinearGradient } from "expo-linear-gradient";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type XPInfo = { nextBase: number | null };

function FancyProgress({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={styles.progressTrack}>
      <LinearGradient
        colors={["#00ffa3", "#00c2ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.progressFill, { width: `${pct * 100}%` }]}
      />
    </View>
  );
}

function DeckCard({
  it,
  onEvolve,
}: {
  it: DeckEntry;
  onEvolve: (it: DeckEntry) => Promise<void>;
}) {
  const [xp, setXp] = useState<XPInfo>({ nextBase: null });

  useEffect(() => {
    (async () => {
      const nextId = await fetchNextEvolutionId(it.pokeId);
      if (!nextId) {
        setXp({ nextBase: null });
        return;
      }
      const nb = await fetchBaseExperience(nextId);
      setXp({ nextBase: nb });
    })();
  }, [it.pokeId]);

  const progress = useMemo(() => {
    if (xp.nextBase == null || xp.nextBase === Number.MAX_SAFE_INTEGER) return 0;
    return Math.min(1, it.experience / xp.nextBase);
  }, [xp.nextBase, it.experience]);

  return (
    <LinearGradient
      colors={["#eef1ff", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.halo} />
      <Image source={{ uri: it.image || artworkUrl(it.pokeId) }} style={styles.cardImg} />
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={styles.cardName}>{it.name}</Text>
        <Text style={styles.cardSub}>
          XP: {it.experience}
          {xp.nextBase != null && xp.nextBase < 9e15 ? ` / ${xp.nextBase}` : ""}
        </Text>
        <FancyProgress value={progress} />
      </View>
      <Pressable
        onPress={() => onEvolve(it)}
        style={({ pressed }) => [styles.neonBtn, pressed && { transform: [{ scale: 0.98 }] }]}
      >
        <LinearGradient
          colors={["#7F00FF", "#E100FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.neonBtnBg}
        >
          <Text style={styles.neonBtnText}>Évoluer</Text>
        </LinearGradient>
      </Pressable>
    </LinearGradient>
  );
}

export default function Deck() {
  const { appUser } = useAuth();
  const [deck, setDeck] = useState<DeckEntry[]>([]);

  useEffect(() => {
    if (!appUser) return;
    const q = query(collection(db, "deck"), where("userId", "==", appUser.id));
    const unsub = onSnapshot(q, (snap) => setDeck(snap.docs.map((d) => d.data() as DeckEntry)));
    return unsub;
  }, [appUser?.id]);

  const addRandomXP = async (it: DeckEntry) => {
    try {
      const gained = Math.floor(Math.random() * 60) + 20;
      const total = it.experience + gained;

      const nextId = await fetchNextEvolutionId(it.pokeId);

      if (!nextId) {
        // forme finale -> juste XP
        await updateDoc(doc(db, "deck", it.id), { experience: total });
        Alert.alert("+XP", `${it.name} gagne ${gained} XP. (forme finale)`);
        return;
      }

      // Seuil pour passer au palier suivant (approximativement: base_experience de la prochaine forme)
      const nextThreshold = await fetchBaseExperience(nextId);

      if (total >= nextThreshold) {
        // Vérifie si le joueur a déjà la forme évoluée
        const newDocId = `${it.userId}_${nextId}`;
        const newRef = doc(db, "deck", newDocId);
        const newSnap = await getDoc(newRef);

        if (newSnap.exists()) {
          // Déjà possédée -> pas de doublon: on garde l'actuelle, on ajoute juste l'XP
          await updateDoc(doc(db, "deck", it.id), { experience: total });
          Alert.alert("Évolution non appliquée", `Vous avez déjà ${ (await fetchPokemonDetail(nextId)).name }. +${gained} XP`);
          return;
        }

        // Migration: créer la nouvelle entrée puis supprimer l'ancienne
        const next = await fetchPokemonDetail(nextId);
        const migrated: DeckEntry = {
          id: newDocId,
          userId: it.userId,
          pokeId: next.id,
          name: next.name,
          image: artworkUrl(next.id),
          experience: total - nextThreshold,
          capturedAt: it.capturedAt,
        };
        await setDoc(newRef, migrated, { merge: false });
        await deleteDoc(doc(db, "deck", it.id));
        Alert.alert("Évolution!", `${it.name} évolue en ${next.name}!`);
      } else {
        await updateDoc(doc(db, "deck", it.id), { experience: total });
        Alert.alert("+XP", `${it.name} gagne ${gained} XP.`);
      }
    } catch (e: any) {
      Alert.alert("Erreur", e?.message ?? "Évolution impossible.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={deck}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) => <DeckCard it={item} onEvolve={addRandomXP} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 12,
    overflow: "hidden",
    ...Platform.select({ //aide de chatgpt prompt: "ajoute une ombre légère sous une carte"
      ios: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 5 },
    }),
  },
  halo: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(124, 77, 255, 0.15)",
  },
  cardImg: { width: 84, height: 84 },
  cardName: { fontSize: 18, fontWeight: "800", textTransform: "capitalize" },
  cardSub: { opacity: 0.75, marginBottom: 6 },
  progressTrack: {
    height: 8,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  progressFill: { height: "100%" },

  neonBtn: { borderRadius: 12, overflow: "hidden" },
  neonBtnBg: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...Platform.select({ //Aide de chatgpt prompt: "ajoute une ombre violette néon autour d'un bouton"
      ios: { shadowColor: "#E100FF", shadowOpacity: 0.55, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
      android: { elevation: 6 },
    }),
  },
  neonBtnText: { color: "#fff", fontWeight: "800", letterSpacing: 0.3 },
});
