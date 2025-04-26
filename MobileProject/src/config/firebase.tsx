// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcw3q_G86WknHW6Ui8qOcgWBqym0SlvnY",
  authDomain: "reactnativeproject-b2be5.firebaseapp.com",
  projectId: "reactnativeproject-b2be5",
  storageBucket: "reactnativeproject-b2be5.firebasestorage.app",
  messagingSenderId: "483657737995",
  appId: "1:483657737995:web:f05b6e22871bbb667f640e",
  measurementId: "G-T3FF6SRZ92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});