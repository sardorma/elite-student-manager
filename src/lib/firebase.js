import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

// ── Sozlama: .env faylida VITE_FIREBASE_* ──────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export function isConfigured() {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
}

let app, auth, db;

function getApp() {
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

export function getAuth_() {
  if (!auth) auth = getAuth(getApp());
  return auth;
}

export function getDb() {
  if (!db) db = getFirestore(getApp());
  return db;
}

// ── Auth ──────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(getAuth_(), provider);
  // Profil yaratish / yangilash
  await ensureProfile(result.user);
  return result.user;
}

export async function signOut() {
  await fbSignOut(getAuth_());
}

export function onAuthChange(cb) {
  return onAuthStateChanged(getAuth_(), cb);
}

// ── Profile ───────────────────────────────────────────────────
async function ensureProfile(user) {
  const ref = doc(getDb(), 'profiles', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    // Birinchi marta kirdi — profil yarat
    const isFirst = await checkIfFirstUser();
    await setDoc(ref, {
      uid:        user.uid,
      email:      user.email,
      full_name:  user.displayName || '',
      avatar_url: user.photoURL || '',
      role:       isFirst ? 'admin' : 'viewer', // birinchi user — admin
      created_at: serverTimestamp(),
    });
  } else {
    // Avatar/ism yangilanishi mumkin
    await updateDoc(ref, {
      avatar_url: user.photoURL || '',
      full_name:  user.displayName || snap.data().full_name || '',
    });
  }
}

async function checkIfFirstUser() {
  const snap = await getDocs(collection(getDb(), 'profiles'));
  return snap.empty;
}

export async function getMyProfile(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(getDb(), 'profiles', uid));
  return snap.exists() ? snap.data() : null;
}

export async function getAllProfiles() {
  const snap = await getDocs(collection(getDb(), 'profiles'));
  return snap.docs.map(d => d.data());
}

export async function updateProfileRole(uid, role) {
  await updateDoc(doc(getDb(), 'profiles', uid), { role });
}

export async function updateProfileName(uid, full_name) {
  await updateDoc(doc(getDb(), 'profiles', uid), { full_name });
}

// ── Teacher-Group ruxsatlari ──────────────────────────────────
export async function getTeacherGroups(uid) {
  const snap = await getDoc(doc(getDb(), 'teacher_groups', uid));
  return snap.exists() ? (snap.data().groups || []) : [];
}

export async function setTeacherGroups(uid, groupIds) {
  await setDoc(doc(getDb(), 'teacher_groups', uid), { groups: groupIds });
}

export async function getAllTeacherGroups() {
  const snap = await getDocs(collection(getDb(), 'teacher_groups'));
  const result = [];
  snap.docs.forEach(d => {
    (d.data().groups || []).forEach(gid => {
      result.push({ teacher_id: d.id, group_id: gid });
    });
  });
  return result;
}

// ── Cloud save/load ────────────────────────────────────────────
export async function cloudSave(uid, payload) {
  await setDoc(doc(getDb(), 'esm_data', uid), {
    payload,
    updated_at: serverTimestamp(),
  });
}

export async function cloudLoad(uid) {
  const snap = await getDoc(doc(getDb(), 'esm_data', uid));
  return snap.exists() ? snap.data().payload : null;
}
