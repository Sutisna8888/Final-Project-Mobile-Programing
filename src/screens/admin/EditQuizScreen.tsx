import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert, KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';
import { getQuestionDetail, updateQuestion } from '../../services/adminService';

export default function EditQuizScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  const [difficulty, setDifficulty] = useState('easy');
  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');

  useEffect(() => {
    loadOldData();
  }, [id]);

  const loadOldData = async () => {
    try {
      const data = await getQuestionDetail(id as string);
      if (data) {
        setQuestionText(data.question);
        setOptA(data.options[0] || '');
        setOptB(data.options[1] || '');
        setOptC(data.options[2] || '');
        setOptD(data.options[3] || '');
        setCorrectAnswer(data.correctAnswer);
        setDifficulty(data.difficulty || 'easy'); 
      } else {
        Alert.alert("Error", "Soal tidak ditemukan.");
        router.back();
      }
    } catch (error) {
      Alert.alert("Error", "Gagal mengambil data soal.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (txt: string) => txt === correctAnswer && txt !== '';

  const handleUpdate = async () => {
    if (!questionText || !optA || !optB || !optC || !optD) {
      Alert.alert("Eits!", "Semua kolom harus diisi.");
      return;
    }
    if (!correctAnswer) {
      Alert.alert("Lupa!", "Pilih kunci jawaban dulu.");
      return;
    }

    const options = [optA, optB, optC, optD];
    if (!options.includes(correctAnswer)) {
      Alert.alert("Perhatian", "Teks opsi berubah. Silakan klik ulang tombol bulat jawaban benar.");
      return;
    }

    setSaving(true);
    try {
      await updateQuestion(
        id as string,
        questionText,
        options,
        correctAnswer,
        difficulty,
      );
      Alert.alert("Sukses", "Soal berhasil diperbarui!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Gagal", "Terjadi kesalahan sistem.");
    } finally {
      setSaving(false);
    }
  };


  const LevelBtn = ({ lvl, color }: { lvl: string, color: string }) => (
    <TouchableOpacity 
      style={[styles.levelBtn, { backgroundColor: difficulty === lvl ? color : 'white', borderColor: color }]}
      onPress={() => setDifficulty(lvl)}
    >
      <Text style={{ color: difficulty === lvl ? 'white' : color, fontWeight: 'bold' }}>{lvl.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2196F3" />
    </View>
  );

  return (

    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={{flex: 1}}
    >
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Soal</Text>
          <View style={{width: 24}} /> 
        </View>

        <ScrollView 
          contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          <Text style={styles.label}>Tingkat Kesulitan</Text>
          <View style={{flexDirection: 'row', gap: 10, marginBottom: 20}}>
             <LevelBtn lvl="easy" color="#4CAF50" />
             <LevelBtn lvl="medium" color="#FF9800" />
             <LevelBtn lvl="hard" color="#F44336" />
          </View>


          <Text style={styles.label}>Pertanyaan</Text>
          <TextInput 
            style={[styles.input, {height: 130, textAlignVertical: 'top', padding: 15}]} 
            placeholder="Tulis pertanyaan di sini..." 
            multiline 
            value={questionText} 
            onChangeText={setQuestionText}
          />
          
          <Text style={styles.instruction}>
             Isi opsi, lalu <Text style={{fontWeight:'bold', color:'#2196F3'}}>KLIK TOMBOL BULAT</Text> untuk kunci jawaban.
          </Text>


          <View style={styles.optionContainer}>
            {[
              { val: optA, set: setOptA, ph: 'Opsi A' },
              { val: optB, set: setOptB, ph: 'Opsi B' },
              { val: optC, set: setOptC, ph: 'Opsi C' },
              { val: optD, set: setOptD, ph: 'Opsi D' },
            ].map((opt, idx) => (
              <View key={idx} style={styles.row}>
                <TouchableOpacity 
                  style={[styles.radio, isSelected(opt.val) && styles.radioActive]} 
                  onPress={() => setCorrectAnswer(opt.val)}
                />
                <TextInput 
                  style={styles.inputFlex} 
                  placeholder={opt.ph} 
                  value={opt.val} 
                  onChangeText={(t) => { 
                    opt.set(t); 
                    opt.set(t); 
                    if(isSelected(opt.val)) setCorrectAnswer(''); 
                  }}
                />
              </View>
            ))}
          </View>


          <TouchableOpacity style={styles.btnSave} onPress={handleUpdate} disabled={saving}>
            {saving ? (
               <ActivityIndicator color="white" />
            ) : (
               <Text style={styles.btnText}>Simpan Perubahan</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    padding: 20, paddingTop: 40, // Sedikit disesuaikan agar pas dengan offset
    backgroundColor: 'white', 
    elevation: 2, alignItems: 'center' 
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  

  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  instruction: { fontSize: 12, color: '#666', marginBottom: 10, marginTop: 10 },
  
  input: { 
    backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', 
    borderRadius: 10, padding: 15, fontSize: 13 
  },
  
  levelBtn: { flex: 1, padding: 10, borderWidth: 1, borderRadius: 15, alignItems: 'center' },
  

  optionContainer: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ccc' },
  radioActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  inputFlex: { 
    flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', 
    borderRadius: 10, padding: 12 
  },
  

  btnSave: { 
    backgroundColor: '#2196F3', padding: 15, borderRadius: 10, 
    alignItems: 'center', marginTop: 30 
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 15 }
});