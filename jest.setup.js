try {
  jest.mock('expo/src/winter/installGlobal', () => ({ installGlobal: jest.fn() }));
  jest.mock('expo/src/winter/runtime.native', () => ({}));
} catch (e) {}

import 'react-native-gesture-handler/jestSetup';

jest.mock('expo-modules-core', () => {
  const actual = jest.requireActual('expo-modules-core');
  return {
    ...actual,
    EventEmitter: jest.fn().mockImplementation(() => ({
      addListener: jest.fn(),
      removeSubscription: jest.fn(),
    })),
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: '123' } })),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('./src/config/firebaseConfig', () => ({
  auth: {},
  db: {},
}));
const originalConsoleError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) return;
  originalConsoleError(...args);
};