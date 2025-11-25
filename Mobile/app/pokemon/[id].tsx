import { useAuth } from "@/app/context/AuthContext";
import { db } from "@/firebaseConfig";
import type { CaptureStatus, DeckEntry, PokemonDetail } from "@/types/pokemon";
import { fetchPokemonDetail } from "@/utils/pokeapi";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

const successRate = 0.4; // 4/10

export default function PokemonDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const pid = useMemo(() => Number(Array.isArray(params.id) ? params.id[0] : params.id), [params.id]);
  const { isAuthenticated, appUser } = useAuth();

  const [detail, setDetail] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<CaptureStatus | null>(null);
  const [alreadyInDeck, setAlreadyInDeck] = useState(false);

  const appUserId = appUser?.id;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const d = await fetchPokemonDetail(pid);
        setDetail(d);

        if (appUserId) {
          const capRef = doc(db, "captures", `${appUserId}_${pid}`);
          const capSnap = await getDoc(capRef);
          setStatus(
            capSnap.exists()
              ? (capSnap.data() as CaptureStatus)
              : { id: `${appUserId}_${pid}`, userId: appUserId, pokeId: pid, attempts: 0, status: "idle" }
          );

          const deckRef = doc(db, "deck", `${appUserId}_${pid}`);
          const deckSnap = await getDoc(deckRef);
          setAlreadyInDeck(deckSnap.exists());
        } else {
          setStatus(null);
          setAlreadyInDeck(false);
        }
      } catch (e: any) {
        Alert.alert("Erreur", e?.message ?? "Impossible de charger ce Pokémon.");
      } finally {
        setLoading(false);
      }
    })();
  }, [pid, appUserId]);

  const tryCapture = async () => {
    if (!isAuthenticated || !appUserId || !detail) return;

    const capId = `${appUserId}_${pid}`;
    const capRef = doc(db, "captures", capId);
    const current =
      status ?? { id: capId, userId: appUserId, pokeId: pid, attempts: 0, status: "idle" };
    if (current.status !== "idle") return;
    if (current.attempts >= 3) return;

    const success = Math.random() < successRate;

    if (success) {
      // 1) Marquer capturé
      const newStatus: CaptureStatus = { ...current, status: "captured", attempts: current.attempts + 1 };
      await setDoc(capRef, newStatus);
      setStatus(newStatus);

      // 2) Ajouter au deck si pas déjà présent
      const deckId = `${appUserId}_${pid}`;
      const deckRef = doc(db, "deck", deckId);
      const exists = await getDoc(deckRef);
      if (!exists.exists()) {
        const entry: Omit<DeckEntry, "id"> = { //https://www.dhiwise.com/post/from-beginner-to-expert-your-path-to-react-omit-mastery
          userId: appUserId,
          pokeId: detail.id,
          name: detail.name,
          image: detail.image,
          experience: 0,
          capturedAt: new Date().toISOString(),
        };
        await setDoc(deckRef, { id: deckId, ...entry });
      }
      setAlreadyInDeck(true);
      Alert.alert("Succès!", `${detail.name} a été capturé!`);
    } else {
      // Échec
      const attempts = current.attempts + 1;
      const newStatus: CaptureStatus = {
        ...current,
        attempts,
        status: attempts >= 3 ? "fled" : "idle",
      };
      await setDoc(capRef, newStatus);
      setStatus(newStatus);
      if (newStatus.status === "fled") Alert.alert("Oh non!", `${detail.name} s’est enfui.`);
      else Alert.alert("Raté", `Il s’est échappé... (essai ${attempts}/3)`);
    }
  };

  if (loading || !detail) return <ActivityIndicator style={{ marginTop: 20 }} />;

  const canCapture =
    isAuthenticated && !alreadyInDeck && status?.status === "idle" && (status?.attempts ?? 0) < 3;

  return (
    <View style={{ flex: 1, padding: 16, alignItems: "center" }}>
      <Image source={{ uri: detail.image }} style={{ width: 240, height: 240 }} />
      <Text style={s.title}>{detail.name}</Text>
      <Text style={s.types}>Types : {detail.types.join(", ")}</Text>
      <Text style={{ marginTop: 4 }}>Base XP : {detail.base_experience}</Text>

      {isAuthenticated ? (
        <View style={{ marginTop: 16 }}>
          {alreadyInDeck && (
            <Text style={{ color: "#01C885", fontWeight: "700", textAlign: "center" }}>
              Déjà dans votre deck
            </Text>
          )}
          {status?.status === "fled" && (
            <Text style={{ color: "#C80104", fontWeight: "700", textAlign: "center" }}>
              Le Pokémon s’est enfui
            </Text>
          )}
          <Pressable
            disabled={!canCapture}
            onPress={tryCapture}
            style={[s.btn, { opacity: canCapture ? 1 : 0.5 }]}
          >
            <Text style={s.btnText}>Tenter la capture</Text>
          </Pressable>
          {status && status.status === "idle" && (
            <Text style={{ textAlign: "center", marginTop: 6 }}>Essais: {status.attempts}/3</Text>
          )}
        </View>
      ) : (
        <Text style={{ marginTop: 16 }}>Connectez-vous pour tenter la capture.</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800", textTransform: "capitalize", marginTop: 12 },
  types: { marginTop: 8, textTransform: "capitalize" },
  btn: {
    marginTop: 10,
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: "#4f7fd9",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
