import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser, registerUser } from '../src/services/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await loginUser(email, password);
      Alert.alert("Sukses", "Selamat datang kembali!");
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert("Gagal Login", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Masuk Akun</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}>
        <Text style={styles.textBtn}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')} style={{marginTop: 20}}>
        <Text style={styles.link}>Belum punya akun? Daftar di sini</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white',},
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: 'black' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10, color:'black', backgroundColor: '#f9f9f9' },
  btnLogin: { backgroundColor: '#2196F3', padding: 15, borderRadius: 5, alignItems: 'center' },
  textBtn: { color: 'white', fontWeight: 'bold' },
  link: { marginTop: 15, color: '#2196F3', textAlign: 'center' }
});

