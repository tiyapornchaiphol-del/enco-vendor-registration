-- ══════════════════════════════════════════════════════════════
-- Supabase Table Setup — AVL Documents (ทะเบียนรายชื่อผู้ค้า)
-- วิธีใช้: คัดลอกทั้งหมดและรันใน Supabase → SQL Editor
-- ทำครั้งเดียว
-- ══════════════════════════════════════════════════════════════

-- 1. สร้างตาราง avl_documents
CREATE TABLE IF NOT EXISTS avl_documents (
  id          uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text          NOT NULL,           -- ชื่อไฟล์ที่แสดง
  url         text          NOT NULL,           -- Public URL จาก Supabase Storage
  path        text          NOT NULL,           -- Path ใน bucket (สำหรับลบ)
  note        text          DEFAULT '',         -- หมายเหตุ/ชื่อประกาศ (optional)
  uploaded_at timestamptz   DEFAULT now()
);

-- 2. เปิด RLS และตั้ง policy (อ่านได้ทุกคน, เขียน/ลบ ทุกคน — เหมือน pattern ที่ใช้กับ documents bucket)
ALTER TABLE avl_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read avl_documents"   ON avl_documents;
DROP POLICY IF EXISTS "Anyone insert avl_documents" ON avl_documents;
DROP POLICY IF EXISTS "Anyone delete avl_documents" ON avl_documents;

CREATE POLICY "Public read avl_documents"
  ON avl_documents FOR SELECT USING (true);

CREATE POLICY "Anyone insert avl_documents"
  ON avl_documents FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone delete avl_documents"
  ON avl_documents FOR DELETE USING (true);

-- 3. ตรวจสอบผล
SELECT column_name, data_type FROM information_schema.columns
  WHERE table_name = 'avl_documents' ORDER BY ordinal_position;

SELECT policyname, cmd FROM pg_policies WHERE tablename = 'avl_documents';
