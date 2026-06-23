import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCpq_p7sAxLLVE89XhjJC1iOghQP92UBhQ",
  authDomain: "pensieve-readingmind.firebaseapp.com",
  projectId: "pensieve-readingmind",
  storageBucket: "pensieve-readingmind.firebasestorage.app",
  messagingSenderId: "419824585358",
  appId: "1:419824585358:web:1bd35ad1f260414a2d57df",
  measurementId: "G-TXHSS4VMNY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
