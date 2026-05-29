// Supabase Client Configuration
const SUPABASE_URL = 'https://gpqfpxezejifxynzlcjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcWZweGV6ZWppZnh5bnpsY2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTM5NDYsImV4cCI6MjA5NDkyOTk0Nn0.hocrr-JKKp3hiAsufTMmFH-WGEX58f4UyPmLW2MaEaY';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Fetch Functions ───

// Parse categories field — supports JSON array string, already-parsed array, and legacy plain string
function parseCategories(val) {
  if (!val) return [];
  // Already an array (Supabase jsonb column returns parsed JS value)
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val !== 'string') return [String(val)];
  // Trim whitespace
  const str = val.trim();
  if (!str) return [];
  // Try JSON parse
  try {
    const p = JSON.parse(str);
    if (Array.isArray(p)) return p.filter(Boolean);
    // JSON parsed but not an array (e.g., a number or object) → treat as string
    return [str];
  } catch (_) {
    // Plain string (legacy single-category format)
    return [str];
  }
}

// Get all submissions
async function getSubmissionsFromDb() {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform database format to app format
    return (data || []).map(row => {
      const categories = parseCategories(row.category);
      console.log(`📋 [submission ${row.id}] raw category =`, JSON.stringify(row.category), '→ parsed =', categories);
      return {
        id: row.id,
        annoId: row.anno_id,
        company: row.company,
        taxId: row.tax_id,
        categories,                  // full array (primary)
        category: categories[0] || '', // first item — backward compat
        address: row.address,
        subDistrict: row.sub_district,
        district: row.district,
        province: row.province,
        postcode: row.postcode,
        phone: row.phone,
        mobile: row.mobile,
        companyEmail: row.company_email,
        capital: row.capital,
        yearsInBusiness: row.years_in_business,
        contact: row.contact_name,
        position: row.contact_position,
        email: row.contact_email,
        contactPhone: row.contact_phone,
        submittedAt: row.submitted_at,
        status: row.status,
        completeness: row.completeness,
        docs: 6,
        missing: 1
      };
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
}

// Get all announcements
async function getAnnouncementsFromDb() {
  try {
    console.log('🔍 Fetching announcements from Supabase...');
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const result = (data || []).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      categories: row.categories,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
      summary: row.summary,
      docs: row.docs || []
    }));

    console.log('✅ Supabase announcements:', result.length, 'items');
    return result;
  } catch (error) {
    console.error('❌ Error fetching announcements, using fallback:', error);
    // Fallback to empty - UI will use ANNOUNCEMENTS from data.jsx
    return [];
  }
}

// Get all categories
async function getCategoriesFromDb() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('num', { ascending: true });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      num: row.num,
      th: row.th || row.name,
      en: row.en || row.name,
      name: row.name || row.th,
      icon: row.icon || '📁',
      worksRequired: row.works_required || 3,
      desc: row.description || ''
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Create category
async function createCategoryInDb(catData) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        id: catData.id,
        name: catData.th || catData.name,
        th: catData.th,
        en: catData.en,
        icon: catData.icon,
        num: catData.num,
        works_required: catData.worksRequired || 3,
        description: catData.desc || ''
      }])
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Category created:', catData.id);
    return data;
  } catch (error) {
    console.error('❌ Error creating category:', error);
    throw error;
  }
}

// Update category
async function updateCategoryInDb(id, catData) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: catData.th || catData.name,
        th: catData.th,
        en: catData.en,
        icon: catData.icon,
        num: catData.num,
        works_required: catData.worksRequired || 3,
        description: catData.desc || ''
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Category updated:', id);
    return data;
  } catch (error) {
    console.error('❌ Error updating category:', error);
    throw error;
  }
}

// Delete category
async function deleteCategoryInDb(id) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log('✅ Category deleted:', id);
    return true;
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    throw error;
  }
}

