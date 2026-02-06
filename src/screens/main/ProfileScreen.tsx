import ResponsiveContainer from '@/src/components/layout/ResponsiveContainer';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../../config/firebaseConfig';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    highScore: 0,
    rank: 'Newbie'
  });


  const calculateRank = (score: number) => {
    if (score >= 2000) return 'Grandmaster';
    if (score >= 1000) return 'Master';
    if (score >= 500) return 'Pro Player';
    if (score >= 100) return 'Apprentice';
    return 'Newbie';
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        let data;

        if (userDoc.exists()) {
          data = userDoc.data();
        } else {
          data = {
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0],
            role: 'user',
            scores: {} 
          };
          await setDoc(userRef, data);
        }

        setUserData(data);
        
        let totalScore = 0;
        const scoresMap = data.scores || {}; 

        Object.values(scoresMap).forEach((val) => {
          if (typeof val === 'number') {
            totalScore += val;
          }
        });

        const calculatedRank = calculateRank(totalScore);

        setStats({
          highScore: totalScore,
          rank: calculatedRank
        });
      }
    } catch (error) {
      console.log("Error fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm("Yakin ingin keluar aplikasi?");
      if (confirm) {
        await signOut(auth);
        router.replace('/(auth)/login');
      }
      return;
    }

    Alert.alert("Konfirmasi", "Yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  const MenuItem = ({ icon, label, onPress, isDestructive = false, showBadge = false }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconContainer, isDestructive && styles.destructiveIconBg]}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={isDestructive ? '#FF4757' : '#2C3E50'} 
        />
      </View>
      <View style={{flex: 1}}>
        <Text style={[styles.menuText, isDestructive && styles.destructiveText]}>{label}</Text>
      </View>
      {showBadge && <View style={styles.badgeDot} />}
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2C3E50" />
      </View>
    );
  }

  return (
    <ResponsiveContainer maxWidth={600}>
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
             <Image 
               source={{ uri: 'https://ui-avatars.com/api/?name=' + (userData?.displayName || 'User') + '&background=random&color=fff&size=128' }} 
               style={styles.avatar} 
             />
             <TouchableOpacity style={styles.editAvatarBtn}>
                <Ionicons name="camera" size={14} color="white" />
             </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{userData?.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{userData?.email}</Text>
          
          {userData?.role === 'admin' && (
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#FFD700" style={{marginRight: 4}}/>
              <Text style={styles.roleText}>Administrator</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
           <Ionicons name="trophy" size={28} color="#FFA502" />
           <Text style={styles.statValue}>{stats.highScore}</Text>
           <Text style={styles.statLabel}>Total Skor</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
           <Ionicons 
              name={stats.rank === 'Grandmaster' ? 'star' : stats.rank === 'Newbie' ? 'leaf' : 'ribbon'} 
              size={28} 
              color="#ff4757" 
           />
           <Text style={styles.statValue}>{stats.rank}</Text>
           <Text style={styles.statLabel}>Rank</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>Menu Utama</Text>
        
        {userData?.role === 'admin' && (
           <MenuItem 
             icon="grid-outline" 
             label="Dashboard Admin" 
             onPress={() => router.push('/(admin)/dashboard')} 
             showBadge={true}
           />
        )}

        <MenuItem 
          icon="person-outline" 
          label="Edit Profil" 
          onPress={() => router.push('/(main)/edit-profile' as any)} 
        />
        
        <MenuItem 
          icon="checkbox-outline" 
          label="Target Belajar" 
          onPress={() => router.push('/(main)/study-target' as any)} 
        />
        
        <MenuItem 
          icon="log-out-outline" 
          label="Keluar Aplikasi" 
          onPress={handleLogout} 
          isDestructive={true} 
        />
        
        <Text style={styles.versionText}>Versi Aplikasi 1.0.0 </Text>
      </ScrollView>
    </View>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    backgroundColor: '#2C3E50',
    paddingTop: 50,
    paddingBottom: 80, 
    alignItems: 'center',
  },
  headerContent: { alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 5 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: 'white' },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2196F3',
    width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'white'
  },
  userName: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 2 },
  userEmail: { fontSize: 14, color: '#BDC3C7', marginBottom: 10 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20
  },
  roleText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 30,
    marginTop: -60, 
    marginBottom: 15,
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1, shadowRadius: 5, elevation: 5,
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  statItem: { alignItems: 'center', width: '40%' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50', marginTop: 5 },
  statLabel: { fontSize: 12, color: '#95a5a6' },
  statDivider: { width: 1, height: '80%', backgroundColor: '#eee' },

  menuContainer: { padding: 5, paddingBottom: 50, marginTop: 10 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#95a5a6', marginBottom: 10, marginTop: 2, marginLeft: 5 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    padding: 10, borderRadius: 12, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2
  },
  menuIconContainer: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#F2F4F8',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  menuText: { fontSize: 15, color: '#2C3E50', fontWeight: '500' },
  destructiveIconBg: { backgroundColor: '#FFEBEE' },
  destructiveText: { color: '#FF4757' },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4757', marginRight: 10 },
  versionText: { textAlign: 'center', marginTop: 10, color: '#ccc', fontSize: 12 }
});