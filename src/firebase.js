import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyAhf8zMZvL2eB8pt1sCVqZ2Cu4xkEivPuk",
  authDomain: "labs-crm-343d2.firebaseapp.com",
  projectId: "labs-crm-343d2",
  storageBucket: "labs-crm-343d2.firebasestorage.app",
  messagingSenderId: "206877057422",
  appId: "1:206877057422:web:00a6b147924759ad5044df",
  measurementId: "G-VN943QH74G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
