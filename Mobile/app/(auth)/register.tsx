import { useAuth } from "@/app/context/AuthContext";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Register() {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("William");     // pour tests
  const [lastName, setLastName] = useState("Dufour");        // pour tests
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("qwerty");

  const onSubmit = async () => {
    const res = await register(email.trim(), password, firstName.trim(), lastName.trim());
    if (!res.ok) Alert.alert("Erreur d'inscription", res.error ?? "Erreur inconnue");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>

      <TextInput placeholder="Prénom" value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput placeholder="Nom de famille" value={lastName} onChangeText={setLastName} style={styles.input} />

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
        <Text style={styles.btnText}>Inscription</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#DDD", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: "#FFF", marginBottom: 10,
  },
  btn: { backgroundColor: "#4F86A8", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
