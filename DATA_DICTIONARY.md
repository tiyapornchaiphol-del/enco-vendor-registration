# พจนานุกรมข้อมูล (Data Dictionary)
## ระบบขึ้นทะเบียนคู่ค้า EnCo Vendor Registration
**ฐานข้อมูล:** Supabase PostgreSQL  
**จัดทำเมื่อ:** พฤษภาคม 2569

---

## ภาพรวมตาราง (Tables Overview)

| ตาราง | คำอธิบาย | จำนวน Column |
|-------|----------|--------------|
| `admins` | บัญชีผู้ใช้งานฝ่ายจัดการ | 9 |
| `categories` | กลุ่มงาน / ประเภทคู่ค้า | 8 |
| `announcements` | ประกาศรับสมัครคู่ค้า | 10 |
| `submissions` | ใบสมัครคู่ค้า | 23 |
| `doc_requests` | การขอเอกสารเพิ่มเติม | 4 |

---

## 1. ตาราง `admins` — บัญชีผู้ใช้งานฝ่ายจัดการ

| Column | ชนิดข้อมูล | คำอธิบาย | ตัวอย่าง |
|--------|-----------|----------|---------|
| `id` | UUID (PK) | รหัสเฉพาะ สร้างอัตโนมัติ | `a1b2c3d4-...` |
| `email` | VARCHAR(255) | อีเมลสำหรับเข้าสู่ระบบ (ห้ามซ้ำ) | `admin@enco.co.th` |
| `password` | VARCHAR(255) | รหัสผ่าน | `admin123` |
| `name` | VARCHAR(255) | ชื่อ-นามสกุล | `Administrator` |
| `role` | VARCHAR(100) | ระดับสิทธิ์ | `Super Admin`, `Admin` |
| `permissions` | TEXT[] | สิทธิ์การใช้งาน (array) | `{approve, manage-announcements}` |
| `is_active` | BOOLEAN | สถานะการใช้งาน | `true` / `false` |
| `created_at` | TIMESTAMPTZ | วันที่สร้างบัญชี | `2026-05-22 10:00:00+07` |
| `updated_at` | TIMESTAMPTZ | วันที่แก้ไขล่าสุด | `2026-05-22 10:00:00+07` |

**สิทธิ์ที่รองรับ (permissions):**
- `approve` — อนุมัติ/ปฏิเสธใบสมัคร
- `request-docs` — ขอเอกสารเพิ่มเติม
- `manage-announcements` — จัดการประกาศ
- `manage-groups` — จัดการกลุ่มงาน
- `manage-users` — จัดการผู้ใช้งาน
- `manage-admins` — จัดการบัญชี Admin

---

## 2. ตาราง `categories` — กลุ่มงาน

| Column | ชนิดข้อมูล | คำอธิบาย | ตัวอย่าง |
|--------|-----------|----------|---------|
| `id` | VARCHAR (PK) | รหัสกลุ่มงาน (ภาษาอังกฤษ ไม่มีช่องว่าง) | `security`, `cleaning` |
| `name` | TEXT | ชื่อกลุ่มงาน (หลัก) | `งานรักษาความปลอดภัย` |
| `th` | TEXT | ชื่อภาษาไทย | `งานรักษาความปลอดภัย` |
| `en` | TEXT | ชื่อภาษาอังกฤษ | `Security Services` |
| `icon` | TEXT | Emoji ประจำกลุ่ม | `🛡` |
| `num` | TEXT | ลำดับที่ (2 หลัก) | `01`, `02` |
| `works_required` | INTEGER | จำนวนผลงานที่ต้องแนบขั้นต่ำ | `3`, `5` |
| `description` | TEXT | คำอธิบายกลุ่มงาน | `รปภ. ประจำพื้นที่ ระบบ CCTV` |

---

## 3. ตาราง `announcements` — ประกาศรับสมัครคู่ค้า

