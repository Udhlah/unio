// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA4he1ToOWZyNW4gNBvl5QBAELJcUyai6o",
    authDomain: "mega-1df5e.firebaseapp.com",
    projectId: "mega-1df5e",
    storageBucket: "mega-1df5e.firebasestorage.app",
    messagingSenderId: "555903627580",
    appId: "1:555903627580:web:f63180c493a0d3e326ae39",
    measurementId: "G-33FYFTG2G8"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
