import ResponsiveContainer from "@/src/components/layout/ResponsiveContainer";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { loginUser } from "../../services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMsg(null);
    Keyboard.dismiss();

    if (!email || !password) {
      setErrorMsg("Harap isi email dan kata sandi.");
      return;
    }

    setLoading(true);
    try {
      await loginUser(email, password);

      if (email === "admin@gmail.com") {
        router.replace("/(admin)/dashboard");
      } else {
        router.replace("/(main)/home");
      }
      
    } catch (error: any) {
      let message = "Terjadi kesalahan pada server.";
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          message = "Email atau kata sandi salah.";
          break;
        case 'auth/invalid-email':
          message = "Format email tidak valid.";
          break;
        case 'auth/too-many-requests':
          message = "Terlalu banyak percobaan. Tunggu sebentar.";
          break;
        case 'auth/user-disabled':
          message = "Akun ini telah dinonaktifkan.";
          break;
        case 'auth/network-request-failed':
          message = "Koneksi internet bermasalah.";
          break;
        default:
          message = error.message;
      }
      
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveContainer maxWidth={400}>
      <View style={styles.container}>
        <Text style={styles.title}>Masuk Akun</Text>
        {errorMsg && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#D32F2F" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <TextInput
          style={[styles.input, errorMsg ? styles.inputError : null]}
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorMsg(null);
          }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={[styles.input, errorMsg ? styles.inputError : null]}
          placeholder="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorMsg(null);
          }}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.btnLogin, loading && styles.btnDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.textBtn}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/register")}
          style={{ marginTop: 20 }}
        >
          <Text style={styles.link}>Belum punya akun? <Text style={{fontWeight: 'bold'}}>Daftar di sini</Text></Text>
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
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    color: "#333",
    backgroundColor: "#F9F9F9",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#EF5350",
    backgroundColor: "#FFEBEE",
  },

  btnLogin: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  btnDisabled: {
    backgroundColor: "#90CAF9",
    elevation: 0,
  },
  textBtn: { 
    color: "white", 
    fontWeight: "bold", 
    fontSize: 16 
  },
  link: { 
    marginTop: 15, 
    color: "#2196F3", 
    textAlign: "center",
    fontSize: 14 
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
    flex: 1,
  },
});