import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';


export const saveScore = async (userId: string, categoryId: string, score: number) => {
  try {
    await addDoc(collection(db, 'scores'), {
      userId: userId,
      categoryId: categoryId,
      score: score,
      playedAt: new Date()
    });
  } catch (error) {
    console.error("Error saving score:", error);

  }
};