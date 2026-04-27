import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC8fwtjpQEEUNDdy1bKZECPDmTMcvAvR3g",
  authDomain: "crisiscontrol-af243.firebaseapp.com",
  projectId: "crisiscontrol-af243",
  storageBucket: "crisiscontrol-af243.firebasestorage.app",
  messagingSenderId: "229900325795",
  appId: "1:229900325795:web:0a0c8735f126d958f64016",
  measurementId: "G-PDTRLCG7J1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
