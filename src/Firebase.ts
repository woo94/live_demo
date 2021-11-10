// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAq8m6iaEEsWzOA2FKPyf-K2Mw4WRb4vxI",
  authDomain: "nextlearning-505ce.firebaseapp.com",
  databaseURL: "https://nextlearning-505ce-library.firebaseio.com/",
  projectId: "nextlearning-505ce",
  storageBucket: "nextlearning-505ce.appspot.com",
  messagingSenderId: "997722786305",
  appId: "1:997722786305:web:4e5b7c7363724f24278e00",
  measurementId: "G-XEG13R91P1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);