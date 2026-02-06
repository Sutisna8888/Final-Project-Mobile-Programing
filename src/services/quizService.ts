import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { Question } from '../types';

export const fetchQuestionsByCategory = async (
  categoryId: string,
  difficulty?: string
): Promise<Question[]> => {
  try {
    let q;

    if (difficulty) {
      q = query(
        collection(db, 'quizzes'),
        where('categoryId', '==', categoryId),
        where('difficulty', '==', difficulty)
      );
    } else {
      q = query(
        collection(db, 'quizzes'),
        where('categoryId', '==', categoryId)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Question));
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

export const finishQuiz = async (
  userId: string,
  categoryId: string,
  difficulty: string,
  score: number
) => {
  try {
    await addDoc(collection(db, 'scores'), {
      userId,
      categoryId,
      difficulty,
      score,
      playedAt: new Date()
    });

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    let userData = userDoc.data();
    if (!userDoc.exists()) {
      const currentUser = auth.currentUser;
      const initialData = {
        email: currentUser?.email || 'user@app.com',
        displayName: currentUser?.displayName || currentUser?.email?.split('@')[0],
        role: 'user',
        scores: {}
      };

      await setDoc(userRef, initialData);
      userData = initialData;
    }

    const currentScores = userData?.scores || {};

    const uniqueKey = `${categoryId}_${difficulty}`;

    const oldBestScore = currentScores[uniqueKey] || 0;
    if (score > oldBestScore) {
      await updateDoc(userRef, {
        [`scores.${uniqueKey}`]: score
      });

      return { status: 'new_record', oldScore: oldBestScore };
    } else {
      return { status: 'no_record', oldScore: oldBestScore };
    }

  } catch (error) {
    console.error("Gagal menyimpan hasil kuis:", error);
    throw error;
  }
};