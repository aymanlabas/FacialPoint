import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBih6rHgsh_iu6sNCsNHNtIb_Wpt0j9cXE",
  authDomain: "app-pointage-e3abd.firebaseapp.com",
  databaseURL: "https://app-pointage-e3abd-default-rtdb.firebaseio.com",
  projectId: "app-pointage-e3abd",
  storageBucket: "app-pointage-e3abd.firebasestorage.app",
  messagingSenderId: "651077053093",
  appId: "1:651077053093:web:870d488ddad4ee43593b4c",
  measurementId: "G-9XKVLLWN18"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
