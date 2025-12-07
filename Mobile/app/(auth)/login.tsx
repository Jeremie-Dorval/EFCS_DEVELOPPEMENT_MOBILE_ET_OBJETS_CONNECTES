import { useAuth } from "@/app/_context/AuthContext";
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from "@/app/_styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Erreur", "L'email est obligatoire");
      return;
    }
    if (!password) {
      Alert.alert("Erreur", "Le mot de passe est obligatoire");
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    if (!res.ok) {
      Alert.alert("Erreur de connexion", res.error ?? "Erreur inconnue");
    }
  };

  return (
    <LinearGradient colors={[COLORS.BACKGROUND, '#1a1a2e']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <LinearGradient
              colors={GRADIENTS.BUTTON}
              style={styles.iconContainer}
            >
              <Ionicons name="game-controller" size={50} color={COLORS.TEXT_PRIMARY} />
            </LinearGradient>
            <Text style={styles.title}>Jeu de Mémoire</Text>
            <Text style={styles.subtitle}>Connectez-vous pour jouer</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                <TextInput
                  placeholder="votre@email.com"
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                <TextInput
                  placeholder="Votre mot de passe"
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={COLORS.TEXT_SECONDARY}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={onSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={GRADIENTS.BUTTON}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, loading && styles.buttonDisabled]}
              >
                {loading ? (
                  <Text style={styles.buttonText}>Connexion en cours...</Text>
                ) : (
                  <>
                    <Ionicons name="log-in" size={20} color={COLORS.TEXT_PRIMARY} />
                    <Text style={styles.buttonText}>Se connecter</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>ou</Text>
              <View style={styles.separatorLine} />
            </View>

            <Link href="/register" asChild>
              <TouchableOpacity style={styles.registerButton} activeOpacity={0.7}>
                <Ionicons name="person-add" size={18} color={COLORS.PRIMARY} />
                <Text style={styles.registerButtonText}>Créer un compte</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.footer}>
            <View style={styles.featureRow}>
              <View style={styles.featureItem}>
                <Ionicons name="flash" size={24} color={COLORS.WARNING} />
                <Text style={styles.featureText}>Défis rapides</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="trophy" size={24} color={COLORS.WARNING} />
                <Text style={styles.featureText}>Classement</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="people" size={24} color={COLORS.PRIMARY} />
                <Text style={styles.featureText}>Multijoueur</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.LG,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.XXL,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.XL,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.LG,
    ...SHADOWS.LG,
  },
  title: {
    fontSize: FONT_SIZE.HERO,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  subtitle: {
    fontSize: FONT_SIZE.LG,
    color: COLORS.TEXT_SECONDARY,
  },
  form: {
    gap: SPACING.MD,
  },
  inputGroup: {
    gap: SPACING.XS,
  },
  label: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.XS,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
  },
  inputIcon: {
    marginRight: SPACING.SM,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.MD,
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.MD,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.SM,
    paddingVertical: SPACING.MD + 2,
    borderRadius: BORDER_RADIUS.MD,
    marginTop: SPACING.SM,
    ...SHADOWS.MD,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.MD,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.BORDER,
  },
  separatorText: {
    color: COLORS.TEXT_MUTED,
    paddingHorizontal: SPACING.MD,
    fontSize: FONT_SIZE.SM,
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.SM,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  registerButtonText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZE.MD,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
  },
  footer: {
    marginTop: SPACING.XXL,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  featureItem: {
    alignItems: "center",
    gap: SPACING.XS,
  },
  featureText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZE.XS,
  },
});
