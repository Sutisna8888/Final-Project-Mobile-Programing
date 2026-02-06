import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { 
  addTarget, 
  deleteTarget, 
  getTargets, 
  initDatabase, 
  toggleTargetStatus,
  updateTargetTitle
} from '../../services/database';
import ResponsiveContainer from '@/src/components/layout/ResponsiveContainer';

export default function StudyTargetScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [targets, setTargets] = useState<any[]>([]);
  
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    initDatabase()
      .then(() => loadData())
      .catch(e => console.error(e));
  }, []);

  const loadData = async () => {
    const data = await getTargets();
    setTargets(data);
  };

  const handleSave = async () => {
    if (!inputText.trim()) {
      Alert.alert("Eits!", "Tulis targetmu dulu ya.");
      return;
    }

    if (editingId !== null) {
      await updateTargetTitle(editingId, inputText);
      setEditingId(null); 
    } else {
      await addTarget(inputText);
    }

    setInputText('');
    Keyboard.dismiss();
    loadData(); 
  };

  const startEditing = (item: any) => {
    setInputText(item.title); 
    setEditingId(item.id);    
  };

  const cancelEditing = () => {
    setInputText('');
    setEditingId(null);
    Keyboard.dismiss();
  };

  const handleToggle = async (id: number, currentStatus: number) => {
    await toggleTargetStatus(id, currentStatus);
    loadData();
  };

  const handleDelete = (id: number) => {
    if (editingId === id) cancelEditing();

    Alert.alert("Hapus?", "Yakin target ini mau dihapus?", [
      { text: "Batal" },
      { 
        text: "Hapus", 
        style: "destructive", 
        onPress: async () => {
          await deleteTarget(id);
          loadData();
        } 
      }
    ]);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isDone = item.isCompleted === 1;
    const isEditing = editingId === item.id;

    return (
      <View style={[
        styles.card, 
        isDone && styles.cardDone,
        isEditing && styles.cardEditing 
      ]}>
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => handleToggle(item.id, item.isCompleted)}
        >
          <Ionicons 
            name={isDone ? "checkbox" : "square-outline"} 
            size={24} 
            color={isDone ? "#27ae60" : "#95a5a6"} 
          />
        </TouchableOpacity>

        <View style={styles.textContainer}>
          <Text style={[styles.itemText, isDone && styles.textDone]}>
            {item.title}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => startEditing(item)} style={styles.iconBtn}>
            <Ionicons name="pencil" size={20} color="#3498db" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ResponsiveContainer maxWidth={600}>
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F8" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(main)/profile')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Target Belajar</Text>
      </View>

      <FlatList
        data={targets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={60} color="#ddd" />
            <Text style={styles.emptyText}>Belum ada target. Tambah yuk!</Text>
          </View>
        }
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={editingId ? "Edit target kamu..." : "Tulis target baru..."}
            value={inputText}
            onChangeText={setInputText}
          />
          
          {editingId !== null && (
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelEditing}>
              <Ionicons name="close" size={24} color="#e74c3c" />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.addBtn, editingId !== null && styles.updateBtn]} 
            onPress={handleSave}
          >
            <Ionicons 
              name={editingId !== null ? "checkmark" : "add"} 
              size={28} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F8' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 30,
    backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
  
  listContent: { padding: 20, paddingBottom: 100 },
  
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    padding: 15, borderRadius: 12, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    borderWidth: 1, borderColor: 'transparent'
  },
  cardDone: { backgroundColor: '#F9F9F9', opacity: 0.6 },
  cardEditing: { borderColor: '#3498db', backgroundColor: '#ebf5fb' }, 
  
  checkboxContainer: { marginRight: 15 },
  textContainer: { flex: 1 },
  itemText: { fontSize: 16, color: '#2C3E50' },
  textDone: { textDecorationLine: 'line-through', color: '#aaa' },
  
  actionButtons: { flexDirection: 'row' },
  iconBtn: { padding: 8, marginLeft: 5 },

  inputWrapper: {
    flexDirection: 'row', padding: 15, backgroundColor: 'white',
    borderTopWidth: 1, borderTopColor: '#eee', paddingBottom: 30, alignItems: 'center'
  },
  input: {
    flex: 1, backgroundColor: '#F2F4F8', borderRadius: 25,
    paddingHorizontal: 20, height: 60, fontSize: 16, marginRight: 10
  },
  addBtn: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#2C3E50',
    justifyContent: 'center', alignItems: 'center'
  },
  updateBtn: {
    backgroundColor: '#3498db'
  },
  cancelBtn: {
    marginRight: 10, padding: 5
  },

  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: '#aaa', fontSize: 16 }
});