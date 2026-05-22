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
      .select('*');

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
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

// Export functions
Object.assign(window, {
  supabase,
  getSubmissionsFromDb,
  getAnnouncementsFromDb,
  getCategoriesFromDb,
  createSubmissionInDb,
  updateSubmissionInDb
});
