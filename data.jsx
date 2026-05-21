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

const ANNOUNCEMENTS = [
  {
    id: "AVL-3/2569",
    title: "ประกาศรับสมัครงานติดตั้งระบบไฟฟ้า โครงการ Smart Plant Phase 2",
    categories: ["repair"],
    openedAt: "10 ก.ค. 2569",
    closedAt: "31 ก.ค. 2569",
    status: "closing",
    summary: "เปิดรับสมัครคู่ค้าเฉพาะกลุ่มงานติดตั้งระบบไฟฟ้าและซ่อมแซมระบบโรงงาน สำหรับโครงการ Smart Plant Phase 2 ผู้สนใจต้องมีประสบการณ์งานในโรงงานอุตสาหกรรมไม่น้อยกว่า 5 ปี",
    docs: [
      { name: "ประกาศ_AVL_3-2569_SmartPlant.pdf",                size: "312 KB" },
      { name: "TOR_SmartPlant_Phase2.pdf",                       size: "1.2 MB" },
    ],
  },
  {
    id: "AVL-2/2569",
    title: "ประกาศรับสมัครงานบริการเสริม — รปภ. และแม่บ้าน",
    categories: ["security", "cleaning"],
    openedAt: "1 มิ.ย. 2569",
    closedAt: "31 ส.ค. 2569",
    status: "open",
    summary: "EnCo เปิดรับสมัครคู่ค้าเฉพาะกลุ่มงานบริการรักษาความปลอดภัย และงานรักษาความสะอาด เพิ่มเติมจากรอบหลัก เพื่อขยายฐานคู่ค้าและรองรับการขยายพื้นที่สำนักงานใหม่",
    docs: [
      { name: "ประกาศ_AVL_2-2569.pdf",                size: "220 KB" },
      { name: "Pre-Qualification_รปภ.docx",             size: "96 KB" },
      { name: "Pre-Qualification_แม่บ้าน.docx",          size: "92 KB" },
    ],
  },
  {
    id: "AVL-1/2569",
    title: "ประกาศรับสมัครขึ้นทะเบียนผู้ค้า ครั้งที่ 1/2569",
    titleEn: "EnCo Approved Vendor List (AVL) — Round 1/2026",
    categories: ["security", "cleaning", "repair", "interior"],
    openedAt: "1 เม.ย. 2569",
    closedAt: "31 ก.ค. 2569",
    status: "open",
    summary: "บริษัท เอนเนอร์ยี่ คอมเพล็กซ์ จำกัด (EnCo) ขอเชิญชวนผู้ค้าที่สนใจสมัครขึ้นทะเบียนของ EnCo เพื่อประโยชน์ในการจัดหาเชิงพาณิชย์ด้วยวิธีประมูล โดยมีวัตถุประสงค์เพื่อให้มั่นใจว่าภายใต้กระบวนการคัดเลือกผู้ค้า EnCo จะได้ผู้ค้าที่มีประสิทธิภาพ สามารถส่งมอบสินค้าหรือบริการได้ตรงกับความต้องการขององค์กร และส่งเสริมความเป็นพันธมิตร (Partnership) กับ EnCo อย่างยั่งยืน",
    docs: [
      { name: "ประกาศ_AVL_1-2569.pdf",                       size: "284 KB" },
      { name: "ระเบียบและเงื่อนไขการขึ้นทะเบียน.pdf",            size: "412 KB" },
      { name: "Pre-Qualification_งานรักษาความปลอดภัย.docx",     size: "96 KB" },
      { name: "Pre-Qualification_งานรักษาความสะอาด.docx",       size: "92 KB" },
      { name: "Pre-Qualification_งานซ่อมแซมทั่วไป.docx",         size: "108 KB" },
      { name: "Pre-Qualification_งานตกแต่งภายใน.docx",          size: "104 KB" },
    ],
  },
  {
    id: "AVL-4/2568",
    title: "ประกาศรับสมัครผู้จำหน่ายงานตกแต่งภายในเพิ่มเติม",
    categories: ["interior"],
    openedAt: "15 พ.ย. 2568",
    closedAt: "31 ธ.ค. 2568",
    status: "closed",
    summary: "ปิดรับสมัครแล้ว — มีผู้ผ่านการประเมินขึ้นทะเบียนเป็นผู้ค้า 12 ราย",
    docs: [],
  },
  {
    id: "AVL-3/2568",
    title: "ประกาศรับสมัครขึ้นทะเบียนผู้ค้า ครั้งที่ 3/2568",
    categories: ["security", "cleaning", "repair"],
    openedAt: "1 ก.ย. 2568",
    closedAt: "30 พ.ย. 2568",
    status: "closed",
    summary: "ปิดรับสมัครเรียบร้อยแล้ว — มีผู้ผ่านการประเมินขึ้นทะเบียนเป็นผู้ค้าของ EnCo แล้ว 47 ราย",
    docs: [],
  },
  {
    id: "AVL-1/2568",
    title: "ประกาศรับสมัครขึ้นทะเบียนผู้ค้า ครั้งที่ 1/2568",
    categories: ["security", "cleaning", "repair", "interior"],
    openedAt: "1 ก.พ. 2568",
    closedAt: "31 พ.ค. 2568",
    status: "closed",
    summary: "ปิดรับสมัครเรียบร้อยแล้ว",
    docs: [],
  },
];

