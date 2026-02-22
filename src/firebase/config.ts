import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDAfTUE6Q38V7Jff5Q-FtWvIe1IwCF72Ko",
  authDomain: "acdistropro.firebaseapp.com",
  projectId: "acdistropro",
  storageBucket: "acdistropro.firebasestorage.app",
  messagingSenderId: "872155744537",
  appId: "1:872155744537:web:992e1d0923273991f51d88",
  measurementId: "G-W2CTNN8PJ6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Analytics only if supported (not in all environments)
isSupported().then(yes => { if (yes) getAnalytics(app); }).catch(() => {});

export default app;
