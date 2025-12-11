import { useAuth } from "@/app/_context/AuthContext";
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from "@/app/_styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

export default function Register() {
  const { register } = useAuth();
  const [pseudonyme, setPseudonyme] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!pseudonyme.trim()) {
      Alert.alert("Erreur", "Le pseudonyme est obligatoire");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Erreur", "Le prénom et le nom sont obligatoires");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Erreur", "L'email est obligatoire");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    const res = await register(
      email.trim(),
      password,
      firstName.trim(),
      lastName.trim(),
      pseudonyme.trim()
    );
    setLoading(false);

    if (!res.ok) {
      Alert.alert("Erreur d'inscription", res.error ?? "Erreur inconnue");
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
              <Ionicons name="game-controller" size={40} color={COLORS.TEXT_PRIMARY} />
            </LinearGradient>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoignez le jeu de mémoire</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pseudonyme</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="at" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                <TextInput
                  placeholder="Votre pseudonyme unique"
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  value={pseudonyme}
                  onChangeText={setPseudonyme}
                  style={styles.input}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Prénom</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Prénom"
                    placeholderTextColor={COLORS.TEXT_MUTED}
                    value={firstName}
                    onChangeText={setFirstName}
                    style={styles.input}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Nom</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Nom"
                    placeholderTextColor={COLORS.TEXT_MUTED}
                    value={lastName}
                    onChangeText={setLastName}
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                <TextInput
                  placeholder="votre@email.com"
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                  placeholder="Minimum 6 caractères"
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                <TextInput
                  placeholder="Répétez le mot de passe"
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.input}
                />
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
                  <Text style={styles.buttonText}>Inscription en cours...</Text>
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color={COLORS.TEXT_PRIMARY} />
                    <Text style={styles.buttonText}>Inscription</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
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
    paddingTop: SPACING.XXL,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.XL,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.XL,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.MD,
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
  row: {
    flexDirection: "row",
    gap: SPACING.MD,
  },
  halfWidth: {
    flex: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.SM,
    paddingVertical: SPACING.MD + 2,
    borderRadius: BORDER_RADIUS.MD,
    marginTop: SPACING.MD,
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
});
