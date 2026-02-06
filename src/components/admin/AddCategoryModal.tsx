import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';

const AVAILABLE_ICONS = [
  'book', 'school', 'library', 'pencil', 'bookmark', 'easel', 'language',
  'flask', 'calculator', 'planet', 'rocket', 'magnet', 'telescope', 'stats-chart',
  'laptop', 'desktop', 'code', 'game-controller', 'phone-portrait', 'wifi', 'server',
  'color-palette', 'brush', 'musical-notes', 'mic', 'camera', 'film', 'headset',
  'football', 'basketball', 'tennisball', 'baseball', 'bicycle', 'trophy', 'medal',
  'globe', 'map', 'compass', 'airplane', 'car', 'bus', 'flag', 'boat',
  'leaf', 'flower', 'paw', 'rose', 'thunderstorm', 'water', 'flame',
  'medkit', 'fitness', 'heart', 'pulse', 'restaurant', 'cafe', 'pizza', 'nutrition',
  'briefcase', 'construct', 'diamond', 'star', 'time', 'warning', 'happy'
];

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, icon: string) => Promise<void>;
}

export default function AddCategoryModal({ visible, onClose, onSave }: AddCategoryModalProps) {
  const [newName, setNewName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('book');
  const [saving, setSaving] = useState(false);

  const { width } = useWindowDimensions();
  const isDesktop = width > 768; 

  const handleSave = async () => {
    if (!newName.trim()) return;
    
    setSaving(true);
    try {
      await onSave(newName, selectedIcon);
      setNewName('');
      setSelectedIcon('book');
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal 
      animationType={isDesktop ? "fade" : "slide"} 
      transparent={true} 
      visible={visible} 
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, isDesktop && styles.overlayDesktop]}>
        
        <View style={[styles.modalContent, isDesktop && styles.contentDesktop]}>
          
          {!isDesktop && <View style={styles.modalHandle} />}
          
          <Text style={styles.modalTitle}>Buat Kategori Baru</Text>
          
          <Text style={styles.label}>Nama Kategori</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Misal: Seni Budaya" 
            placeholderTextColor="#aaa" 
            value={newName} 
            onChangeText={setNewName}
          />
          
          <Text style={styles.label}>Pilih Ikon ({selectedIcon})</Text>
          <View style={styles.iconSelectorContainer}>
            <ScrollView 
              horizontal={false} 
              showsVerticalScrollIndicator={true}
              style={{ maxHeight: 200 }} 
            >
              <View style={styles.iconGrid}>
                {AVAILABLE_ICONS.map((icon) => (
                  <TouchableOpacity 
                    key={icon} 
                    style={[styles.iconOption, selectedIcon === icon && styles.iconSelected]} 
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Ionicons 
                      name={icon as any} 
                      size={24} 
                      color={selectedIcon === icon ? 'white' : '#666'} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          
          <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="white"/> 
            ) : (
              <Text style={styles.btnSaveText}>Simpan Sekarang</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
            <Text style={styles.btnCancelText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 25, 
    paddingBottom: 40, 
    maxHeight: '90%' 
  },


  overlayDesktop: {
    justifyContent: 'center', 
    alignItems: 'center',     
  },
  contentDesktop: {
    width: 500,               
    maxWidth: '90%',
    borderRadius: 20,         
    borderTopLeftRadius: 20,  
    borderTopRightRadius: 20, 
    paddingBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  modalHandle: { width: 50, height: 5, backgroundColor: '#eee', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 10, marginTop: 5 },
  input: { backgroundColor: '#F7F7F7', borderRadius: 15, padding: 18, fontSize: 16, color: '#333', marginBottom: 15 },
  
  iconSelectorContainer: { marginBottom: 25, borderWidth: 1, borderColor: '#eee', borderRadius: 15, padding: 5 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingVertical: 10 },
  iconOption: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F7F7F7', justifyContent: 'center', alignItems: 'center', margin: 5, borderWidth: 1, borderColor: 'transparent' },
  iconSelected: { backgroundColor: '#2C3E50', borderColor: '#2C3E50' },
  
  btnSave: { backgroundColor: '#2C3E50', borderRadius: 15, padding: 18, alignItems: 'center', marginBottom: 10 },
  btnSaveText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  btnCancel: { padding: 15, alignItems: 'center' },
  btnCancelText: { color: '#888', fontWeight: '600' },
});