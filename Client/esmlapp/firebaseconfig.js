import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config
const firebaseConfig = {  
    apiKey: "AIzaSyCk8L-1E6h0-Yp11bqM3T83CUmeT8yaj9Y",
    authDomain: "sportsmate-1a81e.firebaseapp.com",
    projectId: "sportsmate-1a81e",
    storageBucket: "sportsmate-1a81e.firebasestorage.app",
    messagingSenderId: "366055990385",
    appId: "1:366055990385:web:7b5f54edf9f59916b9e7d0" 
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth and Firestore
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);

export { auth, db, firebaseConfig };
