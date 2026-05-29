// Vendor-side pages: Landing (announcements), Registration form (multi-step), Status tracker

function simDownload(filename, url) {
  if (url) { window.open(url, "_blank"); return; }
  const a = document.createElement("a");
  const blob = new Blob([`[ไฟล์จำลอง: ${filename}]`], { type: "application/octet-stream" });
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Force-download a file from a URL (works around cross-origin download attribute limitation)
async function forceDownload(url, filename) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename || "prequalification.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (_) {
    // fallback: open in new tab
    window.open(url, "_blank");
  }
}

function fmtDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
}

// คำนวณสถานะจากวันที่จริง (ใช้ร่วมกันทั้ง vendor และ admin)
function computeAnnoStatus(closedAt, openedAt) {
  if (!closedAt || !openedAt) return "draft";
  const now = new Date();
  const open = new Date(openedAt);
  const close = new Date(closedAt);
  if (now < open) return "draft";   // ยังไม่ถึงวันเปิด
  if (now > close) return "closed";
  const daysLeft = (close - now) / (1000 * 60 * 60 * 24);
  return daysLeft <= 7 ? "closing" : "open";
}

// ── Landing / announcement page ─────────────────────────────────────────────
function VendorLanding({ goto }) {
  const { groups, announcements, settings = {} } = useData();
  const annList = announcements || ANNOUNCEMENTS;
  const groupList = groups || VENDOR_CATEGORIES;
  console.log('🎯 VendorLanding:', { annList: annList?.length, groupList: groupList?.length });

  // ใช้ date-aware status ทุกครั้ง — ไม่ใช้ a.status จาก DB โดยตรง
  const effStatus = (a) => computeAnnoStatus(a.closedAt, a.openedAt);
  const open = (annList || []).filter(a => { const s = effStatus(a); return s === "open" || s === "closing"; });
  const past = (annList || []).filter(a => effStatus(a) === "closed");
  const groupById = Object.fromEntries((groupList || []).map(g => [g.id, g]));

  return (
    <div className="fade-in">
      {/* Simple hero */}
      <div style={{
        position: "relative", overflow: "hidden", borderRadius: 16,
        padding: "44px clamp(28px, 5vw, 52px)",
        background: "linear-gradient(135deg, var(--primary) 0%, oklch(32% 0.13 250) 100%)",
        color: "#fff", marginBottom: 32,
      }}>
        <div className="stripe-bg" style={{ position: "absolute", inset: 0, opacity: .22 }} />
        <div style={{ position: "relative", maxWidth: 720 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 12px", background: "rgba(255,255,255,.16)",
            borderRadius: 999, fontSize: 12.5, fontWeight: 500, marginBottom: 18 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
            <span>{settings.avlName || "EnCo Approved Vendor List (AVL)"}</span>
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(26px, 3.6vw, 38px)", lineHeight: 1.2,
            fontWeight: 600, letterSpacing: "-.01em", marginBottom: 12 }}>
            {settings.heroTitle || "ระบบขึ้นทะเบียนผู้ค้าของ EnCo"}
          </h1>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.8, opacity: .92,
            maxWidth: 700, marginBottom: 24 }}>
            {settings.orgFullName || "บริษัท เอนเนอร์ยี่ คอมเพล็กซ์ จำกัด"} ({settings.orgName || "EnCo"}) ขอเชิญชวนผู้ค้าที่สนใจสมัครขึ้นทะเบียนของ {settings.orgName || "EnCo"}
            เพื่อประโยชน์ในการจัดหาเชิงพาณิชย์ด้วยวิธีประมูล โดยมีวัตถุประสงค์เพื่อให้มั่นใจว่า
            ภายใต้กระบวนการกำหนดกลุ่มงาน และขั้นตอน หรือวิธีการในการคัดเลือกผู้ค้าเพื่อขึ้นทะเบียนผู้ค้ากับ {settings.orgName || "EnCo"} นั้น
            จะได้ผู้ค้าที่มีประสิทธิภาพ สามารถส่งมอบสินค้า หรือบริการได้ตรงกับความต้องการขององค์กร
            และส่งเสริมความเป็นพันธมิตร (Partnership) กับ {settings.orgName || "EnCo"} อย่างยั่งยืน
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn" style={{ background: "#fff", color: "var(--primary-ink)" }}
              onClick={() => {
                const el = document.getElementById("announcements-feed");
                if (el) window.scrollTo({ top: el.offsetTop - 40, behavior: "smooth" });
              }}>
              <Icon name="megaphone" size={16} /> ดูประกาศที่เปิดรับ
            </button>
            <button className="btn btn-ghost" style={{ borderColor: "rgba(255,255,255,.3)", color: "#fff" }}
              onClick={() => goto("avl-registry")}>
              <Icon name="building" size={16} /> ทะเบียนรายชื่อผู้ค้า
            </button>
          </div>
        </div>
      </div>

      {/* Current open announcement */}
      <div id="announcements-feed" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
        marginBottom: 14, gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>ประกาศรับสมัครที่เปิดอยู่</h2>
        <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>{(open || []).length} ฉบับ</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
        {(open || []).map(a => (
          <div key={a.id} className="card" style={{ padding: "clamp(14px, 4vw, 24px) clamp(14px, 5vw, 28px)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 260, minWidth: 0 }}>
                {/* Status + ID */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
                  flexWrap: "wrap" }}>
                  <StatusChip status={effStatus(a)} map={ANNC_STATUS_LABEL} />
                  <span style={{ fontSize: 12, color: "var(--text-3)",
                    fontFamily: "var(--font-mono)" }}>{a.id}</span>
                </div>

                {/* Title */}
                <h3 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 700,
                  letterSpacing: "-.005em", lineHeight: 1.3 }}>{a.title}</h3>

                {/* Date range — subtle inline */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6,
                  marginBottom: 14, fontSize: 13, color: "var(--text)",
                  padding: "5px 10px", background: "var(--surface-2)",
                  border: "1px solid var(--line)", borderRadius: 8 }}>
                  <Icon name="track" size={13} style={{ color: "var(--text-3)" }} />
                  <span>รับสมัคร {fmtDate(a.openedAt)}</span>
                  <span style={{ color: "var(--text-3)" }}>—</span>
                  <span>{fmtDate(a.closedAt)}</span>
                </div>

                {/* Summary */}
                {a.summary ? (
                  <p style={{ margin: "0 0 18px", color: "var(--text-2)", fontSize: 14,
                    maxWidth: 760, lineHeight: 1.7 }}>{a.summary}</p>
                ) : null}

                {/* Pre-Q per category */}
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)",
                      marginBottom: 2 }}>
                      กลุ่มงานที่เปิดรับสมัคร
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                      ดาวน์โหลดฟอร์ม Pre-Qualification ของแต่ละกลุ่มงาน เพื่อทำแบบประเมิน
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(a.categories || []).map(cid => {
                      const g = groupById && groupById[cid];
                      if (!g) return null;
                      const preqDoc = (a.docs || []).find(d => d.categoryId === cid);
                      const hasFile = !!(preqDoc?.url);
                      return (
                        <div key={cid} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 14px",
                          border: `1px solid ${hasFile ? "var(--primary-border)" : "var(--line)"}`,
                          background: hasFile ? "var(--primary-soft)" : "var(--surface-2)",
                          borderRadius: 10,
                        }}>
                          <span style={{ fontSize: 18, flexShrink: 0 }}>{g.icon}</span>
                          <div style={{ flex: 1, minWidth: 80, overflow: "hidden" }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)",
                              lineHeight: 1.4 }}>
                              {g.th}
                            </div>
                            {hasFile && (
                              <div style={{ fontSize: 11, color: "var(--primary-ink)", marginTop: 1,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                fontFamily: "var(--font-mono)" }}>
                                {preqDoc.name}
                              </div>
                            )}
                          </div>
                          {hasFile ? (
                            <button
                              className="btn btn-sm"
                              style={{
                                flexShrink: 0,
                                background: "var(--primary)", color: "#fff",
                                border: "none", whiteSpace: "nowrap",
                              }}
                              onClick={() => forceDownload(preqDoc.url, preqDoc.name)}
                              title={`ดาวน์โหลด ${preqDoc.name}`}
                            >
                              <Icon name="download" size={13} />
                              <span className="btn-dl-text">ดาวน์โหลด</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: "var(--text-3)",
                              padding: "4px 8px", border: "1px dashed var(--line)",
                              borderRadius: 6, flexShrink: 0, whiteSpace: "nowrap" }}>
                              ยังไม่มีไฟล์
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                <button className="btn btn-primary" onClick={() => goto("form", a.id)}>
                  สมัครประกาศนี้
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Past announcements */}
      {(past && past.length) ? (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 600,
            color: "var(--text-2)" }}>ประกาศที่ปิดรับสมัครแล้ว</h2>
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>เลขที่ประกาศ</th>
                  <th>ชื่อประกาศ</th>
                  <th>กลุ่มที่เปิด</th>
                  <th>ปิดรับ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(past || []).map(a => (
                  <tr key={a.id}>
                    <td className="mono" style={{ fontSize: 12.5, color: "var(--text-2)" }}>{a.id}</td>
                    <td style={{ fontWeight: 500 }}>{a.title}</td>
                    <td style={{ color: "var(--text-2)" }}>{(a.categories || []).length} กลุ่ม</td>
                    <td style={{ color: "var(--text-2)" }}>{fmtDate(a.closedAt)}</td>
                    <td><StatusChip status="closed" map={ANNC_STATUS_LABEL} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Contact footer */}
      <div style={{
        position: "relative", overflow: "hidden", borderRadius: 20,
        background: "linear-gradient(135deg, var(--primary) 0%, oklch(32% 0.13 250) 100%)",
        padding: "clamp(28px, 5vw, 44px) clamp(24px, 6vw, 52px)",
        color: "#fff",
      }}>
        {/* stripe pattern */}
        <div className="stripe-bg" style={{ position: "absolute", inset: 0, opacity: .15, pointerEvents: "none" }} />

        <div style={{ position: "relative", display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
          {/* Left — heading */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
              padding: "4px 12px", background: "rgba(255,255,255,.15)",
              borderRadius: 999, fontSize: 12, fontWeight: 500, marginBottom: 14 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
              ติดต่อเรา
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 700, lineHeight: 1.3 }}>
              สอบถามข้อมูลเพิ่มเติม
            </h3>
            <p style={{ margin: 0, fontSize: 14, opacity: .85, lineHeight: 1.7, maxWidth: 400 }}>
              ฝ่ายจัดซื้อ {settings.orgName || "EnCo"} ยินดีให้ข้อมูลและตอบข้อซักถามเกี่ยวกับการขึ้นทะเบียนคู่ค้า
            </p>
          </div>

          {/* Right — contact cards */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* Phone */}
            <a href={`tel:${(settings.contactPhone || "").replace(/\s/g, "")}`}
              style={{ display: "flex", alignItems: "center", gap: 14,
                padding: "16px 22px", borderRadius: 14,
                background: "rgba(255,255,255,.12)",
                border: "1px solid rgba(255,255,255,.2)",
                backdropFilter: "blur(8px)",
                textDecoration: "none", color: "#fff",
                transition: "background .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.12)"}>
              <div style={{ width: 40, height: 40, borderRadius: 10,
                background: "rgba(255,255,255,.18)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                📞
              </div>
              <div>
                <div style={{ fontSize: 11, opacity: .75, marginBottom: 3, fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase" }}>โทรศัพท์</div>
                <div className="mono" style={{ fontSize: 15, fontWeight: 700, letterSpacing: ".02em" }}>
                  {settings.contactPhone || "02-123-4567 ต่อ 8801"}
                </div>
              </div>
            </a>

            {/* Email */}
            <a href={`mailto:${settings.contactEmail || "procurement.enco@energycomplex.co.th"}`}
              style={{ display: "flex", alignItems: "center", gap: 14,
                padding: "16px 22px", borderRadius: 14,
                background: "rgba(255,255,255,.12)",
                border: "1px solid rgba(255,255,255,.2)",
                backdropFilter: "blur(8px)",
                textDecoration: "none", color: "#fff",
                transition: "background .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.12)"}>
              <div style={{ width: 40, height: 40, borderRadius: 10,
                background: "rgba(255,255,255,.18)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                ✉️
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, opacity: .75, marginBottom: 3, fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase" }}>อีเมล</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 700,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
                  {settings.contactEmail || "procurement.enco@energycomplex.co.th"}
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


// Validation helpers
const validatePhone = (phone) => {
  if (!phone) return null;
  const pattern = /^(0\d{1,2})-(\d{3,4})-(\d{4})$/;
  if (!pattern.test(phone)) return "รูปแบบไม่ถูกต้อง (เช่น 02-1234-5678 หรือ 081-234-5678)";
  return null;
};

// Auto-format Thai phone number with dashes as user types
// Bangkok (02-XXXX-XXXX) vs Mobile/Provincial (0XX-XXX-XXXX)
function autoFormatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  if (digits.startsWith("02")) {
    // Bangkok: 02-XXXX-XXXX
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return digits.slice(0, 2) + "-" + digits.slice(2);
    return digits.slice(0, 2) + "-" + digits.slice(2, 6) + "-" + digits.slice(6);
  }
  // Mobile / Provincial: 0XX-XXX-XXXX
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.slice(0, 3) + "-" + digits.slice(3);
  return digits.slice(0, 3) + "-" + digits.slice(3, 6) + "-" + digits.slice(6);
}

const validateEmail = (email) => {
  if (!email) return null;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email)) return "รูปแบบอีเมลไม่ถูกต้อง (ตัวอย่าง: name@example.com)";
  return null;
};

// ── Registration form (multi-step) ──────────────────────────────────────────
function VendorForm({ goto, annoId }) {
  const { groups, categories, announcements } = useData();
  const annList = announcements || ANNOUNCEMENTS;
  const groupList = (groups && groups.length > 0 ? groups : null)
                 || (categories && categories.length > 0 ? categories : null)
                 || VENDOR_CATEGORIES;
  const targetAnnc = annoId && annList.find(a => a.id === annoId)
    || annList.find(a => a.status === "open" || a.status === "closing");
  const allowedCatIds = targetAnnc?.categories || [];
  const STEPS = [
    { id: "category", label: "ประเภทกลุ่มงาน" },
    { id: "company",  label: "ข้อมูลทั่วไป" },
    { id: "contact",  label: "ผู้ติดต่อ" },
    { id: "review",   label: "ตรวจสอบ & ส่ง" },
  ];
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({
    categories: allowedCatIds.length === 1 ? [allowedCatIds[0]] : [],
    vendorName: "",
    taxId: "",
    address: "",
    subDistrict: "",
    district: "",
    province: "กรุงเทพมหานคร",
    postalCode: "",
    phone: "",
    mobile: "",
    email: "",
    years: "",
    capital: "",
    contactName: "",
    contactPosition: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [errors, setErrors] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);
  const [consent, setConsent] = React.useState(false);
  const [showErr, setShowErr] = React.useState(false);

  // Validate individual fields
  const validateField = (key, value) => {
    const v = String(value || "").trim();

    // Company phone: optional, but validate format if filled
    if (key === "phone") return validatePhone(v); // validatePhone returns null when empty

    // Required check for all other fields
    if (!v) return "กรุณากรอกข้อมูลให้ครบถ้วน";

    // Tax ID: exactly 13 digits
    if (key === "taxId") {
      const digits = v.replace(/\D/g, "");
      if (digits.length !== 13) return "เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก";
      return null;
    }

    // Phone format validation
    if (key === "mobile" || key === "contactPhone") {
      return validatePhone(v);
    }

    // Email validation
    if (key === "email" || key === "contactEmail") {
      return validateEmail(v);
    }

    return null;
  };

  // Update form and validate — functional updates to avoid stale-closure bugs
  const update = (k) => (e) => {
    let val = e.target?.value ?? e;
    if (k === "phone" || k === "mobile" || k === "contactPhone") {
      val = autoFormatPhone(val);
    }
    setForm(f => ({ ...f, [k]: val }));
    const err = validateField(k, val);
    setErrors(prev => {
      const n = { ...prev };
      if (err) n[k] = err; else delete n[k];
      return n;
    });
  };

  // Capital field — auto-comma (1,000,000) on input
  const updateCapital = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const formatted = raw ? parseInt(raw, 10).toLocaleString("en-US") : "";
    setForm(f => ({ ...f, capital: formatted }));
    setErrors(err => {
      const n = { ...err };
      if (!formatted) n.capital = "กรุณากรอกข้อมูลให้ครบถ้วน";
      else delete n.capital;
      return n;
    });
  };

  // Pure validation — NO setState calls inside (calling setState during render causes infinite loop)
  const validateStep = (s, f = form, c = consent) => {
    if (s === 0) {
      return f.categories.length > 0
        ? { ok: true, errors: {} }
        : { ok: false, msg: "กรุณาเลือกอย่างน้อย 1 กลุ่มงาน", errors: {} };
    }
    if (s === 1) {
      const need = ["vendorName","taxId","years","address","subDistrict",
        "district","province","postalCode","mobile","email","capital"];
      const newErrors = {};
      need.forEach(k => {
        const err = validateField(k, f[k]);
        if (err) newErrors[k] = err;
      });
      return Object.keys(newErrors).length === 0
        ? { ok: true, errors: {} }
        : { ok: false, msg: "กรุณากรอกข้อมูลให้ครบถ้วน", errors: newErrors };
    }
    if (s === 2) {
      const need = ["contactName","contactPosition","contactEmail","contactPhone"];
      const newErrors = {};
      need.forEach(k => {
        const err = validateField(k, f[k]);
        if (err) newErrors[k] = err;
      });
      return Object.keys(newErrors).length === 0
        ? { ok: true, errors: {} }
        : { ok: false, msg: "กรุณากรอกข้อมูลให้ครบถ้วน", errors: newErrors };
    }
    if (s === 3) {
      return c
        ? { ok: true, errors: {} }
        : { ok: false, msg: "กรุณายอมรับเงื่อนไขก่อนส่งใบสมัคร", errors: {} };
    }
    return { ok: true, errors: {} };
  };
  const currentValid = validateStep(step);

  const goNext = () => {
    const v = validateStep(step);
    if (!v.ok) {
      setShowErr(true);
      if (Object.keys(v.errors).length > 0) setErrors(v.errors);
      return;
    }
    setShowErr(false);
    setErrors({});
    setStep(s => Math.min(STEPS.length - 1, s + 1));
  };
  const goPrev = () => {
    setShowErr(false);
    setStep(s => Math.max(0, s - 1));
  };

  const [submissionId, setSubmissionId] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  const [submitStep, setSubmitStep] = React.useState("");

  const SUBMIT_COOLDOWN_MS = 10 * 60 * 1000; // 10 นาที

  const submit = async () => {
    if (!currentValid.ok) { setShowErr(true); return; }

    // ── Rate limit: ป้องกัน spam ──
    const lastSubmit = parseInt(localStorage.getItem("enco_last_submit") || "0", 10);
    const elapsed = Date.now() - lastSubmit;
    if (lastSubmit && elapsed < SUBMIT_COOLDOWN_MS) {
      const remaining = Math.ceil((SUBMIT_COOLDOWN_MS - elapsed) / 60000);
      alert(`กรุณารออีก ${remaining} นาทีก่อนส่งใบสมัครอีกครั้ง เพื่อป้องกันการส่งซ้ำ`);
      return;
    }

    try {
      setSubmitting(true);

      // ── 1. สร้างเลขที่ใบสมัคร ──
      const year = new Date().getFullYear().toString().slice(-2);
      const id = `AVL-${year}-${Math.floor(Math.random() * 9000 + 1000)}`;
      const catNames = (groupList || [])
        .filter(g => form.categories.includes(g.id)).map(g => g.th).join(", ");
      const submittedAt = new Date().toLocaleString("th-TH");

      // ── 2. บันทึกข้อมูลใน Supabase Database (text เท่านั้น) ──
      setSubmitStep("กำลังบันทึกข้อมูล...");
      console.log('📤 [submit] form.categories =', form.categories);
      const submissionData = {
        id,
        annoId: targetAnnc?.id || null,
        company: form.vendorName,
        taxId: form.taxId,
        categories: form.categories,   // full array — saved as JSON in DB
        address: form.address,
        subDistrict: form.subDistrict,
        district: form.district,
        province: form.province,
        postcode: form.postalCode,
        phone: form.phone,
        mobile: form.mobile,
        companyEmail: form.email,
        capital: form.capital,
        yearsInBusiness: form.years,
        contact: form.contactName,
        position: form.contactPosition,
        email: form.contactEmail,
        contactPhone: form.contactPhone,
        submittedAt: new Date().toISOString(),
      };
      if (window.createSubmissionInDb) {
        await window.createSubmissionInDb(submissionData);
      }

      // บันทึก timestamp สำหรับ rate limit
      localStorage.setItem("enco_last_submit", Date.now().toString());

      setSubmissionId(id);
      setSubmitted(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setSubmitting(false);
      setSubmitStep("");
    }
  };

  if (submitted) return <SubmittedScreen goto={goto} submissionId={submissionId} form={form} />;

  return (
    <div className="fade-in" style={{ maxWidth: 980, margin: "0 auto" }}>
      <SectionHeader
        eyebrow="Vendor Registration"
        title="ลงทะเบียนคู่ค้า EnCo"
        desc="กรอกข้อมูล 4 ขั้นตอนเพื่อสมัครเป็นคู่ค้า ใช้เวลาประมาณ 5-10 นาที"
        action={
          <button className="btn btn-ghost btn-sm" onClick={() => goto("landing")}>
            <Icon name="arrowLeft" size={14} /> กลับหน้าหลัก
          </button>
        } />

      {/* Important note */}
      <div style={{
        padding: "14px 20px", marginBottom: 16,
        background: "var(--warn-soft)", border: "1px solid oklch(85% 0.08 70)",
        borderRadius: "var(--radius-lg)", display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <Icon name="bell" size={16} style={{ color: "oklch(55% 0.12 70)", marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.7 }}>
          <b style={{ color: "oklch(45% 0.12 70)" }}>หมายเหตุ:</b>{" "}
          การกรอกแบบฟอร์ม <b>(1)</b> เป็นการแจ้งความประสงค์เบื้องต้น ผู้ค้าจะต้องกรอกข้อมูลในฟอร์ม{" "}
          Pre-Qualification <b>(2)</b> ของแต่ละงานจัดซื้อจัดจ้างฯ โดยผู้ค้าจะต้องผ่านการประเมินก่อน
          และได้รับแจ้งจาก EnCo ว่าได้รับการขึ้นทะเบียนเป็นผู้ค้าของ EnCo{" "}
          จึงจะสามารถเข้าร่วมประมูลแข่งขันในรายการสินค้าและบริการที่สมัครได้
        </div>
      </div>

      {/* Stepper */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
        <Stepper steps={STEPS} current={step} />
      </div>

      {/* Form body */}
      <div className="card" style={{ padding: "28px 32px", marginBottom: 16 }}>
        {step === 0 && <StepCategory form={form} setForm={setForm} annc={targetAnnc} />}
        {step === 1 && <StepCompany form={form} update={update} errors={errors} updateCapital={updateCapital} />}
        {step === 2 && <StepContact form={form} update={update} errors={errors} />}
        {step === 3 && <StepReview form={form} consent={consent} setConsent={setConsent} />}
      </div>

      {/* Nav */}
      <div className="card" style={{ padding: "14px 20px", display: "flex",
        justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "var(--text-3)" }}>
          ขั้นตอนที่ <span className="num" style={{ fontWeight: 600, color: "var(--text)" }}>{step + 1}</span>
          {" / "}<span className="num">{STEPS.length}</span> · บันทึกอัตโนมัติ
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {showErr && !currentValid.ok ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", background: "var(--danger-soft)",
              color: "oklch(42% 0.14 25)", borderRadius: 8, fontSize: 12.5,
              marginRight: 4,
            }}>
              <Icon name="x" size={13} stroke={2.4} />
              <span>{currentValid.msg}</span>
            </div>
          ) : null}
          <button className="btn btn-ghost" disabled={step === 0}
            onClick={goPrev}>
            <Icon name="arrowLeft" size={14} /> ก่อนหน้า
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={goNext}>
              ถัดไป <Icon name="arrowRight" size={14} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={submit}
              disabled={submitting}>
              {submitting
                ? (submitStep || "กำลังส่ง...")
                : <><span>ส่งใบสมัคร</span> <Icon name="check" size={14} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const StepCategory = ({ form, setForm, annc }) => {
  const { groups, categories } = useData();
  const groupList = (groups && groups.length > 0 ? groups : null)
                 || (categories && categories.length > 0 ? categories : null)
                 || VENDOR_CATEGORIES;
  const activeAnnc = annc;
  // Show ONLY the categories that the announcement opens
  const availableGroups = groupList.filter(g => (activeAnnc?.categories || []).includes(g.id));
  const toggle = (id) => {
    setForm(f => {
      const has = f.categories.includes(id);
      return { ...f, categories: has ? f.categories.filter(c => c !== id) : [...f.categories, id] };
    });
  };
  const selected = groupList.filter(g => form.categories.includes(g.id));
  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 600 }}>เลือกประเภทกลุ่มงาน</h3>
      <p style={{ margin: "0 0 16px", color: "var(--text-2)", fontSize: 14 }}>
        เลือกได้มากกว่า 1 กลุ่มงานที่บริษัทของคุณให้บริการ — แสดงเฉพาะกลุ่มที่ประกาศนี้เปิดรับสมัคร
      </p>
      {activeAnnc ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", background: "var(--primary-soft)",
          border: "1px solid var(--primary-border)", borderRadius: 10,
          marginBottom: 20, fontSize: 13, color: "var(--primary-ink)",
        }}>
          <Icon name="megaphone" size={15} />
          <span><b>{activeAnnc.title}</b> · เปิดรับ {availableGroups.length} กลุ่มงาน</span>
        </div>
      ) : (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", background: "var(--warn-soft)",
          border: "1px solid oklch(85% 0.08 70)", borderRadius: 10,
          marginBottom: 20, fontSize: 13, color: "oklch(45% 0.12 70)",
        }}>
          <Icon name="bell" size={15} />
          <span>ไม่มีประกาศที่เปิดรับสมัครในขณะนี้</span>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 12, marginBottom: 24 }}>
        {(availableGroups || []).map(c => {
          const checked = form.categories.includes(c.id);
          return (
            <label key={c.id} style={{
              padding: 16, display: "flex", gap: 12, alignItems: "flex-start",
              border: `1px solid ${checked ? "var(--primary)" : "var(--line)"}`,
              background: checked ? "var(--primary-soft)" : "var(--surface)",
              borderRadius: 12, cursor: "pointer", transition: "all .15s",
            }}>
              <input type="checkbox" checked={checked} onChange={() => toggle(c.id)}
                style={{ marginTop: 2, accentColor: "var(--primary)" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{c.th}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4,
                  fontFamily: "var(--font-en)" }}>{c.en}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 6 }}>
                  ขอผลงาน <b style={{ color: "var(--text-2)" }}>{c.worksRequired || 0}</b> ผลงาน
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

const StepCompany = ({ form, update, errors, updateCapital }) => (
  <div>
    <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 600 }}>ข้อมูลทั่วไป</h3>
    <p style={{ margin: "0 0 24px", color: "var(--text-2)", fontSize: 14 }}>
      กรอกข้อมูลให้ตรงตามหนังสือรับรองบริษัท รายการที่มีเครื่องหมาย <span style={{ color: "var(--danger)" }}>*</span> จำเป็นต้องกรอก
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <Field label="ชื่อ Vendor" required span={2} error={errors.vendorName}>
        <input className="input" value={form.vendorName} onChange={update("vendorName")} style={{ borderColor: errors.vendorName ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="เลขประจำตัวผู้เสียภาษี" required hint="13 หลัก ตามเอกสาร ภ.พ.20" error={errors.taxId}>
        <input className="input mono" value={form.taxId} onChange={update("taxId")}
          placeholder="0000000000000" maxLength={13}
          style={{ borderColor: errors.taxId ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="ระยะเวลาที่ทำธุรกิจ (ปี)" required error={errors.years}>
        <input className="input num" value={form.years} onChange={update("years")} style={{ borderColor: errors.years ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="ที่อยู่นิติบุคคล (เลขที่ / ถนน)" required span={2} error={errors.address}>
        <textarea className="textarea" value={form.address} onChange={update("address")} rows={2} style={{ borderColor: errors.address ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="แขวง / ตำบล" required error={errors.subDistrict}>
        <input className="input" value={form.subDistrict} onChange={update("subDistrict")} style={{ borderColor: errors.subDistrict ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="เขต / อำเภอ" required error={errors.district}>
        <input className="input" value={form.district} onChange={update("district")} style={{ borderColor: errors.district ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="จังหวัด" required error={errors.province}>
        <select className="select" value={form.province} onChange={update("province")} style={{ borderColor: errors.province ? "var(--danger)" : undefined }}>
          <option>กรุงเทพมหานคร</option>
          <option>สมุทรปราการ</option>
          <option>นนทบุรี</option>
          <option>ปทุมธานี</option>
          <option>ชลบุรี</option>
          <option>ระยอง</option>
        </select>
      </Field>
      <Field label="รหัสไปรษณีย์" required error={errors.postalCode}>
        <input className="input mono" value={form.postalCode} onChange={update("postalCode")} style={{ borderColor: errors.postalCode ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="โทรศัพท์ (บริษัท)" hint="ไม่บังคับ" error={errors.phone}>
        <input className="input mono" value={form.phone} onChange={update("phone")}
          placeholder="02-1234-5678" maxLength={13}
          style={{ borderColor: errors.phone ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="โทรศัพท์มือถือ" required error={errors.mobile}>
        <input className="input mono" value={form.mobile} onChange={update("mobile")}
          placeholder="081-234-5678" maxLength={12}
          style={{ borderColor: errors.mobile ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="อีเมล" required span={2} error={errors.email}>
        <input className="input mono" value={form.email} onChange={update("email")} placeholder="contact@example.com" style={{ borderColor: errors.email ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="ทุนจดทะเบียน (บาท)" required span={2} error={errors.capital}>
        <input className="input num" value={form.capital} onChange={updateCapital}
          placeholder="เช่น 1,000,000"
          style={{ borderColor: errors.capital ? "var(--danger)" : undefined }} />
      </Field>
    </div>
  </div>
);

const DocChecklist = ({ form, compact = false }) => {
  const { groups, categories } = useData();
  // `groups` starts as [] and is populated via useEffect (one render delay).
  // Fall through to `categories` which is synced directly from Supabase.
  const groupList = (groups && groups.length > 0 ? groups : null)
                 || (categories && categories.length > 0 ? categories : null)
                 || VENDOR_CATEGORIES;
  const selectedGroups = groupList.filter(g => form.categories.includes(g.id));
  const itemStyle = {
    display: "flex", alignItems: "flex-start", gap: 8,
    fontSize: compact ? 12.5 : 13, color: "var(--text-2)", lineHeight: 1.55,
    padding: "4px 0",
  };
  const dotStyle = {
    width: 6, height: 6, borderRadius: "50%",
    background: "var(--primary)", flexShrink: 0, marginTop: 6,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 10 : 14 }}>
      {/* General docs */}
      <div>
        <div style={{ fontSize: compact ? 11 : 11.5, fontWeight: 600, color: "var(--primary)",
          letterSpacing: ".07em", textTransform: "uppercase",
          fontFamily: "var(--font-en)", marginBottom: 8 }}>
          เอกสารทั่วไป (ทุกบริษัทต้องส่ง)
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {REQUIRED_DOCS.map(d => (
            <div key={d.id} style={itemStyle}>
              <span style={dotStyle} />
              <span>{d.th}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-group docs */}
      {selectedGroups.length > 0 && (
        <div>
          <div style={{ fontSize: compact ? 11 : 11.5, fontWeight: 600, color: "var(--primary)",
            letterSpacing: ".07em", textTransform: "uppercase",
            fontFamily: "var(--font-en)", marginBottom: 8 }}>
            เอกสารเฉพาะกลุ่มงานที่สมัคร
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selectedGroups.map(g => (
              <div key={g.id} style={{
                padding: "10px 14px",
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 8,
              }}>
                <div style={{ fontWeight: 600, fontSize: compact ? 12.5 : 13,
                  color: "var(--text)", marginBottom: 6, display: "flex",
                  alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: compact ? 15 : 17 }}>{g.icon}</span>
                  <span>{g.th}</span>
                </div>
                <div style={itemStyle}>
                  <span style={dotStyle} />
                  <span>แบบฟอร์ม Pre-Qualification สำหรับกลุ่ม "{g.th}"</span>
                </div>
                <div style={itemStyle}>
                  <span style={dotStyle} />
                  <span>
                    ผลงานที่ผ่านมา{" "}
                    <b style={{ color: "var(--primary-ink)" }}>
                      {g.worksRequired || 0} ผลงาน
                    </b>
                    {" "}(แนบเป็นไฟล์ PDF หรือรูปภาพ)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StepContact = ({ form, update, errors }) => (
  <div>
    <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 600 }}>ผู้ติดต่อ</h3>
    <p style={{ margin: "0 0 24px", color: "var(--text-2)", fontSize: 14 }}>
      ระบุผู้ประสานงานหลัก เพื่อให้ EnCo ติดต่อกลับเรื่องการสมัคร
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <Field label="ชื่อ-นามสกุล" required error={errors.contactName}>
        <input className="input" value={form.contactName} onChange={update("contactName")} style={{ borderColor: errors.contactName ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="ตำแหน่ง" required error={errors.contactPosition}>
        <input className="input" value={form.contactPosition} onChange={update("contactPosition")} style={{ borderColor: errors.contactPosition ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="อีเมล" required error={errors.contactEmail}>
        <input className="input mono" value={form.contactEmail} onChange={update("contactEmail")} placeholder="email@example.com" style={{ borderColor: errors.contactEmail ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="โทรศัพท์มือถือ" required error={errors.contactPhone}>
        <input className="input mono" value={form.contactPhone} onChange={update("contactPhone")}
          placeholder="081-234-5678" maxLength={12}
          style={{ borderColor: errors.contactPhone ? "var(--danger)" : undefined }} />
      </Field>
    </div>

    {/* Email + document checklist banner */}
    <div style={{
      marginTop: 24, padding: "20px 24px",
      background: "var(--primary-soft)",
      border: "1px solid var(--primary-border)",
      borderRadius: 12,
    }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface)",
          display: "grid", placeItems: "center", color: "var(--primary)", flexShrink: 0, marginTop: 2 }}>
          <Icon name="paperclip" size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14.5, color: "var(--primary-ink)", marginBottom: 6 }}>
            📎 เอกสารที่ต้องส่งทางอีเมล
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 12 }}>
            หลังกรอกข้อมูลครบ กรุณาส่งเอกสารทั้งหมดด้านล่างนี้มาที่:{" "}
            <span style={{
              fontFamily: "var(--font-mono)", fontWeight: 600,
              color: "var(--primary-ink)",
            }}>procurement.enco@energycomplex.co.th</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 14 }}>
            <b>Subject:</b>{" "}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5,
              background: "var(--surface)", padding: "2px 8px", borderRadius: 5,
              border: "1px solid var(--line)", color: "var(--text)" }}>
              ลงทะเบียนคู่ค้า EnCo — {form.vendorName || "(ชื่อบริษัท)"}
            </span>
          </div>
          <DocChecklist form={form} />
        </div>
      </div>
    </div>
  </div>
);


const StepReview = ({ form, consent, setConsent }) => {
  const { groups } = useData();
  const groupList = groups || VENDOR_CATEGORIES;
  const cats = groupList.filter(c => form.categories.includes(c.id)).map(c => c.th);
  const Block = ({ title, children }) => (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--primary)",
        letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10,
        fontFamily: "var(--font-en)" }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", rowGap: 10, columnGap: 16, fontSize: 13.5 }}>
        {children}
      </div>
    </div>
  );
  const Row = ({ k, v, mono }) => (
    <>
      <div style={{ color: "var(--text-3)" }}>{k}</div>
      <div style={{ color: "var(--text)", fontFamily: mono ? "var(--font-mono)" : "inherit" }}>{v}</div>
    </>
  );
  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 600 }}>ตรวจสอบข้อมูลก่อนส่ง</h3>
      <p style={{ margin: "0 0 24px", color: "var(--text-2)", fontSize: 14 }}>
        กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนส่งใบสมัคร เมื่อส่งแล้วต้องติดต่อ Admin หากต้องการแก้ไข
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <Block title="ประเภทกลุ่มงาน">
          <Row k="หมวดที่สมัคร" v={cats.join(" · ")} />
        </Block>
        <div className="divider" />
        <Block title="ข้อมูลทั่วไป">
          <Row k="ชื่อ Vendor" v={form.vendorName} />
          <Row k="เลขผู้เสียภาษี" v={form.taxId} mono />
          <Row k="ที่อยู่" v={`${form.address} แขวง${form.subDistrict} เขต${form.district} ${form.province} ${form.postalCode}`} />
          <Row k="โทรศัพท์บริษัท" v={form.phone} mono />
          <Row k="โทรศัพท์มือถือ" v={form.mobile} mono />
          <Row k="อีเมล" v={form.email} mono />
          <Row k="ระยะเวลาทำธุรกิจ" v={`${form.years} ปี`} />
          <Row k="ทุนจดทะเบียน" v={`${form.capital} บาท`} />
        </Block>
        <div className="divider" />
        <Block title="ผู้ติดต่อ">
          <Row k="ชื่อ" v={`${form.contactName} (${form.contactPosition})`} />
          <Row k="อีเมล" v={form.contactEmail} mono />
          <Row k="โทรศัพท์" v={form.contactPhone} mono />
        </Block>
        <div className="divider" />
        {/* Email doc reminder with full checklist */}
        <div style={{
          padding: "20px 24px",
          background: "var(--primary-soft)",
          border: "1px solid var(--primary-border)",
          borderRadius: 12,
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--surface)",
              display: "grid", placeItems: "center", color: "var(--primary)", flexShrink: 0, marginTop: 2 }}>
              <Icon name="paperclip" size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--primary-ink)", marginBottom: 6 }}>
                📎 เอกสารที่ต้องส่งทางอีเมลหลังกด "ส่งใบสมัคร"
              </div>
              <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 6 }}>
                ส่งมาที่:{" "}
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600,
                  color: "var(--primary-ink)" }}>
                  procurement.enco@energycomplex.co.th
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-2)", marginBottom: 14 }}>
                <b>Subject:</b>{" "}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12,
                  background: "var(--surface)", padding: "2px 7px", borderRadius: 5,
                  border: "1px solid var(--line)", color: "var(--text)" }}>
                  ลงทะเบียนคู่ค้า EnCo — {form.vendorName || "(ชื่อบริษัท)"}
                </span>
              </div>
              <DocChecklist form={form} compact />
            </div>
          </div>
        </div>
        <label style={{ display: "flex", gap: 10, padding: 14,
          background: consent ? "var(--success-soft)" : "var(--surface-2)",
          border: `1px solid ${consent ? "oklch(82% 0.08 155)" : "var(--line)"}`,
          borderRadius: 10, fontSize: 13.5, cursor: "pointer", transition: "all .15s" }}>
          <input type="checkbox" checked={!!consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={{ accentColor: "var(--primary)", marginTop: 2 }} />
          <span style={{ color: "var(--text-2)" }}>
            ข้าพเจ้ารับรองว่าข้อมูลและเอกสารที่ส่งทั้งหมดเป็นความจริง และยินยอมให้ EnCo ตรวจสอบข้อมูลตาม
            <a href="#" style={{ color: "var(--primary)", textDecoration: "underline" }}> ระเบียบและเงื่อนไข</a>
          </span>
        </label>
      </div>
    </div>
  );
};

const SubmittedScreen = ({ goto, submissionId, form }) => (
  <div className="fade-in" style={{ maxWidth: 640, margin: "60px auto", textAlign: "center" }}>
    <div style={{
      width: 84, height: 84, margin: "0 auto 24px",
      borderRadius: "50%", background: "var(--success-soft)",
      display: "grid", placeItems: "center",
      color: "oklch(38% 0.11 155)",
    }}>
      <Icon name="check" size={42} stroke={2.6} />
    </div>
    <h1 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 600 }}>ส่งใบสมัครเรียบร้อย</h1>
    <p style={{ margin: "0 0 8px", color: "var(--text-2)", fontSize: 15 }}>
      ขอบคุณที่สนใจร่วมเป็นคู่ค้ากับ EnCo
    </p>
    <p style={{ margin: 0, color: "var(--text-3)", fontSize: 14 }}>
      เลขที่ใบสมัคร: <span className="mono" style={{ color: "var(--text)", fontWeight: 600 }}>{submissionId || "AVL-26-0142"}</span>
    </p>

    {/* Email reminder with checklist */}
    <div style={{
      margin: "24px 0 0",
      padding: "20px 24px",
      background: "var(--warn-soft)",
      border: "1px solid oklch(85% 0.08 70)",
      borderRadius: 12, textAlign: "left",
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ fontSize: 24, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>📎</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "oklch(45% 0.12 70)", marginBottom: 6 }}>
            อย่าลืม! ส่งเอกสารมาทางอีเมล
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 4 }}>
            ส่งมาที่:{" "}
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600,
              color: "oklch(45% 0.12 70)" }}>
              procurement.enco@energycomplex.co.th
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-2)", marginBottom: 14 }}>
            <b>Subject:</b>{" "}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12,
              background: "var(--surface)", padding: "2px 7px", borderRadius: 5,
              border: "1px solid var(--line)", color: "var(--text)" }}>
              ลงทะเบียนคู่ค้า EnCo — (ระบุชื่อบริษัท)
            </span>
          </div>
          {form && <DocChecklist form={form} compact />}
        </div>
      </div>
    </div>

    <div className="card" style={{ padding: 20, margin: "20px 0", textAlign: "left" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)",
        letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12,
        fontFamily: "var(--font-en)" }}>ขั้นตอนถัดไป</div>
      {[
        "ส่งเอกสารประกอบการสมัครมาทางอีเมลที่แจ้งไว้ด้านบน",
        "ฝ่ายจัดซื้อจะตรวจสอบข้อมูลและเอกสาร ภายใน 5-7 วันทำการ",
        "ติดตามประกาศรายชื่อผู้ค้าที่ผ่านการคัดเลือกได้ที่หน้าทะเบียนรายชื่อผู้ค้า",
      ].map((t, i) => (
        <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", fontSize: 13.5 }}>
          <span className="num" style={{ width: 22, height: 22, borderRadius: "50%",
            background: "var(--primary-soft)", color: "var(--primary-ink)",
            display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{i + 1}</span>
          <span style={{ color: "var(--text-2)" }}>{t}</span>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      <button className="btn btn-primary" onClick={() => goto("avl-registry")}>
        <Icon name="building" size={14} /> ดูทะเบียนรายชื่อผู้ค้า
      </button>
      <button className="btn btn-ghost" onClick={() => goto("landing")}>กลับหน้าหลัก</button>
    </div>
  </div>
);



Object.assign(window, { VendorLanding, VendorForm });
