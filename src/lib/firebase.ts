import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
  connectedEmail?: string;
}

// Your web app's Firebase configuration
export const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyAPbxCv1rkcDX-3NFErXNBUx0ilJcw3rp4",
  authDomain: "steak11-2fa2a.firebaseapp.com",
  projectId: "steak11-2fa2a",
  storageBucket: "steak11-2fa2a.firebasestorage.app",
  messagingSenderId: "529741743252",
  appId: "1:529741743252:web:d5072c854ad58c0528e081",
  firestoreDatabaseId: "(default)",
  connectedEmail: "steaksatusatu.11@gmail.com"
};

export const PROVISIONED_CONFIG: FirebaseConfig = firebaseConfig;

export const getEffectiveFirebaseConfig = (): FirebaseConfig => firebaseConfig;
export const saveStoredFirebaseConfig = (_config: FirebaseConfig) => {};

// Initialize Firebase
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export const initFirebase = () => ({ app, db, auth });
export const getAuthInstance = (): Auth => auth;
export const getDb = (): Firestore => db;
export const isFirebaseConfigured = (): boolean => true;

export default app;



