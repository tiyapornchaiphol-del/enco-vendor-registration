# Firebase Setup Guide - EnCo Vendor Registration

## 📋 ขั้นตอน 1: สร้าง Firebase Project (5 นาที)

### 1.1 สร้าง Project
1. ไปที่ https://console.firebase.google.com/
2. Click **"+ Add project"** → ตั้งชื่อ "EnCo-Vendor-Registration"
3. Disable Google Analytics (สำหรับตอนนี้)
4. Click **"Create project"** → รอเล็กน้อย

### 1.2 ดึง Firebase Config
1. ไปที่ **Project Settings** (gear icon)
2. ไปที่ tab **"Your apps"** 
3. Click **"</>"** (Web app icon)
4. ตั้งชื่อ "EnCo Web App"
5. Copy ทั้ง config object:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123...:web:abc..."
};
```

### 1.3 Update firebase-config.jsx
แก้ไขไฟล์ `firebase-config.jsx` โดยแทนที่ค่า YOUR_API_KEY เป็นค่าจริง:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",  // ← ใส่ค่าจริง
  authDomain: "...",
  // ... etc
};
```

---

## 📚 ขั้นตอน 2: Setup Firestore Database (10 นาที)

### 2.1 Enable Firestore
1. ใน Firebase Console, ไปที่ **Firestore Database**
2. Click **"Create database"**
3. เลือก region **asia-southeast1** (Bangkok)
4. เลือก **"Start in test mode"** (สำหรับเริ่มต้น)
5. Click **"Create"**

### 2.2 Import Security Rules
1. ไปที่ **Rules** tab ใน Firestore
2. Replace ทั้งหมดด้วยเนื้อหาจาก `firestore.rules` ไฟล์
3. Click **"Publish"**

### 2.3 สร้าง Initial Collections
เพิ่มข้อมูลเริ่มต้นผ่าน Firebase Console:

#### เก็บ `categories` (ประเภทงาน)
```
Collection: categories
Documents:
  - id: "sec" → { name: "งานรักษาความปลอดภัย", ... }
  - id: "clean" → { name: "งานทำความสะอาด", ... }
  - id: "consultant" → { name: "งานให้คำปรึกษา", ... }
```

#### เก็บ `announcements` (ประกาศ)
```
Collection: announcements
Documents:
  - id: "AVL-1/2569" → {
      title: "ประกาศที่ 1/2569 - บริการรักษาความปลอดภัย",
      description: "...",
      status: "open",
      deadline: "2025-12-31",
      createdAt: timestamp,
      ...
    }
```

#### เก็บ `adminUsers` (ผู้ดูแลระบบ)
```
Collection: adminUsers
Documents:
  - id: "[Firebase UID]" → {
      email: "apha@enco.co.th",
      name: "อาภา จันทร์",
      role: "Procurement Admin",
      permissions: ["approve", "request-docs", ...],
      createdAt: timestamp
    }
```

---

## 🔐 ขั้นตอน 3: Setup Firebase Authentication (5 นาที)

### 3.1 Enable Email/Password Auth
1. ไปที่ **Authentication** 
2. Click **"Get started"** → เลือก **Email/Password**
3. Enable **Email/Password** authentication
4. Click **"Save"**

### 3.2 สร้าง Admin Account
1. ไปที่ **Users** tab
2. Click **"Add user"** → ใส่:
   - Email: `apha@enco.co.th`
   - Password: (ใจดี 6+ ตัวอักษร)
3. Click **"Add user"**
4. จดบันทึก UID (จะใช้สำหรับ adminUsers collection)

### 3.3 เพิ่มเข้า adminUsers Collection
1. ไปที่ Firestore Console
2. สร้าง document ใน `adminUsers` collection
3. ตั้ง document ID เป็น **UID ที่ได้จากข้อ 3.2**
4. เพิ่ม fields:
```json
{
  "email": "apha@enco.co.th",
  "name": "อาภา จันทร์",
  "role": "Procurement Admin",
  "permissions": ["approve", "request-docs", "manage-announcements", "manage-groups", "manage-users"]
}
```

---

## 💾 ขั้นตอน 4: Setup Cloud Storage (สำหรับ File Uploads)

### 4.1 Enable Cloud Storage
1. ไปที่ **Storage**
2. Click **"Get started"**
3. เลือก region **asia-southeast1**
4. เลือก **"Start in test mode"** (ต่อมาแก้ rules)
5. Click **"Create"**

