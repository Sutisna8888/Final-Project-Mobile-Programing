import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { fetchQuestionsByCategory } from '../services/quizService';
import { Question } from '../types';

export const useQuizGame = (categoryId: string, difficulty: string) => {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGame();
  }, [categoryId, difficulty]);

  const loadGame = async () => {
    setLoading(true);
    try {
      const data = await fetchQuestionsByCategory(categoryId, difficulty);

      if (data.length === 0) {
        Alert.alert(
          "Maaf",
          "Belum ada soal untuk level ini.",
          [{ text: "Kembali", onPress: () => router.back() }]
        );
      } else {
        const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 10);
        setQuestions(shuffled);
      }
    } catch (error) {
      Alert.alert("Error", "Gagal memuat soal.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = (selectedOption: string) => {
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQ.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 10);
    }
    return isCorrect;
  };


  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setLoading(true);
    try {
      (router as any).replace({
        pathname: "/quiz/result",
        params: {
          score: score,
          totalQuestions: questions.length,
          categoryId: categoryId,
          difficulty: difficulty
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    currentQuestionIndex,
    loading,
    score,
    checkAnswer,
    nextQuestion,
    questionNow: questions[currentQuestionIndex],
    totalQuestions: questions.length
  };
};