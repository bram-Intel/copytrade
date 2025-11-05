import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration
// You'll need to replace these with your own Firebase project credentials
// Get them from: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "AIzaSyDJbl5TC81DP2KW0ZCnS3TOokZs7xbDxgY",
  authDomain: "cryp-df62b.firebaseapp.com",
  projectId: "cryp-df62b",
  storageBucket: "cryp-df62b.firebasestorage.app",
  messagingSenderId: "1094961984891",
  appId: "1:1094961984891:web:2ca1b2006c6f80119f79de"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
