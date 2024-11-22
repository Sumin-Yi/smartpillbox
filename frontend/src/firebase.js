import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD7-Dwlk_NOJ8OZnLPNjweK8RxYnEd-kYk",
    authDomain: "cs350-71cd2.firebaseapp.com",
    projectId: "cs350-71cd2",
    storageBucket: "cs350-71cd2.firebasestorage.app",
    messagingSenderId: "132559837219",
    appId: "1:132559837219:web:669eaa37dc2ad5c0603996",
    measurementId: "G-E55Y170MBK"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

export { auth };
