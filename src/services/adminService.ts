import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Question } from '../types';


export const addQuestion = async (
  categoryId: string,
  question: string,
  options: string[],
  correctAnswer: string,
  difficulty: string
) => {
  try {

    await addDoc(collection(db, 'quizzes'), {
      categoryId,
      question,
      options,
      correctAnswer,
      difficulty,
      createdAt: new Date()
    });

    const categoryRef = doc(db, 'categories', categoryId);
    await updateDoc(categoryRef, {
      questionCount: increment(1)
    });

  } catch (error) {
    console.error("Error adding question:", error);
    throw error;
  }
};


export const deleteQuestion = async (questionId: string) => {
  try {

    const questionRef = doc(db, 'quizzes', questionId);
    const questionSnap = await getDoc(questionRef);

    if (questionSnap.exists()) {
      const questionData = questionSnap.data();
      const categoryId = questionData.categoryId;


      await deleteDoc(questionRef);


      if (categoryId) {
        const categoryRef = doc(db, 'categories', categoryId);
        await updateDoc(categoryRef, {
          questionCount: increment(-1)
        });
      }
    }
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};


export const fetchAdminQuestions = async (categoryId: string): Promise<Question[]> => {
  try {
    const q = query(collection(db, 'quizzes'), where('categoryId', '==', categoryId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Question));
  } catch (error) {
    console.error("Error fetchAdminQuestions:", error);
    throw error;
  }
};

export const getQuestionDetail = async (questionId: string): Promise<Question | null> => {
  try {
    const docRef = doc(db, 'quizzes', questionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Question;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getQuestionDetail:", error);
    throw error;
  }
};

export const updateQuestion = async (
  questionId: string,
  questionText: string,
  options: string[],
  correctAnswer: string,
  difficulty: string
) => {
  try {
    const docRef = doc(db, 'quizzes', questionId);
    await updateDoc(docRef, {
      question: questionText,
      options: options,
      correctAnswer: correctAnswer,
      difficulty: difficulty,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updateQuestion:", error);
    throw error;
  }
};