  // lib/firebase.ts
  import { initializeApp } from "firebase/app"
  import { getFirestore } from "firebase/firestore"
  import { getStorage } from 'firebase/storage'

  const firebaseConfig = {
    apiKey: "AIzaSyAt4YpMFa39eKiYI3skoUDke1n3XdwB0Vo",
  authDomain: "gorra-style.firebaseapp.com",
  projectId: "gorra-style",
  storageBucket: "gorra-style.firebasestorage.app",
  messagingSenderId: "246680920094",
  appId: "1:246680920094:web:186b6bbe7ed962223e4e0f",
  measurementId: "G-N8BJZL5F3C"
  }

  const app = initializeApp(firebaseConfig)
  export const db = getFirestore(app)
  import { getAuth } from 'firebase/auth'
  export const auth = getAuth(app)
  export const storage = getStorage(app)