| Column | ชนิดข้อมูล | คำอธิบาย | ตัวอย่าง |
|--------|-----------|----------|---------|
| `id` | VARCHAR (PK) | เลขที่ประกาศ | `AN-2026-001` |
| `title` | TEXT | หัวข้อประกาศ | `รับสมัครบริษัทรักษาความปลอดภัย` |
| `description` | TEXT | รายละเอียดย่อ | `ต้องการบริษัทที่มีใบอนุญาต` |
| `summary` | TEXT | รายละเอียดเพิ่มเติม (full text) | `...` |
| `status` | TEXT | สถานะ (คำนวณจากวันที่) | `open`, `closing`, `closed` |
| `categories` | TEXT[] | กลุ่มงานที่เปิดรับ (array) | `{security, cleaning}` |
| `opened_at` | DATE | วันที่เปิดรับสมัคร | `2026-05-01` |
| `closed_at` | DATE | วันที่ปิดรับสมัคร | `2026-07-31` |
| `docs` | JSONB | เอกสารแนบประกาศ (array of objects) | `[{"name":"TOR.pdf","url":"https://..."}]` |
| `created_at` | TIMESTAMPTZ | วันที่สร้างประกาศ | `2026-05-22 10:00:00+07` |

**ค่า status:**
- `open` — เปิดรับสมัคร (วันปัจจุบันอยู่ในช่วง opened_at ถึง closed_at)
- `closing` — ใกล้ปิดรับ (เหลือ ≤ 7 วัน)
- `closed` — ปิดรับสมัครแล้ว (เลยวันปิด)
- `draft` — ร่าง (ยังไม่ถึงวันเปิด)

---

## 4. ตาราง `submissions` — ใบสมัครคู่ค้า

### ข้อมูลการสมัคร
| Column | ชนิดข้อมูล | คำอธิบาย | ตัวอย่าง |
|--------|-----------|----------|---------|
| `id` | VARCHAR (PK) | เลขที่ใบสมัคร | `AVL-26-0001` |
| `anno_id` | VARCHAR | FK → announcements.id | `AN-2026-001` |
| `status` | TEXT | สถานะใบสมัคร | `new`, `review`, `approved`, `rejected` |
| `completeness` | INTEGER | ความครบถ้วนเอกสาร (%) | `80`, `100` |
| `submitted_at` | TIMESTAMPTZ | วันที่ยื่นสมัคร | `2026-05-22 14:30:00+07` |
| `created_at` | TIMESTAMPTZ | วันที่สร้างระเบียน | `2026-05-22 14:30:00+07` |

### ข้อมูลบริษัท (Step 1-2)
| Column | ชนิดข้อมูล | คำอธิบาย | ตัวอย่าง |
|--------|-----------|----------|---------|
| `category` | TEXT | กลุ่มงานที่สมัคร | `security` |
| `company` | TEXT | ชื่อบริษัท | `บริษัท เซฟการ์ด จำกัด` |
| `tax_id` | VARCHAR(13) | เลขผู้เสียภาษี 13 หลัก | `0105556012345` |
| `capital` | TEXT | ทุนจดทะเบียน (บาท) | `5000000` |
| `years_in_business` | TEXT | ระยะเวลาดำเนินธุรกิจ (ปี) | `10` |

### ที่อยู่บริษัท
| Column | ชนิดข้อมูล | คำอธิบาย | ตัวอย่าง |
|--------|-----------|----------|---------|
| `address` | TEXT | ที่อยู่ (บ้านเลขที่ ถนน) | `123/45 ถ.พระราม 9` |
| `sub_district` | TEXT | แขวง/ตำบล | `ห้วยขวาง` |
| `district` | TEXT | เขต/อำเภอ | `ห้วยขวาง` |
| `province` | TEXT | จังหวัด | `กรุงเทพมหานคร` |
| `postcode` | VARCHAR(5) | รหัสไปรษณีย์ | `10310` |

