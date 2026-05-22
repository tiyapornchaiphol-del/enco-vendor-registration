-- ══════════════════════════════════════════════════════════════
-- ข้อมูลทดสอบ (Test Data) — EnCo Vendor Registration
-- วิธีใช้: คัดลอกทั้งหมดและรันใน Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- ล้างข้อมูลเก่าก่อน (ถ้าต้องการเริ่มใหม่)
-- DELETE FROM doc_requests;
-- DELETE FROM submissions;
-- DELETE FROM announcements;
-- DELETE FROM categories;

-- ══════════════════════════════════════════════════════════════
-- 1. กลุ่มงาน (Categories)
-- ══════════════════════════════════════════════════════════════
INSERT INTO categories (id, name, th, en, icon, num, works_required, description) VALUES
(
  'security',
  'งานรักษาความปลอดภัย',
  'งานรักษาความปลอดภัย',
  'Security Services',
  '🛡',
  '01',
  3,
  'รปภ. ประจำพื้นที่ ระบบ CCTV และงานควบคุมการเข้า-ออก'
),
(
  'cleaning',
  'งานรักษาความสะอาด',
  'งานรักษาความสะอาด',
  'Cleaning Services',
  '🧹',
  '02',
  3,
  'แม่บ้าน ทำความสะอาดสำนักงาน อาคาร และพื้นที่ส่วนกลาง'
),
(
  'repair',
  'งานปรับปรุง-ซ่อมแซมทั่วไป',
  'งานปรับปรุง-ซ่อมแซมทั่วไป',
  'General Repair & Maintenance',
  '🔧',
  '03',
  5,
  'งานซ่อมบำรุงอาคาร ระบบไฟฟ้า ประปา ปรับอากาศ'
),
(
  'interior',
  'งานปรับปรุง-ซ่อมแซมตกแต่งภายใน',
  'งานปรับปรุง-ซ่อมแซมตกแต่งภายใน',
  'Interior Decoration',
  '🛠',
  '04',
  5,
  'ตกแต่งภายใน เฟอร์นิเจอร์ ฝ้า ผนัง พื้น และงาน built-in'
)
ON CONFLICT (id) DO UPDATE SET
  th = EXCLUDED.th,
  en = EXCLUDED.en,
  icon = EXCLUDED.icon,
  num = EXCLUDED.num,
  works_required = EXCLUDED.works_required,
  description = EXCLUDED.description;

