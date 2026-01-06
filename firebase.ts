import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  initializeFirestore
} from 'firebase/firestore';

// ==========================================
// KONFIGURASI FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAQj_7S1c8-lhZiRBVpQTnmo3l7PBwEUBY",
  authDomain: "absensi-smpn3-pacet.firebaseapp.com",
  projectId: "absensi-smpn3-pacet",
  storageBucket: "absensi-smpn3-pacet.firebasestorage.app",
  messagingSenderId: "433565489244",
  appId: "1:433565489244:web:0804fc71bfd8ab8cccae99"
};

// ==========================================
// INISIALISASI
// ==========================================

let app;
let db: any;

try {
  // Cek sederhana untuk memastikan config bukan template kosong
  if (firebaseConfig.apiKey !== "ISI_API_KEY_DARI_FIREBASE") {
      app = initializeApp(firebaseConfig);
      
      // PERBAIKAN: Menggunakan initializeFirestore dengan experimentalForceLongPolling: true
      // Ini mengatasi error "Could not reach Cloud Firestore backend" (code=unavailable)
      // yang sering terjadi di jaringan tertentu atau lingkungan pengembangan yang memblokir WebSocket.
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });

      console.log("Firebase initialized successfully (Online Mode Active with Long Polling)");
  } else {
      console.warn("Firebase Config belum diisi dengan benar.");
      db = null;
  }
} catch (e) {
  console.error("Firebase init error:", e);
  db = null;
}

export { db, doc, setDoc, getDoc, collection, getDocs, deleteDoc };