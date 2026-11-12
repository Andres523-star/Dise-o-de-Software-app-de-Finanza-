// ===== CONEXIÓN A FIREBASE (DEFINITIVA) - Código JS =====
// (Los scripts de Firebase CDN se cargan en el HTML)
const firebaseConfig = {
  apiKey: "AIzaSyDY8LTbU5bwUJHhp3xmSe0ru0UV4siuTmA",
  authDomain: "mis-finanzas-app-2d508.firebaseapp.com",
  projectId: "mis-finanzas-app-2d508",
  storageBucket: "mis-finanzas-app-2d508.firebasestorage.app",
  messagingSenderId: "93452152715",
  appId: "1:93452152715:web:f57900f5caeb2aaa07898e",
  measurementId: "G-3C1H4X4717"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
try { db.enablePersistence({ synchronizeTabs: true }).catch(function() {}); } catch (e) {}

