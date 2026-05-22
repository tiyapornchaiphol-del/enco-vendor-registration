// Vendor-side pages: Landing (announcements), Registration form (multi-step), Status tracker

function simDownload(filename) {
  const a = document.createElement("a");
  const blob = new Blob([`[ไฟล์จำลอง: ${filename}]`], { type: "application/octet-stream" });
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Landing / announcement page ─────────────────────────────────────────────
function VendorLanding({ goto }) {
  const { groups, announcements } = useData();
  const annList = announcements || ANNOUNCEMENTS;
  const groupList = groups || VENDOR_CATEGORIES;
  console.log('🎯 VendorLanding:', { annList: annList?.length, groupList: groupList?.length });
  const open = (annList || []).filter(a => a.status !== "closed");
  const past = (annList || []).filter(a => a.status === "closed");
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
            <span>EnCo Approved Vendor List (AVL)</span>
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(26px, 3.6vw, 38px)", lineHeight: 1.2,
            fontWeight: 600, letterSpacing: "-.01em", marginBottom: 12 }}>
            ระบบขึ้นทะเบียนผู้ค้าของ EnCo
          </h1>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, opacity: .85,
            maxWidth: 600, marginBottom: 24 }}>
            ลงทะเบียนเป็นผู้ค้าออนไลน์ ดาวน์โหลดประกาศและรายชื่อทะเบียนคู่ค้า
            และตรวจสอบสถานะใบสมัครได้ในที่เดียว
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
              onClick={() => goto("track")}>
              <Icon name="track" size={16} /> ตรวจสอบสถานะ
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
          <div key={a.id} className="card" style={{ padding: "24px 28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: 24, alignItems: "start" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
                  flexWrap: "wrap" }}>
                  <StatusChip status={a.status} map={ANNC_STATUS_LABEL} />
                  <span style={{ fontSize: 12, color: "var(--text-3)",
                    fontFamily: "var(--font-mono)" }}>{a.id}</span>
                  <span style={{ color: "var(--text-3)", fontSize: 12 }}>·</span>
                  <span style={{ fontSize: 12.5, color: "var(--text-2)" }}>
                    {a.openedAt} → <b>{a.closedAt}</b>
                  </span>
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 600,
                  letterSpacing: "-.005em", lineHeight: 1.3 }}>{a.title}</h3>
                <p style={{ margin: 0, color: "var(--text-2)", fontSize: 14, maxWidth: 760,
                  lineHeight: 1.6 }}>
                  {a.summary}
                </p>

                {/* Category chips */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-3)",
                    letterSpacing: ".06em", textTransform: "uppercase",
                    fontFamily: "var(--font-en)", marginBottom: 8 }}>
                    กลุ่มงานที่เปิดรับสมัคร ({(a.categories || []).length} กลุ่ม)
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(a.categories || []).map(cid => {
                      const g = groupById && groupById[cid];
                      if (!g) return null;
                      return (
                        <span key={cid} className="pill" style={{
                          background: "var(--primary-soft)", color: "var(--primary-ink)",
                          gap: 6, padding: "4px 11px",
                        }}>
                          <span>{g.icon}</span>
                          <span style={{ fontWeight: 500 }}>{g.th}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Documents */}
                {a.docs.length ? (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-3)",
                      letterSpacing: ".06em", textTransform: "uppercase",
                      fontFamily: "var(--font-en)", marginBottom: 8 }}>
                      เอกสารประกาศ ({a.docs.length} ไฟล์)
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {a.docs.map(d => (
                        <button key={d.name} className="btn btn-ghost btn-sm"
                          style={{ paddingLeft: 10, paddingRight: 12 }}
                          onClick={() => simDownload(d.name)}>
                          <Icon name="download" size={13} />
                          <span style={{ maxWidth: 240, overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                          <span style={{ color: "var(--text-3)", fontSize: 11,
                            fontFamily: "var(--font-mono)", marginLeft: 4 }}>{d.size}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
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
                    <td style={{ color: "var(--text-2)" }}>{a.closedAt}</td>
                    <td><StatusChip status="closed" map={ANNC_STATUS_LABEL} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Contact footer */}
      <div className="card" style={{ padding: "20px 24px", display: "flex",
        gap: 20, alignItems: "center", flexWrap: "wrap",
        background: "var(--surface-2)" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
            สอบถามข้อมูลเพิ่มเติม
          </h3>
          <p style={{ margin: "2px 0 0", color: "var(--text-2)", fontSize: 13 }}>
            ติดต่อฝ่ายจัดซื้อ EnCo สำหรับข้อมูลเกี่ยวกับการขึ้นทะเบียนคู่ค้า
          </p>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
          <div>
            <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>โทรศัพท์</div>
            <div className="mono" style={{ fontWeight: 500 }}>02-123-4567 ต่อ 8801</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>อีเมล</div>
            <div className="mono" style={{ fontWeight: 500 }}>procurement.enco@energycomplex.co.th</div>
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
  if (!pattern.test(phone)) return "รูปแบบเบอร์โทรไม่ถูกต้อง (ระบบ: 02-555-1234 หรือ 081-234-5678)";
  return null;
};

const validateEmail = (email) => {
  if (!email) return null;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email)) return "รูปแบบอีเมลไม่ถูกต้อง (ตัวอย่าง: name@example.com)";
  return null;
};

// ── Registration form (multi-step) ──────────────────────────────────────────
function VendorForm({ goto, annoId }) {
  const { groups, announcements } = useData();
  const annList = announcements || ANNOUNCEMENTS;
  const groupList = groups || VENDOR_CATEGORIES;
  console.log('🎬 VendorForm init:', { annList: annList?.length, groupList: groupList?.length });
  const targetAnnc = annoId && annList.find(a => a.id === annoId)
    || annList.find(a => a.status === "open" || a.status === "closing");
  const allowedCatIds = targetAnnc?.categories || [];
  const STEPS = [
    { id: "category", label: "ประเภทกลุ่มงาน" },
    { id: "company",  label: "ข้อมูลทั่วไป" },
    { id: "contact",  label: "ผู้ติดต่อ" },
    { id: "docs",     label: "อัปโหลดเอกสาร" },
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
    province: "",
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
  const [files, setFiles] = React.useState({
    general: {
      cert:    { name: "หนังสือรับรอง_บริษัท.pdf", size: "245 KB" },
      pp20:    { name: "ภพ20_safeguard.pdf",         size: "180 KB" },
      fin:     { name: "งบการเงิน_3ปี.pdf",        size: "1.4 MB" },
      id:      null, iso: null, profile: null,
    },
    groups: {}, // { security: { preq: null, works: [null, null, null] }, ... }
  });
  const [submitted, setSubmitted] = React.useState(false);
  const [consent, setConsent] = React.useState(false);
  const [showErr, setShowErr] = React.useState(false);

  // Validate individual fields
  const validateField = (key, value) => {
    const v = String(value || "").trim();

    // Required check
    if (!v) return "กรุณากรอกข้อมูลให้ครบถ้วน";

    // Phone validation
    if (key === "phone" || key === "mobile" || key === "contactPhone") {
      return validatePhone(v);
    }

    // Email validation
    if (key === "email" || key === "contactEmail") {
      return validateEmail(v);
    }

    return null;
  };

  // Update form and validate
  const update = (k) => (e) => {
    const val = e.target?.value ?? e;
    setForm({ ...form, [k]: val });
    const err = validateField(k, val);
    if (err) {
      setErrors({ ...errors, [k]: err });
    } else {
      const newErrors = { ...errors };
      delete newErrors[k];
      setErrors(newErrors);
    }
  };

  // Step validation
  const validateStep = (s) => {
    if (s === 0) {
      return form.categories.length > 0
        ? { ok: true }
        : { ok: false, msg: "กรุณาเลือกอย่างน้อย 1 กลุ่มงาน" };
    }
    if (s === 1) {
      const need = ["vendorName","taxId","years","address","subDistrict",
        "district","province","postalCode","phone","mobile","email","capital"];
      const newErrors = {};
      const empty = [];
      need.forEach(k => {
        const err = validateField(k, form[k]);
        if (err) {
          newErrors[k] = err;
          empty.push(k);
        }
      });
      if (showErr) setErrors(newErrors);
      return empty.length === 0
        ? { ok: true }
        : { ok: false, msg: "กรุณากรอกข้อมูลให้ครบถ้วน" };
    }
    if (s === 2) {
      const need = ["contactName","contactPosition","contactEmail","contactPhone"];
      const newErrors = {};
      const empty = [];
      need.forEach(k => {
        const err = validateField(k, form[k]);
        if (err) {
          newErrors[k] = err;
          empty.push(k);
        }
      });
      if (showErr) setErrors(newErrors);
      return empty.length === 0
        ? { ok: true }
        : { ok: false, msg: "กรุณากรอกข้อมูลให้ครบถ้วน" };
    }
    if (s === 3) {
      const generalMissing = REQUIRED_DOCS.filter(d => !files.general[d.id]).length;
      const selectedGroups = (groupList || []).filter(g => form.categories.includes(g.id));
      let groupMissing = 0;
      (selectedGroups || []).forEach(g => {
        const gf = files.groups[g.id] || { preq: null, works: [] };
        if (!gf.preq) groupMissing++;
        const worksDone = (gf.works || []).filter(Boolean).length;
        groupMissing += Math.max(0, (g.worksRequired || 0) - worksDone);
      });
      const total = generalMissing + groupMissing;
      return total === 0
        ? { ok: true }
        : { ok: false, msg: `ยังไม่ได้แนบเอกสาร ${total} รายการ` };
    }
    if (s === 4) {
      return consent
        ? { ok: true }
        : { ok: false, msg: "กรุณายอมรับเงื่อนไขก่อนส่งใบสมัคร" };
    }
    return { ok: true };
  };
  const currentValid = validateStep(step);

  const goNext = () => {
    if (!currentValid.ok) { setShowErr(true); return; }
    setShowErr(false);
    setStep(s => Math.min(STEPS.length - 1, s + 1));
  };
  const goPrev = () => {
    setShowErr(false);
    setStep(s => Math.max(0, s - 1));
  };

  const [submissionId, setSubmissionId] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async () => {
    if (!currentValid.ok) { setShowErr(true); return; }

    try {
      setSubmitting(true);

      // Generate submission ID (AVL-YY-XXXX format)
      const year = new Date().getFullYear().toString().slice(-2);
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const id = `AVL-${year}-${randomNum}`;

      // Prepare submission data
      const submissionData = {
        id,
        annoId: targetAnnc?.id || "AVL-1/2569",
        company: form.vendorName,
        taxId: form.taxId,
        category: groups.find(g => form.categories.includes(g.id))?.th || form.categories[0],
        address: form.address,
        subDistrict: form.subDistrict,
        district: form.district,
        province: form.province,
        postcode: form.postalCode,
        phone: form.phone,
        mobile: form.mobile,
        companyEmail: form.email,
        capital: form.capital,
        yearsInBusiness: parseInt(form.years, 10),
        contact: form.contactName,
        position: form.contactPosition,
        email: form.contactEmail,
        contactPhone: form.contactPhone,
        submittedAt: new Date().toLocaleString("th-TH"),
      };

      // Save to Supabase
      if (window.createSubmissionInDb) {
        await window.createSubmissionInDb(submissionData);
      }

      setSubmissionId(id);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('เกิดข้อผิดพลาดในการส่งใบสมัคร: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <SubmittedScreen goto={goto} submissionId={submissionId} />;

  return (
    <div className="fade-in" style={{ maxWidth: 980, margin: "0 auto" }}>
      <SectionHeader
        eyebrow="Vendor Registration"
        title="ลงทะเบียนคู่ค้า EnCo"
        desc="กรอกข้อมูล 5 ขั้นตอนเพื่อสมัครเป็นคู่ค้า ใช้เวลาประมาณ 10-15 นาที"
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
        {step === 1 && <StepCompany form={form} update={update} errors={errors} />}
        {step === 2 && <StepContact form={form} update={update} errors={errors} />}
        {step === 3 && <StepDocs form={form} files={files} setFiles={setFiles} />}
        {step === 4 && <StepReview form={form} files={files} consent={consent} setConsent={setConsent} />}
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
            <button className="btn btn-primary" onClick={goNext}
              disabled={!currentValid.ok}
              title={currentValid.ok ? "" : currentValid.msg}>
              ถัดไป <Icon name="arrowRight" size={14} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={submit}
              disabled={!currentValid.ok}
              title={currentValid.ok ? "" : currentValid.msg}>
              ส่งใบสมัคร <Icon name="check" size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const StepCategory = ({ form, setForm, annc }) => {
  const { groups } = useData();
  const groupList = groups || VENDOR_CATEGORIES;
  const activeAnnc = annc;
  // Show ONLY the categories that the announcement opens
  const availableGroups = groupList.filter(g => (activeAnnc?.categories || []).includes(g.id));
  const toggle = (id) => {
    const has = form.categories.includes(id);
    setForm({ ...form, categories: has ? form.categories.filter(c => c !== id)
                                       : [...form.categories, id] });
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

      {/* Pre-Qualification downloads for selected groups */}
      {selected.length ? (
        <div style={{
          padding: 20,
          background: "var(--surface-2)",
          border: "1px solid var(--line)",
          borderRadius: 12,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            marginBottom: 14, gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--primary)",
                letterSpacing: ".08em", textTransform: "uppercase",
                fontFamily: "var(--font-en)", marginBottom: 4 }}>
                Pre-Qualification
              </div>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
                ดาวน์โหลดแบบฟอร์ม Pre-Qualification ของกลุ่มที่เลือก
              </h4>
              <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--text-2)" }}>
                ดาวน์โหลด กรอกข้อมูลให้ครบ แล้วอัปโหลดกลับในขั้น "อัปโหลดเอกสาร"
              </p>
            </div>
            <button className="btn btn-soft btn-sm"
              onClick={() => selected.forEach(c => { const preq = PREQ_DOCS[c.id]; simDownload(preq?.name || `Pre-Qualification_${c.id}.docx`); })}>
              <Icon name="download" size={13} /> ดาวน์โหลดทั้งหมด ({selected.length})
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(selected || []).map(c => {
              const preq = PREQ_DOCS[c.id];
              return (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", background: "var(--surface)",
                  border: "1px solid var(--line)", borderRadius: 8,
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 7,
                    background: "var(--primary-soft)", color: "var(--primary)",
                    display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon name="file" size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>
                      <span style={{ marginRight: 6 }}>{c.icon}</span>{c.th}
                    </div>
                    <div className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                      {preq?.name || `Pre-Qualification_${c.id}.docx`}
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                    {preq?.size || "—"}
                  </span>
                  <button className="btn btn-ghost btn-sm"
                    onClick={() => simDownload(preq?.name || `Pre-Qualification_${c.id}.docx`)}>
                    <Icon name="download" size={13} /> ดาวน์โหลด
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const StepCompany = ({ form, update, errors }) => (
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
        <input className="input mono" value={form.taxId} onChange={update("taxId")} style={{ borderColor: errors.taxId ? "var(--danger)" : undefined }} />
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
      <Field label="โทรศัพท์ (บริษัท)" required hint="รูปแบบ: 02-555-1234" error={errors.phone}>
        <input className="input mono" value={form.phone} onChange={update("phone")} placeholder="02-555-1234" style={{ borderColor: errors.phone ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="โทรศัพท์มือถือ" required hint="รูปแบบ: 081-234-5678" error={errors.mobile}>
        <input className="input mono" value={form.mobile} onChange={update("mobile")} placeholder="081-234-5678" style={{ borderColor: errors.mobile ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="อีเมล" required span={2} error={errors.email}>
        <input className="input mono" value={form.email} onChange={update("email")} placeholder="contact@example.com" style={{ borderColor: errors.email ? "var(--danger)" : undefined }} />
      </Field>
      <Field label="ทุนจดทะเบียน (บาท)" required span={2} error={errors.capital}>
        <input className="input num" value={form.capital} onChange={update("capital")} style={{ borderColor: errors.capital ? "var(--danger)" : undefined }} />
      </Field>
    </div>
  </div>
);

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
      <Field label="โทรศัพท์มือถือ" required hint="รูปแบบ: 081-234-5678" error={errors.contactPhone}>
        <input className="input mono" value={form.contactPhone} onChange={update("contactPhone")} placeholder="081-234-5678" style={{ borderColor: errors.contactPhone ? "var(--danger)" : undefined }} />
      </Field>
    </div>
    <div style={{
      marginTop: 20, padding: "12px 16px",
      background: "var(--surface-2)", borderRadius: 10,
      display: "flex", gap: 10, alignItems: "flex-start",
      fontSize: 12.5, color: "var(--text-2)",
    }}>
      <Icon name="track" size={14} style={{ color: "var(--text-3)", marginTop: 2, flexShrink: 0 }} />
      <div>
        <b style={{ color: "var(--text)" }}>หมายเหตุ:</b>{" "}
        ผลงานที่ผ่านมาให้แนบเป็นไฟล์ในขั้นถัดไป (อัปโหลดเอกสาร)
        โดยจะขอเอกสารผลงานแยกตามแต่ละกลุ่มงานที่สมัคร
      </div>
    </div>
  </div>
);

const StepDocs = ({ form, files, setFiles }) => {
  const { groups } = useData();
  const groupList = groups || VENDOR_CATEGORIES;
  const selectedGroups = groupList.filter(g => form.categories.includes(g.id));

  // Helpers
  const setGeneral = (id, file) => setFiles({
    ...files,
    general: { ...files.general, [id]: file },
  });
  const setGroupPreq = (gid, file) => setFiles({
    ...files,
    groups: { ...files.groups, [gid]: { ...(files.groups[gid] || { works: [] }), preq: file } },
  });
  const setGroupWork = (gid, idx, file) => {
    const cur = files.groups[gid] || { preq: null, works: [] };
    const works = [...cur.works];
    works[idx] = file;
    setFiles({
      ...files,
      groups: { ...files.groups, [gid]: { ...cur, works } },
    });
  };

  // Counts for completeness
  const generalDone = REQUIRED_DOCS.filter(d => files.general[d.id]).length;
  const generalTotal = REQUIRED_DOCS.length;
  let groupDone = 0, groupTotal = 0;
  (selectedGroups || []).forEach(g => {
    groupTotal += 1 + g.worksRequired; // preq + N works
    const gf = files.groups[g.id];
    if (gf?.preq) groupDone++;
    if (gf?.works) groupDone += gf.works.filter(Boolean).length;
  });
  const totalDone = generalDone + groupDone;
  const totalReq = generalTotal + groupTotal;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 24, gap: 24 }}>
        <div>
          <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 600 }}>อัปโหลดเอกสาร</h3>
          <p style={{ margin: 0, color: "var(--text-2)", fontSize: 14 }}>
            กรุณาแนบเอกสารให้ครบทุกรายการ <span style={{ color: "var(--danger)" }}>*</span> = จำเป็นต้องส่ง
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="num" style={{ fontSize: 22, fontWeight: 600, color: "var(--primary)" }}>
            {totalDone} / {totalReq}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>แนบแล้ว</div>
        </div>
      </div>

      {/* General docs */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>เอกสารทั่วไป</h4>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>
            {generalDone}/{generalTotal} แนบแล้ว
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {REQUIRED_DOCS.map(d => (
            <FileSlot key={d.id} doc={d} file={files.general[d.id]}
              onPick={(f) => setGeneral(d.id, f)}
              onRemove={() => setGeneral(d.id, null)} />
          ))}
        </div>
      </div>

      {/* Per-group docs */}
      {selectedGroups.length === 0 ? (
        <div style={{
          padding: "20px 24px", background: "var(--warn-soft)",
          border: "1px solid oklch(85% 0.08 70)", borderRadius: 12,
          fontSize: 13, color: "var(--text-2)", textAlign: "center",
        }}>
          <Icon name="bell" size={14} style={{ verticalAlign: "middle", marginRight: 6,
            color: "oklch(50% 0.15 70)" }} />
          กรุณากลับไปขั้นตอน "ประเภทกลุ่มงาน" และเลือกอย่างน้อย 1 กลุ่ม
        </div>
      ) : (selectedGroups || []).map(g => {
        const gf = files.groups[g.id] || { preq: null, works: [] };
        const works = gf.works || [];
        const worksDone = works.filter(Boolean).length;
        return (
          <div key={g.id} style={{
            marginBottom: 20, padding: 20,
            background: "var(--surface-2)",
            border: "1px solid var(--line)",
            borderRadius: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>{g.icon}</span>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{g.th}</h4>
              <span className="pill" style={{ background: "var(--surface)",
                color: "var(--text-3)", fontSize: 11 }}>
                {(gf.preq ? 1 : 0) + worksDone} / {1 + g.worksRequired} แนบแล้ว
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-3)", marginBottom: 14 }}>
              กลุ่ม "{g.th}" ขอเอกสาร Pre-Qualification 1 ไฟล์ และผลงาน {g.worksRequired} ผลงาน
            </div>

            {/* Pre-Qualification slot */}
            <div style={{ marginBottom: 10 }}>
              <FileSlot
                doc={{ th: `Pre-Qualification ของ "${g.th}"`, required: true }}
                file={gf.preq}
                onPick={(f) => setGroupPreq(g.id, f)}
                onRemove={() => setGroupPreq(g.id, null)} />
            </div>

            {/* Works slots */}
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)",
              letterSpacing: ".05em", textTransform: "uppercase",
              fontFamily: "var(--font-en)", marginTop: 14, marginBottom: 8 }}>
              ผลงานที่ผ่านมา ({g.worksRequired} ผลงาน)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: g.worksRequired }).map((_, i) => (
                <FileSlot key={i}
                  doc={{ th: `ผลงานที่ ${i + 1}`, required: true }}
                  file={works[i]}
                  onPick={(f) => setGroupWork(g.id, i, f)}
                  onRemove={() => setGroupWork(g.id, i, null)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const StepReview = ({ form, files, consent, setConsent }) => {
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
        <Block title="เอกสารทั่วไป">
          {REQUIRED_DOCS.map(d => (
            <React.Fragment key={d.id}>
              <div style={{ color: "var(--text-3)" }}>
                {d.th}<span style={{ color: "var(--danger)" }}> *</span>
              </div>
              <div>
                {files.general[d.id] ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6,
                    color: "oklch(38% 0.11 155)" }}>
                    <Icon name="check" size={14} stroke={2.4} />
                    <span className="mono" style={{ fontSize: 12.5 }}>{files.general[d.id].name}</span>
                  </span>
                ) : (
                  <span style={{ color: "var(--danger)" }}>ยังไม่ได้แนบ</span>
                )}
              </div>
            </React.Fragment>
          ))}
        </Block>
        {((groupList || []).filter(g => form.categories.includes(g.id)) || []).map(g => {
          const gf = files.groups[g.id] || { preq: null, works: [] };
          const works = gf.works || [];
          return (
            <React.Fragment key={g.id}>
              <div className="divider" />
              <Block title={`เอกสารกลุ่ม ${g.icon} ${g.th}`}>
                <div style={{ color: "var(--text-3)" }}>
                  Pre-Qualification<span style={{ color: "var(--danger)" }}> *</span>
                </div>
                <div>
                  {gf.preq ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6,
                      color: "oklch(38% 0.11 155)" }}>
                      <Icon name="check" size={14} stroke={2.4} />
                      <span className="mono" style={{ fontSize: 12.5 }}>{gf.preq.name}</span>
                    </span>
                  ) : (
                    <span style={{ color: "var(--danger)" }}>ยังไม่ได้แนบ</span>
                  )}
                </div>
                <div style={{ color: "var(--text-3)" }}>
                  ผลงาน ({g.worksRequired} ผลงาน)<span style={{ color: "var(--danger)" }}> *</span>
                </div>
                <div>
                  <span className="num" style={{
                    color: works.filter(Boolean).length === g.worksRequired
                      ? "oklch(38% 0.11 155)" : "var(--danger)",
                    fontWeight: 500,
                  }}>
                    {works.filter(Boolean).length} / {g.worksRequired}
                  </span>{" "}
                  <span style={{ color: "var(--text-3)" }}>ไฟล์</span>
                </div>
              </Block>
            </React.Fragment>
          );
        })}
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

const SubmittedScreen = ({ goto, submissionId }) => (
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
    <div className="card" style={{ padding: 20, margin: "32px 0", textAlign: "left" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)",
        letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12,
        fontFamily: "var(--font-en)" }}>ขั้นตอนถัดไป</div>
      {[
        "ฝ่ายจัดซื้อจะตรวจสอบเอกสารและคุณสมบัติภายใน 5-7 วันทำการ",
        "หากเอกสารไม่ครบ ทีมงานจะติดต่อกลับทางอีเมลที่ระบุไว้",
        "คุณสามารถตรวจสอบสถานะใบสมัครได้ที่หน้า 'ตรวจสอบสถานะ'",
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
      <button className="btn btn-primary" onClick={() => goto("track")}>
        ตรวจสอบสถานะ <Icon name="arrowRight" size={14} />
      </button>
      <button className="btn btn-ghost" onClick={() => goto("landing")}>กลับหน้าหลัก</button>
    </div>
  </div>
);


// ── Track status (no login — verify by ID + tax ID/email) ───────────────────
function VendorTrack({ goto }) {
  const [refNo, setRefNo] = React.useState("");
  const [verify, setVerify] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState("");

  const search = () => {
    setError("");
    const ref = refNo.trim().toUpperCase();
    const v = verify.trim().toLowerCase();
    if (!ref || !v) {
      setError("กรุณากรอกเลขที่ใบสมัครและเลขผู้เสียภาษี/อีเมล");
      return;
    }
    const found = SUBMISSIONS.find(s =>
      s.id.toUpperCase() === ref &&
      (s.taxId === v || s.email.toLowerCase() === v)
    );
    if (!found) {
      setError("ไม่พบใบสมัคร — กรุณาตรวจสอบเลขที่ใบสมัครและข้อมูลยืนยันตัวตน");
      setResult(null);
    } else {
      setResult(found);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: "0 auto" }}>
      <SectionHeader
        eyebrow="Application Status"
        title="ตรวจสอบสถานะใบสมัคร"
        desc="ใส่เลขที่ใบสมัครพร้อมเลขผู้เสียภาษีหรืออีเมลที่ใช้ตอนสมัคร เพื่อตรวจสอบสถานะ — ไม่ต้องสมัครสมาชิก"
        action={
          <button className="btn btn-ghost btn-sm" onClick={() => goto("landing")}>
            <Icon name="arrowLeft" size={14} /> กลับหน้าหลัก
          </button>
        } />

      {/* Lookup form */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12,
          alignItems: "flex-end" }}>
          <Field label="เลขที่ใบสมัคร" required hint="ดูได้ในอีเมลยืนยันการสมัคร">
            <input className="input mono" value={refNo} onChange={(e) => setRefNo(e.target.value)}
              placeholder="AVL-26-XXXX" />
          </Field>
          <Field label="เลขผู้เสียภาษี หรือ อีเมล" required hint="ใช้ยืนยันตัวตน">
            <input className="input mono" value={verify} onChange={(e) => setVerify(e.target.value)}
              placeholder="0105556012345 หรือ contact@..." />
          </Field>
          <button className="btn btn-primary" onClick={search} style={{ height: "var(--row-h)" }}>
            <Icon name="search" size={14} /> ตรวจสอบ
          </button>
        </div>

        {error ? (
          <div style={{
            marginTop: 12, padding: "10px 14px",
            background: "var(--danger-soft)", color: "oklch(42% 0.14 25)",
            borderRadius: 8, fontSize: 13, display: "flex", gap: 8, alignItems: "center",
          }}>
            <Icon name="x" size={14} /> {error}
          </div>
        ) : null}

        <div style={{
          marginTop: 14, padding: "10px 14px",
          background: "var(--surface-2)", borderRadius: 8,
          fontSize: 12.5, color: "var(--text-2)", display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <Icon name="track" size={14} style={{ color: "var(--text-3)", marginTop: 2, flexShrink: 0 }} />
          <div>
            ทดสอบ: ลองใช้ <button className="mono" onClick={() => { setRefNo("AVL-26-0142"); setVerify("0105556012345"); }}
              style={{ background: "none", border: "none", color: "var(--primary)",
                textDecoration: "underline", cursor: "pointer", padding: 0, font: "inherit" }}>
              AVL-26-0142
            </button>{" "}+ เลขผู้เสียภาษี <span className="mono">0105556012345</span>
          </div>
        </div>
      </div>

      {result ? <TrackResult sub={result} /> : null}
    </div>
  );
}

const TrackResult = ({ sub }) => (
  <>
    <div className="card" style={{ padding: 28, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
            flexWrap: "wrap" }}>
            <span className="mono" style={{ fontSize: 12.5, color: "var(--text-3)" }}>{sub.id}</span>
            <span style={{ color: "var(--text-3)", fontSize: 12 }}>·</span>
            <StatusChip status={sub.status} />
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{sub.company}</h2>
          <div style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 4 }}>
            {sub.category} · ยื่นเมื่อ {sub.submittedAt}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>ความครบถ้วนเอกสาร</div>
          <div style={{ width: 200 }}><Progress value={sub.completeness} /></div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--primary)",
        letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 14,
        fontFamily: "var(--font-en)" }}>ประวัติการดำเนินการ</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {TIMELINE.map((t, i) => (
          <div key={t.id} style={{ display: "grid", gridTemplateColumns: "20px 1fr",
            gap: 14, padding: "10px 0", position: "relative" }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 12, height: 12, borderRadius: "50%",
                background: i === TIMELINE.length - 1 ? "var(--primary)" : "var(--success)",
                marginTop: 4, marginLeft: 4,
                boxShadow: i === TIMELINE.length - 1
                  ? "0 0 0 4px var(--primary-soft)" : "0 0 0 4px var(--success-soft)",
              }} />
              {i < TIMELINE.length - 1 ? (
                <div style={{ position: "absolute", left: 9, top: 18, bottom: -10,
                  width: 2, background: "var(--line)" }} />
              ) : null}
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{t.action}</div>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>{t.date}</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>
                <span style={{ color: "var(--text-3)" }}>โดย</span> {t.actor} — {t.note}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {sub.status === "review" && sub.missing > 0 ? <UploadMore sub={sub} /> : null}
    {sub.status === "approved" ? (
      <div className="card" style={{
        padding: 24, display: "flex", gap: 16, alignItems: "flex-start",
        background: "var(--success-soft)", border: "1px solid oklch(82% 0.08 155)",
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--surface)",
          display: "grid", placeItems: "center", color: "oklch(38% 0.11 155)", flexShrink: 0 }}>
          <Icon name="check" size={22} stroke={2.4} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: "oklch(38% 0.11 155)", marginBottom: 6 }}>
            ทางเราได้รับเอกสารครบถ้วนแล้ว
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.65 }}>
            ใบสมัครของคุณได้รับการอนุมัติเบื้องต้นเรียบร้อยแล้ว
            กรุณารอดูรายชื่อได้ที่หน้า{" "}
            <b style={{ color: "oklch(38% 0.11 155)" }}>ทะเบียนรายชื่อผู้ค้า</b>{" "}
            เมื่อ EnCo ประกาศรายชื่อผู้ที่ผ่านการคัดเลือก
          </div>
        </div>
      </div>
    ) : null}
  </>
);

// Inline upload section shown when admin has requested more documents
const UploadMore = ({ sub }) => {
  const [uploads, setUploads] = React.useState([]);
  const [note, setNote] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const inputRef = React.useRef(null);

  const onFile = (e) => {
    const list = [...(e.target.files || [])].map(f => ({
      name: f.name, size: `${(f.size / 1024).toFixed(0)} KB`,
    }));
    setUploads([...uploads, ...list]);
    e.target.value = "";
  };

  if (sent) {
    return (
      <div className="card" style={{ padding: 20, display: "flex",
        gap: 16, alignItems: "center",
        background: "var(--success-soft)", border: "1px solid oklch(82% 0.08 155)" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface)",
          display: "grid", placeItems: "center", color: "oklch(38% 0.11 155)", flexShrink: 0 }}>
          <Icon name="check" size={20} stroke={2.4} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "oklch(38% 0.11 155)" }}>
            ส่งเอกสารเพิ่มเติมเรียบร้อย
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>
            ทีม EnCo จะตรวจสอบและแจ้งกลับทางอีเมลภายใน 3-5 วันทำการ
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{
      padding: 24, border: "1px solid var(--primary-border)",
      background: "var(--primary-soft)",
    }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface)",
          display: "grid", placeItems: "center", color: "var(--primary)", flexShrink: 0 }}>
          <Icon name="upload" size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--primary-ink)" }}>
            ทีม EnCo ขอเอกสารเพิ่มเติม
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>
            อัปโหลดเอกสารตามที่ทีมจัดซื้อร้องขอ คุณสามารถแนบหลายไฟล์พร้อมกันและเพิ่มหมายเหตุได้
          </div>
        </div>
      </div>

      {/* Uploads list */}
      {uploads.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {uploads.map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", background: "var(--surface)",
              borderRadius: 8, border: "1px solid var(--line)",
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 7,
                background: "var(--success-soft)", color: "oklch(38% 0.11 155)",
                display: "grid", placeItems: "center" }}>
                <Icon name="check" size={16} stroke={2.4} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 13, fontWeight: 500,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>{f.size}</div>
              </div>
              <button className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setUploads(uploads.filter((_, j) => j !== i))}>
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={onFile} />
      <button className="btn btn-ghost" style={{ width: "100%", borderStyle: "dashed",
        background: "var(--surface)" }} onClick={() => inputRef.current?.click()}>
        <Icon name="upload" size={14} /> {uploads.length ? "เพิ่มไฟล์อีก" : "เลือกไฟล์ที่ต้องการแนบ"}
      </button>

      <div style={{ marginTop: 14 }}>
        <div className="label" style={{ marginBottom: 6 }}>
          <span>หมายเหตุถึงทีมจัดซื้อ (ไม่บังคับ)</span>
        </div>
        <textarea className="textarea" rows={3} value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="เช่น 'แนบใบรับรอง ISO ฉบับล่าสุดตามที่ขอ + เพิ่มผลงานเสริม'" />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={() => setSent(true)}
          disabled={uploads.length === 0}>
          <Icon name="paperclip" size={14} /> ส่งเอกสารเพิ่ม ({uploads.length} ไฟล์)
        </button>
      </div>
    </div>
  );
};

