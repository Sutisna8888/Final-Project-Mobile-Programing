import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { deleteQuestion, fetchAdminQuestions } from '../../services/adminService';
import { Question } from '../../types';

export default function ManageQuizScreen() {
  const { categoryId } = useLocalSearchParams(); 
  const router = useRouter();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filterType, setFilterType] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadQuestions();
    }, [categoryId])
  );

  const loadQuestions = async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const data = await fetchAdminQuestions(categoryId as string);
      setQuestions(data);
    } catch (error) {
      Alert.alert("Error", "Gagal memuat daftar soal.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Hapus Soal?", "Data tidak bisa dikembalikan.", [
      { text: "Batal" },
      { text: "Hapus", style: 'destructive', onPress: async () => {
          await deleteQuestion(id);
          loadQuestions(); 
        } 
      }
    ]);
  };

  const filteredQuestions = questions.filter(q => {
    const matchLevel = filterType === 'all' || (q.difficulty || 'easy') === filterType;

    const matchSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());

    return matchLevel && matchSearch;
  });

  const FilterTab = ({ label, value }: { label: string, value: string }) => (
    <TouchableOpacity 
      style={[styles.tab, filterType === value && styles.tabActive]}
      onPress={() => setFilterType(value)}
    >
      <Text style={[styles.tabText, filterType === value && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Kelola Soal</Text>
        <View style={{width: 24}} /> 
      </View>


      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={{marginRight: 10}} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Cari pertanyaan..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
             <Ionicons name="close-circle" size={18} color="#ccc" />
          </TouchableOpacity>
        )}
      </View>


      <View style={styles.filterContainer}>
        <FilterTab label="Semua" value="all" />
        <FilterTab label="Easy" value="easy" />
        <FilterTab label="Medium" value="medium" />
        <FilterTab label="Hard" value="hard" />
      </View>


      <Text style={styles.stats}>
        Ditemukan {filteredQuestions.length} soal
      </Text>


      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#2196F3"/></View>
      ) : (
        <FlatList
          data={filteredQuestions}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>

                   <View style={[styles.badge, getBadgeStyle(item.difficulty || 'easy')]}>
                      <Text style={styles.badgeText}>{item.difficulty || 'easy'}</Text>
                   </View>
                   <Text style={styles.number}>#{index + 1}</Text>
                </View>
                <Text style={styles.questionText} numberOfLines={2}>{item.question}</Text>
                <Text style={styles.answerText}>Kunci: {item.correctAnswer}</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => (router as any).push(`/(admin)/edit/${item.id}`)} style={styles.actionBtn}>
                  <Ionicons name="pencil" size={20} color="#FFA000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                  <Ionicons name="trash" size={20} color="#FF5252" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
               <Ionicons name="search-outline" size={48} color="#ccc" />
               <Text style={{color:'#999', marginTop:10}}>
                 {searchQuery ? "Pencarian tidak ditemukan." : "Belum ada soal."}
               </Text>
            </View>
          }
        />
      )}


      <TouchableOpacity 
        style={styles.fab}
        onPress={() => (router as any).push(`/(admin)/create/${categoryId}`)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const getBadgeStyle = (diff: string) => {
  switch(diff) {
    case 'hard': return { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' };
    case 'medium': return { backgroundColor: '#FFF3E0', borderColor: '#FFE0B2' };
    default: return { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' };
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  

  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10, 
    backgroundColor: 'white', elevation: 2, zIndex: 1 
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },


  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    marginHorizontal: 20, marginTop: 15, marginBottom: 5,
    paddingHorizontal: 15, height: 45, borderRadius: 10,
    borderWidth: 1, borderColor: '#ddd'
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },

  filterContainer: { flexDirection: 'row', padding: 15, gap: 10, paddingBottom: 5 },
  tab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd' },
  tabActive: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  tabText: { fontSize: 12, color: '#666' },
  tabTextActive: { color: 'white', fontWeight: 'bold' },
  stats: { marginLeft: 20, marginBottom: 10, fontSize: 12, color: '#888' },

  card: { flexDirection: 'row', backgroundColor: 'white', marginHorizontal: 20, marginBottom: 12, borderRadius: 12, padding: 15, alignItems: 'center', elevation: 1 },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: '#555' },
  number: { fontSize: 12, color: '#aaa' },
  questionText: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  answerText: { fontSize: 12, color: '#4CAF50' },

  actions: { marginLeft: 10, gap: 10 },
  actionBtn: { padding: 8, backgroundColor: '#FAFAFA', borderRadius: 8 },
  empty: { alignItems: 'center', marginTop: 50 },

  fab: {
    position: 'absolute', bottom: 30, right: 20,
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#2196F3',
    justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#2196F3', shadowOpacity: 0.3, shadowRadius: 10
  }
});