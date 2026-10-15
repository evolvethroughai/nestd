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

export function fbSignOut() {
  return signOut(auth);
}

export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export function getUserDocRef(uid: string) {
  return doc(db, 'users', uid, 'data', 'state');
}

export function syncToFirestore(uid: string, data: object) {
  const ref = getUserDocRef(uid);
  return setDoc(ref, { json: JSON.stringify(data) });
}

export function listenFirestore(uid: string, cb: (json: string) => void): Unsubscribe {
  const ref = getUserDocRef(uid);
  return onSnapshot(ref, (snap) => {
    if (snap.exists() && snap.data()?.json) {
      cb(snap.data()!.json as string);
    }
  });
}

export type { User };
