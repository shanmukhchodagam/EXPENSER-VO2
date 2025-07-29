import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// TODO: Replace with your Firebase project configuration
// Get these values from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyDummyApiKey123456789abcdefghijklmnop", // TODO: Replace with your API key
  authDomain: "expenser-app-12345.firebaseapp.com", // TODO: Replace with your auth domain
  projectId: "expenser-app-12345", // TODO: Replace with your project ID
  storageBucket: "expenser-app-12345.appspot.com", // TODO: Replace with your storage bucket
  messagingSenderId: "123456789012", // TODO: Replace with your messaging sender ID
  appId: "1:123456789012:web:abcdef123456789012345", // TODO: Replace with your app ID
  // measurementId: "G-XXXXXXXXXX" // TODO: Add if you're using Google Analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };
export default app;