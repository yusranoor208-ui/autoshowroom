// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';



const firebaseConfig = {
     apiKey: "AIzaSyC0yTsoPOo-OpTBA4V5XgGLsmXcR2OwqmA",
  authDomain: "autoshowmanagment.firebaseapp.com",
  projectId: "autoshowmanagment",
  storageBucket: "autoshowmanagment.firebasestorage.app",
  messagingSenderId: "629185516493",
  appId: "1:629185516493:web:02c4b550304016a1772a84",
  measurementId: "G-0N3BQ2C4RQ"
  };

// Initialize Firebase
try {
  var  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}
// const app = initializeApp(firebaseConfig);

// Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };