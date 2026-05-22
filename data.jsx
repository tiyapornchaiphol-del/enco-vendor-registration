// Sample / seed data + i18n strings shared by vendor & admin views.

const VENDOR_CATEGORIES = [
  { id: "security",  num: "01", th: "งานรักษาความปลอดภัย",            en: "Security Services",        icon: "🛡",
    worksRequired: 3,
    desc: "รปภ. ประจำพื้นที่ ระบบ CCTV และงานควบคุมการเข้า-ออก" },
  { id: "cleaning",  num: "02", th: "งานรักษาความสะอาด",              en: "Cleaning Services",         icon: "🧹",
    worksRequired: 3,
    desc: "แม่บ้าน ทำความสะอาดสำนักงาน อาคาร และพื้นที่ส่วนกลาง" },
  { id: "repair",    num: "03", th: "งานปรับปรุง-ซ่อมแซมทั่วไป",        en: "General Repair & Maintenance", icon: "🔧",
    worksRequired: 5,
    desc: "งานซ่อมบำรุงอาคาร ระบบไฟฟ้า ประปา ปรับอากาศ" },
  { id: "interior",  num: "04", th: "งานปรับปรุง-ซ่อมแซมตกแต่งภายใน",   en: "Interior Decoration",       icon: "🛠",
    worksRequired: 5,
    desc: "ตกแต่งภายใน เฟอร์นิเจอร์ ฝ้า ผนัง พื้น และงาน built-in" },
];

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

const TIMELINE = [
  { id: 1, date: "18 ก.ค. 2569 09:24", actor: "ระบบ",                    action: "รับใบสมัครเรียบร้อย",            note: "ใบสมัครเลขที่ AVL-26-0142" },
  { id: 2, date: "18 ก.ค. 2569 11:08", actor: "ฝ่ายจัดซื้อ EnCo",          action: "เริ่มตรวจสอบเอกสาร Pre-Qualification", note: "มอบหมายให้ คุณอาภา ดูแล" },
  { id: 3, date: "19 ก.ค. 2569 14:30", actor: "คุณอาภา ผู้ตรวจสอบ",        action: "ขอเอกสารเพิ่มเติม",              note: "ขอใบรับรองมาตรฐานการรักษาความปลอดภัย ฉบับล่าสุด" },
  { id: 4, date: "20 ก.ค. 2569 10:15", actor: "เซฟการ์ด ซีเคียวริตี้",       action: "อัปโหลดเอกสารเพิ่มเติม",         note: "Security_Cert_2025.pdf" },
];

// Approved Vendor List documents (PDFs published by EnCo, downloadable)
const AVL_REGISTRY_DOCS = [
  { id: "avl-2568-3",  period: "ครั้งที่ 3/2568",  publishedAt: "15 ธ.ค. 2568", vendors: 47,
    file: "EnCo_AVL_Registry_2568_3.pdf", size: "1.8 MB" },
  { id: "avl-2568-2",  period: "ครั้งที่ 2/2568",  publishedAt: "20 ก.ย. 2568", vendors: 34,
    file: "EnCo_AVL_Registry_2568_2.pdf", size: "1.5 MB" },
  { id: "avl-2568-1",  period: "ครั้งที่ 1/2568",  publishedAt: "30 มิ.ย. 2568", vendors: 28,
    file: "EnCo_AVL_Registry_2568_1.pdf", size: "1.3 MB" },
  { id: "avl-2567-2",  period: "ครั้งที่ 2/2567",  publishedAt: "12 ธ.ค. 2567", vendors: 22,
    file: "EnCo_AVL_Registry_2567_2.pdf", size: "1.2 MB" },
  { id: "avl-2567-1",  period: "ครั้งที่ 1/2567",  publishedAt: "5 ส.ค. 2567",  vendors: 19,
    file: "EnCo_AVL_Registry_2567_1.pdf", size: "1.1 MB" },
];

// Pre-Qualification document templates per vendor group
const PREQ_DOCS = {
  security: { name: "Pre-Qualification_งานรักษาความปลอดภัย.docx", size: "96 KB" },
  cleaning: { name: "Pre-Qualification_งานรักษาความสะอาด.docx",   size: "92 KB" },
  repair:   { name: "Pre-Qualification_งานซ่อมแซมทั่วไป.docx",     size: "108 KB" },
  interior: { name: "Pre-Qualification_งานตกแต่งภายใน.docx",       size: "104 KB" },
};

Object.assign(window, {
  VENDOR_CATEGORIES, ANNOUNCEMENTS, REQUIRED_DOCS, SUBMISSIONS,
  STATUS_LABEL, ANNC_STATUS_LABEL, TIMELINE,
  AVL_REGISTRY_DOCS, PREQ_DOCS,
});

// Shared data context — App owns mutable copies of groups + announcements
// so Admin edits propagate to Vendor views in real-time.
const DataContext = React.createContext(null);
const useData = () => React.useContext(DataContext);

// Custom hook to fetch data from Supabase
function useSupabaseData() {
  const [submissions, setSubmissions] = React.useState([]);
  const [announcements, setAnnouncements] = React.useState([]);
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

        // Fetch submissions and announcements from Supabase
        const subsData = await window.getSubmissionsFromDb?.();
        const annData = await window.getAnnouncementsFromDb?.();

        console.log('✅ Supabase data loaded:', { subsData: subsData?.length, annData: annData?.length });

        setSubmissions(subsData || []);
        setAnnouncements(annData || []);
      } catch (err) {
        console.error('❌ Error loading Supabase data:', err);
        setError(err.message);
        // Fallback to hardcoded data if Supabase fails
        console.log('⚠️ Using fallback hardcoded data');
        setSubmissions(SUBMISSIONS);
        setAnnouncements(ANNOUNCEMENTS);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // If announcements from Supabase are incomplete, use hardcoded
  const finalAnnouncements = (announcements && announcements.length > 0 && announcements[0]?.categories)
    ? announcements
    : ANNOUNCEMENTS;

  return {
    submissions: submissions && submissions.length > 0 ? submissions : [],
    setSubmissions,
    announcements: finalAnnouncements,
    setAnnouncements,
    loading,
    error
  };
}

Object.assign(window, { DataContext, useData, useSupabaseData });