// ── AVL Registry (dedicated page) ───────────────────────────────────────────
function VendorRegistry({ goto }) {
  const { registryDocs } = useData();
  return (
    <div className="fade-in" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <SectionHeader
        eyebrow="Approved Vendor List"
        title="ทะเบียนรายชื่อผู้ค้า EnCo"
        desc="ดาวน์โหลดประกาศรายชื่อคู่ค้าที่ได้รับการขึ้นทะเบียนกับ EnCo เผยแพร่โดยฝ่ายจัดซื้อ EnCo ตามรอบการรับสมัคร — รายชื่อล่าสุดอยู่ด้านบนสุด" />

      {/* Latest highlight */}
      {(() => {
        const latest = registryDocs[0];
        if (!latest) return null;
        return (
          <div className="card" style={{
            padding: 24, marginBottom: 24,
            background: "linear-gradient(135deg, var(--primary-soft) 0%, var(--surface) 60%)",
            border: "1px solid var(--primary-border)",
            display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto",
            gap: 20, alignItems: "center",
          }}>
            <div style={{
              width: 64, height: 80, borderRadius: 8,
              background: "var(--surface)",
              border: "1px solid var(--primary-border)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 4, color: "var(--primary)",
              boxShadow: "var(--shadow-sm)",
            }}>
              <Icon name="file" size={26} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".08em",
                fontFamily: "var(--font-en)" }}>PDF</span>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span className="pill" style={{ background: "var(--success-soft)",
                  color: "oklch(38% 0.11 155)", fontSize: 11 }}>
                  <span className="pill-dot" /> ฉบับล่าสุด
                </span>
                <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>
                  เผยแพร่เมื่อ {latest.publishedAt}
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                รายชื่อคู่ค้าที่ขึ้นทะเบียน {latest.period}
              </h3>
              <div className="mono" style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
                {latest.file}{" · "}{latest.size}
              </div>
              <div style={{ display: "flex", gap: 20, marginTop: 10, fontSize: 13,
                color: "var(--text-2)" }}>
                <div>
                  <span style={{ color: "var(--text-3)" }}>คู่ค้าในรายชื่อ:</span>{" "}
                  <b className="num">{latest.vendors}</b> ราย
                </div>
              </div>
            </div>
            <button className="btn btn-primary"
              onClick={() => { const latest = registryDocs[0]; simDownload(latest?.file || "AVL_Registry_latest.pdf"); }}>
              <Icon name="download" size={15} /> ดาวน์โหลด PDF
            </button>
          </div>
        );
      })()}

      {/* Older registry — table */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
        marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-2)" }}>
          ทะเบียนฉบับก่อนหน้า
        </h3>
        <span style={{ fontSize: 12, color: "var(--text-3)" }}>
          {registryDocs.length - 1} ฉบับ
        </span>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 70 }}></th>
              <th>เอกสาร</th>
              <th style={{ width: 150 }}>วันที่เผยแพร่</th>
              <th style={{ width: 140 }}>คู่ค้าในรายชื่อ</th>
              <th style={{ width: 100 }}>ขนาดไฟล์</th>
              <th style={{ width: 150 }}></th>
            </tr>
          </thead>
          <tbody>
            {registryDocs.slice(1).map((d) => (
              <tr key={d.id}>
                <td>
                  <div style={{
                    width: 38, height: 46, margin: "0 auto",
                    background: "var(--surface-2)",
                    border: "1px solid var(--line)",
                    borderRadius: 5,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    color: "var(--text-3)",
                    fontSize: 8, fontWeight: 700, letterSpacing: ".05em",
                    fontFamily: "var(--font-en)",
                  }}>
                    <Icon name="file" size={15} />
                    PDF
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>
                    รายชื่อคู่ค้าที่ขึ้นทะเบียน {d.period}
                  </div>
                  <div className="mono" style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>
                    {d.file}
                  </div>
                </td>
                <td style={{ color: "var(--text-2)", fontSize: 13 }}>{d.publishedAt}</td>
                <td className="num" style={{ color: "var(--text-2)", fontSize: 13 }}>
                  {d.vendors} ราย
                </td>
                <td className="mono" style={{ color: "var(--text-3)", fontSize: 12 }}>{d.size}</td>
                <td>
                  <button className="btn btn-soft btn-sm" style={{ width: "100%" }}
                    onClick={() => simDownload(d.file)}>
                    <Icon name="download" size={13} /> ดาวน์โหลด
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info note */}
      <div style={{
        marginTop: 24, padding: "14px 18px",
        background: "var(--surface-2)", borderRadius: 12,
        display: "flex", gap: 12, alignItems: "flex-start",
        fontSize: 13, color: "var(--text-2)",
      }}>
        <Icon name="track" size={16} style={{ color: "var(--text-3)", marginTop: 2, flexShrink: 0 }} />
        <div>
          <b style={{ color: "var(--text)" }}>เกี่ยวกับทะเบียนรายชื่อผู้ค้า:</b>{" "}
          ทะเบียนรายชื่อผู้ค้า (Approved Vendor List) เป็นเอกสารทางการที่ EnCo เผยแพร่
          ระบุรายชื่อคู่ค้าที่ผ่านการประเมินและขึ้นทะเบียนเรียบร้อยแล้ว
          ประกาศรายชื่อตามรอบการรับสมัคร — หากต้องการเข้าร่วมเป็นคู่ค้า กรุณาดู
          <button onClick={() => goto("landing")}
            style={{ background: "none", border: "none", color: "var(--primary)",
              textDecoration: "underline", cursor: "pointer", padding: 0, font: "inherit",
              margin: "0 4px" }}>
            ประกาศรับสมัครที่เปิดอยู่
          </button>
          และยื่นใบสมัครพร้อมเอกสารที่กำหนด
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VendorLanding, VendorForm, VendorTrack, VendorRegistry });
