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

// Wait for Firebase to load, then initialize
function initFirebase() {
  if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
    try {
      const firebaseApp = firebase.initializeApp(firebaseConfig);
      window.firebaseAuth = firebase.auth();
      window.firebaseDB = firebase.firestore();
      console.log('✅ Firebase initialized');
      return true;
    } catch (error) {
      console.error('Firebase init error:', error);
      return false;
    }
  } else if (firebase.apps.length > 0) {
    window.firebaseAuth = firebase.auth();
    window.firebaseDB = firebase.firestore();
    console.log('✅ Firebase already initialized');
    return true;
  }
  return false;
}

// Try to initialize immediately, or wait for Firebase SDK
if (typeof firebase === 'undefined') {
  // Firebase SDK not loaded yet, wait for it
  const waitForFirebase = setInterval(() => {
    if (typeof firebase !== 'undefined') {
      clearInterval(waitForFirebase);
      initFirebase();
    }
  }, 100);
} else {
  // Firebase SDK already loaded
  initFirebase();
}
