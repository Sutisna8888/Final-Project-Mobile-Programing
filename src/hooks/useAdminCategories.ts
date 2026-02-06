import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { addCategory, deleteCategory, fetchCategories } from '../services/categoryService';
import { Category } from '../types';

export const useAdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);


  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      Alert.alert("Error", "Gagal memuat kategori.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const handleAdd = async (name: string, icon: string) => {
    if (!name.trim()) {
      Alert.alert("Eits!", "Nama kategori tidak boleh kosong.");
      return;
    }
    try {
      await addCategory(name, icon);
      Alert.alert("Sukses", "Kategori berhasil ditambahkan!");
      loadData();
    } catch (error) {
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan.");
    }
  };


  const handleDelete = (id: string) => {
    Alert.alert(
      "Hapus Kategori?",
      "Semua soal di dalam kategori ini mungkin akan kehilangan induknya.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(id);
              loadData();
            } catch (error) {
              Alert.alert("Error", "Gagal menghapus.");
            }
          }
        }
      ]
    );
  };

  return { categories, loading, handleAdd, handleDelete, refresh: loadData };
};