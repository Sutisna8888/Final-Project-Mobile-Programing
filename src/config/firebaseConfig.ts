import { initializeApp } from "firebase/app";

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  Auth,
  browserLocalPersistence,
  getReactNativePersistence,
  initializeAuth
} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyDkubT5ovDWR5kkOucwb7vXMU8DfUTJfgI",
  authDomain: "simplequizapp-d3f72.firebaseapp.com",
  projectId: "simplequizapp-d3f72",
  storageBucket: "simplequizapp-d3f72.firebasestorage.app",
  messagingSenderId: "1002068454798",
  appId: "1:1002068454798:web:fd2f2939df73a8841cc8df"
};

const app = initializeApp(firebaseConfig);

let auth: Auth;

if (Platform.OS === 'web') {
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence
  });
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

const db = getFirestore(app);

export { auth, db };

