// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, EmailAuthProvider, deleteUser } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBubHqS9MJVkkZLBZVAXccaRHsbrMawY4U",
    authDomain: "film-application-76b49.firebaseapp.com",
    projectId: "film-application-76b49",
    storageBucket: "film-application-76b49.appspot.com",
    messagingSenderId: "80695682706",
    appId: "1:80695682706:web:b11f4aaf9ee888bb21684b",
    measurementId: "G-FZREP3WQN7"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new EmailAuthProvider();
export const db = getFirestore(app);
export { getAuth } from "firebase/auth";
;