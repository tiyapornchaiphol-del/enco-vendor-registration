# ✅ Deployment Checklist - EnCo Vendor Registration

## Phase 1: Firebase Setup (Day 1-2)

### Google Account & Firebase Project
- [ ] มี Google Account
- [ ] สร้าง Firebase Project "EnCo-Vendor-Registration"
- [ ] Enable Firestore Database (asia-southeast1, test mode)
- [ ] Enable Authentication (Email/Password)
- [ ] Enable Cloud Storage (asia-southeast1, test mode)
- [ ] Enable Hosting
- [ ] Copy Firebase Config และ save ไว้

### firebase-config.jsx
- [ ] Download / Copy firebase config
- [ ] Update firebaseConfig ด้วยค่าจริง
- [ ] ตรวจสอบค่า: apiKey, authDomain, projectId, storageBucket
- [ ] Save ไฟล์

### index.html
- [ ] เพิ่ม Firebase SDK scripts ใน `<head>`
  ```html
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js"></script>
  ```
- [ ] เพิ่ม `<script type="text/babel" src="firebase-config.jsx"></script>` ก่อน tweaks-panel.jsx
- [ ] Save ไฟล์

### Firestore Security Rules
- [ ] Copy content จาก `firestore.rules` ไปยัง Firebase Console → Firestore → Rules
- [ ] Click "Publish"
- [ ] ตรวจสอบไม่มี errors

### Firestore Collections & Data
- [ ] สร้าง Collection: `categories`
  - [ ] Add documents สำหรับประเภทงาน (งานรักษาความปลอดภัย, etc.)
- [ ] สร้าง Collection: `announcements`
  - [ ] Add documents สำหรับประกาศ (AVL-1/2569, AVL-2/2569, etc.)
- [ ] สร้าง Collection: `submissions` (เว้นไว้ - จะถูกสร้างอัตโนมัติเมื่อ vendor submit)

### Firebase Authentication
- [ ] Enable Email/Password authentication
- [ ] สร้าง admin user ตัวแรก
  - Email: `apha@enco.co.th`
  - Password: (ใจดี 6+ ตัวอักษร)
  - [ ] Copy UID จาก Firebase Console
- [ ] สร้าง admin user เพิ่มเติม (ถ้ามี)
  - [ ] kitti@enco.co.th
  - [ ] napas@enco.co.th
  - [ ] manager@enco.co.th

### adminUsers Collection (Firestore)
- [ ] สร้าง Collection: `adminUsers`
- [ ] For each admin user:
  - [ ] Document ID = Firebase UID (จากขั้นตอนข้างบน)
  - [ ] Add fields:
    ```json
    {
      "email": "...",
      "name": "...",
      "role": "Procurement Admin / Reviewer / Super Admin",
      "permissions": ["approve", "request-docs", "manage-announcements", "manage-groups", "manage-users"]
    }
    ```

### Cloud Storage Rules
- [ ] ไปที่ Storage → Rules
- [ ] Replace ด้วย rules ที่อนุญาต authenticated users อัปโหลดได้
- [ ] Click "Publish"

---

## Phase 2: Local Testing (Day 2-3)

### Server Startup
- [ ] เปิด PowerShell / Terminal ใน project directory
- [ ] รัน: `npx http-server -p 3000 -c-1`
- [ ] ตรวจสอบ: http://localhost:3000 เปิดได้

### Browser Console Check
- [ ] เปิด Browser DevTools (F12)
- [ ] ไปที่ Console tab
- [ ] รัน command ต่อไปนี้:
  ```javascript
  window.firebaseDb        // should be defined
  window.firebaseAuth      // should be defined
  window.firebaseStorage   // should be defined
  ```
- [ ] ไม่ควรมี errors

### Firebase Connectivity
- [ ] รัน: `getAnnouncements().then(console.log)`
  - [ ] ไม่ควรมี "Permission denied" error
  - [ ] ควรแสดง announcements ที่เพิ่มไว้
- [ ] รัน: `getCategories().then(console.log)`
  - [ ] ควรแสดง categories

### Vendor Flow Test
- [ ] ไปที่ "Vendor Portal"
- [ ] Click "เลือกประกาศ"
- [ ] ใส่ข้อมูล Vendor (ชื่อบริษัท, โทร, etc.)
- [ ] Submit form
- [ ] ตรวจสอบ Firestore Console:
  - [ ] มี document ใหม่ใน submissions collection
  - [ ] ข้อมูลถูกต้อง

