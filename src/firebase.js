// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6XM8e7qC4b_ryBUyMaN_ps3O_H5H0YmI",
  authDomain: "real-time-shared-todo-list.firebaseapp.com",
  databaseURL: "https://real-time-shared-todo-list-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "real-time-shared-todo-list",
  storageBucket: "real-time-shared-todo-list.firebasestorage.app",
  messagingSenderId: "829571663841",
  appId: "1:829571663841:web:e8c27c0699c04ae064f4a0",
  measurementId: "G-SXXJBYCKVS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app); // kept for Firebase Analytics side-effects; the returned handle isn't used elsewhere

// Initialize Firestore and get a reference to the service
export const db = getDatabase(app);

// Auth: lets the app verify who someone really is via the custom token
// minted by the PHP backend, instead of trusting a raw ?userId= URL param.
export const auth = getAuth(app);

// Optional: Export the app instance if needed
export default app;