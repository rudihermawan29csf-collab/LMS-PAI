import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

// ==========================================
// TAHAP 2: TEMPEL KODE CONFIG DI BAWAH INI
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
// KODE INISIALISASI ROBUST (ONLINE FIRST)
// ==========================================

let app;
let db: any;

try {
// Cek apakah config masih default atau sudah diisi
if (firebaseConfig.apiKey !== "ISI_API_KEY_DARI_FIREBASE") {
app = initializeApp(firebaseConfig);
// Inisialisasi Firestore Standard (Online First)
// Menghapus persistence offline yang agresif untuk menghindari konflik sinkronisasi data
db = getFirestore(app);

console.log("Firebase initialized successfully (Online Mode)");
} else {
console.warn("Firebase Config belum diisi. Aplikasi berjalan dalam Mode Offline (Data tidak tersimpan ke server).");
db = null;
}
} catch (e) {
console.error("Firebase init error:", e);
db = null;
}

export { db, doc, setDoc, getDoc, collection, getDocs, deleteDoc };