// Create submission
async function createSubmissionInDb(submissionData) {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .insert([{
        id: submissionData.id,
        anno_id: submissionData.annoId,
        company: submissionData.company,
        tax_id: submissionData.taxId,
        // Store full categories array as JSON string in the `category` text column
        category: (() => {
          const cats = submissionData.categories;
          const stored = Array.isArray(cats) ? JSON.stringify(cats) : (submissionData.category || '');
          console.log('💾 [createSubmission] categories to store:', cats, '→ DB value:', stored);
          return stored;
        })(),
        address: submissionData.address,
        sub_district: submissionData.subDistrict,
        district: submissionData.district,
        province: submissionData.province,
        postcode: submissionData.postcode,
        phone: submissionData.phone,
        mobile: submissionData.mobile,
        company_email: submissionData.companyEmail,
        capital: submissionData.capital,
        years_in_business: submissionData.yearsInBusiness,
        contact_name: submissionData.contact,
        contact_position: submissionData.position,
        contact_email: submissionData.email,
        contact_phone: submissionData.contactPhone,
        submitted_at: submissionData.submittedAt,
        status: 'new',
        completeness: 0
      }])
      .select();

    if (error) throw error;
    console.log('Submission created:', data);
    return data[0];
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
}

// Update submission
async function updateSubmissionInDb(id, updates) {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating submission:', error);
    throw error;
  }
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

// บันทึก audit event — ไม่ throw ถ้าล้มเหลว เพื่อไม่ให้กระทบการทำงานหลัก
async function logAuditEvent(action, details = {}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('audit_log').insert([{
      actor_id:    session?.user?.id    || null,
      actor_email: session?.user?.email || null,
      action,
      details,
    }]);
  } catch (_) { /* audit failure must never crash the app */ }
}

// ─── Admin Auth Functions (Supabase Auth — ไม่เก็บ password ใน DB) ────────────

// Helper: ดึง profile จาก admin_profiles
async function _getAdminProfile(userId) {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('name, role, is_active, must_change_password')
    .eq('id', userId)
    .single();
  if (error || !data || !data.is_active) return null;
  return {
    name: data.name,
    role: data.role,
    must_change_password: !!data.must_change_password,
  };
}

// Login admin ผ่าน Supabase Auth (password hash โดย Supabase, ไม่เก็บ plaintext)
async function getAdminByEmail(email, password) {
  try {
    console.log('🔐 Authenticating admin:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });
    if (error) { console.warn('⚠️ Auth failed:', error.message); return null; }
    const profile = await _getAdminProfile(data.user.id);
    if (!profile) {
      console.warn('⚠️ ไม่พบ admin_profiles สำหรับ:', email);
      await supabase.auth.signOut();
      return null;
    }
    console.log('✅ Admin authenticated:', email, '— Role:', profile.role);
    // Log successful login (fire-and-forget — session exists now)
    logAuditEvent('admin.login', { email: data.user.email, role: profile.role });
    return { id: data.user.id, email: data.user.email, ...profile, permissions: [] };
  } catch (err) {
    console.error('❌ Login error:', err);
    return null;
  }
}

// ตรวจสอบ Supabase session ที่มีอยู่ (เรียกตอน load หน้า #admin)
async function checkAdminSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const profile = await _getAdminProfile(session.user.id);
    if (!profile) return null;
    console.log('✅ Admin session restored:', session.user.email);
    return { id: session.user.id, email: session.user.email, ...profile, permissions: [] };
  } catch (err) {
    console.error('❌ Session check error:', err);
    return null;
  }
}

// Sign out admin
async function signOutAdmin() {
  await supabase.auth.signOut();
  console.log('👋 Admin signed out');
}

