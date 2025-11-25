import { useAuth } from "@/app/context/AuthContext";
import { db } from "@/firebaseConfig";
import type { DeckEntry } from "@/types/pokemon";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import * as Sharing from "expo-sharing";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function GradientRow({
  selected,
  children,
}: {
  selected: boolean;
  children: React.ReactNode;
}) {
  return (
    <LinearGradient
      colors={selected ? ["#7F00FF", "#E100FF"] : ["#dfe7ff", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 12, padding: 1 }}
    >
      <View
        style={[s.row, selected && { backgroundColor: "rgba(255,255,255,0.92)" }]}
      >
        {children}
      </View>
    </LinearGradient>
  );
}

// --- Helpers pour le stockage local ---
async function ensureDirAsync(dirUri: string) {
  const info = await FileSystem.getInfoAsync(dirUri);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
  }
}

/** Récupère un dossier base valide (cache ou documents) et crée /exports/ dedans */
async function getExportDir(): Promise<string | null> {
  // "as any" pour contourner des typages trop stricts selon des versions, proposer par chatgpt vue mes erreurs multiples autrement. prompt: "in typescript, how to bypass strict type checking for a specific variable"
  const fsAny = FileSystem as any;
  const base: string | null =
    fsAny?.cacheDirectory ?? fsAny?.documentDirectory ?? null;
  if (!base) return null;

  const exportDir = `${base}exports/`;
  await ensureDirAsync(exportDir);
  return exportDir;
}

export default function Exchange() {
  const { appUser } = useAuth();
  const [items, setItems] = useState<DeckEntry[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const appUserId = appUser?.id;

  // Hauteur réelle de la tab bar + safe-area
  const tabH = useBottomTabBarHeight();
  const { bottom: insetBottom } = useSafeAreaInsets();

  const FAB_BAR_HEIGHT = 64;
  const fabBottom = Math.max(12, tabH + insetBottom + 8);

  useEffect(() => {
    (async () => {
      if (!appUserId) return;
      const q = query(collection(db, "deck"), where("userId", "==", appUserId));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => d.data() as DeckEntry));
    })();
  }, [appUserId]);

  const shareSelected = async () => {
    const picked = items.filter((i) => selected[i.id]);
    if (picked.length === 0) return;

    try {
      const jsonStr = JSON.stringify(picked, null, 2);

      // En premier, essaye la voie "fichier + expo-sharing"
      const canShareFile = await Sharing.isAvailableAsync();
      const exportDir = await getExportDir();

      if (canShareFile && exportDir) {
        const fileName = `deck-export-${Date.now()}.json`;
        const uri = `${exportDir}${fileName}`;
        await FileSystem.writeAsStringAsync(uri, jsonStr);

        await Sharing.shareAsync(uri, {
          mimeType: "application/json",
          UTI: "public.json",
          dialogTitle: "Partager le deck",
        });

        // Suppression après partage
        await Promise.all(picked.map((p) => deleteDoc(doc(db, "deck", p.id))));
        setItems((prev) => prev.filter((i) => !selected[i.id]));
        setSelected({});
        return;
      }

      // Deux (si ça marche pas): partage **texte** (sans fichier) via React Native Share
      const res = await Share.share({
        title: "Deck Pokémon (JSON)",
        message: jsonStr,
      });

      if (res.action === Share.sharedAction) {
        await Promise.all(picked.map((p) => deleteDoc(doc(db, "deck", p.id))));
        setItems((prev) => prev.filter((i) => !selected[i.id]));
        setSelected({});
      } else {
      }
    } catch (e: any) {
      Alert.alert("Partage échoué", e?.message ?? "Erreur inconnue");
    }
  };

  const importDeck = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;

      const pickedUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(pickedUri);

      const arr = JSON.parse(content) as DeckEntry[];
      if (!Array.isArray(arr)) throw new Error("Format JSON invalide");

      await Promise.all(
        arr.map(async (e) => setDoc(doc(db, "deck", e.id), e, { merge: false }))
      );
      Alert.alert("Import réussi", `${arr.length} Pokémon(s) importé(s).`);
    } catch (e: any) {
      Alert.alert("Import échoué", e?.message ?? "Erreur inconnue");
    }
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          gap: 10,
          paddingBottom: fabBottom + FAB_BAR_HEIGHT + 8,
        }}
        renderItem={({ item }) => {
          const sel = !!selected[item.id];
          return (
            <GradientRow selected={sel}>
              <Pressable
                onPress={() =>
                  setSelected((m) => ({ ...m, [item.id]: !sel }))
                }
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Text
                  style={{
                    flex: 1,
                    textTransform: "capitalize",
                    fontWeight: "700",
                  }}
                >
                  {item.name}
                </Text>
                <Text style={{ opacity: 0.7, marginRight: 10 }}>
                  #{item.pokeId}
                </Text>
                <Text style={{ fontSize: 18 }}>{sel ? "✨" : "⬜️"}</Text>
              </Pressable>
            </GradientRow>
          );
        }}
      />

      {/* Barre d’actions flottante */}
      <LinearGradient
        colors={["rgba(255,255,255,0.95)", "rgba(240,244,255,0.95)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.fabBar, { bottom: fabBottom }]}
      >
        <Pressable
          onPress={shareSelected}
          style={[s.bigBtn, { backgroundColor: "#00C389" }]}
        >
          <Text style={s.bigBtnTxt}>Partager (supprime)</Text>
        </Pressable>
        <Pressable
          onPress={importDeck}
          style={[s.bigBtn, { backgroundColor: "#4f7fd9" }]}
        >
          <Text style={s.bigBtnTxt}>Importer</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    ...Platform.select({ //proposer par chatgpt prompt: "ajoute une ombre légère sous une carte"
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
    }),
  },
  fabBar: {
    position: "absolute",
    left: 12,
    right: 12,
    padding: 8,
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    ...Platform.select({ //proposer par chatgpt prompt: "ajoute une ombre légère sous une barre flottante"
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 8 },
    }),
  },
  bigBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bigBtnTxt: { color: "#fff", fontWeight: "800", letterSpacing: 0.2 },
});
