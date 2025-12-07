import { useAuth } from "@/app/_context/AuthContext";
import { getUserRank } from "@/app/_services/firestore";
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from "@/app/_styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

async function ensureGalleryPermission(): Promise<boolean> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted || current.accessPrivileges === "limited") return true;
  const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (req.granted || req.accessPrivileges === "limited") return true;
  Alert.alert("Permission requise", "L'accès à la galerie est nécessaire pour choisir une photo.");
  return false;
}

async function ensureCameraPermission(): Promise<boolean> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) return true;
  const req = await ImagePicker.requestCameraPermissionsAsync();
  if (req.granted) return true;
  Alert.alert("Permission requise", "L'accès à la caméra est nécessaire pour prendre une photo.");
  return false;
}

export default function Profil() {
  const { appUser, avatarUri, setAvatar, changePassword, refreshUser } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [rank, setRank] = useState<number>(-1);
  const [loading, setLoading] = useState(false);

  const headerHeight = useHeaderHeight();

  useEffect(() => {
    const loadRank = async () => {
      if (appUser?.userId) {
        const userRank = await getUserRank(appUser.userId);
        setRank(userRank);
      }
    };
    loadRank();
    refreshUser?.();
  }, [appUser?.userId]);

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
    if (!current) {
      Alert.alert("Erreur", "Veuillez entrer votre mot de passe actuel.");
      return;
    }
    if (!next || next.length < 6) {
      Alert.alert("Erreur", "Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (next !== confirm) {
      Alert.alert("Erreur", "Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const res = await changePassword(current, next);
    setLoading(false);

    if (!res.ok) {
      Alert.alert("Erreur", res.error ?? "Impossible de changer le mot de passe");
    } else {
      Alert.alert("Succès", "Mot de passe modifié avec succès.");
      setCurrent("");
      setNext("");
      setConfirm("");
    }
  };

  return (
    <LinearGradient colors={[COLORS.BACKGROUND, '#1a1a2e']} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.select({ ios: headerHeight, android: headerHeight + 24 }) as number}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={GRADIENTS.HEADER}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.avatarContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <LinearGradient colors={GRADIENTS.BUTTON} style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {appUser?.pseudonyme?.charAt(0).toUpperCase() || "?"}
                  </Text>
                </LinearGradient>
              )}
              <TouchableOpacity style={styles.avatarEditButton} onPress={pickFromGallery}>
                <Ionicons name="camera" size={16} color={COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            <Text style={styles.pseudonyme}>{appUser?.pseudonyme}</Text>
            <Text style={styles.fullName}>
              {appUser?.firstName} {appUser?.lastName}
            </Text>
            <Text style={styles.email}>{appUser?.email}</Text>

            <View style={styles.avatarButtons}>
              <TouchableOpacity style={styles.avatarBtn} onPress={pickFromGallery}>
                <Ionicons name="images" size={18} color={COLORS.TEXT_PRIMARY} />
                <Text style={styles.avatarBtnText}>Galerie</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarBtn} onPress={takePhoto}>
                <Ionicons name="camera" size={18} color={COLORS.TEXT_PRIMARY} />
                <Text style={styles.avatarBtnText}>Photo</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={24} color={COLORS.WARNING} />
              <Text style={styles.statValue}>{appUser?.points || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="podium" size={24} color={COLORS.PRIMARY} />
              <Text style={styles.statValue}>
                {rank > 0 ? `#${rank}` : "-"}
              </Text>
              <Text style={styles.statLabel}>Classement</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="flame" size={24} color={COLORS.DANGER} />
              <Text style={styles.statValue}>{appUser?.winStreak || 0}</Text>
              <Text style={styles.statLabel}>Série</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe actuel</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="key" size={20} color={COLORS.TEXT_SECONDARY} />
                <TextInput
                  style={styles.input}
                  placeholder="Votre mot de passe actuel"
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  secureTextEntry={!showPasswords}
                  value={current}
                  onChangeText={setCurrent}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color={COLORS.TEXT_SECONDARY} />
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 6 caractères"
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  secureTextEntry={!showPasswords}
                  value={next}
                  onChangeText={setNext}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmer le nouveau</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.TEXT_SECONDARY} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmez le nouveau mot de passe"
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  secureTextEntry={!showPasswords}
                  value={confirm}
                  onChangeText={setConfirm}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowPasswords(!showPasswords)}
            >
              <Ionicons
                name={showPasswords ? "eye-off" : "eye"}
                size={18}
                color={COLORS.TEXT_SECONDARY}
              />
              <Text style={styles.showPasswordText}>
                {showPasswords ? "Masquer" : "Afficher"} les mots de passe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onChangePwd}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={GRADIENTS.BUTTON_SUCCESS}
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              >
                <Ionicons name="checkmark" size={20} color={COLORS.TEXT_PRIMARY} />
                <Text style={styles.submitButtonText}>
                  {loading ? "Modification..." : "Valider le changement"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  banner: {
    paddingTop: SPACING.LG,
    paddingBottom: SPACING.LG,
    paddingHorizontal: SPACING.MD,
    alignItems: "center",
    ...SHADOWS.LG,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: SPACING.MD,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.FULL,
    borderWidth: 3,
    borderColor: COLORS.TEXT_PRIMARY,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.FULL,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.TEXT_PRIMARY,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  avatarEditButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.FULL,
    ...SHADOWS.SM,
  },
  pseudonyme: {
    fontSize: FONT_SIZE.TITLE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  fullName: {
    fontSize: FONT_SIZE.MD,
    color: COLORS.TEXT_PRIMARY,
    opacity: 0.9,
    marginTop: SPACING.XS,
  },
  email: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_PRIMARY,
    opacity: 0.7,
    marginTop: SPACING.XS,
  },
  avatarButtons: {
    flexDirection: "row",
    gap: SPACING.MD,
    marginTop: SPACING.MD,
  },
  avatarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.XS,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  avatarBtnText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.SURFACE,
    marginHorizontal: SPACING.MD,
    marginTop: -SPACING.LG,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    ...SHADOWS.MD,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: SPACING.XS,
  },
  statValue: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  statLabel: {
    fontSize: FONT_SIZE.XS,
    color: COLORS.TEXT_SECONDARY,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: SPACING.SM,
  },
  section: {
    margin: SPACING.MD,
    marginTop: SPACING.LG,
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    ...SHADOWS.MD,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.SM,
    marginBottom: SPACING.MD,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  inputGroup: {
    marginBottom: SPACING.MD,
  },
  inputLabel: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
    marginLeft: SPACING.XS,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    gap: SPACING.SM,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.MD,
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.MD,
  },

  showPasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.SM,
    marginBottom: SPACING.MD,
  },
  showPasswordText: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.SM,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    ...SHADOWS.MD,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.MD,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
});