// Get all admin profiles (requires authenticated session)
async function getAllAdmins() {
  try {
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('id, email, name, role, is_active, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('❌ Error getting admins:', err);
    return [];
  }
}

// Update admin profile
async function updateAdmin(id, updates) {
  try {
    const { data, error } = await supabase
      .from('admin_profiles')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    console.log('✅ Admin updated:', id);
    return data;
  } catch (err) {
    console.error('❌ Error updating admin:', err);
    return null;
  }
}

// Deactivate admin (soft delete)
async function deactivateAdmin(id) {
  try {
    const { data, error } = await supabase
      .from('admin_profiles')
      .update({ is_active: false, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    console.log('✅ Admin deactivated:', id);
    return data;
  } catch (err) {
    console.error('❌ Error deactivating admin:', err);
    return null;
  }
}

// ── Helper: เรียก smooth-worker Edge Function ───────────────────────────────
async function _callSmoothWorker(payload) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('ไม่พบ session กรุณาเข้าสู่ระบบใหม่');
  const res = await fetch(`${SUPABASE_URL}/functions/v1/smooth-worker`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 404) throw new Error('Edge Function ยังไม่ได้ deploy — กรุณา deploy "smooth-worker" ใน Supabase Dashboard → Edge Functions');
  if (!res.ok) throw new Error(json.error || `เกิดข้อผิดพลาด (HTTP ${res.status})`);
  return json;
}

// ── สร้าง admin user ผ่าน Edge Function (ไม่ส่งอีเมล — admin กำหนด temp password เอง) ────
async function createAdminUserViaEdge(email, name, role, password) {
  try {
    const json = await _callSmoothWorker({
      action: 'create_user',
      email: email.toLowerCase().trim(),
      name:  name.trim(),
      role,
      password,
    });
    console.log('✅ Admin user created via Edge Function:', email);
    return json;
  } catch (err) {
    console.error('❌ createAdminUserViaEdge error:', err);
    throw err;
  }
}

// ── รีเซ็ตรหัสผ่าน admin ผ่าน Edge Function (ไม่ส่งอีเมล — admin กำหนด temp password เอง) ──
async function resetAdminPasswordViaEdge(userId, newPassword) {
  try {
    const json = await _callSmoothWorker({
      action: 'reset_password',
      userId,
      password: newPassword,
    });
    console.log('✅ Admin password reset via Edge Function:', userId);
    return json;
  } catch (err) {
    console.error('❌ resetAdminPasswordViaEdge error:', err);
    throw err;
  }
}

// ── ลบ admin user ผ่าน Edge Function ──────────────────────────────────────────
async function deleteAdminUserViaEdge(userId) {
  try {
    const json = await _callSmoothWorker({ action: 'delete_user', userId });
    console.log('✅ Admin user deleted via Edge Function:', userId);
    return json;
  } catch (err) {
    console.error('❌ deleteAdminUserViaEdge error:', err);
    throw err;
  }
}

// ─── Storage Functions ───

// Sanitize filename for Supabase Storage (ASCII-safe, no spaces)
function sanitizeStorageKey(name) {
  const ext = name.split('.').pop();
  const base = name.slice(0, -(ext.length + 1));
  // Replace non-ASCII + spaces + special chars with underscore
  const safe = base
    .replace(/[^\x00-\x7F]/g, '_')   // non-ASCII (Thai etc.) → _
    .replace(/\s+/g, '_')             // spaces → _
    .replace(/[^a-zA-Z0-9._-]/g, '_') // remaining specials → _
    .replace(/_+/g, '_')              // collapse multiple __
    .replace(/^_+|_+$/g, '');         // trim leading/trailing _
  return (safe || 'file') + '.' + ext;
}

// Upload file to Supabase Storage
async function uploadFileToStorage(file, folder = 'announcements') {
  try {
    const safeFilename = sanitizeStorageKey(file.name);
    const fileName = `${folder}/${Date.now()}_${safeFilename}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file, { upsert: false });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    console.log('✅ File uploaded:', file.name);
    return {
      name: file.name,
      size: formatFileSize(file.size),
      url: urlData.publicUrl,
      path: fileName
    };
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
}

// Delete file from Supabase Storage
async function deleteFileFromStorage(filePath) {
  try {
    const { error } = await supabase.storage
      .from('documents')
      .remove([filePath]);
    if (error) throw error;
    console.log('✅ File deleted:', filePath);
    return true;
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    throw error;
  }
}

// Helper - format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ─── Announcement Functions ───

// Create announcement
async function createAnnouncementInDb(annoData) {
  try {
    console.log('📝 Creating announcement:', annoData.id);
    const { data, error } = await supabase
      .from('announcements')
      .insert([{
        id: annoData.id,
        title: annoData.title,
        description: annoData.description,
        status: annoData.status || 'open',
        categories: annoData.categories || [],
        opened_at: annoData.openedAt,
        closed_at: annoData.closedAt,
        summary: annoData.summary,
        docs: annoData.docs || []
      }])
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Announcement created:', annoData.id);
    return data;
  } catch (error) {
    console.error('❌ Error creating announcement:', error);
    throw error;
  }
}

// Update announcement
async function updateAnnouncementInDb(id, updates) {
  try {
    console.log('✏️ Updating announcement:', id);
    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Announcement updated:', id);
    return data;
  } catch (error) {
    console.error('❌ Error updating announcement:', error);
    throw error;
  }
}

// Delete announcement
async function deleteAnnouncementInDb(id) {
  try {
    console.log('🗑️ Deleting announcement:', id);
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log('✅ Announcement deleted:', id);
    return true;
  } catch (error) {
    console.error('❌ Error deleting announcement:', error);
    throw error;
  }
}

// ─── AVL Document Functions (ทะเบียนรายชื่อผู้ค้า) ───

// Get all AVL documents
async function getAvlDocumentsFromDb() {
  try {
    const { data, error } = await supabase
      .from('avl_documents')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(row => ({
      id:         row.id,
      name:       row.name,
      url:        row.url,
      path:       row.path,
      note:       row.note || '',
      uploadedAt: row.uploaded_at,
    }));
  } catch (err) {
    console.error('❌ Error fetching AVL documents:', err);
    return [];
  }
}

// Create AVL document record
async function createAvlDocumentInDb(docData) {
  try {
    const { data, error } = await supabase
      .from('avl_documents')
      .insert([{
        name:  docData.name,
        url:   docData.url,
        path:  docData.path,
        note:  docData.note || '',
      }])
      .select()
      .single();
    if (error) throw error;
    console.log('✅ AVL document created:', docData.name);
    return {
      id:         data.id,
      name:       data.name,
      url:        data.url,
      path:       data.path,
      note:       data.note || '',
      uploadedAt: data.uploaded_at,
    };
  } catch (err) {
    console.error('❌ Error creating AVL document:', err);
    throw err;
  }
}

// Delete AVL document record
async function deleteAvlDocumentInDb(id) {
  try {
    const { error } = await supabase
      .from('avl_documents')
      .delete()
      .eq('id', id);
    if (error) throw error;
    console.log('✅ AVL document deleted:', id);
    return true;
  } catch (err) {
    console.error('❌ Error deleting AVL document:', err);
    throw err;
  }
}

// ─── Site Settings Functions ───

const DEFAULT_SETTINGS = {
  orgName:       "EnCo",
  orgFullName:   "บริษัท เอนเนอร์ยี่ คอมเพล็กซ์ จำกัด",
  portalSubtitle:"Vendor Portal",
  contactEmail:  "procurement.enco@energycomplex.co.th",
  contactPhone:  "02-123-4567 ต่อ 8801",
  logoUrl:       "",
  logoInitials:  "E",
  siteTitle:     "EnCo Vendor Registration",
  avlName:       "EnCo Approved Vendor List (AVL)",
  heroTitle:     "ระบบขึ้นทะเบียนผู้ค้าของ EnCo",
};

async function getSiteSettingsFromDb() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('data')
      .eq('id', 1)
      .single();
    if (error) throw error;
    return { ...DEFAULT_SETTINGS, ...(data?.data || {}) };
  } catch (err) {
    console.warn('⚠️ site_settings table not found, using defaults:', err.message);
    return { ...DEFAULT_SETTINGS };
  }
}

async function updateSiteSettingsInDb(newSettings) {
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ id: 1, data: newSettings, updated_at: new Date() });
    if (error) throw error;
    console.log('✅ Site settings updated');
    return true;
  } catch (err) {
    console.error('❌ Error updating site settings:', err);
    throw err;
  }
}

// Export functions
Object.assign(window, {
  supabase,
  logAuditEvent,
  getSubmissionsFromDb,
  getAnnouncementsFromDb,
  getCategoriesFromDb,
  createCategoryInDb,
  updateCategoryInDb,
  deleteCategoryInDb,
  uploadFileToStorage,
  deleteFileFromStorage,
  createSubmissionInDb,
  updateSubmissionInDb,
  createAnnouncementInDb,
  updateAnnouncementInDb,
  deleteAnnouncementInDb,
  getAdminByEmail,
  checkAdminSession,
  signOutAdmin,
  getAllAdmins,
  updateAdmin,
  deactivateAdmin,
  createAdminUserViaEdge,
  resetAdminPasswordViaEdge,
  deleteAdminUserViaEdge,
  getAvlDocumentsFromDb,
  createAvlDocumentInDb,
  deleteAvlDocumentInDb,
  DEFAULT_SETTINGS,
  getSiteSettingsFromDb,
  updateSiteSettingsInDb,
});
