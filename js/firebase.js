// firebase.js - Auth + Firestore sync
var firebaseConfig = {
  apiKey: "AIzaSyDh-aig27YhJAofS9SdXQjET-NgLDJmQ20",
  authDomain: "nestd---get-sortd.firebaseapp.com",
  projectId: "nestd---get-sortd",
  storageBucket: "nestd---get-sortd.firebasestorage.app",
  messagingSenderId: "1099502069188",
  appId: "1:1099502069188:web:46e1264540d49bda543091"
};

firebase.initializeApp(firebaseConfig);
var _auth = firebase.auth();
var _db = firebase.firestore();

function fbSignIn() {
  var provider = new firebase.auth.GoogleAuthProvider();
  _auth.signInWithPopup(provider).catch(function(e){ toast('Sign-in failed: ' + e.message); });
}
function fbSignOut() {
  _auth.signOut().then(function(){ toast('Signed out'); });
}

_auth.onAuthStateChanged(function(user) {
  var btn = document.getElementById('fb-signin-btn');
  if (user) {
    if (btn) { btn.textContent = user.displayName ? user.displayName.split(' ')[0] + ' ↩' : 'Sign out'; btn.onclick = fbSignOut; }
    dbDoc = _db.collection('users').doc(user.uid).collection('data').doc('state');
    dbDoc.get().then(function(snap) {
      if (snap.exists && snap.data().json) {
        var remote = JSON.parse(snap.data().json);
        // merge: remote wins if it has a newer day key
        if (!st.day || remote.day >= st.day) {
          st = migrate(remote);
          try { localStorage.setItem('jt-v5', JSON.stringify(st)); } catch(e) {}
        }
      } else {
        // first time — push local data up
        dbDoc.set({ json: JSON.stringify(st) }).catch(function(){});
      }
      if (typeof renderAll === 'function') renderAll();
      toast('Synced ✓');
    }).catch(function(e){ toast('Sync error: ' + e.message); });
  } else {
    dbDoc = null;
    if (btn) { btn.textContent = '🔐 Sign in'; btn.onclick = fbSignIn; }
  }
});
