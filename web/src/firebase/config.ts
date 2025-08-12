import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * IMPORTANT: Firebase Setup Instructions
 * 
 * To make Google authentication work, follow these steps:
 * 
 * 1. Go to https://console.firebase.google.com/ and create a new project
 * 2. In the Firebase console, go to Authentication > Sign-in method
 * 3. Enable Google as a sign-in provider
 * 4. Go to Project settings > General > Your apps > Web app
 * 5. Click "Register app" if you haven't already, or "Add app" if you have
 * 6. Copy the firebaseConfig object and replace the placeholder below
 * 7. Make sure to add your app's domain to the authorized domains list in Authentication settings
 */

// Load Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Verify environment variables are set
if (!process.env.REACT_APP_FIREBASE_API_KEY) {
  console.error('Firebase configuration is missing. Please check your .env file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;