### Admin Flow Test
- [ ] Click "Admin Panel"
- [ ] Login ด้วย admin credentials
  - Email: apha@enco.co.th
  - Password: (ตามที่สร้างไว้)
- [ ] ตรวจสอบสามารถเห็น submissions
- [ ] ตรวจสอบสามารถ filter by announcement
- [ ] ทดสอบ "ขอเอกสารเพิ่ม" feature
- [ ] ทดสอบ Export to Excel

### File Upload Test
- [ ] ไปที่ admin submission detail
- [ ] Click "ขอเอกสารเพิ่ม"
- [ ] เพิ่มรายการเอกสาร (name, description, deadline)
- [ ] Switch ไป vendor account
- [ ] Upload file สำหรับแต่ละรายการ
- [ ] ตรวจสอบ Cloud Storage Console:
  - [ ] มี folder submissions/{submissionId}/docRequests/
  - [ ] มีไฟล์ที่อัปโหลด

### Responsive Design Test
- [ ] เปิด DevTools
- [ ] Toggle Device Toolbar (Ctrl+Shift+M)
- [ ] ทดสอบที่ viewport:
  - [ ] 1920x1080 (Desktop)
  - [ ] 1024x768 (Tablet)
  - [ ] 768x1024 (Tablet Portrait)
  - [ ] 480x800 (Mobile)
- [ ] ตรวจสอบ:
  - [ ] Hamburger menu ปรากฏใน mobile
  - [ ] Sidebar ซ่อน/แสดง ถูกต้อง
  - [ ] ปุ่มและ input อ่านได้

---

## Phase 3: Firebase Deployment (Day 3)

### Install Firebase CLI
- [ ] รัน: `npm install -g firebase-tools`
- [ ] ตรวจสอบ: `firebase --version` (ควรแสดง version)

### Firebase Login
- [ ] รัน: `firebase login`
- [ ] Browser เปิด → Click "Allow" ให้ Firebase CLI access
- [ ] ตรวจสอบ terminal: ควรแสดง "✔ Success!"

### Firebase Init
- [ ] รัน: `firebase init`
- [ ] เมื่อถามคำถาม:
  ```
  ? Which Firebase features do you want to set up for this directory?
  → Select: Hosting, Firestore
  
  ? Select a default Firebase project
  → เลือก: EnCo-Vendor-Registration
  
  ? What do you want to use as your public directory?
  → ตอบ: . (dot)
  
  ? Configure as a single-page app?
  → ตอบ: Yes
  ```
- [ ] ตรวจสอบมี firebase.json ถูกสร้าง

### Firebase Deploy
- [ ] รัน: `firebase deploy`
- [ ] รอให้ complete (อาจใช้เวลา 1-2 นาที)
- [ ] ตรวจสอบ output แสดง:
  ```
  Hosting URL: https://enco-vendor-registration.web.app
  ```
- [ ] Copy URL

---

## Phase 4: Production Testing (Day 4)

### Test Live Website
- [ ] เปิด browser ไปที่ Hosting URL
- [ ] ตรวจสอบ HTTPS (🔒 icon ในหน้า)
- [ ] ทดสอบ vendor flow (เหมือนขั้นตอน Phase 2)
- [ ] ทดสอบ admin flow
- [ ] ทดสอบ file upload
- [ ] ตรวจสอบ responsive design

### Performance Check
- [ ] เปิด DevTools → Lighthouse
- [ ] Run Lighthouse audit
  - [ ] Performance > 70
  - [ ] Accessibility > 80
  - [ ] Best Practices > 80
  - [ ] SEO > 80

### Security Check
- [ ] ตรวจสอบ Firestore rules ไม่ใช่ test mode
  ```javascript
  // ❌ ผิด - อนุญาต all
  match /{document=**} {
    allow read, write: if true;
  }
  
  // ✅ ถูก - มี permission checks
  match /submissions/{docId} {
    allow read: if request.auth.uid == resource.data.vendorId;
    allow write: if isAdmin(request.auth.uid);
  }
  ```
- [ ] ตรวจสอบ Storage rules
- [ ] ตรวจสอบไม่มี hardcoded passwords / API keys ใน code

### Monitor Firebase Usage
- [ ] ไปที่ Firebase Console
- [ ] ดู Usage dashboard
- [ ] ตรวจสอบ:
  - [ ] Firestore reads/writes (ควร < 50K reads/day)
  - [ ] Storage usage (ควร < 1GB)
  - [ ] Bandwidth (ควร < 10GB/month)

