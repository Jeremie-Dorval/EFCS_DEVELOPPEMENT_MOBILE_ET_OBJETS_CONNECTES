import { useAuth } from "@/app/context/AuthContext";
import { useHeaderHeight } from "@react-navigation/elements";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

async function ensureGalleryPermission(): Promise<boolean> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted || current.accessPrivileges === "limited") return true;
  const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (req.granted || req.accessPrivileges === "limited") return true;
  Alert.alert("Permission requise", "L’accès à la galerie est nécessaire pour choisir une photo.");
  return false;
}

async function ensureCameraPermission(): Promise<boolean> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) return true;
  const req = await ImagePicker.requestCameraPermissionsAsync();
  if (req.granted) return true;
  Alert.alert("Permission requise", "L’accès à la caméra est nécessaire pour prendre une photo.");
  return false;
}

type FieldProps = React.ComponentProps<typeof TextInput> & {
  label: string;
  icon?: string;
};

function Field({ label, icon, style, ...rest }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const active = focused;

  // readonly pour satisfaire le typage expo-linear-gradient; proposer par chatgpt: prompt "in a react native project using typescript, how to fix this error: Type '{ colors: readonly string[]; start: { x: number; y: number; }; end: { x: number; y: number; }; style: StyleProp<ViewStyle>; }' is not assignable to type 'IntrinsicAttributes & LinearGradientProps & { children?: ReactNode; }'."
  const colors = active
    ? (["#4f7fd9", "#01C885"] as const)
    : (["#E7ECF7", "#F2F5FC"] as const);

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fieldWrap}>
        <View style={styles.fieldInner}>
          {icon ? <Text style={styles.fieldIcon}>{icon}</Text> : null}
          <TextInput
            {...rest}
            style={[styles.input, style]}
            placeholderTextColor="#6B7280"
            selectionColor="#4f7fd9"
            cursorColor="#4f7fd9"
            onFocus={(e) => {
              setFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              rest.onBlur?.(e);
            }}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

export default function Profil() {
  const { appUser, avatarUri, setAvatar, changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const headerHeight = useHeaderHeight();

  const pickFromGallery = async () => {
    const ok = await ensureGalleryPermission();
    if (!ok) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled && res.assets?.[0]?.uri) await setAvatar(res.assets[0].uri);
  };

  const takePhoto = async () => {
    const ok = await ensureCameraPermission();
    if (!ok) return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled && res.assets?.[0]?.uri) await setAvatar(res.assets[0].uri);
  };

  const onChangePwd = async () => {
    if (!next || next !== confirm) {
      Alert.alert("Erreur", "Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    const res = await changePassword(current, next);
    if (!res.ok) Alert.alert("Erreur", res.error ?? "Impossible de changer le mot de passe");
    else Alert.alert("OK", "Mot de passe modifié.");
  };

  return (
    <KeyboardAvoidingView //https://reactnative.dev/docs/keyboardavoidingview (très pratique!!)
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.select({ ios: headerHeight, android: headerHeight + 24 }) as number}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Bannière */}
        <LinearGradient
          colors={["#1f005c", "#5b0060", "#870160", "#ac255e", "#ca485c"] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.avatarRing}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.08)",
                  },
                ]}
              >
                <Text style={{ fontSize: 42 }}>👤</Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>
            {appUser?.firstName} {appUser?.lastName}
          </Text>
          <Text style={styles.mail}>{appUser?.email}</Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <Pressable style={[styles.btn, { backgroundColor: "#4f7fd9" }]} onPress={pickFromGallery}>
              <Text style={styles.btnTxt}>Depuis la galerie</Text>
            </Pressable>
            <Pressable style={[styles.btn, { backgroundColor: "#01C885" }]} onPress={takePhoto}>
              <Text style={styles.btnTxt}>Prendre une photo</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Formulaire */}
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontWeight: "900", fontSize: 18, marginBottom: 8 }}>Changer le mot de passe</Text>

          <Field                                             /*******Les emoji sont trop quetaine ? peut etre les enlever********/
            label="Mot de passe actuel"
            icon="🔒"
            placeholder="Votre mot de passe actuel"
            secureTextEntry
            value={current}
            onChangeText={setCurrent}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Field
            label="Nouveau mot de passe"
            icon="✨"
            placeholder="Nouveau mot de passe"
            secureTextEntry
            value={next}
            onChangeText={setNext}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Field
            label="Confirmer le nouveau"
            icon="✅"
            placeholder="Confirmez le nouveau mot de passe"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable onPress={onChangePwd} style={[styles.bigBtn, { backgroundColor: "#0a7" }]}>
            <Text style={styles.bigBtnTxt}>Valider</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    ...Platform.select({ //proposer par chatgpt prompt: "ajoute une ombre légère sous une carte"
      ios: { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 8 },
    }),
  },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 3,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  avatar: { width: "100%", height: "100%", borderRadius: 56 },
  name: { marginTop: 10, fontWeight: "900", fontSize: 20, color: "#fff" },
  mail: { color: "rgba(255,255,255,0.85)" },

  label: {
    fontWeight: "800",
    marginBottom: 6,
    color: "#1f2937",
  },
  fieldWrap: {
    borderRadius: 14,
    padding: 1.5,
  },
  fieldInner: {
    borderRadius: 13,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({ //proposer par chatgpt: prompt "in a react native project using typescript, how to add a light shadow under a card"
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 2 },
    }),
  },
  fieldIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: "#111827",
    fontWeight: "600",
    letterSpacing: 0.2,
    paddingVertical: Platform.select({ ios: 6, android: 2 }) as number, //proposer par chatgpt: prompt "in a react native project using typescript, how to vertically center text in a TextInput"
  },

  btn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnTxt: { color: "#fff", fontWeight: "800" },
  bigBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  bigBtnTxt: { color: "#fff", fontWeight: "800", letterSpacing: 0.3 },
});
