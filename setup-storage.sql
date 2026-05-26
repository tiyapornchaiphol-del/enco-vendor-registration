-- ══════════════════════════════════════════════════════════════
-- Supabase Storage Setup — EnCo Vendor Registration
-- วิธีใช้: คัดลอกทั้งหมดและรันใน Supabase → SQL Editor
-- ทำครั้งเดียว ก่อนใช้งานระบบอัปโหลดไฟล์
-- ══════════════════════════════════════════════════════════════

-- 1. สร้าง bucket 'documents' และตั้งเป็น public
--    (ถ้ามีแล้วจะ update ให้เป็น public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  52428800,   -- 50 MB limit per file
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800;

-- 2. ลบ policy เก่าทั้งหมด (ป้องกัน duplicate error)
DROP POLICY IF EXISTS "Public read documents"        ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload documents"  ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update documents"  ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete documents"  ON storage.objects;
DROP POLICY IF EXISTS "Public Access"                ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads"                ON storage.objects;

-- 3. สร้าง RLS policies
--    อ่าน/ดาวน์โหลดไฟล์: ทุกคนเข้าถึงได้ (public)
CREATE POLICY "Public read documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

--    อัปโหลดไฟล์: ทุกคน (vendor + admin)
CREATE POLICY "Anyone can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents');

--    อัปเดตไฟล์
CREATE POLICY "Anyone can update documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents');

--    ลบไฟล์ (admin ใช้ตอนลบ Pre-Q)
CREATE POLICY "Anyone can delete documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents');

-- 4. ตรวจสอบผล
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'documents';
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