---

## Phase 5: Production Hardening (Week 2+)

### Firestore Backup
- [ ] Enable Firestore automated backups
  - [ ] Firebase Console → Firestore → Backups
  - [ ] Set schedule: daily

### Monitoring & Alerts
- [ ] ตั้ง budget alerts
  - [ ] Firebase Console → Billing → Budgets
  - [ ] Set threshold: $5/month (หรือตามต้องการ)
  - [ ] Notification email

### Update Firestore Rules (from Test Mode)
- [ ] ตรวจสอบ rules ครั้งแล้วครั้งเล่า
- [ ] ต้องแน่ใจว่า:
  - [ ] Vendors สามารถอ่านเฉพาะ submissions เป็นของตัวเอง
  - [ ] Admins สามารถอ่านทั้งหมด
  - [ ] Nobody สามารถลบ data (เว้นแต่ admin)

### User Documentation
- [ ] สร้างคู่มือ Vendor
- [ ] สร้างคู่มือ Admin
- [ ] ทำ training session

### Custom Domain (Optional)
- [ ] ถ้าต้องการ enco-vendor.com
  - [ ] Firebase Console → Hosting → Custom domain
  - [ ] Follow ขั้นตอน DNS setup

---

## Phase 6: Go Live (Week 3+)

### Pre-Launch Checklist
- [ ] ✅ ทั้งหมดในขั้นตอนก่อนหน้า complete
- [ ] ✅ ทดสอบจากกลุ่มผู้ใช้ตัวแทน (Beta testers)
- [ ] ✅ ได้ feedback และแก้ไขปัญหา
- [ ] ✅ Training สำหรับ users complete
- [ ] ✅ Support team ready
- [ ] ✅ Backup plan (ถ้าเกิด incidents)

### Launch Day
- [ ] Announce ผู้ใช้เกี่ยวกับ live date
- [ ] Monitor Firebase dashboard อย่างใกล้ชิด
- [ ] มี support team online สำหรับ assist users
- [ ] เก็บ metrics (ผู้ใช้, submissions, etc.)

### Post-Launch (Week 1)
- [ ] ดู usage patterns
- [ ] เก็บ user feedback
- [ ] Fix bugs/issues ด่วน
- [ ] Update documentation ถ้าต้อง
- [ ] Plan Phase 2 features

---

## 🚨 Critical Path Items (Don't Skip!)

**ถ้าข้ามขั้นตอนนี้ จะเกิด problems:**

1. **Firestore Rules** - ต้องมี security rules ก่อน production
2. **adminUsers Collection** - ต้องมีก่อนจึงลอง admin login
3. **Firebase Config** - ต้องมี apiKey และ projectId ที่ถูกต้อง
4. **Firebase SDK Scripts** - ต้องเพิ่มใน index.html ก่อนไฟล์ jsx
5. **Local Testing** - ต้องทดสอบบน localhost ก่อน deploy
6. **Live Testing** - ต้องทดสอบบน live URL ก่อนบอก users

---

## 📊 Timeline

```
Day 1:  Firebase Setup (3-4 hours)
        ├─ Create project
        ├─ Setup Firestore + Auth + Storage
        └─ Update code

Day 2:  Local Testing (2-3 hours)
        ├─ Run localhost
        ├─ Test vendor flow
        ├─ Test admin flow
        └─ Test responsive design

Day 3:  Firebase Deploy (1-2 hours)
        ├─ Install Firebase CLI
        ├─ firebase init
        ├─ firebase deploy
        └─ Test live URL

Day 4:  Production Testing (2-3 hours)
        ├─ Full flow testing
        ├─ Performance check
        ├─ Security review
        └─ Monitor usage

Total:  ~10 hours of work
        Spread over 4 days for best results
```

---

## 📞 Need Help?

**Stuck? Check:**
1. `FIREBASE_SETUP_GUIDE.md` - Detailed step-by-step
2. `DEPLOYMENT_ANALYSIS.md` - Architecture & options
3. Browser Console - Error messages
4. Firebase Console - Usage & error logs
5. Firebase Docs - https://firebase.google.com/docs

---

**Date Started:** _______________
**Date Completed:** _______________

**Signed off by:** _______________

---

✅ **All done! Your EnCo Vendor Registration is now LIVE!**
