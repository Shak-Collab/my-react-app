import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyATKmS41vgZNKgWGgk5e3Mmh-EmKa9V2Vw",
  authDomain: "social-001-458b1.firebaseapp.com",
  projectId: "social-001-458b1",
  storageBucket: "social-001-458b1.firebasestorage.app",
  messagingSenderId: "958104249275",
  appId: "1:958104249275:web:dba765c5c489966d299a9e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);