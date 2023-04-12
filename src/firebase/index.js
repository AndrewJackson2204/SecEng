// Import the Firebase modules
import { initializeApp } from 'firebase/app';
import { getFirestore,collection } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'

// Configure Firebase
const firebaseConfig = {
  // Replace with your Firebase configuration details
        authDomain: "edu-ctf.firebaseapp.com",
        projectId: "edu-ctf",
        storageBucket: "edu-ctf.appspot.com",
        messagingSenderId: "1012482569735",
        appId: "1:1012482569735:web:17d309c51fc02e6112dca2",
        measurementId: "G-VXMEKBKEW2",
        apiKey: "AIzaSyBOMTXbN-e59y2izFzARPsLVm2Drt7g1y8",
};

initializeApp(firebaseConfig)

// used for the firestore refs
const db = getFirestore()

const auth = getAuth()

// here we can export reusable database references
const challengesRef = collection(db, 'challenges')

export { auth, db, challengesRef }

