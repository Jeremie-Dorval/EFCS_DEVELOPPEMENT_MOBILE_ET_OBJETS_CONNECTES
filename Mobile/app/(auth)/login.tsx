import { useAuth } from "@/app/context/AuthContext";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("qwerty");

  const onSubmit = async () => {
    const res = await login(email.trim(), password);
    if (!res.ok) Alert.alert("Erreur de connexion", res.error ?? "Erreur inconnue");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Se connecter</Text>

      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity onPress={onSubmit} style={styles.btn}>
        <Text style={styles.btnText}>Connexion</Text>
      </TouchableOpacity>

      <Link href="/register" asChild>
        <TouchableOpacity style={{ marginTop: 12 }}>
          <Text>Créer un compte</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1, borderColor: "#DDD", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: "#FFF", marginBottom: 10, width: "100%",
  },
  btn: { backgroundColor: "#4F86A8", paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10, width: "100%", alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
