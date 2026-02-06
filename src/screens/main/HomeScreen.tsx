import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList, 
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { auth, db } from '../../config/firebaseConfig';
import { Category } from '../../types';

const HORIZONTAL_PADDING = 24; 
const GAP = 15; 

const GRADIENTS = [
  ['#FF9966', '#FF5E62'], 
  ['#56CCF2', '#2F80ED'], 
  ['#00b09b', '#96c93d'], 
  ['#8E2DE2', '#4A00E0'], 
  ['#F2994A', '#F2C94C'], 
  ['#EF32D9', '#89FFFD'], 
];

export default function HomeScreen() {
  const router = useRouter();
  
  const { width } = useWindowDimensions();

  const numColumns = width > 768 ? 3 : 2;

  const cardWidth = (width - (HORIZONTAL_PADDING * 2) - (GAP * (numColumns - 1))) / numColumns;

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastPlayed, setLastPlayed] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const fetchData = async () => {
    try {
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) setUser(userDoc.data());
      }

      const querySnapshot = await getDocs(collection(db, 'categories'));
      const cats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(cats);
      setFilteredCategories(cats);

      if (currentUser) {
        const scoresRef = collection(db, 'scores');
        const q = query(scoresRef, where("userId", "==", currentUser.uid));
        const scoreSnapshot = await getDocs(q);

        if (!scoreSnapshot.empty) {
           const allScores = scoreSnapshot.docs.map(d => d.data());
           allScores.sort((a: any, b: any) => (b.playedAt?.seconds || 0) - (a.playedAt?.seconds || 0));
           const latest = allScores[0];
           const catDetail = cats.find(c => c.id === latest.categoryId);
           
           if (catDetail) {
              setLastPlayed({
                 ...latest,
                 categoryName: catDetail.name,
                 icon: catDetail.icon,
                 difficulty: latest.difficulty
              });
           }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const filtered = categories.filter(cat => 
        cat.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  };

  const renderCard = ({ item, index }: { item: Category; index: number }) => {
    const gradient = GRADIENTS[index % GRADIENTS.length];
    const count = (item as any).questionCount || 0;

    return (
      <TouchableOpacity 
        style={[styles.cardContainer, { width: cardWidth }]}
        activeOpacity={0.8}
        onPress={() => router.push({
          pathname: '/(main)/level',
          params: { 
            categoryId: item.id, 
            categoryName: item.name 
          }
        })}
      >
        <View style={styles.cardInner}>
          <View style={[styles.decorativeCircle, { backgroundColor: gradient[0] }]} />
          
          <View style={styles.cardHeader}>
             <LinearGradient
                colors={gradient as any}
                style={styles.iconBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
             >
                <Ionicons name={item.icon as any || 'book'} size={24} color="white" />
             </LinearGradient>
             
             <View style={styles.countBadge}>
                <Text style={styles.countText}>{count}</Text>
             </View>
          </View>

          <View style={styles.cardBody}>
             <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
             <Text style={styles.cardSubtitle}>Pilih Level</Text> 
          </View>

          <View style={styles.cardFooter}>
             <Ionicons name="arrow-forward" size={18} color="#CBD5E0" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2C3E50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
      
      <FlatList
        data={filteredCategories}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        
        key={numColumns} 
        numColumns={numColumns}
        columnWrapperStyle={[styles.row, { gap: GAP }]}
        
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />
        }
        
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.topRow}>
               <View>
                 <Text style={styles.greetingTitle}>Waktunya main, {user?.displayName}! </Text>
                 <Text style={styles.greetingSub}>Yuk, uji kemampuanmu sekarang juga!</Text>
               </View>
               <TouchableOpacity onPress={() => router.push('/(main)/profile')}>
                  <Image 
                    source={{ uri: `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=random` }} 
                    style={styles.avatar} 
                  />
               </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
               <Ionicons name="search-outline" size={20} color="#A0AEC0" />
               <TextInput 
                  style={styles.searchInput}
                  placeholder="Cari kategori kuis..."
                  placeholderTextColor="#A0AEC0"
                  value={searchQuery}
                  onChangeText={handleSearch}
               />
            </View>

            {lastPlayed && !searchQuery && (
               <View style={styles.heroSection}>
                  <Text style={styles.sectionTitle}>Lanjutkan Terakhir </Text>
                  <TouchableOpacity 
                    activeOpacity={0.9}
                    onPress={() => router.push({
                      pathname: '/quiz/[categoryId]',
                      params: { categoryId: lastPlayed.categoryId, difficulty: lastPlayed.difficulty }
                    })}
                  >
                    <LinearGradient
                       colors={['#2C3E50', '#4CA1AF']}
                       start={{ x: 0, y: 0 }}
                       end={{ x: 1, y: 1 }}
                       style={styles.heroCard}
                    >
                       <View style={styles.heroContent}>
                          <View style={styles.heroIconCircle}>
                             <Ionicons name={lastPlayed.icon as any || 'game-controller'} size={30} color="#2C3E50" />
                          </View>
                          <View style={{flex: 1}}>
                             <Text style={styles.heroTitle}>{lastPlayed.categoryName}</Text>
                             <Text style={styles.heroSubtitle}>
                                Level {lastPlayed.difficulty?.toUpperCase()} • Skor: {lastPlayed.score}
                             </Text>
                          </View>
                          <View style={styles.playBtnCircle}>
                             <Ionicons name="play" size={20} color="white" />
                          </View>
                       </View>
                    </LinearGradient>
                  </TouchableOpacity>
               </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Jelajahi Kategori</Text>
          </View>
        }

        ListEmptyComponent={
          <View style={styles.emptyState}>
             <Ionicons name="cube-outline" size={60} color="#E2E8F0" />
             <Text style={styles.emptyText}>Tidak ada kategori ditemukan</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  listContent: { paddingBottom: 100 },
  headerContainer: { paddingHorizontal: HORIZONTAL_PADDING, paddingTop: 30, paddingBottom: 10 },
  
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingTitle: { fontSize: 20, fontWeight: '800', color: '#1A202C' },
  greetingSub: { fontSize: 13, color: '#718096', marginTop: 4 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 2, borderColor: 'white' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 16, paddingHorizontal: 15, height: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    marginBottom: 25
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#2D3748' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2D3748', marginBottom: 15 },

  heroSection: { marginBottom: 10 },
  heroCard: {
    borderRadius: 24, padding: 20,
    shadowColor: '#2C3E50', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8
  },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  heroIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  playBtnCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  row: { 
    paddingHorizontal: HORIZONTAL_PADDING 
  },
  cardContainer: {
    marginBottom: 20,
    borderRadius: 24,
    backgroundColor: 'white',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardInner: {
    padding: 16,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    height: 160,
    justifyContent: 'space-between'
  },
  decorativeCircle: {
    position: 'absolute', top: -20, right: -20, width: 80, height:  80, borderRadius: 50, opacity: 0.3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  iconBox: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4
  },
  countBadge: { backgroundColor: '#F7F9FC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  countText: { fontSize: 11, fontWeight: 'bold', color: '#718096' },
  
  cardBody: { marginTop: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: '#A0AEC0', fontWeight: '500' },
  cardFooter: { alignItems: 'flex-end', marginTop: 5 },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#A0AEC0', marginTop: 10, fontSize: 15 }
});