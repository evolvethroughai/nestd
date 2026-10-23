import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDh-aig27YhJAofS9SdXQjET-NgLDJmQ20',
  authDomain: 'nestd---get-sortd.firebaseapp.com',
  projectId: 'nestd---get-sortd',
  storageBucket: 'nestd---get-sortd.firebasestorage.app',
  messagingSenderId: '1099502069188',
  appId: '1:1099502069188:web:46e1264540d49bda543091',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export function fbSignIn() {
  return signInWithPopup(auth, googleProvider);
}

export function firebaseErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code || 'unknown';
  const messages: Record<string, string> = {
    'auth/unauthorized-domain': `Sign-in is not enabled for ${window.location.hostname}. Add this hostname in Firebase Authentication > Settings > Authorized domains.`,
    'auth/popup-blocked': 'Your browser blocked Google sign-in. Open Nestd directly in Chrome or Safari, allow popups for this site, then try again.',
    'auth/popup-closed-by-user': 'Google sign-in closed before finishing. Try again in Chrome or Safari if you opened Nestd inside another app or from a home-screen shortcut.',
    'auth/cancelled-popup-request': 'Another sign-in is already open. Finish that sign-in or try again.',
    'auth/web-storage-unsupported': 'This browser cannot store your sign-in session. Open Nestd in a regular Chrome or Safari tab.',
    'auth/operation-not-supported-in-this-environment': 'Open Nestd using its HTTPS website address in Chrome or Safari to sign in.',
    'auth/network-request-failed': 'Could not reach Google sign-in. Check your connection and try again.',
    'auth/operation-not-allowed': 'Google sign-in is disabled for this Firebase project. Enable Google in Authentication > Sign-in method.',
    'permission-denied': 'Cloud access was denied. Check this account\'s Firestore permissions.',
    'unavailable': 'Cloud storage is temporarily unavailable. Check your connection and try again.',
  };
  return `${messages[code] || 'Firebase could not complete the request.'} (${code})`;
}

export function fbSignOut() {
  return signOut(auth);
}

export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export function getUserDocRef(uid: string) {
  return doc(db, 'users', uid, 'data', 'state');
}

export function saveUserProfile(uid: string, profile: object) {
  return setDoc(doc(db, 'users', uid, 'data', 'profile'), profile);
}

export function listenUserProfile(uid: string, cb: (profile: Record<string, unknown> | null) => void, onError?: (error: Error) => void): Unsubscribe {
  return onSnapshot(doc(db, 'users', uid, 'data', 'profile'), (snap) => {
    cb(snap.exists() ? snap.data() : null);
  }, onError);
}

export function syncToFirestore(uid: string, data: object) {
  const ref = getUserDocRef(uid);
  return setDoc(ref, { json: JSON.stringify(data) });
}

export function listenFirestore(uid: string, cb: (json: string | null) => void, onError?: (error: Error) => void): Unsubscribe {
  const ref = getUserDocRef(uid);
  return onSnapshot(ref, (snap) => {
    if (snap.exists() && snap.data()?.json) {
      cb(snap.data()!.json as string);
    } else {
      cb(null);
    }
  }, onError);
}

export type { User };
