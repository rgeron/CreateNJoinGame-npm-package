// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxnWLMMpX9Ko8X0g04-jj2-oi8mfSYwVo",
  authDomain: "onlinegame-2a7e1.firebaseapp.com",
  projectId: "onlinegame-2a7e1",
  storageBucket: "onlinegame-2a7e1.appspot.com",
  messagingSenderId: "477579355530",
  appId: "1:477579355530:web:ef67a53002fb0c604fd473"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db}