### 4.2 Update Storage Rules
1. ไปที่ **Rules** tab
2. Replace ด้วย:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /submissions/{submissionId=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🌐 ขั้นตอน 5: Update index.html (เพิ่ม Firebase SDK)

เพิ่ม Firebase scripts ลงใน `<head>` ก่อนไฟล์อื่นๆ:

```html
<!-- Firebase -->
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js"></script>

<!-- Then your JSX files -->
<script type="text/babel" src="firebase-config.jsx"></script>
<script type="text/babel" src="tweaks-panel.jsx"></script>
<!-- ... rest of scripts ... -->
```

---

## ✅ ขั้นตอน 6: ทดสอบ Local

```bash
# Start local server
cd "D:\EnCo Vendor Registration"
npx http-server -p 3000 -c-1

# Open browser
# http://localhost:3000
```

ตรวจสอบใน browser console:
```javascript
// ถ้า Firebase loaded ถูกต้อง
window.firebaseDb // Should be defined
window.firebaseAuth // Should be defined

// ลอง query
getAnnouncements().then(console.log)
```

---

## 🚀 ขั้นตอน 7: Deploy to Firebase Hosting

### 7.1 Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 7.2 Login
```bash
firebase login
# → สั่งให้เปิด browser เพื่อ authorize
```

### 7.3 Initialize Firebase Project (ทำครั้งเดียว)
```bash
cd "D:\EnCo Vendor Registration"
firebase init

# ตอบคำถาม:
# ? Which Firebase features do you want to set up for this directory?
#   → เลือก "Hosting" และ "Firestore"
# ? Select a default Firebase project for this directory?
#   → เลือก "EnCo-Vendor-Registration"
# ? What do you want to use as your public directory?
#   → ตอบ "." (current directory)
# ? Configure as a single-page app?
#   → ตอบ "Yes"
```

### 7.4 Deploy
```bash
firebase deploy
```

**ผลลัพธ์:**
```
Hosting URL: https://enco-vendor-registration.web.app
```

---

## 🎯 ตรวจสอบหลังจาก Deploy

1. ไปที่ hosting URL
2. ลองใช้งาน (Vendor form, Admin login, etc.)
3. ตรวจสอบ Firestore ว่าข้อมูลบันทึกถูกต้อง

---

## 🔍 การแก้ไขปัญหา

### ❌ "Firebase is not defined"
**วิธีแก้:** ตรวจสอบว่า Firebase CDN scripts ถูกเพิ่มใน index.html ก่อน firebase-config.jsx

### ❌ "Permission denied" errors
**วิธีแก้:** ตรวจสอบ Firestore rules ว่า publish ถูกต้อง

### ❌ "File upload not working"
**วิธีแก้:** ตรวจสอบว่า Cloud Storage enable และ rules updated

### ❌ Admin login ไม่ได้
**วิธีแก้:** 
1. ตรวจสอบ UID ใน adminUsers collection ตรงกับ Firebase Auth UID
2. ตรวจสอบว่า Authentication enable และสร้าง user ถูกต้อง

---

## 📊 Monitoring & Cost

### ดูการใช้งาน
1. Firebase Console → **Usage** section
2. ดูการใช้ Firestore reads/writes/storage

### Free Tier Limit
```
Firestore: 50,000 reads/day ≈ 690 form submissions/month
Storage:   1GB free
Bandwidth: 10GB/month free
```

หากเกิน โปรแกรมไม่หยุด แต่คิดค่าใช้งาน (ราคาถูก)

---

## 🎓 ความรู้เพิ่มเติม

### Firestore Console Tips
- ⚡ **Realtime Updates:** collection หรือ document อัปเดต → browser update อัตโนมัติ
- 🔐 **Security Rules:** test ด้วยการเปลี่ยน rules และดู log errors
- 📈 **Indexes:** ถ้า query slow Firebase จะแสนนำ auto-index

### Cost Optimization (ต่อมา)
1. Enable **Firestore Backup**
2. ตั้ง **Data TTL** สำหรับ old submissions
3. Compress images before upload

---

## 📞 Support

- Firebase Docs: https://firebase.google.com/docs
- Firestore Guide: https://firebase.google.com/docs/firestore
- Auth Guide: https://firebase.google.com/docs/auth/web/start
- Storage Guide: https://firebase.google.com/docs/storage/web/start
