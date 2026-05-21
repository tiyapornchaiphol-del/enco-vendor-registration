# EnCo Vendor Registration - ข้อมูลสำหรับการใช้งานจริง

## 📊 สรุปเลือก Free Services ที่เหมาะสม

### ✅ แนะนำสำหรับเริ่มต้นฟรี

**Stack แนะนำ: Firebase (Complete)**
```
Frontend  → HTML/CSS/JS (Static)
Hosting   → Firebase Hosting (ฟรี)
Database  → Cloud Firestore (ฟรี 1GB storage)
Auth      → Firebase Auth (ฟรี)
API       → Cloud Functions (ฟรี 2M calls/month)
```

**ข้อดี:**
- All-in-one solution (ไม่ต้องตั้ง server เอง)
- Free tier เพียงพอสำหรับ MVP (Product Minimum Viable)
- HTTPS มาตรฐาน
- Auto-scaling
- Real-time database updates
- Simple deployment

---

## 🏗️ สถาปัตยกรรมปัจจุบัน vs ที่ต้องเปลี่ยน

### ปัจจุบัน (Frontend-only)
```
Browser
  ├─ HTML/CSS/JS
  └─ Hardcoded Demo Data (SUBMISSIONS, ANNOUNCEMENTS)
```

**ปัญหา:** ข้อมูลหาย เมื่อ reload, ไม่สามารถแชร์ข้อมูล between users

### ต้องเปลี่ยนเป็น (Frontend + Backend)
```
Browser (Vendor/Admin)
  ↓
Frontend (React - Static HTML/JS)
  ↓
Backend API (Node.js/Express)
  ↓
Database (Firebase/Supabase)
```

---

## 💾 ตัวเลือก Database + Hosting

### ตัวเลือก 1: **Firebase (แนะนำมากที่สุด)** ⭐
| สิ่งที่ | Free Limit | ราคาเมื่อเกิน |
|------|----------|----------|
| Cloud Firestore | 1GB storage, 50K reads/day | $0.06 per 100K reads |
| Cloud Functions | 2M invocations/month | $0.40 per 1M calls |
| Hosting | 1GB storage, 10GB bandwidth/month | $0.15 per GB |
| Auth (Users) | ไม่จำกัด | ไม่มีค่าใช้อื่นๆ |
| SSL/HTTPS | ✅ | ✅ |

**เหมาะสำหรับ:**
- Website ที่มีผู้ใช้ 100-1000 คน/เดือน
- Form submissions <1000/เดือน
- Team ขนาดเล็ก (ไม่ต้องระหว่าง server)

**เริ่มต้น:**
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

---

### ตัวเลือก 2: **Supabase (PostgreSQL)** ⭐⭐
| สิ่งที่ | Free Limit | 
|------|----------|
| Database | 500MB, 2 projects | 
| Auth (Users) | ไม่จำกัด |
| Edge Functions | 1M invocations/month |
| File Storage | 1GB |
| Hosting | ❌ (ต้องใช้ Vercel/Netlify) |

**เหมาะสำหรับ:**
- ต้องการ SQL database (ปกติกว่า Firestore)
- Developers ที่คุ้นเคย PostgreSQL

**ต้องจับ:** ต้อง deploy API และ Frontend แยกต่างหาก

---

### ตัวเลือก 3: **Railway + MongoDB** 💥
| สิ่งที่ | Free Limit |
|------|----------|
| Hosting (Railway) | $5/month credits (ฟรี forever) |
| MongoDB Atlas | 512MB storage ฟรี |
| Bandwidth | ไม่จำกัด |

**ข้อดี:** โปรแกรมเมอร์ (full control)
**ข้อเสีย:** ต้อง code Node.js backend เอง

---

## 🎯 โครงการแนะนำ: Firebase Full Stack

### ขั้นตอน Deployment

#### 1. **สร้าง Firebase Project**
```
1. ไปที่ https://console.firebase.google.com/
2. Create New Project → "EnCo-Vendor-Registration"
3. Enable Firestore Database
4. Enable Authentication (Email/Password)
5. Set up Hosting
```

#### 2. **โครงสร้าง Firestore Collections**

```
firestore/
├── announcements/
│   └── [docId]
│       ├── id: "AVL-1/2569"
│       ├── title: "ประกาศที่ 1/2569"
│       ├── description: "..."
│       ├── status: "open|closed"
│       └── createdAt: timestamp
│
├── vendors/
│   └── [uid - from Firebase Auth]
│       ├── email: "contact@safeguard.co.th"
│       ├── password: hashed (Firebase handles)
│       ├── company: "เซฟการ์ด ซีเคียวริตี้ จำกัด"
│       └── submittedAt: timestamp
│
├── submissions/
│   └── [docId]
│       ├── id: "AVL-26-0142"
│       ├── vendorId: "uid"
│       ├── annoId: "AVL-1/2569"
│       ├── company: "..."
│       ├── taxId: "..."
│       ├── status: "new|review|approved|rejected"
│       └── ... (ฟิลด์อื่นๆ)
│
├── docRequests/
│   └── [docId]
│       ├── submissionId: "AVL-26-0142"
│       ├── items: [
│       │   {
│       │     id: "...",
│       │     name: "...",
│       │     desc: "...",
│       │     deadline: "...",
│       │     requestedAt: timestamp,
│       │     uploadedFiles: ["path/to/file1", ...]
│       │   }
│       │ ]
│       └── createdAt: timestamp
│
└── adminUsers/
    └── [uid]
        ├── email: "apha@enco.co.th"
        ├── name: "อาภา จันทร์"
        ├── role: "Procurement Admin"
        └── permissions: ["approve", "request-docs", ...]
```

