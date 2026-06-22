import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDPLACEHOLDER",
  authDomain: "pensieve-readingmind.firebaseapp.com",
  projectId: "pensieve-readingmind",
  storageBucket: "pensieve-readingmind.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:placeholder"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const functions = getFunctions(app);
