import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

// ==========================================
// TAHAP 2: TEMPEL KODE CONFIG DI BAWAH INI
// ==========================================
// 1. Buka console.firebase.google.com -> Project Settings -> General
// 2. Scroll ke bawah "Your Apps", pilih "Config"
// 3. Copy semua yang ada di dalam "const firebaseConfig = { ... }"
// 4. Paste GANTIKAN isi variabel di bawah ini:

const firebaseConfig = {
  apiKey: "AIzaSyAQj_7S1c8-lhZiRBVpQTnmo3l7PBwEUBY",
  authDomain: "absensi-smpn3-pacet.firebaseapp.com",
  projectId: "absensi-smpn3-pacet",
  storageBucket: "absensi-smpn3-pacet.firebasestorage.app",
  messagingSenderId: "433565489244",
  appId: "1:433565489244:web:0804fc71bfd8ab8cccae99"
};

// ==========================================
// JANGAN UBAH KODE DI BAWAH INI
// ==========================================

// Initialize Firebase only if config is valid (prevent crash on demo)
let app;
let db: any;

try {
  if (firebaseConfig.apiKey !== "ISI_API_KEY_DARI_FIREBASE") {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      console.log("Firebase initialized successfully");
  } else {
      console.warn("Firebase Config belum diisi. Menggunakan Data Lokal (Offline Mode).");
      db = null;
  }
} catch (e) {
  console.error("Firebase init error:", e);
  db = null;
}

export { db, doc, setDoc, getDoc, collection, getDocs };