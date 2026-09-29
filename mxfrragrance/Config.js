/**
 * Project: mxfrragrance
 * Created: 2026/05/14 19:33
 * Author: Scarra Luba
 */

import {initializeApp} from "firebase/app";
import {
    getAuth,
    setPersistence,
    browserSessionPersistence,
    GoogleAuthProvider
} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

/* =========================================================
 * FIREBASE CONFIG
 * ========================================================= */

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

/* =========================================================
 * INIT APP
 * ========================================================= */

const app = initializeApp(firebaseConfig, "mx-storefront");

/* =========================================================
 * SERVICES
 * ========================================================= */

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

setPersistence(auth, browserSessionPersistence).then(r => {});

export default app;