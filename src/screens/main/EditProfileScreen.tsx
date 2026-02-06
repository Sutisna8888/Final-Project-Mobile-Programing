import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../../config/firebaseConfig';
import ResponsiveContainer from '@/src/components/layout/ResponsiveContainer';

export default function EditProfileScreen() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, []);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert("Eits!", "Nama tidak boleh kosong.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, {
          displayName: displayName
        });

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              displayName: displayName
            });
        } catch (e) {
            console.log("Firestore update skipped or failed", e);
        }

        Alert.alert("Sukses", "Profil berhasil diperbarui!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      Alert.alert("Gagal", error.message || "Terjadi kesalahan saat update profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveContainer maxWidth={600}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(main)/profile')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profil</Text>
        <View style={{width: 24}} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{flex: 1}}
      >
        <ScrollView contentContainerStyle={styles.content}>
          
          <View style={styles.avatarContainer}>
             <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                    {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                </Text>
             </View>
             <Text style={styles.avatarHint}>Foto profil menggunakan inisial nama Anda</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email (Tidak dapat diubah)</Text>
            <View style={[styles.inputContainer, styles.disabledInput]}>
                <Ionicons name="mail-outline" size={20} color="#999" style={{marginRight: 10}}/>
                <TextInput 
                    style={[styles.input, {color: '#999'}]} 
                    value={email} 
                    editable={false} 
                />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#2C3E50" style={{marginRight: 10}}/>
                <TextInput 
                    style={styles.input} 
                    value={displayName} 
                    onChangeText={setDisplayName}
                    placeholder="Masukkan nama lengkap"
                    autoFocus
                />
            </View>
          </View>

          <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={loading}>
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.btnText}>Simpan Perubahan</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 20, paddingTop: 20, backgroundColor: 'white', elevation: 2 
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  backBtn: { padding: 5 },

  content: { padding: 25 },

  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#2C3E50',
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    elevation: 5
  },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: 'white' },
  avatarHint: { fontSize: 12, color: '#999' },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginLeft: 5 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 15, height: 50
  },
  input: { flex: 1, fontSize: 16, color: '#333' },
  disabledInput: { backgroundColor: '#F0F0F0', borderColor: '#eee' },

  btnSave: {
    backgroundColor: '#2C3E50', borderRadius: 12, height: 55,
    justifyContent: 'center', alignItems: 'center', marginTop: 30,
    elevation: 3, shadowColor: '#2C3E50', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});