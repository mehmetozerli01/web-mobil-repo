// Firebase Web SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAcw3q_G86WknHW6Ui8qOcgWBqym0SlvnY",
    authDomain: "reactnativeproject-b2be5.firebaseapp.com",
    projectId: "reactnativeproject-b2be5",
    storageBucket: "reactnativeproject-b2be5.appspot.com",
    messagingSenderId: "483657737995",
    appId: "1:483657737995:web:f05b6e22871bbb667f640e",
    measurementId: "G-T3FF6SRZ92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
