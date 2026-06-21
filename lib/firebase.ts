import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCdMQBKjbLOo-74-JeReyTUPskBarQrD4g",
  authDomain: "auditpro-c4647.firebaseapp.com",
  projectId: "auditpro-c4647",
  storageBucket: "auditpro-c4647.firebasestorage.app",
  messagingSenderId: "323297474329",
  appId: "1:323297474329:web:ceb93284c26407b3a7b788",
  measurementId: "G-75VZG66K11"
};

// 1. Initialize Firebase (Check muna kung na-initialize na para iwas error)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firestore
export const db = getFirestore(app);

// 3. Initialize Analytics na safe para sa Client/Server
export const analytics = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null) 
  : null;