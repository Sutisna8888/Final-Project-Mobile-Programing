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
  apiKey: "xxxxxxxxxxx",
  authDomain: "xxxxxxxxxxx",
  projectId: "xxxxxxxx",
  storageBucket: "xxxxxxxxx",
  messagingSenderId: "xxxxxxxx",
  appId: "xxxxxxxxx"
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

