// Sample / seed data + i18n strings shared by vendor & admin views.

// Categories and announcements are now stored in Supabase database
// Empty arrays serve as fallback if database is unavailable
const VENDOR_CATEGORIES = [];
const ANNOUNCEMENTS = [];

const REQUIRED_DOCS = [
  { id: "cert",   th: "หนังสือรับรองบริษัท (อายุไม่เกิน 6 เดือน)", required: true },
  { id: "pp20",   th: "ภ.พ.20 (ทะเบียนภาษีมูลค่าเพิ่ม)",            required: true },
  { id: "fin",    th: "งบการเงินย้อนหลัง 3 ปี",                       required: true },
  { id: "id",     th: "สำเนาบัตรประชาชนกรรมการผู้มีอำนาจ",            required: true },
  { id: "iso",    th: "ใบรับรองมาตรฐาน (ISO, มอก. ฯลฯ)",              required: true },
  { id: "profile",th: "Company Profile",                              required: true },
];

const SUBMISSIONS = [];

const STATUS_LABEL = {
  draft:    { th: "ร่าง",            en: "Draft",        cls: "st-draft"    },
  new:      { th: "ใหม่ — รอตรวจ",    en: "New",          cls: "st-new"      },
  review:   { th: "กำลังตรวจสอบ",     en: "Reviewing",    cls: "st-review"   },
  approved: { th: "อนุมัติ",          en: "Approved",     cls: "st-approved" },
  rejected: { th: "ปฏิเสธ",           en: "Rejected",     cls: "st-rejected" },
};

const ANNC_STATUS_LABEL = {
  open:    { th: "เปิดรับสมัคร", en: "Open",          cls: "st-approved" },
  closing: { th: "ใกล้ปิดรับ",   en: "Closing Soon",  cls: "st-review"   },
  closed:  { th: "ปิดรับสมัคร",  en: "Closed",        cls: "st-draft"    },
};


Object.assign(window, {
  VENDOR_CATEGORIES, ANNOUNCEMENTS, REQUIRED_DOCS, SUBMISSIONS,
  STATUS_LABEL, ANNC_STATUS_LABEL,
});

// Shared data context — App owns mutable copies of groups + announcements
// so Admin edits propagate to Vendor views in real-time.
const DataContext = React.createContext(null);
const useData = () => React.useContext(DataContext);

// Custom hook to fetch data from Supabase
function useSupabaseData() {
  const [submissions, setSubmissions] = React.useState([]);
  const [announcements, setAnnouncements] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [settings, setSettings] = React.useState(
    () => window.DEFAULT_SETTINGS ? { ...window.DEFAULT_SETTINGS } : {
      orgName: "EnCo", orgFullName: "บริษัท เอนเนอร์ยี่ คอมเพล็กซ์ จำกัด",
      portalSubtitle: "Vendor Portal", contactEmail: "procurement.enco@energycomplex.co.th",
      contactPhone: "02-123-4567 ต่อ 8801", logoUrl: "", logoInitials: "E",
      siteTitle: "EnCo Vendor Registration",
      avlName: "EnCo Approved Vendor List (AVL)",
      heroTitle: "ระบบขึ้นทะเบียนผู้ค้าของ EnCo",
    }
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📡 Loading data from Supabase...');
        console.log('window.getSubmissionsFromDb:', typeof window.getSubmissionsFromDb);
        console.log('window.getAnnouncementsFromDb:', typeof window.getAnnouncementsFromDb);
        console.log('window.getCategoriesFromDb:', typeof window.getCategoriesFromDb);

        // Fetch all data from Supabase in parallel
        const [subsData, annData, catData, settingsData] = await Promise.all([
          window.getSubmissionsFromDb?.(),
          window.getAnnouncementsFromDb?.(),
          window.getCategoriesFromDb?.(),
          window.getSiteSettingsFromDb?.(),
        ]);

        console.log('✅ Supabase data loaded:', {
          subsData: subsData?.length,
          annData: annData?.length,
          catData: catData?.length,
          settings: !!settingsData,
        });

        setSubmissions(subsData || []);
        setAnnouncements(annData || []);
        setCategories(catData || []);
        if (settingsData) setSettings(settingsData);
      } catch (err) {
        console.error('❌ Error loading Supabase data:', err);
        setError(err.message);
        // Fallback to hardcoded data if Supabase fails
        console.log('⚠️ Using fallback hardcoded data');
        setSubmissions(SUBMISSIONS);
        setAnnouncements(ANNOUNCEMENTS);
        setCategories(VENDOR_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    submissions: submissions && submissions.length > 0 ? submissions : [],
    setSubmissions,
    announcements: announcements && announcements.length > 0 ? announcements : ANNOUNCEMENTS,
    setAnnouncements,
    categories: categories && categories.length > 0 ? categories : VENDOR_CATEGORIES,
    setCategories,
    settings,
    setSettings,
    loading,
    error
  };
}

Object.assign(window, {
  DataContext,
  useData,
  useSupabaseData,
  VENDOR_CATEGORIES,
  ANNOUNCEMENTS,
  SUBMISSIONS,
  REQUIRED_DOCS,
  STATUS_LABEL,
  ANNC_STATUS_LABEL
});
