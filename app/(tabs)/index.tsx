import React, { useEffect, useState } from 'react';
import { StyleSheet, Text,TextInput, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { db, auth } from '../../src/config/firebaseConfig'; 
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  updateDoc, 
  doc,
  orderBy,
  limit
} from 'firebase/firestore';

export default function HomeScreen() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); 
  const [playerName, setPlayerName] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); 
  const [score, setScore] = useState(0); 
  const [isFinished, setIsFinished] = useState(false); 
  const [topScore, setTopScore] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "quizzes"));
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        
        data.sort(() => Math.random() - 0.5); 
        setQuestions(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quizzes: ", error);
        Alert.alert("Error", "Gagal mengambil soal dari database.");
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const fetchMyHighScore = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      const q = query(
        collection(db, "scores"), 
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setTopScore(querySnapshot.docs[0].data().score);
      }
    } catch (error) {
      console.log("Gagal ambil high score di home:", error);
    }
  };
  useEffect(() => {
    fetchMyHighScore();
  }, []);

  const handleAnswer = (selectedOption: string) => {
    const currentQuiz = questions[currentQuestionIndex];
    if (selectedOption === currentQuiz.correctAnswer) {
      setScore(score + 10);
      Alert.alert("Benar! 🎉", "Jawaban kamu tepat");
    } else {
      Alert.alert("Salah 😅", `Pilih jawaban yang benar`);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setIsFinished(false);
  };

  const saveScoreToFirebase = async () => {
    const nameToSave = playerName || auth.currentUser?.email;
    if (!nameToSave) {
      Alert.alert("Eits!", "Isi nama dulu (atau login).");
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert("Error", "Anda harus login untuk menyimpan skor.");
      return;
    }
    setLoading(true); 

    try {
      const q = query(collection(db, "scores"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {       
        const existingDoc = querySnapshot.docs[0]; 
        const oldScore = existingDoc.data().score;

        if (score > oldScore) {
          const scoreDocRef = doc(db, "scores", existingDoc.id);
          await updateDoc(scoreDocRef, {
            score: score,
            name: nameToSave,
            waktu: new Date()
          });
          setTopScore(score);
          Alert.alert("REKOR BARU! 🏆", `Hebat! Skor tertinggi kamu sekarang: ${score}`);
        } else {
          Alert.alert("Bagus!", `Skor kali ini: ${score}. Tapi masih belum mengalahkan rekor lamamu (${oldScore}).`);
        }

      } else {
        await addDoc(collection(db, "scores"), {
          userId: userId,
          name: nameToSave,
          score: score,
          waktu: new Date()
        });
        setTopScore(score);
        Alert.alert("Berhasil!", "Skor pertamamu berhasil disimpan.");
      }

      setIsSaved(true); 
    } catch (error) {
      console.error(error);
      Alert.alert("Gagal", "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{marginTop: 10}}>Memuat Soal...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Tidak ada soal ditemukan di Database.</Text>
      </View>
    );
  }

  if (isFinished) {
    if (isFinished) {
      return (
        <View style={styles.container}>
          <Text style={styles.header}>Kuis Selesai!</Text>
          <Text style={styles.scoreText}>Skor Akhir Kamu:</Text>
          <Text style={[styles.scoreNumber, { color: score > 50 ? 'green' : 'red' }]}>{score}</Text>

          {!isSaved && (
            <View style={{width: '100%', marginBottom: 20}}>
              <TextInput
                style={styles.input}
                placeholder="Ketik Nama Kamu..."
                value={playerName}
                onChangeText={setPlayerName}
              />
              <TouchableOpacity style={styles.buttonSave} onPress={saveScoreToFirebase}>
                <Text style={styles.buttonText}>Simpan Skor</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.buttonReset} onPress={restartQuiz}>
            <Text style={styles.buttonText}>{isSaved ? "Main Lagi" : "Ulangi Tanpa Simpan"}</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  const currentQuiz = questions[currentQuestionIndex];
  
  return (
    <View style={styles.container}>
      <View style={styles.topInfo}>
         <Text style={styles.topScoreLabel}>🏆 High Score: {topScore}</Text>
      </View>
      <View style={styles.badgeContainer}>
      <Text style={styles.badgeText}>
        {currentQuiz.difficulty ? currentQuiz.difficulty.toUpperCase() : 'NORMAL'}
      </Text>
    </View>

    <Text style={styles.progress}>Soal {currentQuestionIndex + 1} / {questions.length}</Text>
    <Text style={styles.questionText}>{currentQuiz.question}</Text>

      <View style={styles.optionsContainer}>
        {currentQuiz.options.map((option: string, index: number) => (
          <TouchableOpacity 
            key={index} 
            style={styles.optionButton} 
            onPress={() => handleAnswer(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.currentScore}>Skor Saat Ini: {score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  progress: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 18,
    textAlign: 'center',
  },
  scoreNumber: {
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonReset: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  currentScore: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-end', 
    marginBottom: 10,
  },
  topScoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeContainer: {
    backgroundColor: '#45c76a', 
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    marginBottom: 10,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },

  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonSave: {
    backgroundColor: '#FF9800', 
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },

});



