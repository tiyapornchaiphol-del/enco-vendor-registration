// Supabase Client Configuration
const SUPABASE_URL = 'https://gpqfpxezejifxynzlcjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcWZweGV6ZWppZnh5bnpsY2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTM5NDYsImV4cCI6MjA5NDkyOTk0Nn0.hocrr-JKKp3hiAsufTMmFH-WGEX58f4UyPmLW2MaEaY';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Fetch Functions ───

// Get all submissions
async function getSubmissionsFromDb() {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform database format to app format
    return (data || []).map(row => ({
      id: row.id,
      annoId: row.anno_id,
      company: row.company,
      taxId: row.tax_id,
      category: row.category,
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
    }));
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
        category: submissionData.category,
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

// ─── Admin Functions ───

// Get admin by email and password
async function getAdminByEmail(email, password) {
  try {
    console.log('🔐 Authenticating admin:', email);
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('password', password)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('❌ Admin auth error:', error);
      return null;
    }

    console.log('✅ Admin authenticated:', email);
    return data;
  } catch (err) {
    console.error('❌ Error getting admin:', err);
    return null;
  }
}

// Get all admins
async function getAllAdmins() {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('❌ Error getting admins:', err);
    return [];
  }
}

// Create new admin
async function createAdmin(email, password, name, role = 'Admin') {
  try {
    const { data, error } = await supabase
      .from('admins')
      .insert({
        email: email.toLowerCase(),
        password,
        name,
        role,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Admin created:', email);
    return data;
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    return null;
  }
}

// Update admin
async function updateAdmin(id, updates) {
  try {
    const { data, error } = await supabase
      .from('admins')
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

// Delete admin (soft delete - set is_active to false)
async function deactivateAdmin(id) {
  try {
    const { data, error } = await supabase
      .from('admins')
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

// ─── Storage Functions ───

// Upload file to Supabase Storage
async function uploadFileToStorage(file, folder = 'announcements') {
  try {
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${file.name}`;

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

// Export functions
Object.assign(window, {
  supabase,
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
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deactivateAdmin
});
