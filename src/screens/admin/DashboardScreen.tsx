import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';
import AddCategoryModal from '../../components/admin/AddCategoryModal';
import { db } from '../../config/firebaseConfig';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import { Category } from '../../types';

const getRandomColor = (id: string) => {
  const colors = ['#6C63FF', '#FF6584', '#33D9B2', '#FFA502', '#2f3542', '#17c0eb'];
  return colors[id.length % colors.length];
};

export default function DashboardScreen() {
  const { categories, loading, handleAdd, handleDelete, refresh } = useAdminCategories();
  const router = useRouter();

  const { width } = useWindowDimensions();
  const HORIZONTAL_PADDING = 20;
  const GAP = 15;
  
  const numColumns = width > 768 ? 3 : 2; 
  
  const cardWidth = (width - (HORIZONTAL_PADDING * 2) - (GAP * (numColumns - 1))) / numColumns;

  const [modalVisible, setModalVisible] = useState(false);
  
  const [totalQuizzes, setTotalQuizzes] = useState(0); 
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({}); 

  const [syncing, setSyncing] = useState(false); 
  const [isSearching, setIsSearching] = useState(false); 
  const [searchQuery, setSearchQuery] = useState(''); 

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'quizzes'));
          setTotalQuizzes(snapshot.size);
          const counts: Record<string, number> = {};
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            const catId = data.categoryId;
            if (catId) counts[catId] = (counts[catId] || 0) + 1;
          });
          setCategoryCounts(counts);
        } catch (error) {
          console.log("Error fetching quiz count:", error);
        }
      };
      fetchData();
    }, [])
  );

  const handleSyncCounts = async () => {
    Alert.alert("Sync Data", "Hitung ulang jumlah soal di setiap kategori? Ini mungkin memakan waktu.", [
      { text: "Batal" },
      { 
        text: "Mulai Sync", 
        onPress: async () => {
          setSyncing(true);
          try {
            for (const cat of categories) {
              const q = query(collection(db, 'quizzes'), where('categoryId', '==', cat.id));
              const snap = await getDocs(q);
              const count = snap.size;
              await updateDoc(doc(db, 'categories', cat.id), {
                questionCount: count
              });
            }
            Alert.alert("Selesai", "Data jumlah soal sudah diperbarui!");
            refresh(); 
          } catch (e) {
            Alert.alert("Error", "Gagal sinkronisasi.");
          } finally {
            setSyncing(false);
          }
        }
      }
    ]);
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSaveCategory = async (name: string, icon: string) => {
    await handleAdd(name, icon);
  };

  const renderGridItem = ({ item }: { item: Category }) => {
    const count = (item as any).questionCount ?? categoryCounts[item.id] ?? 0;
    
    return (
      <TouchableOpacity 
        style={[styles.gridCard, { width: cardWidth }]}
        activeOpacity={0.9}
        onPress={() => (router as any).push(`/(admin)/manage/${item.id}`)}
      >
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBadge}>
           <Ionicons name="trash-outline" size={16} color="white" />
        </TouchableOpacity>
        <View style={[styles.iconCircle, { backgroundColor: getRandomColor(item.id) }]}>
          <Ionicons name={item.icon as any} size={32} color="white" />
        </View>
        <Text style={styles.gridTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.gridSubtitle}>{count} Soal</Text>
        <View style={styles.cardFooter}>
           <Text style={styles.manageText}>Kelola</Text>
           <Ionicons name="arrow-forward-circle" size={24} color="#2C3E50" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F8" />
      
      <FlatList
        data={filteredCategories}
        renderItem={renderGridItem}
        keyExtractor={item => item.id}
        
        key={numColumns}
        numColumns={numColumns}
        columnWrapperStyle={{ gap: GAP, paddingHorizontal: HORIZONTAL_PADDING }}
        
        ListHeaderComponent={
          <View>
            <View style={styles.floatingHero}>
               <View style={styles.headerTopRow}>
                  {isSearching ? (
                     <View style={styles.searchBarContainer}>
                        <Ionicons name="search" size={20} color="#666" style={{marginLeft: 10}}/>
                        <TextInput 
                           style={styles.searchInput}
                           placeholder="Cari kategori..."
                           placeholderTextColor="#999"
                           value={searchQuery}
                           onChangeText={setSearchQuery}
                           autoFocus={true} 
                        />
                        <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
                           <Ionicons name="close-circle" size={24} color="#ccc" style={{marginRight: 5}}/>
                        </TouchableOpacity>
                     </View>
                  ) : (
                    <>
                      <View>
                        <Text style={styles.heroTitle}>Admin Panel</Text>
                        <Text style={styles.heroSubtitle}>Dashboard Manager</Text>
                      </View>
                      <View style={{flexDirection: 'row', gap: 10}}>
                         <TouchableOpacity onPress={() => setIsSearching(true)} style={styles.iconBtnGlass}>
                            <Ionicons name="search" size={20} color="white" />
                         </TouchableOpacity>
                         <TouchableOpacity onPress={() => router.replace('/(main)/profile')} style={styles.iconBtnGlass}>
                            <Ionicons name="close" size={20} color="white" />
                         </TouchableOpacity>
                      </View>
                    </>
                  )}
               </View>

               {!isSearching && (
                 <View style={styles.statsContainer}>
                    <View style={styles.circularStat}>
                        <View style={styles.ring}>
                            <Text style={styles.statNumber}>{categories.length}</Text>
                        </View>
                        <Text style={styles.statLabel}>Kategori Aktif</Text>
                    </View>
                    <View style={styles.verticalDivider} />
                    <View style={styles.circularStat}>
                        <View style={[styles.ring, { borderColor: 'rgba(255,255,255,0.4)' }]}>
                            <Text style={styles.statNumber}>{totalQuizzes}</Text>
                        </View>
                        <Text style={styles.statLabel}>Total Kuis</Text>
                    </View>
                 </View>
               )}
            </View>

            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>
                 {isSearching ? `Hasil: ${filteredCategories.length}` : 'Daftar Kategori'}
              </Text>
              
              {!isSearching && (
                <TouchableOpacity onPress={handleSyncCounts} disabled={syncing}>
                   {syncing ? (
                     <ActivityIndicator size="small" color="#2C3E50"/> 
                   ) : (
                     <Ionicons name="sync-circle" size={28} color="#2C3E50" />
                   )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        }

        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={refresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name={isSearching ? "search-outline" : "cube-outline"} size={60} color="#ddd" />
            <Text style={styles.emptyText}>
               {isSearching ? "Kategori tidak ditemukan" : "Belum ada kategori"}
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <AddCategoryModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={onSaveCategory}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F8' },
  floatingHero: {
    backgroundColor: '#2C3E50',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 25,
    padding: 25,
    shadowColor: '#2C3E50', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10,
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, minHeight: 40 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: 'white' },
  heroSubtitle: { fontSize: 13, color: '#BDC3C7', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  
  searchBarContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 25, paddingHorizontal: 5, height: 45
  },
  searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 16, color: '#333' },
  iconBtnGlass: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 5 },
  circularStat: { alignItems: 'center' },
  ring: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center', marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  statLabel: { fontSize: 12, color: '#BDC3C7', fontWeight: '500' },
  verticalDivider: { width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.1)' },
  
  sectionHeaderContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginHorizontal: 25, 
    marginBottom: 15 
  },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },

  gridCard: {
    backgroundColor: 'white', borderRadius: 20, padding: 15, marginBottom: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4, position: 'relative'
  },
  deleteBadge: { position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: '#FF4757', justifyContent: 'center', alignItems: 'center', zIndex: 2, elevation: 3 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12, marginTop: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  gridTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 4 },
  gridSubtitle: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 4 },
  cardFooter: { marginTop: 10, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  manageText: { fontSize: 12, color: '#2C3E50', fontWeight: '600' },
  
  fab: { position: 'absolute', bottom: 30, right: 25, width: 65, height: 65, borderRadius: 35, backgroundColor: '#2C3E50', justifyContent: 'center', alignItems: 'center', shadowColor: '#2C3E50', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  emptyState: { alignItems: 'center', marginTop: 50, opacity: 0.5 },
  emptyText: { marginTop: 10, fontSize: 16 }
});