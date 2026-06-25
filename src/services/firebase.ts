import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, type Auth, type User } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase singleton — init lazy.
 * Config đọc từ env (VITE_FIREBASE_*). Tham khảo .env.example.
 */

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

const getConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const getFirebaseApp = (): FirebaseApp => {
  if (_app) return _app;
  const cfg = getConfig();
  if (!cfg.apiKey || !cfg.projectId) {
    throw new Error(
      '[services/firebase] Thiếu env VITE_FIREBASE_*. Xem .env.example.',
    );
  }
  _app = initializeApp(cfg);
  return _app;
};

export const getFirebaseAuth = (): Auth => {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
};

export const getDb = (): Firestore => {
  if (_db) return _db;
  _db = getFirestore(getFirebaseApp());
  return _db;
};

/**
 * Ensure có user đã đăng nhập (anonymous nếu chưa). Trả về uid.
 * Dùng cho mọi flow lưu game — userId là khoá Firestore path.
 */
export const ensureSignedIn = async (): Promise<User> => {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return auth.currentUser;

  const cred = await signInAnonymously(auth);
  return cred.user;
};
