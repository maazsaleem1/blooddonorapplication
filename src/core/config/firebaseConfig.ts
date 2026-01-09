/**
 * Firebase Configuration
 * Initialize and configure Firebase services
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBL2BoH4mPZDgLLSA6YAzc6npVScVjMuqo",
    authDomain: "authapp-2af47.firebaseapp.com",
    projectId: "authapp-2af47",
    storageBucket: "authapp-2af47.firebasestorage.app",
    messagingSenderId: "672647980338",
    appId: "1:672647980338:web:db0392c226fdbbfd5b632b",
    measurementId: "G-S765Q91P4W"
};

// Initialize Firebase App (only if not already initialized)
let app: FirebaseApp;
const existingApps = getApps();

if (existingApps.length === 0) {
    console.log('🔥 [firebaseConfig] Initializing Firebase App...');
    app = initializeApp(firebaseConfig);
    console.log('✅ [firebaseConfig] Firebase App initialized:', app.name);
} else {
    console.log('✅ [firebaseConfig] Using existing Firebase App');
    app = existingApps[0];
}

// Initialize Firebase Auth
// Note: For AsyncStorage persistence, you need to use initializeAuth with getReactNativePersistence
// But it requires Firebase v9+ with React Native support. For now, using getAuth.
// The warning about AsyncStorage is informational - auth will still work but won't persist between app restarts.
console.log('🔥 [firebaseConfig] Initializing Firebase Auth...');
export const auth: Auth = getAuth(app);
console.log('✅ [firebaseConfig] Firebase Auth initialized');
console.log('⚠️ [firebaseConfig] Note: Auth state persistence requires initializeAuth with AsyncStorage (see FIRESTORE_RULES.md)');

console.log('🔥 [firebaseConfig] Initializing Firestore...');
export const firestore: Firestore = getFirestore(app);
console.log('✅ [firebaseConfig] Firestore initialized');

console.log('🔥 [firebaseConfig] Initializing Storage...');
export const storage: FirebaseStorage = getStorage(app);
console.log('✅ [firebaseConfig] Storage initialized');

// Export initialization function (for compatibility)
export function initializeFirebase(): FirebaseApp {
    return app;
}

export default app;
