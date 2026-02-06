import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { registerUser } from "../../services/authService";
import ResponsiveContainer from "@/src/components/layout/ResponsiveContainer";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Eits!", "Email dan Password tidak boleh kosong.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Password Lemah", "Password minimal harus 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      await registerUser(email, password);

      setLoading(false);
      Alert.alert("Berhasil!", "Akun sudah dibuat. Silakan Login.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      setLoading(false);
      let msg = error.message;
      if (error.code === "auth/email-already-in-use")
        msg = "Email ini sudah terdaftar.";
      if (error.code === "auth/invalid-email") msg = "Format email salah.";

      Alert.alert("Gagal Daftar", msg);
    }
  };

  return (
    <ResponsiveContainer maxWidth={400}>
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Akun Baru</Text>

      <TextInput
        style={styles.input}
        placeholder="Masukkan Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Buat Password (Min. 6 karakter)"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.btnRegister}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.textBtn}>Daftar Sekarang</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ marginTop: 20 }}>
        <Text style={styles.link}>Sudah punya akun? Login</Text>
      </TouchableOpacity>
    </View>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "black",
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    color: "black",
    backgroundColor: "#f9f9f9",
  },
  btnRegister: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  textBtn: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "#2196F3",
    textAlign: "center",
  },
});