const REQUIRED_DOCS = [
  { id: "cert",   th: "หนังสือรับรองบริษัท (อายุไม่เกิน 6 เดือน)", required: true },
  { id: "pp20",   th: "ภ.พ.20 (ทะเบียนภาษีมูลค่าเพิ่ม)",            required: true },
  { id: "fin",    th: "งบการเงินย้อนหลัง 3 ปี",                       required: true },
  { id: "id",     th: "สำเนาบัตรประชาชนกรรมการผู้มีอำนาจ",            required: true },
  { id: "iso",    th: "ใบรับรองมาตรฐาน (ISO, มอก. ฯลฯ)",              required: true },
  { id: "profile",th: "Company Profile",                              required: true },
];

const SUBMISSIONS = [
  {
    id: "AVL-26-0142", annoId: "AVL-1/2569",
    company: "เซฟการ์ด ซีเคียวริตี้ จำกัด", taxId: "0105556012345",
    category: "งานรักษาความปลอดภัย",
    address: "999/12 ถนนพระราม 9", subDistrict: "ห้วยขวาง", district: "ห้วยขวาง",
    province: "กรุงเทพมหานคร", postcode: "10310",
    phone: "02-555-1234", mobile: "081-234-5678",
    companyEmail: "contact@safeguard.co.th", capital: "20,000,000", yearsInBusiness: 12,
    contact: "วิชัย รัตนพงษ์", position: "ผู้จัดการฝ่ายขาย",
    email: "wichai@safeguard.co.th", contactPhone: "081-234-5678",
    submittedAt: "18 ก.ค. 2569", status: "review",   completeness: 92,  docs: 6, missing: 1,
  },
  {
    id: "AVL-26-0141", annoId: "AVL-1/2569",
    company: "คลีนพลัส เซอร์วิส", taxId: "0105560054321",
    category: "งานรักษาความสะอาด",
    address: "45/3 ถนนลาดพร้าว", subDistrict: "จตุจักร", district: "จตุจักร",
    province: "กรุงเทพมหานคร", postcode: "10900",
    phone: "02-234-5678", mobile: "081-234-5678",
    companyEmail: "info@cleanplus.co.th", capital: "5,000,000", yearsInBusiness: 7,
    contact: "สมศักดิ์ ใจดี", position: "กรรมการผู้จัดการ",
    email: "somsak@cleanplus.co.th", contactPhone: "081-234-5678",
    submittedAt: "18 ก.ค. 2569", status: "new",      completeness: 100, docs: 7, missing: 0,
  },
  {
    id: "AVL-26-0140", annoId: "AVL-3/2569",
    company: "เมก้าฟิกซ์ เอ็นจิเนียริ่ง", taxId: "0105549987654",
    category: "งานปรับปรุง-ซ่อมแซมทั่วไป",
    address: "123 ถนนบางนา-ตราด กม.8", subDistrict: "บางนา", district: "บางนา",
    province: "กรุงเทพมหานคร", postcode: "10260",
    phone: "02-888-4567", mobile: "089-888-4567",
    companyEmail: "info@megafix.com", capital: "50,000,000", yearsInBusiness: 18,
    contact: "กชกร แสงทอง", position: "ผู้อำนวยการฝ่ายขาย",
    email: "kotchakorn@megafix.com", contactPhone: "089-888-4567",
    submittedAt: "17 ก.ค. 2569", status: "approved", completeness: 100, docs: 5, missing: 0,
  },
  {
    id: "AVL-26-0139", annoId: "AVL-3/2569",
    company: "อินทีเรียร์ ดีไซน์ สตูดิโอ", taxId: "0105561112233",
    category: "งานปรับปรุง-ซ่อมแซมตกแต่งภายใน",
    address: "77/5 ซอยสุขุมวิท 31", subDistrict: "คลองเตยเหนือ", district: "วัฒนา",
    province: "กรุงเทพมหานคร", postcode: "10110",
    phone: "02-610-3344", mobile: "086-789-0123",
    companyEmail: "info@indesign.co.th", capital: "3,000,000", yearsInBusiness: 5,
    contact: "ธนพล ศรีสุข", position: "ผู้จัดการโครงการ",
    email: "tanapol@indesign.co.th", contactPhone: "086-789-0123",
    submittedAt: "17 ก.ค. 2569", status: "review",   completeness: 85,  docs: 4, missing: 1,
  },
  {
    id: "AVL-26-0138", annoId: "AVL-2/2569",
    company: "ครีเอทีฟ บิวด์ แอนด์ ดีโค", taxId: "0105558443322",
    category: "งานปรับปรุง-ซ่อมแซมตกแต่งภายใน",
    address: "34/18 ถนนนวมินทร์", subDistrict: "นวมินทร์", district: "บึงกุ่ม",
    province: "กรุงเทพมหานคร", postcode: "10230",
    phone: "02-374-5566", mobile: "091-345-6789",
    companyEmail: "hello@creativebuild.co", capital: "2,000,000", yearsInBusiness: 3,
    contact: "พิมพ์ใจ ทองคำ", position: "ผู้จัดการทั่วไป",
    email: "pim@creativebuild.co", contactPhone: "091-345-6789",
    submittedAt: "16 ก.ค. 2569", status: "review",   completeness: 60,  docs: 3, missing: 3,
  },
  {
    id: "AVL-26-0137", annoId: "AVL-2/2569",
    company: "พรีเมียร์การ์ด แอนด์ เซอร์วิส", taxId: "0105545667788",
    category: "งานรักษาความปลอดภัย",
    address: "56/2 ถนนแจ้งวัฒนะ", subDistrict: "ทุ่งสองห้อง", district: "หลักสี่",
    province: "กรุงเทพมหานคร", postcode: "10210",
    phone: "02-456-7890", mobile: "086-456-7890",
    companyEmail: "contact@premierguard.co.th", capital: "15,000,000", yearsInBusiness: 22,
    contact: "นภา สุขใจ", position: "ผู้จัดการฝ่ายพัฒนาธุรกิจ",
    email: "napa@premierguard.co.th", contactPhone: "086-456-7890",
    submittedAt: "16 ก.ค. 2569", status: "approved", completeness: 100, docs: 6, missing: 0,
  },
  {
    id: "AVL-26-0136", annoId: "AVL-1/2569",
    company: "อีโคคลีน เซอร์วิส", taxId: "0105563009987",
    category: "งานรักษาความสะอาด",
    address: "89/1 ถนนรัชดาภิเษก", subDistrict: "ลาดยาว", district: "จตุจักร",
    province: "กรุงเทพมหานคร", postcode: "10900",
    phone: "02-513-4455", mobile: "087-654-3210",
    companyEmail: "info@ecoclean.co.th", capital: "4,000,000", yearsInBusiness: 8,
    contact: "รัฐพล มั่นคง", position: "กรรมการผู้จัดการ",
    email: "rattapon@ecoclean.co.th", contactPhone: "087-654-3210",
    submittedAt: "15 ก.ค. 2569", status: "approved", completeness: 100, docs: 5, missing: 0,
  },
  {
    id: "AVL-26-0135", annoId: "AVL-1/2569",
    company: "ฟิกซ์แอนด์ฟาส เอ็นเตอร์ไพรส์", taxId: "0105541223344",
    category: "งานปรับปรุง-ซ่อมแซมทั่วไป",
    address: "12/7 ถนนเพชรบุรี", subDistrict: "มักกะสัน", district: "ราษฎร์บูรณะ",
    province: "กรุงเทพมหานคร", postcode: "10400",
    phone: "02-310-8899", mobile: "083-210-9876",
    companyEmail: "info@fixandfast.com", capital: "8,000,000", yearsInBusiness: 10,
    contact: "วรัญญา ใจกล้า", position: "ผู้จัดการฝ่ายขาย",
    email: "waranya@fixandfast.com", contactPhone: "083-210-9876",
    submittedAt: "15 ก.ค. 2569", status: "review",   completeness: 90,  docs: 5, missing: 1,
  },
  {
    id: "AVL-26-0134", annoId: "AVL-1/2569",
    company: "โฮม เดคคอร์ พลัส", taxId: "0105557998877",
    category: "งานปรับปรุง-ซ่อมแซมตกแต่งภายใน",
    address: "201/3 ถนนเอกมัย", subDistrict: "คลองเตยเหนือ", district: "วัฒนา",
    province: "กรุงเทพมหานคร", postcode: "10110",
    phone: "02-711-2233", mobile: "095-432-1098",
    companyEmail: "hello@homedecor.co", capital: "1,500,000", yearsInBusiness: 4,
    contact: "กษิดิ์เดช ทรัพย์ดี", position: "ผู้บริหาร",
    email: "kasidet@homedecor.co", contactPhone: "095-432-1098",
    submittedAt: "14 ก.ค. 2569", status: "new",      completeness: 100, docs: 6, missing: 0,
  },
];

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
Object.assign(window, { DataContext, useData });
