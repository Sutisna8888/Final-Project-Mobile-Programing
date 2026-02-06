import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../../config/firebaseConfig";
import { finishQuiz } from "../../services/quizService"; 
import ResponsiveContainer from "@/src/components/layout/ResponsiveContainer";

export default function ResultScreen() {

  const { score, categoryId, difficulty } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const finalScore = parseInt(score as string) || 0;
  const currentDifficulty = (difficulty as string) || 'easy'; 

  const handleSave = async () => {
    const user = auth.currentUser;
    
    if (!user) {
      Alert.alert("Gagal", "Anda harus login untuk menyimpan skor.");
      return;
    }

    setLoading(true);
    try {
      const result = await finishQuiz(
        user.uid,
        categoryId as string,
        currentDifficulty,
        finalScore
      );

      if (result.status === 'new_record') {
        Alert.alert(
          "REKOR BARU! 🏆",
          `Selamat! Skor ${finalScore} ditambahkan ke High Score Profilmu.`
        );
      } else {
        Alert.alert(
          "Skor Tersimpan",
          `Skor: ${finalScore}. (Tidak menambah High Score karena belum memecahkan rekor lamamu: ${result.oldScore})`
        );
      }
      
      setIsSaved(true);
    } catch (error) {
      Alert.alert("Gagal", "Terjadi kesalahan koneksi saat menyimpan.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    (router as any).replace({
      pathname: "/quiz/[categoryId]",
      params: { categoryId, difficulty: currentDifficulty },
    });
  };

  const handleHome = () => {
    (router as any).replace({
      pathname: "(main)/home",
    });
  };

  return (
    <ResponsiveContainer maxWidth={600}>
    <View style={styles.container}>
      <Text style={styles.header}>Kuis Selesai!</Text>
      
      <View style={styles.badgeContainer}>
         <Text style={styles.badgeText}>Level: {currentDifficulty.toUpperCase()}</Text>
      </View>

      <Text style={styles.scoreText}>Skor Akhir Kamu:</Text>
      <Text style={[styles.scoreNumber, { color: finalScore >= 60 ? "#4CAF50" : "#F44336" }]}>
        {finalScore}
      </Text>

      {!isSaved ? (
        <View style={{ width: "100%", marginBottom: 20 }}>
          <Text style={{textAlign:'center', marginBottom:10, color:'#666'}}>
             Simpan skor untuk update Rank di Profil!
          </Text>
          <TouchableOpacity
            style={styles.buttonSave}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Simpan Skor</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{marginBottom: 20}}>
            <Text style={{textAlign:'center', color:'green', fontWeight:'bold'}}>
                Skor Tersimpan
            </Text>
        </View>
      )}

      <TouchableOpacity style={styles.buttonReset} onPress={handleRestart}>
        <Text style={styles.buttonText}>Main Lagi</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.buttonReset, { marginTop: 10, backgroundColor: "#555" }]}
        onPress={handleHome}
      >
        <Text style={styles.buttonText}>Kembali ke Home</Text>
      </TouchableOpacity>
    </View>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#f5f5f5", alignItems: 'center' },
  header: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 10, color: '#333' },
  badgeContainer: { backgroundColor: '#2196F3', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 15, marginBottom: 20 },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  scoreText: { fontSize: 18, textAlign: "center", color: '#555' },
  scoreNumber: { fontSize: 80, fontWeight: "bold", textAlign: "center", marginBottom: 30 },
  buttonSave: { backgroundColor: "#FF9800", padding: 15, borderRadius: 30, alignItems: "center", marginBottom: 10, width: '100%' },
  buttonReset: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 30, alignItems: "center", width: '100%' },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});