-- ══════════════════════════════════════════════════════════════
-- 2. ประกาศรับสมัคร (Announcements)
-- ══════════════════════════════════════════════════════════════
INSERT INTO announcements (id, title, description, summary, status, categories, opened_at, closed_at, docs) VALUES
(
  'AN-2026-001',
  'รับสมัครบริษัทรักษาความปลอดภัย ปี 2569',
  'บริษัท พลังงานไทย จำกัด (EnCo) เปิดรับสมัครบริษัทรักษาความปลอดภัยเพื่อดูแลพื้นที่สำนักงานใหญ่',
  'คุณสมบัติผู้สมัคร: มีใบอนุญาตประกอบธุรกิจรักษาความปลอดภัย มีประสบการณ์ไม่น้อยกว่า 5 ปี มีพนักงานไม่น้อยกว่า 50 คน รับผิดชอบพื้นที่อาคารสำนักงาน 10 ชั้น พร้อมที่จอดรถ 500 คัน',
  'open',
  ARRAY['security'],
  '2026-05-01',
  '2026-07-31',
  '[]'::jsonb
),
(
  'AN-2026-002',
  'รับสมัครบริษัทรักษาความสะอาดและซ่อมบำรุง ปี 2569',
  'เปิดรับสมัครบริษัทรักษาความสะอาดและงานซ่อมบำรุงทั่วไป สำหรับพื้นที่อาคารและโรงงาน',
  'ขอบเขตงาน: ทำความสะอาดสำนักงาน 5 วัน/สัปดาห์ ดูแลพื้นที่โรงอาหาร ห้องน้ำ พื้นที่ส่วนกลาง ซ่อมบำรุงระบบไฟฟ้า ประปา งานทาสี และงาน Facility ทั่วไป',
  'open',
  ARRAY['cleaning', 'repair'],
  '2026-05-15',
  '2026-08-15',
  '[]'::jsonb
),
(
  'AN-2026-003',
  'รับสมัครบริษัทตกแต่งภายใน ปี 2569',
  'เปิดรับสมัครบริษัทรับเหมาตกแต่งภายในสำหรับปรับปรุงสำนักงาน',
  'โครงการปรับปรุงสำนักงานชั้น 3-5 งบประมาณ 15 ล้านบาท ระยะเวลาดำเนินงาน 6 เดือน ต้องการบริษัทที่มีประสบการณ์งานตกแต่งอาคารสำนักงานขนาดใหญ่',
  'open',
  ARRAY['interior'],
  '2026-06-01',
  '2026-08-31',
  '[]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  summary = EXCLUDED.summary,
  status = EXCLUDED.status,
  categories = EXCLUDED.categories,
  opened_at = EXCLUDED.opened_at,
  closed_at = EXCLUDED.closed_at;

-- ══════════════════════════════════════════════════════════════
-- 3. ใบสมัครคู่ค้า (Submissions)
-- ══════════════════════════════════════════════════════════════
INSERT INTO submissions (
  id, anno_id, category,
  company, tax_id, capital, years_in_business,
  address, sub_district, district, province, postcode,
  phone, mobile, company_email,
  contact_name, contact_position, contact_email, contact_phone,
  status, completeness, submitted_at
) VALUES
-- ใบสมัครที่ 1: อนุมัติแล้ว
(
  'AVL-26-0001', 'AN-2026-001', 'security',
  'บริษัท เซฟการ์ด บริการ จำกัด', '0105556012345', '10000000', '12',
  '123/45 ถนนพระราม 9', 'ห้วยขวาง', 'ห้วยขวาง', 'กรุงเทพมหานคร', '10310',
  '02-123-4567', '081-234-5678', 'info@safeguard.co.th',
  'คุณสมชาย ใจดี', 'ผู้จัดการฝ่ายขาย', 'somchai@safeguard.co.th', '081-234-5678',
  'approved', 100, NOW() - INTERVAL '10 days'
),
-- ใบสมัครที่ 2: กำลังตรวจสอบ
(
  'AVL-26-0002', 'AN-2026-001', 'security',
  'บริษัท พาวเวอร์ซีเคียวริตี้ จำกัด', '0205558023456', '5000000', '8',
  '456 ถนนสุขุมวิท 21', 'คลองเตยเหนือ', 'วัฒนา', 'กรุงเทพมหานคร', '10110',
  '02-234-5678', '082-345-6789', 'info@powersecurity.co.th',
  'คุณวิภา รักงาน', 'กรรมการผู้จัดการ', 'vipa@powersecurity.co.th', '082-345-6789',
  'review', 85, NOW() - INTERVAL '5 days'
),
-- ใบสมัครที่ 3: ใหม่ รอตรวจสอบ
(
  'AVL-26-0003', 'AN-2026-002', 'cleaning',
  'บริษัท คลีนโปร เซอร์วิส จำกัด', '0305559034567', '3000000', '6',
  '789 ถนนลาดพร้าว', 'จอมพล', 'จตุจักร', 'กรุงเทพมหานคร', '10900',
  '02-345-6789', '083-456-7890', 'contact@cleanpro.co.th',
  'คุณประภา สะอาด', 'ผู้อำนวยการ', 'prapa@cleanpro.co.th', '083-456-7890',
  'new', 90, NOW() - INTERVAL '2 days'
),
-- ใบสมัครที่ 4: ใหม่ รอตรวจสอบ
(
  'AVL-26-0004', 'AN-2026-002', 'repair',
  'บริษัท สมาร์ทเมนเทนแนนซ์ จำกัด', '0405557045678', '8000000', '15',
  '321 ถนนรัชดาภิเษก', 'ดินแดง', 'ดินแดง', 'กรุงเทพมหานคร', '10400',
  '02-456-7890', '084-567-8901', 'info@smartmaintenance.co.th',
  'คุณธนกร ซ่อมดี', 'ผู้จัดการโครงการ', 'thanakorn@smartmaintenance.co.th', '084-567-8901',
  'new', 75, NOW() - INTERVAL '1 day'
),
-- ใบสมัครที่ 5: ปฏิเสธ
(
  'AVL-26-0005', 'AN-2026-003', 'interior',
  'บริษัท ดีไซน์โปร อินทีเรียร์ จำกัด', '0505556056789', '2000000', '3',
  '654 ถนนพหลโยธิน', 'สามเสนใน', 'พญาไท', 'กรุงเทพมหานคร', '10400',
  '02-567-8901', '085-678-9012', 'hello@designpro.co.th',
  'คุณมนัส สร้างสรรค์', 'CEO', 'manas@designpro.co.th', '085-678-9012',
  'rejected', 60, NOW() - INTERVAL '7 days'
)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 4. การขอเอกสารเพิ่มเติม (Doc Requests)
-- ══════════════════════════════════════════════════════════════
INSERT INTO doc_requests (submission_id, note, created_at) VALUES
(
  'AVL-26-0002',
  'กรุณาส่งใบรับรอง ISO 9001 ฉบับปัจจุบัน และรายชื่อพนักงานรักษาความปลอดภัยที่ผ่านการอบรม',
  NOW() - INTERVAL '3 days'
)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- ตรวจสอบข้อมูลที่ใส่
-- ══════════════════════════════════════════════════════════════
SELECT 'categories' AS table_name, COUNT(*) AS rows FROM categories
UNION ALL
SELECT 'announcements', COUNT(*) FROM announcements
UNION ALL
SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL
SELECT 'doc_requests', COUNT(*) FROM doc_requests
UNION ALL
SELECT 'admins', COUNT(*) FROM admins;
