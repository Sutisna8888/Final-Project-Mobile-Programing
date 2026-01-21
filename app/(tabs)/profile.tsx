import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebaseConfig';
import { logoutUser } from '../../src/services/auth';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [highScore, setHighScore] = useState<any>(null); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchHighScore(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchHighScore = async (userId: string) => {
    try {
      const q = query(
        collection(db, "scores"), 
        where("userId", "==", userId), 
        orderBy("score", "desc"),
        limit(1)                       
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setHighScore(data);
      } else {
        setHighScore(null); 
      }
    } catch (error) {
      console.error("Gagal ambil highscore:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          fetchHighScore(currentUser.uid);
        } else {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    }, [])
  );

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  if (loading) return <ActivityIndicator size="large" style={{marginTop: 50}} />;

  return (
    <View style={styles.container}>
      {}
      <View style={styles.headerCard}>
        <Ionicons name="person-circle-outline" size={80} color="white" />
        <Text style={styles.emailText}>{user?.email}</Text>
        <Text style={styles.roleText}>
           {user?.email === 'admin@gmail.com' ? 'ADMINISTRATOR' : 'PLAYER'}
        </Text>
      </View>

      {}
      <View style={styles.scoreSection}>
        <Text style={styles.sectionTitle}>Pencapaian Terbaik</Text>
        
        <View style={styles.highScoreCard}>
          <Ionicons name="trophy" size={50} color="#FFD700" />
          <View style={styles.scoreInfo}>
             <Text style={styles.scoreLabel}>High Score</Text>
             <Text style={styles.scoreValue}>
               {highScore ? highScore.score : "0"}
             </Text>
          </View>
        </View>

        {highScore && (
          <Text style={styles.lastPlayed}>
          </Text>
        )}
      </View>
      
      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Keluar Aplikasi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  headerCard: {
    backgroundColor: '#2196F3',
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    elevation: 5
  },
  emailText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  roleText: { color: '#E3F2FD', fontSize: 14, marginTop: 5, letterSpacing: 1 },
  
  scoreSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  highScoreCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 }
  },
  scoreInfo: { marginLeft: 20 },
  scoreLabel: { fontSize: 14, color: '#888' },
  scoreValue: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  lastPlayed: { textAlign: 'center', marginTop: 10, color: '#999', fontSize: 12 },

  logoutBtn: {
    margin: 20,
    backgroundColor: '#FF5252',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

