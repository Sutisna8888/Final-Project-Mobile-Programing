import ResponsiveContainer from '@/src/components/layout/ResponsiveContainer';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import AnimatedOption from '../../components/quiz/AnimatedOption';
import AnimatedProgressBar from '../../components/quiz/AnimatedProgressBar';
import { useQuizGame } from '../../hooks/useQuizGame';

export default function QuizScreen() {
  const router = useRouter();
  const { categoryId, difficulty } = useLocalSearchParams();
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false); 
  const [timeLeft, setTimeLeft] = useState(15); 


  const questionAnim = useRef(new Animated.Value(0)).current; 
  const timerScaleAnim = useRef(new Animated.Value(1)).current;

  const { 
    questionNow, 
    currentQuestionIndex, 
    totalQuestions, 
    loading, 
    score,        
    checkAnswer,  
    nextQuestion  
  } = useQuizGame(categoryId as string, difficulty as string);


  useEffect(() => {
    setSelectedOption(null);
    setIsChecked(false);
    setTimeLeft(15); 

    questionAnim.setValue(0);
    Animated.spring(questionAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true
    }).start();

  }, [currentQuestionIndex]);


  useEffect(() => {
    if (loading || isChecked) {
      timerScaleAnim.setValue(1);
      return; 
    }

    if (timeLeft === 0) {
      setIsChecked(true); 
      return;
    }


    if (timeLeft <= 5) {
      Animated.sequence([
        Animated.timing(timerScaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(timerScaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isChecked, loading]);

  const handleMainButtonPress = () => {
    if (!isChecked) {
      if (!selectedOption) {
        Alert.alert("Ups!", "Pilih jawaban dulu ya.");
        return;
      }
      checkAnswer(selectedOption); 
      setIsChecked(true);          
    } else {
      nextQuestion();
    }
  };

  const handleExitQuiz = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm("Keluar Kuis? Progresmu akan hilang.");
      if (confirm) {
        router.back();
      }
      return;
    }

    Alert.alert("Keluar Kuis?", "Progresmu akan hilang.", [
      { text: "Batal", style: "cancel" },
      { 
        text: "Keluar", 
        style: "destructive", 
        onPress: () => router.back() 
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#26C6DA" />
        <Text style={{marginTop: 15, color: '#26C6DA', fontWeight: 'bold'}}>Menyiapkan Soal...</Text>
      </View>
    );
  }

  if (!questionNow) return null;

  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const getTimerColor = () => {
    if (timeLeft > 5) return '#26C6DA'; 
    if (timeLeft > 3) return '#FFA726'; 
    return '#EF5350'; 
  };

  const timerColor = getTimerColor();

  return (
    <ResponsiveContainer maxWidth={800}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#EAF6F6" />
        

        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleExitQuiz}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>


          <View style={{ flex: 1, marginHorizontal: 15 }}>
             <AnimatedProgressBar progress={progressPercent} />
          </View>

          <View style={styles.scoreBadge}>
             <Ionicons name="trophy" size={14} color="#FFA726" />
             <Text style={styles.scoreBadgeText}>{score}</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.timerWrapper}>
             <Animated.View style={[
               styles.timerCircle, 
               { 
                 borderColor: timerColor, 
                 shadowColor: timerColor,
                 transform: [{ scale: timerScaleAnim }]
               }
             ]}>
                <Text style={[styles.timerLabel, { color: timerColor }]}>DETIK</Text>
                <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}</Text> 
             </Animated.View>
          </View>


          <Animated.View style={{
            opacity: questionAnim,
            transform: [{
              translateY: questionAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }}>
            <View style={styles.questionCard}>
               <Text style={styles.questionText}>{questionNow.question}</Text>
            </View>
            
            <View style={styles.optionsContainer}>
              {questionNow.options.map((option, index) => {

                let status: 'idle' | 'selected' | 'correct' | 'wrong' = 'idle';

                if (isChecked) {
                  if (option === questionNow.correctAnswer) status = 'correct';
                  else if (selectedOption === option) status = 'wrong';
                } else {
                  if (selectedOption === option) status = 'selected';
                }
                

                return (
                  <AnimatedOption
                    key={index}
                    label={option}
                    status={status}
                    onPress={() => !isChecked && setSelectedOption(option)}
                    disabled={isChecked}
                  />
                );
              })}
            </View>
          </Animated.View>

        </ScrollView> 
        
        <View style={styles.footer}>
           <TouchableOpacity 
             style={[
               styles.mainButton, 
               (!selectedOption && !isChecked) && styles.disabledButton,
               isChecked && styles.continueButton 
              ]} 
             onPress={handleMainButtonPress}
             disabled={!selectedOption && !isChecked}
           >
              <Text style={styles.mainButtonText}>
                {isChecked ? "Lanjut Soal Berikutnya" : "Periksa Jawaban"}
              </Text>
              {isChecked && <Ionicons name="arrow-forward" size={20} color="white" style={{marginLeft: 10}} />}
           </TouchableOpacity>
        </View>

      </View>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF6F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EAF6F6' },

  header: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10,
    backgroundColor: '#EAF6F6', zIndex: 10 
  },
  closeBtn: { padding: 8, backgroundColor: 'white', borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  

  
  scoreBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2
  },
  scoreBadgeText: { fontWeight: 'bold', color: '#333' },

  scrollContent: { padding: 20, paddingBottom: 120 },

  timerWrapper: { alignItems: 'center', marginBottom: 20 },
  timerCircle: {
    width: 60, height: 60, borderRadius: 30, borderWidth: 4, 
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'white',
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
  },
  timerLabel: { fontSize: 10, fontWeight: 'bold', marginBottom: -2 },
  timerText: { fontSize: 14, fontWeight: 'bold' },

  questionCard: {
    backgroundColor: '#D1F2F9', borderRadius: 20, padding: 15, minHeight: 180,
    justifyContent: 'center', alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#B2EBF2'
  },
  questionText: { fontSize: 15, fontWeight: 'bold', color: '#006064', textAlign: 'center', lineHeight: 28 },

  optionsContainer: { gap: 0 },
  


  footer: { 
    position: 'absolute', 
    bottom: 0, left: 0, right: 0, 
    padding: 20, 
    paddingBottom: 30, 
    backgroundColor: 'transparent'
  },
  
  mainButton: {
    backgroundColor: '#26C6DA', paddingVertical: 13, borderRadius: 30,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
    shadowColor: '#26C6DA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  continueButton: { backgroundColor: '#FFA726', shadowColor: '#FFA726' },
  disabledButton: { backgroundColor: '#B0BEC5', shadowOpacity: 0 },
  mainButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 }
});