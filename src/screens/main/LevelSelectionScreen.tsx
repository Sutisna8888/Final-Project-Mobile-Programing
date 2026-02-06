import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveContainer from '@/src/components/layout/ResponsiveContainer';

export default function LevelSelectionScreen() {
  const { categoryId, categoryName } = useLocalSearchParams();
  const router = useRouter();

  const handleSelectLevel = (level: string) => {
    (router as any).push({
      pathname: "/quiz/[categoryId]",
      params: { categoryId, difficulty: level } 
    });
  };

  return (
    <ResponsiveContainer maxWidth={600}>
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Pilih Tantangan!</Text>
      <Text style={styles.subtitle}>Kategori: {categoryName}</Text>

      <View style={styles.menuContainer}>
        {/* EASY */}
        <TouchableOpacity style={[styles.card, {borderColor: '#4CAF50'}]} onPress={() => handleSelectLevel('easy')}>
           <Ionicons name="bicycle" size={40} color="#4CAF50" />
           <View>
             <Text style={styles.levelTitle}>EASY</Text>
             <Text style={styles.levelDesc}>Pemanasan dulu, santai.</Text>
           </View>
        </TouchableOpacity>

        {/* MEDIUM */}
        <TouchableOpacity style={[styles.card, {borderColor: '#FF9800'}]} onPress={() => handleSelectLevel('medium')}>
           <Ionicons name="car-sport" size={40} color="#FF9800" />
           <View>
             <Text style={styles.levelTitle}>MEDIUM</Text>
             <Text style={styles.levelDesc}>Mulai mikir keras.</Text>
           </View>
        </TouchableOpacity>

        {/* HARD */}
        <TouchableOpacity style={[styles.card, {borderColor: '#F44336'}]} onPress={() => handleSelectLevel('hard')}>
           <Ionicons name="rocket" size={40} color="#F44336" />
           <View>
             <Text style={styles.levelTitle}>HARD</Text>
             <Text style={styles.levelDesc}>Mode dewa, khusus ahli!</Text>
           </View>
        </TouchableOpacity>
      </View>
    </View>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, color: '#333' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, color: '#666' },
  menuContainer: { gap: 20 },
  card: { 
    flexDirection: 'row', alignItems: 'center', gap: 20,
    backgroundColor: 'white', padding: 20, borderRadius: 15, borderWidth: 2,
    elevation: 3 
  },
  levelTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  levelDesc: { fontSize: 14, color: '#888' }
});