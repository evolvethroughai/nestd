// firebase.js - Auth + Firestore sync + Profile
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
var _fbUser = null;

function fbSignIn() {
  var provider = new firebase.auth.GoogleAuthProvider();
  _auth.signInWithPopup(provider).catch(function(e){ toast('Sign-in failed: ' + e.message); });
}
function fbSignOut() {
  _auth.signOut().then(function(){ toast('Signed out'); });
}

// --- Avatar helpers ---
function _getFirstName() {
  var name = (_fbProfile && _fbProfile.name) || (_fbUser && _fbUser.displayName) || '';
  return name.trim().split(' ')[0] || '';
}

var _fbProfile = null;

function _setAvatar(user, profile) {
  var btn = document.getElementById('profile-btn');
  var avEl = document.getElementById('profile-avatar');
  var avLg = document.getElementById('pd-avatar-lg');
  if (!btn || !avEl) return;
  var photoURL = user && user.photoURL;
  if (photoURL) {
    avEl.innerHTML = '<img src="' + photoURL + '" alt="">';
    if (avLg) avLg.innerHTML = '<img src="' + photoURL + '" alt="">';
  } else {
    var name = (profile && profile.name) || (user && user.displayName) || '';
    var initials = name ? name.trim().split(' ').map(function(w){return w[0];}).slice(0,2).join('').toUpperCase() : '👤';
    avEl.innerHTML = '<span class="p-initials">' + initials + '</span>';
    if (avLg) avLg.textContent = initials;
  }
}

function _updateDropdown(user, profile) {
  var nameEl = document.getElementById('pd-name');
  var emailEl = document.getElementById('pd-email');
  var signoutBtn = document.getElementById('pd-signout-btn');
  var signinBtn = document.getElementById('pd-signin-btn');
  var settingsBtn = document.getElementById('pd-settings-btn');
  if (user) {
    var displayName = (profile && profile.name) || user.displayName || '';
    if (nameEl) nameEl.textContent = displayName;
    if (emailEl) emailEl.textContent = user.email || '';
    if (signoutBtn) signoutBtn.hidden = false;
    if (signinBtn) signinBtn.hidden = true;
    if (settingsBtn) settingsBtn.hidden = false;
    _setAvatar(user, profile);
  } else {
    if (nameEl) nameEl.textContent = 'Not signed in';
    if (emailEl) emailEl.textContent = '';
    if (signoutBtn) signoutBtn.hidden = true;
    if (signinBtn) signinBtn.hidden = false;
    if (settingsBtn) settingsBtn.hidden = true;
    var avEl = document.getElementById('profile-avatar');
    if (avEl) avEl.innerHTML = '🔐';
    var avLg = document.getElementById('pd-avatar-lg');
    if (avLg) avLg.textContent = '🔐';
  }
}

// --- Profile dropdown ---
document.getElementById('profile-btn').onclick = function(e) {
  e.stopPropagation();
  document.getElementById('profile-drop').hidden = false;
};
document.getElementById('profile-drop').addEventListener('click', function(e) {
  if (e.target === this) this.hidden = true;
});
document.getElementById('pd-signin-btn').onclick = function() {
  document.getElementById('profile-drop').hidden = true;
  fbSignIn();
};
document.getElementById('pd-signout-btn').onclick = function() {
  document.getElementById('profile-drop').hidden = true;
  fbSignOut();
};
document.getElementById('pd-settings-btn').onclick = function() {
  document.getElementById('profile-drop').hidden = true;
  _openProfileSheet();
};
var _pdThemeBtn = document.getElementById('pd-theme-btn');
if (_pdThemeBtn) _pdThemeBtn.onclick = function() {
  document.getElementById('profile-drop').hidden = true;
  if (typeof toggleTheme === 'function') toggleTheme();
};

// --- Profile settings sheet ---
function _openProfileSheet() {
  if (!_fbUser) return;
  _db.collection('users').doc(_fbUser.uid).collection('data').doc('profile').get().then(function(snap) {
    var p = snap.exists ? snap.data() : {};
    document.getElementById('ps-name').value = p.name || _fbUser.displayName || '';
    document.getElementById('ps-gender').value = p.gender || '';
    document.getElementById('ps-dob').value = p.dob || '';
    document.getElementById('profile-sheet').hidden = false;
  });
}
document.getElementById('ps-cancel').onclick = function() {
  document.getElementById('profile-sheet').hidden = true;
};
document.getElementById('profile-sheet').addEventListener('click', function(e) {
  if (e.target === this) this.hidden = true;
});
document.getElementById('ps-save').onclick = function() {
  if (!_fbUser) return;
  var profile = {
    name: document.getElementById('ps-name').value.trim(),
    gender: document.getElementById('ps-gender').value,
    dob: document.getElementById('ps-dob').value
  };
  _db.collection('users').doc(_fbUser.uid).collection('data').doc('profile').set(profile).then(function() {
    document.getElementById('profile-sheet').hidden = true;
    _fbProfile = profile;
    _updateDropdown(_fbUser, profile);
    if (typeof renderAll === 'function') renderAll();
    toast('Profile saved ✓');
  }).catch(function(e){ toast('Error: ' + e.message); });
};

// --- Auth state ---
_auth.onAuthStateChanged(function(user) {
  _fbUser = user;
  if (user) {
    dbDoc = _db.collection('users').doc(user.uid).collection('data').doc('state');
    // Load profile first, then data
    _db.collection('users').doc(user.uid).collection('data').doc('profile').get().then(function(pSnap) {
      var profile = pSnap.exists ? pSnap.data() : {};
      _fbProfile = profile;
      _updateDropdown(user, profile);
      if (typeof renderAll === 'function') renderAll();
      dbDoc.onSnapshot(function(snap) {
        if (snap.exists && snap.data().json) {
          var remote = JSON.parse(snap.data().json);
          st = migrate(remote);
          try { localStorage.setItem('jt-v5', JSON.stringify(st)); } catch(e) {}
          if (typeof renderAll === 'function') renderAll();
        } else {
          // Nothing in Firestore yet — push local data up
          dbDoc.set({ json: JSON.stringify(st) }).catch(function(){});
        }
      }, function(e){ toast('Sync error: ' + e.message); });
      toast('Synced ✓');
    }).catch(function(e){ toast('Sync error: ' + e.message); });
  } else {
    dbDoc = null;
    _fbProfile = null;
    _updateDropdown(null, null);
    // Clear local state on sign out
    st = migrate(JSON.parse(JSON.stringify(SEED)));
    try { localStorage.removeItem('jt-v5'); } catch(e) {}
    if (typeof renderAll === 'function') renderAll();
  }
});
