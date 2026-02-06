import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';


let db: any = null;

if (Platform.OS !== 'web') {

  db = SQLite.openDatabaseSync('quizapp.db');
}


const WEB_KEY = 'quizapp_study_targets';

const getWebData = () => {
  if (typeof localStorage === 'undefined') return [];
  const json = localStorage.getItem(WEB_KEY);
  return json ? JSON.parse(json) : [];
};

const saveWebData = (data: any[]) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(WEB_KEY, JSON.stringify(data));
  }
};




export const initDatabase = async () => {
  if (Platform.OS === 'web') {

    console.log("Web Database initialized (LocalStorage)");
    return true;
  }

  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS study_targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        isCompleted INTEGER DEFAULT 0
      );
    `);
    console.log("SQLite Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Error init database:", error);
    return false;
  }
};


export const addTarget = async (title: string) => {
  if (Platform.OS === 'web') {
    const currentData = getWebData();
    const newItem = {
      id: Date.now(),
      title: title,
      isCompleted: 0
    };
    saveWebData([newItem, ...currentData]);
    return newItem;
  }

  try {
    const result = db.runSync(
      'INSERT INTO study_targets (title, isCompleted) VALUES (?, 0)',
      [title]
    );
    return result;
  } catch (error) {
    console.error("Error adding target:", error);
    throw error;
  }
};


export const getTargets = async () => {
  if (Platform.OS === 'web') {
    return getWebData();
  }

  try {
    const allRows = db.getAllSync('SELECT * FROM study_targets ORDER BY id DESC');
    return allRows;
  } catch (error) {
    console.error("Error getting targets:", error);
    return [];
  }
};


export const toggleTargetStatus = async (id: number, currentStatus: number) => {
  const newStatus = currentStatus === 1 ? 0 : 1;

  if (Platform.OS === 'web') {
    const currentData = getWebData();
    const updatedData = currentData.map((item: any) =>
      item.id === id ? { ...item, isCompleted: newStatus } : item
    );
    saveWebData(updatedData);
    return newStatus;
  }

  try {
    db.runSync(
      'UPDATE study_targets SET isCompleted = ? WHERE id = ?',
      [newStatus, id]
    );
    return newStatus;
  } catch (error) {
    console.error("Error toggling status:", error);
    throw error;
  }
};


export const updateTargetTitle = async (id: number, newTitle: string) => {
  if (Platform.OS === 'web') {
    const currentData = getWebData();
    const updatedData = currentData.map((item: any) =>
      item.id === id ? { ...item, title: newTitle } : item
    );
    saveWebData(updatedData);
    return true;
  }

  try {
    db.runSync(
      'UPDATE study_targets SET title = ? WHERE id = ?',
      [newTitle, id]
    );
    return true;
  } catch (error) {
    console.error("Error updating target title:", error);
    throw error;
  }
};


export const deleteTarget = async (id: number) => {
  if (Platform.OS === 'web') {
    const currentData = getWebData();
    const filteredData = currentData.filter((item: any) => item.id !== id);
    saveWebData(filteredData);
    return true;
  }

  try {
    db.runSync('DELETE FROM study_targets WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error("Error deleting target:", error);
    throw error;
  }
};