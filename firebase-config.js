// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgOygFs3LLGMAHYcdFblcd483dWiD_q88",
  authDomain: "point-exchange-a3453.firebaseapp.com",
  projectId: "point-exchange-a3453",
  storageBucket: "point-exchange-a3453.firebasestorage.app",
  messagingSenderId: "468773370693",
  appId: "1:468773370693:web:b1a0fd46de62ad623edc2c",
  measurementId: "G-25NKQKEJ41"
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const firebaseAuth = firebase.auth();
const firebaseDB = firebase.firestore();

// Export for use in app
window.firebaseAuth = firebaseAuth;
window.firebaseDB = firebaseDB;
