
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Category } from '../types';


export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category));
  } catch (error) {
    console.error("Error fetchCategories:", error);
    throw error;
  }
};


export const addCategory = async (name: string, icon: string = 'cube') => {
  try {
    await addDoc(collection(db, 'categories'), {
      name: name,
      icon: icon,
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Error addCategory:", error);
    throw error;
  }
};


export const deleteCategory = async (categoryId: string) => {
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (error) {
    console.error("Error deleteCategory:", error);
    throw error;
  }
};