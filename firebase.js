// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDICXou9A8ed5Wm53rziG9nW5XjHpEmuYQ",
  authDomain: "inventory-management-app-08.firebaseapp.com",
  projectId: "inventory-management-app-08",
  storageBucket: "inventory-management-app-08.appspot.com",
  messagingSenderId: "201128409520",
  appId: "1:201128409520:web:37577b7a66968bdad47e75",
  measurementId: "G-EZCVHE4W0S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app)
// const analytics = getAnalytics(app);

export { firestore, auth };