// Firebase Configuration & Initialization
// ⚠️ Replace with your actual Firebase config from https://console.firebase.google.com/

const firebaseConfig = {
  apiKey: "AIzaSyAlYGdqPdsSa2dujrAdYTmgQJ8yh2z3pHQ",
  authDomain: "enco-vendor-registration.firebaseapp.com",
  projectId: "enco-vendor-registration",
  storageBucket: "enco-vendor-registration.firebasestorage.app",
  messagingSenderId: "387967443409",
  appId: "1:387967443409:web:187f4547eea3ac8fec00f0",
  measurementId: "G-VMW47W3GTV"
};

// Initialize Firebase (loaded via CDN in index.html)
// window.firebase is available from CDN
function initFirebase() {
  if (!window.firebase) {
    console.error("Firebase SDK not loaded. Add to index.html:");
    console.error('<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"></script>');
    return false;
  }

  try {
    const app = firebase.initializeApp(firebaseConfig);
    window.firebaseApp = app;
    window.firebaseDb = firebase.firestore(app);
    window.firebaseAuth = firebase.auth(app);
    window.firebaseStorage = firebase.storage(app);
    return true;
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return false;
  }
}

// Helper Functions
function getDb() {
  if (!window.firebaseDb) initFirebase();
  return window.firebaseDb;
}

function getAuth() {
  if (!window.firebaseAuth) initFirebase();
  return window.firebaseAuth;
}

function getStorage() {
  if (!window.firebaseStorage) initFirebase();
  return window.firebaseStorage;
}

// ─── Collection Helpers ───

// Get all submissions
async function getSubmissions(annoId = null) {
  const db = getDb();
  let query = db.collection("submissions");

  if (annoId && annoId !== "all") {
    query = query.where("annoId", "==", annoId);
  }

  const snapshot = await query.orderBy("submittedAt", "desc").get();
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    _id: doc.id
  }));
}

// Get single submission
async function getSubmission(id) {
  const db = getDb();
  const doc = await db.collection("submissions").doc(id).get();
  return doc.exists ? { ...doc.data(), _id: doc.id } : null;
}

// Create submission
async function createSubmission(data) {
  const db = getDb();
  const docRef = await db.collection("submissions").add({
    ...data,
    submittedAt: new Date().toLocaleString("th-TH"),
    status: "new",
    completeness: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return docRef.id;
}

// Update submission
async function updateSubmission(id, data) {
  const db = getDb();
  await db.collection("submissions").doc(id).update({
    ...data,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// Delete submission
async function deleteSubmission(id) {
  const db = getDb();
  await db.collection("submissions").doc(id).delete();
}

// ─── Get Announcements ───
async function getAnnouncements() {
  const db = getDb();
  const snapshot = await db.collection("announcements").orderBy("createdAt", "desc").get();
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    _id: doc.id
  }));
}

// ─── Get Categories ───
async function getCategories() {
  const db = getDb();
  const snapshot = await db.collection("categories").get();
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    _id: doc.id
  }));
}

// ─── Upload File ───
async function uploadFile(submissionId, requestId, file) {
  const storage = getStorage();
  const path = `submissions/${submissionId}/docRequests/${requestId}/${Date.now()}_${file.name}`;
  const ref = storage.ref(path);

  try {
    await ref.put(file);
    const url = await ref.getDownloadURL();
    return { path, url, filename: file.name };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

// ─── Auth Helpers ───
async function loginAdmin(email, password) {
  const auth = getAuth();
  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    const adminDoc = await getDb().collection("adminUsers").doc(result.user.uid).get();
    if (!adminDoc.exists) throw new Error("Not an admin user");
    return result.user;
  } catch (error) {
    throw new Error("ไม่สามารถเข้าสู่ระบบได้: " + error.message);
  }
}

async function logoutAdmin() {
  const auth = getAuth();
  await auth.signOut();
}

// ─── Initialize on page load ───
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFirebase);
} else {
  initFirebase();
}

Object.assign(window, {
  initFirebase,
  getDb, getAuth, getStorage,
  getSubmissions, getSubmission, createSubmission, updateSubmission, deleteSubmission,
  getAnnouncements, getCategories,
  uploadFile,
  loginAdmin, logoutAdmin
});