### ข้อมูลติดต่อ
| Column | ชนิดข้อมูล | คำอธิบาย | ตัวอย่าง |
|--------|-----------|----------|---------|
| `phone` | TEXT | โทรศัพท์บริษัท | `02-123-4567` |
| `mobile` | TEXT | มือถือ | `081-234-5678` |
| `company_email` | TEXT | อีเมลบริษัท | `info@safeguard.co.th` |

### ผู้ติดต่อ (Step 3)
| Column | ชนิดข้อมูล | คำอธิบาย | ตัวอย่าง |
|--------|-----------|----------|---------|
| `contact_name` | TEXT | ชื่อผู้ติดต่อ | `คุณสมชาย ใจดี` |
| `contact_position` | TEXT | ตำแหน่ง | `ผู้จัดการฝ่ายขาย` |
| `contact_email` | TEXT | อีเมลผู้ติดต่อ | `somchai@safeguard.co.th` |
| `contact_phone` | TEXT | โทรศัพท์ผู้ติดต่อ | `081-234-5678` |

**ค่า status:**
- `new` — ใหม่ รอตรวจสอบ
- `review` — กำลังตรวจสอบ
- `approved` — อนุมัติ
- `rejected` — ปฏิเสธ

---

## 5. ตาราง `doc_requests` — การขอเอกสารเพิ่มเติม

| Column | ชนิดข้อมูล | คำอธิบาย | ตัวอย่าง |
|--------|-----------|----------|---------|
| `id` | UUID (PK) | รหัสเฉพาะ สร้างอัตโนมัติ | `a1b2c3d4-...` |
| `submission_id` | VARCHAR | FK → submissions.id | `AVL-26-0001` |
| `note` | TEXT | รายละเอียดเอกสารที่ขอเพิ่ม | `ขอ ISO Certificate เพิ่มเติม` |
| `created_at` | TIMESTAMPTZ | วันที่ขอเอกสาร | `2026-05-22 15:00:00+07` |

---

## เอกสารแนบที่กำหนด (REQUIRED_DOCS)

เอกสารที่ Vendor ต้องแนบในใบสมัคร:

| รหัส | เอกสาร | บังคับ |
|------|--------|--------|
| `cert` | หนังสือรับรองบริษัท (อายุไม่เกิน 6 เดือน) | ✅ |
| `pp20` | ภ.พ.20 (ทะเบียนภาษีมูลค่าเพิ่ม) | ✅ |
| `fin` | งบการเงินย้อนหลัง 3 ปี | ✅ |
| `id` | สำเนาบัตรประชาชนกรรมการผู้มีอำนาจ | ✅ |
| `iso` | ใบรับรองมาตรฐาน (ISO, มอก.) | ✅ |
| `profile` | Company Profile | ✅ |

---

## ความสัมพันธ์ระหว่างตาราง (Relationships)

```
admins (1) ──────── จัดการ ──────────── (M) submissions
                                               │
categories (1) ─── ใช้ใน ──── (M) announcements
                                               │
announcements (1) ─ รับสมัครผ่าน ─ (M) submissions
                                               │
submissions (1) ── มี ──────────── (M) doc_requests
```

---

## Row Level Security (RLS) Policies

| ตาราง | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `admins` | ✅ Public | ❌ | ❌ | ❌ |
| `categories` | ✅ Public | ✅ Public | ✅ Public | ✅ Public |
| `announcements` | ✅ Public | ✅ Public | ✅ Public | ✅ Public |
| `submissions` | ✅ Public | ✅ Public | ✅ Public | ✅ Public |
| `doc_requests` | ✅ Public | ✅ Public | ✅ Public | ✅ Public |

---

## Storage Bucket: `documents`

สำหรับเก็บไฟล์แนบประกาศ

| Path | คำอธิบาย | ตัวอย่าง |
|------|----------|---------|
| `announcements/` | เอกสารแนบประกาศ | `announcements/1716375600_TOR.pdf` |

**รูปแบบชื่อไฟล์:** `{timestamp}_{originalname}`  
**ประเภทไฟล์ที่รองรับ:** PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG
