// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQ9L_z3_jjSh9-wy64qpnPxjijDIyAQwM",
  authDomain: "yeurecords-d4d94.firebaseapp.com",
  projectId: "yeurecords-d4d94",
  storageBucket: "yeurecords-d4d94",
  messagingSenderId: "34802948878",
  appId: "1:34802948878:web:f2d6c625202aa229d6955f",
  measurementId: "G-DNF12N9SSJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Google and Facebook Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Export the necessary functions and variables
export { auth, googleProvider, facebookProvider, signInWithPopup };