#### 3. **Firebase Cloud Functions (API)**

```javascript
// functions/index.js - Simple API wrapper
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Get submissions
exports.getSubmissions = functions.https.onCall(async (data, context) => {
  const snapshot = await db.collection("submissions").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

// Create submission
exports.createSubmission = functions.https.onCall(async (data, context) => {
  const ref = await db.collection("submissions").add({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { id: ref.id };
});

// Export submissions to Excel
exports.exportSubmissions = functions.https.onCall(async (data, context) => {
  // Called from frontend, generates Excel and returns download URL
  // Uses Cloud Storage to save the file temporarily
});
```

#### 4. **Update Frontend (data.jsx)**

```javascript
// Replace hardcoded SUBMISSIONS with Firebase calls
const useData = () => {
  const [submissions, setSubmissions] = React.useState([]);
  const [announcements, setAnnouncements] = React.useState([]);

  React.useEffect(() => {
    // Load from Firestore
    firebase.firestore().collection("submissions")
      .onSnapshot(snapshot => {
        setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    
    firebase.firestore().collection("announcements")
      .onSnapshot(snapshot => {
        setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
  }, []);

  return { submissions, setSubmissions, announcements, setAnnouncements };
};
```

---

## 🚀 ขั้นตอน Deployment

### วิธี A: Firebase Hosting + Firestore (แนะนำ)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. สร้าง firebase.json ในโปรเจค
firebase init hosting

# 3. Deploy
firebase deploy
```

**ผลลัพธ์:**
```
Hosting URL: https://enco-vendor-registration.web.app
```

---

### วิธี B: Netlify + Firebase Firestore

```bash
# 1. สร้าง GitHub repository
git init
git add .
git commit -m "Initial commit"
git push origin main

# 2. Connect กับ Netlify
# Visit: https://app.netlify.com/
# Click "New site from Git"
# Select your GitHub repo
```

**ผลลัพธ์:**
```
Auto-deploy URL: https://[project-name].netlify.app
```

---

### วิธี C: Railway + Custom Backend + MongoDB

```bash
# 1. สร้าง Node.js backend
mkdir enco-backend
cd enco-backend
npm init -y
npm install express firebase-admin dotenv

# 2. Push to GitHub
git push

# 3. Connect Railway
# Visit: https://railway.app/
# Import from GitHub
# Set PORT env variable
```

---

## 📊 เปรียบเทียบ 3 วิธี

| | Firebase | Netlify + Firestore | Railway |
|---|---------|-----------------|---------|
| **Setup ความยาก** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Monthly Cost** | ฟรี (เริ่มต้น) | ฟรี (เริ่มต้น) | ฟรี ($5/mo credits) |
| **Auto-scale** | ✅ | ✅ | ✅ |
| **Database** | Firestore | Firestore | MongoDB |
| **Full Control** | ❌ | ❌ | ✅ |
| **Support** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 💡 ข้อแนะนำ: ใช้ Firebase ก่อน

**เหตุผล:**
1. ✅ No server code needed (ลดความซับซ้อน)
2. ✅ All-in-one (Database, Auth, Hosting, API)
3. ✅ Generous free tier
4. ✅ Documentation ดี
5. ✅ Real-time sync (ข้อมูลอัปเดตโดยอัตโนมัติ)

**ขั้นตอนเริ่มต้น:**
```
1. Create Firebase Project (5 นาที)
2. Setup Firestore & Auth (10 นาที)
3. Update Frontend Code (30 นาที)
4. Deploy (5 นาที)
→ ทั้งหมด ~1 ชั่วโมง
```

**ต้องสร้าง:**
- ✅ Firestore Collections Schema (ตามด้านบน)
- ✅ Firestore Security Rules (อนุญาต read/write)
- ✅ Frontend Firebase SDK integration

---

## 🔐 Security Considerations

### Firestore Security Rules (เริ่มต้น)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin only
    match /adminUsers/{uid} {
      allow read, write: if request.auth.uid == uid && 
                            hasRole(uid, 'admin');
    }
    
    // Vendors can read announcements, write own submissions
    match /submissions/{submissionId} {
      allow read: if request.auth.uid == resource.data.vendorId;
      allow write: if request.auth.uid == submissionId;
      allow read, write: if hasRole(request.auth.uid, 'admin');
    }
    
    // Helper function
    function hasRole(uid, role) {
      return get(/databases/$(database)/documents/adminUsers/$(uid)).data.role == role;
    }
  }
}
```

---

## 🎯 สรุปการดำเนิน

### Phase 1: Setup (1-2 สัปดาห์)
- [ ] สร้าง Firebase Project
- [ ] ออกแบบ Firestore schema
- [ ] Update Frontend code สำหรับ Firebase
- [ ] Set security rules
- [ ] Deploy to Firebase Hosting

### Phase 2: Testing & Refinement (1 สัปดาห์)
- [ ] Test ทั้ง flow (vendor + admin)
- [ ] Load testing
- [ ] Security audit

### Phase 3: Live (Going Live)
- [ ] Configure custom domain
- [ ] Set up monitoring
- [ ] Documentation สำหรับ users
- [ ] Soft launch (beta users)

---

## 📚 Resources

- Firebase: https://firebase.google.com/
- Firestore Pricing: https://firebase.google.com/pricing
- Firebase Docs: https://firebase.google.com/docs
- Netlify: https://netlify.com/
- Railway: https://railway.app/

---

**ข้อแนะนำ:** เริ่มด้วย Firebase ก่อน หากต้องการ control มากขึ้นในอนาคตสามารถ migrate ไป Railway + MongoDB ได้
