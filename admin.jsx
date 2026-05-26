// Admin pages: Dashboard, Submissions list, Submission detail, Announcements management

// Export submissions to Excel using SheetJS
function exportToExcel(rows, announcements, annoId) {
  if (!window.XLSX) { alert("ไม่สามารถ Export ได้ — กรุณาโหลดหน้าใหม่"); return; }
  const annoMap = Object.fromEntries((announcements || []).map(a => [a.id, a.title]));
  const statusMap = {
    new: "ใหม่ — รอตรวจ", review: "กำลังตรวจสอบ",
    approved: "อนุมัติ", rejected: "ปฏิเสธ",
  };
  const data = rows.map(r => ({
    // ── ข้อมูลการสมัคร ──
    "เลขที่ใบสมัคร":              r.id,
    "ประกาศที่สมัคร":             r.annoId || "-",
    "ชื่อประกาศ":                 annoMap[r.annoId] || "-",
    "วันที่ยื่นสมัคร":             r.submittedAt,
    "สถานะ":                     statusMap[r.status] || r.status,
    "ความครบถ้วนเอกสาร (%)":     r.completeness,
    // ── Step 1: ประเภทกลุ่มงาน ──
    "ประเภทกลุ่มงาน":             r.category,
    // ── Step 2: ข้อมูลทั่วไป ──
    "ชื่อ Vendor":                r.company,
    "เลขผู้เสียภาษี":             r.taxId,
    "ระยะเวลาทำธุรกิจ (ปี)":     r.yearsInBusiness || "-",
    "ที่อยู่":                    r.address || "-",
    "แขวง/ตำบล":                 r.subDistrict || "-",
    "เขต/อำเภอ":                 r.district || "-",
    "จังหวัด":                   r.province || "-",
    "รหัสไปรษณีย์":              r.postcode || "-",
    "โทรศัพท์บริษัท":            r.phone || "-",
    "โทรศัพท์มือถือ":            r.mobile || "-",
    "อีเมลบริษัท":               r.companyEmail || "-",
    "ทุนจดทะเบียน (บาท)":        r.capital || "-",
    // ── Step 3: ผู้ติดต่อ ──
    "ชื่อผู้ติดต่อ":              r.contact,
    "ตำแหน่ง":                   r.position || "-",
    "อีเมลผู้ติดต่อ":            r.email,
    "โทรศัพท์ผู้ติดต่อ":         r.contactPhone || "-",
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [
    {wch:16},{wch:14},{wch:50},{wch:16},{wch:16},{wch:14},
    {wch:26},
    {wch:32},{wch:17},{wch:14},{wch:38},{wch:14},{wch:14},{wch:18},{wch:11},{wch:14},{wch:14},{wch:28},{wch:20},
    {wch:20},{wch:18},{wch:28},{wch:14},
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "ใบสมัครคู่ค้า");
  const suffix = annoId && annoId !== "all"
    ? `_${annoId.replace(/\//g, "-")}`
    : "_ทั้งหมด";
  XLSX.writeFile(wb, `EnCo_Submissions${suffix}.xlsx`);
}

// Simulated download/view helper
function simDownload(filename) {
  const a = document.createElement("a");
  const blob = new Blob([`[ไฟล์จำลอง: ${filename}]`], { type: "application/pdf" });
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Toast notification
function useToast() {
  const [toast, setToast] = React.useState(null);
  const show = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  return [toast, show];
}

function Toast({ toast }) {
  if (!toast) return null;
  const bg = toast.type === "success" ? "var(--success-soft)" : toast.type === "warn" ? "var(--warn-soft)" : "var(--danger-soft)";
  const color = toast.type === "success" ? "oklch(38% 0.11 155)" : toast.type === "warn" ? "oklch(45% 0.12 70)" : "oklch(42% 0.14 25)";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      padding: "12px 18px", background: bg, color, borderRadius: 10,
      boxShadow: "var(--shadow-lg)", fontWeight: 500, fontSize: 14,
      display: "flex", alignItems: "center", gap: 8, maxWidth: 360,
      animation: "fadeIn .2s ease",
    }}>
      <Icon name="check" size={15} stroke={2.4} /> {toast.msg}
    </div>
  );
}

// Format date → "26 พ.ค. 2568"
function fmtDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

// Format datetime → "26 พ.ค. 2568 10:30"
function fmtDateTime(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString("th-TH", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// Auto-compute announcement status from dates
function computeAnnoStatus(closedAt, openedAt) {
  if (!closedAt || !openedAt) return "draft";
  const now = new Date();
  const open = new Date(openedAt);
  const close = new Date(closedAt);
  if (now < open) return "draft";
  if (now > close) return "closed";
  const daysLeft = (close - now) / (1000 * 60 * 60 * 24);
  return daysLeft <= 7 ? "closing" : "open";
}

function AdminDashboard({ goto }) {
  const data = useData();
  const submissions = data?.submissions || [];

  // Calculate real statistics
  const totalCount = submissions.length;
  const newCount = submissions.filter(s => s.status === "new").length;
  const reviewCount = submissions.filter(s => s.status === "review").length;
  const approvedCount = submissions.filter(s => s.status === "approved").length;
  const rejectedCount = submissions.filter(s => s.status === "rejected").length;
  const docPendingCount = submissions.filter(s => s.docsPending === true || s.status === "review").length;

  // Calculate percentage of approved
  const approvedPercent = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  // Generate recent activities from submissions
  const recentActivities = submissions
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5)
    .map(s => ({
      who: "ระบบ",
      what: s.status === "approved" ? "อนุมัติใบสมัคร" : s.status === "new" ? "รับใบสมัครใหม่" : s.status === "review" ? "กำลังตรวจสอบ" : "ปฏิเสธใบสมัคร",
      who2: s.company || "บริษัท",
      submittedAt: s.submittedAt,
      type: s.status === "approved" ? "approve" : s.status === "rejected" ? "reject" : s.status === "review" ? "request" : "new",
    }));

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow="Admin · Dashboard"
        title="ภาพรวมการรับสมัครคู่ค้า"
        desc="สรุปยอดผู้สมัคร สถานะการดำเนินการ และกิจกรรมล่าสุดในระบบ"
        action={
          <>
            <button className="btn btn-ghost btn-sm"
              onClick={() => simDownload("EnCo_Dashboard_Report.xlsx")}>
              <Icon name="download" size={14} /> Export Excel
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => goto("admin-announcements")}>
              <Icon name="plus" size={14} /> สร้างประกาศใหม่
            </button>
          </>
        } />

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 14, marginBottom: 24 }}>
        <StatCard label="ผู้สมัครทั้งหมด" value={totalCount.toString()} sub="ปีงบประมาณ 2569" />
        <StatCard label="รอตรวจสอบ" value={newCount.toString()} sub={`+${newCount} รายการ`} accent="oklch(58% 0.13 70)" />
        <StatCard label="อนุมัติแล้ว" value={approvedCount.toString()} sub={`${approvedPercent}% ของยอดทั้งหมด`} accent="oklch(52% 0.13 155)" />
        <StatCard label="รอเอกสารเพิ่ม" value={docPendingCount.toString()} sub="อยู่ระหว่างดำเนินการ" accent="oklch(55% 0.14 250)" />
      </div>

      {/* Two-col layout: pipeline chart + recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.8fr) 1fr",
        gap: 20, marginBottom: 24 }}>
        {/* Pipeline */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
            marginBottom: 18 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>การสมัครรายเดือน</h3>
              <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--text-3)" }}>
                6 เดือนล่าสุด · แยกตามสถานะ
              </p>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
              <LegendDot color="var(--primary)" label="ส่งใหม่" />
              <LegendDot color="oklch(58% 0.13 70)" label="ตรวจสอบ" />
              <LegendDot color="oklch(52% 0.13 155)" label="อนุมัติ" />
            </div>
          </div>
          <BarChart submissions={submissions} />
        </div>
        {/* Recent activity */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
            marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>กิจกรรมล่าสุด</h3>
            <a href="#" style={{ fontSize: 12.5, color: "var(--primary)" }}>ดูทั้งหมด</a>
          </div>
          {recentActivities.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--line-2)" }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: a.type === "approve" ? "var(--success-soft)"
                          : a.type === "reject"  ? "var(--danger-soft)"
                          : a.type === "request" ? "var(--warn-soft)"
                          :                        "var(--primary-soft)",
                color: a.type === "approve" ? "oklch(38% 0.11 155)"
                      : a.type === "reject"  ? "oklch(42% 0.14 25)"
                      : a.type === "request" ? "oklch(45% 0.12 70)"
                      :                        "var(--primary-ink)",
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>
                <Icon name={a.type === "approve" ? "check" : a.type === "reject" ? "x" :
                  a.type === "request" ? "paperclip" : "plus"} size={14} stroke={2.2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                  <b>{a.who}</b> <span style={{ color: "var(--text-2)" }}>{a.what}</span>{" "}
                  <span style={{ color: "var(--text)" }}>{a.who2}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>
                  {formatTimeAgo(a.submittedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending list */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>ใบสมัครที่รอดำเนินการ</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--text-3)" }}>
              {newCount} รายการรอตรวจสอบ · {docPendingCount} รายการต้องการเอกสารเพิ่ม
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => goto("admin-submissions")}>
            ดูทั้งหมด <Icon name="arrowRight" size={14} />
          </button>
        </div>
        <SubmissionsTable rows={submissions.slice(0, 5)} goto={goto} />
      </div>
    </div>
  );
}

// Helper function to format time ago in Thai
function formatTimeAgo(dateStr) {
  if (!dateStr) return "เมื่อไม่นานมานี้";
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "เมื่อตอนนี้";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชม.ที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "เมื่อวาน";
  if (days < 7) return `${days} วันที่แล้ว`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} สัปดาห์ที่แล้ว`;
  const months = Math.floor(days / 30);
  return `${months} เดือนที่แล้ว`;
}

const LegendDot = ({ color, label }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-2)" }}>
    <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
    {label}
  </span>
);

const BarChart = ({ submissions = [] }) => {
  // Calculate monthly data from submissions
  const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  // Get last 6 months
  const now = new Date();
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push(d);
  }

  // Count submissions by month and status
  const monthlyData = last6Months.map(monthDate => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 1);

    const monthSubmissions = submissions.filter(s => {
      const subDate = new Date(s.submittedAt || s.createdAt || new Date());
      return subDate >= monthStart && subDate < monthEnd;
    });

    return {
      m: thaiMonths[month],
      a: monthSubmissions.filter(s => s.status === "new").length,           // new (ส่งใหม่)
      b: monthSubmissions.filter(s => s.status === "review").length,        // review (ตรวจสอบ)
      c: monthSubmissions.filter(s => s.status === "approved").length,      // approved (อนุมัติ)
      d: monthSubmissions.filter(s => s.status === "rejected").length,      // rejected (ปฏิเสธ)
    };
  });

  const max = Math.max(...monthlyData.map(d => d.a + d.b + d.c + d.d), 1);

  return (
    <div style={{ height: 220, display: "flex", alignItems: "flex-end",
      gap: 18, padding: "8px 0 0" }}>
      {monthlyData.map((d, i) => {
        const total = d.a + d.b + d.c + d.d;
        const h = total > 0 ? (total / max) * 100 : 4;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", gap: 8 }}>
            <div className="num" style={{ fontSize: 11, color: "var(--text-3)" }}>{total}</div>
            <div style={{ width: "100%", height: `${h}%`, minHeight: 4,
              display: "flex", flexDirection: "column",
              borderRadius: "6px 6px 0 0", overflow: "hidden",
              boxShadow: "var(--shadow-sm)" }}>
              {total > 0 && (
                <>
                  {d.a > 0 && <div style={{ flex: d.a, background: "var(--primary)" }} />}
                  {d.b > 0 && <div style={{ flex: d.b, background: "oklch(58% 0.13 70)" }} />}
                  {d.c > 0 && <div style={{ flex: d.c, background: "oklch(52% 0.13 155)" }} />}
                  {d.d > 0 && <div style={{ flex: d.d, background: "var(--line)" }} />}
                </>
              )}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", fontWeight: 500 }}>{d.m}</div>
          </div>
        );
      })}
    </div>
  );
};


// ── Export modal ────────────────────────────────────────────────────────────
function ExportModal({ onClose, announcements, submissions }) {
  const [annoFilter, setAnnoFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Use submissions from context, fallback to SUBMISSIONS
  const allSubmissions = submissions && submissions.length > 0 ? submissions : SUBMISSIONS;

  const filtered = allSubmissions.filter(s =>
    (annoFilter === "all" || s.annoId === annoFilter) &&
    (statusFilter === "all" || s.status === statusFilter)
  );

  const doExport = () => {
    exportToExcel(filtered, announcements, annoFilter);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.4)",
      backdropFilter: "blur(2px)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24 }}
      onClick={onClose}>
      <div className="card" style={{ width: "100%", maxWidth: 520, padding: 28 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 22 }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 600 }}>
              Export ข้อมูลผู้สมัคร
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>
              ส่งออกเป็นไฟล์ Excel (.xlsx) ยกเว้นไฟล์แนบ
            </p>
          </div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)",
              display: "block", marginBottom: 8 }}>
              ประกาศที่ต้องการ Export
            </label>
            <select className="select" value={annoFilter}
              onChange={e => setAnnoFilter(e.target.value)} style={{ width: "100%" }}>
              <option value="all">ทุกประกาศ</option>
              {announcements.map(a => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.title.length > 38 ? a.title.substring(0, 38) + "…" : a.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)",
              display: "block", marginBottom: 8 }}>
              สถานะใบสมัคร
            </label>
            <select className="select" value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)} style={{ width: "100%" }}>
              <option value="all">ทุกสถานะ</option>
              <option value="new">ใหม่ — รอตรวจ</option>
              <option value="review">กำลังตรวจสอบ</option>
              <option value="approved">อนุมัติ</option>
            </select>
          </div>

          {/* Preview summary */}
          <div style={{ padding: "16px", background: "var(--surface-2)",
            borderRadius: 10, border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 2 }}>
                  จำนวนรายการที่จะ Export
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span className="num" style={{ fontSize: 28, fontWeight: 700,
                    color: filtered.length > 0 ? "var(--primary)" : "var(--text-3)" }}>
                    {filtered.length}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-3)" }}>ราย</span>
                </div>
              </div>
              {filtered.length > 0 && (
                <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {Object.entries(
                    filtered.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {})
                  ).map(([st, n]) => {
                    const colors = {
                      new:      { bg: "var(--primary-soft)",  ink: "var(--primary-ink)" },
                      review:   { bg: "var(--warn-soft)",     ink: "oklch(45% 0.12 70)" },
                      approved: { bg: "var(--success-soft)",  ink: "oklch(38% 0.11 155)" },
                      rejected: { bg: "var(--danger-soft)",   ink: "oklch(42% 0.14 25)" },
                    };
                    const labels = { new: "ใหม่", review: "ตรวจสอบ", approved: "อนุมัติ", rejected: "ปฏิเสธ" };
                    const c = colors[st] || { bg: "var(--line)", ink: "var(--text-3)" };
                    return (
                      <span key={st} className="num" style={{
                        fontSize: 11.5, padding: "3px 9px", borderRadius: 99,
                        background: c.bg, color: c.ink, fontWeight: 600,
                      }}>
                        {labels[st] || st} {n}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-3)", lineHeight: 1.65 }}>
              <b style={{ color: "var(--text-2)" }}>คอลัมน์ที่จะส่งออก:</b>{" "}
              เลขที่ใบสมัคร · ประกาศ · ชื่อประกาศ · ชื่อบริษัท · เลขผู้เสียภาษี · ประเภทงาน · ผู้ติดต่อ · ตำแหน่ง · อีเมล · เบอร์โทร · ที่อยู่ · จังหวัด · รหัสไปรษณีย์ · ทุนจดทะเบียน · ระยะเวลา · วันที่สมัคร · สถานะ · ความครบถ้วน
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
            <button className="btn btn-primary" onClick={doExport}
              disabled={filtered.length === 0}>
              <Icon name="download" size={14} />
              Export{filtered.length > 0 ? ` (${filtered.length} ราย)` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Submissions list ────────────────────────────────────────────────────────
function AdminSubmissions({ goto }) {
  const { announcements, submissions } = useData();
  const [filter, setFilter] = React.useState("all");
  const [annoFilter, setAnnoFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [showExport, setShowExport] = React.useState(false);

  // Use submissions from context, fallback to SUBMISSIONS
  const allSubmissions = submissions && submissions.length > 0 ? submissions : SUBMISSIONS;

  const filters = [
    { id: "all",      label: "ทั้งหมด",  count: allSubmissions.length },
    { id: "new",      label: "ใหม่",      count: allSubmissions.filter(s => s.status === "new").length },
    { id: "review",   label: "ตรวจสอบ",  count: allSubmissions.filter(s => s.status === "review").length },
    { id: "approved", label: "อนุมัติ",  count: allSubmissions.filter(s => s.status === "approved").length },
  ];
  const rows = allSubmissions.filter(s =>
    (filter === "all" || s.status === filter) &&
    (annoFilter === "all" || s.annoId === annoFilter) &&
    (search === "" || s.company.includes(search) || s.id.includes(search) || s.taxId.includes(search))
  );

  return (
    <div className="fade-in">
      {showExport && (
        <ExportModal announcements={announcements} submissions={allSubmissions} onClose={() => setShowExport(false)} />
      )}

      <SectionHeader
        eyebrow="Admin · Submissions"
        title="ใบสมัครคู่ค้า"
        desc="จัดการและพิจารณาใบสมัครทั้งหมดในระบบ"
        action={
          <button className="btn btn-ghost btn-sm" onClick={() => setShowExport(true)}>
            <Icon name="download" size={14} /> Export Excel
          </button>
        } />

      {/* Tabs + filters */}
      <div className="card" style={{ padding: "12px 16px", marginBottom: 16,
        display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{
                padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: filter === f.id ? "var(--primary-soft)" : "transparent",
                color: filter === f.id ? "var(--primary-ink)" : "var(--text-2)",
                fontWeight: filter === f.id ? 600 : 500, fontSize: 13,
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
              {f.label}
              <span className="num" style={{
                background: filter === f.id ? "rgba(255,255,255,.6)" : "var(--surface-2)",
                color: filter === f.id ? "var(--primary-ink)" : "var(--text-3)",
                padding: "1px 7px", borderRadius: 99, fontSize: 11, fontWeight: 600,
              }}>{f.count}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Announcement filter */}
          <select className="select" value={annoFilter}
            onChange={e => setAnnoFilter(e.target.value)}
            style={{ fontSize: 13, height: 34, minWidth: 155 }}>
            <option value="all">ทุกประกาศ</option>
            {announcements.map(a => (
              <option key={a.id} value={a.id}>{a.id}</option>
            ))}
          </select>
          {/* Search */}
          <div style={{ display: "flex", gap: 8, alignItems: "center",
            background: "var(--surface-2)", padding: "4px 10px", borderRadius: 8,
            minWidth: 260 }}>
            <Icon name="search" size={14} style={{ color: "var(--text-3)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาบริษัท, เลขที่ใบสมัคร, เลขผู้เสียภาษี..."
              style={{ flex: 1, border: "none", background: "transparent", outline: "none",
                height: 30, fontSize: 13 }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SubmissionsTable rows={rows} goto={goto} full />
      </div>
    </div>
  );
}

const SubmissionsTable = ({ rows, goto, full = false }) => (
  <table className="tbl">
    <thead>
      <tr>
        <th style={{ width: 110 }}>เลขที่</th>
        <th>บริษัท</th>
        {full && <th style={{ width: 115 }}>ประกาศ</th>}
        {full && <th>ประเภท</th>}
        <th>ยื่นเมื่อ</th>
        {full && <th>ครบถ้วน</th>}
        <th>สถานะ</th>
        <th style={{ width: 60 }}></th>
      </tr>
    </thead>
    <tbody>
      {rows.map(r => (
        <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => goto("admin-detail", r.id)}>
          <td className="mono" style={{ fontSize: 12.5, color: "var(--text-2)" }}>{r.id}</td>
          <td>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={r.company} size={32} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{r.company}</div>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>{r.taxId}</div>
              </div>
            </div>
          </td>
          {full && (
            <td>
              {r.annoId ? (
                <span className="mono" style={{
                  fontSize: 11.5, padding: "3px 8px", whiteSpace: "nowrap",
                  background: "var(--primary-soft)", color: "var(--primary-ink)",
                  borderRadius: 6, fontWeight: 600,
                }}>{r.annoId}</span>
              ) : <span style={{ color: "var(--text-3)" }}>-</span>}
            </td>
          )}
          {full && <td style={{ color: "var(--text-2)", fontSize: 13 }}>{r.category}</td>}
          <td style={{ color: "var(--text-2)", fontSize: 13 }}>{fmtDateTime(r.submittedAt)}</td>
          {full && <td><Progress value={r.completeness} /></td>}
          <td><StatusChip status={r.status} /></td>
          <td><Icon name="chevron" size={16} style={{ color: "var(--text-3)" }} /></td>
        </tr>
      ))}
    </tbody>
  </table>
);


// ── Submission detail ───────────────────────────────────────────────────────
function AdminDetail({ goto, id }) {
  const { submissions } = useData();
  const allSubmissions = submissions && submissions.length > 0 ? submissions : SUBMISSIONS;
  const base = allSubmissions.find(x => x.id === id) || allSubmissions[0];
  const [status, setStatus] = React.useState(base.status);
  const [tab, setTab] = React.useState("info");
  const [requestingDocs, setRequestingDocs] = React.useState(false);
  const [docRequests, setDocRequests] = React.useState([]);
  const [showRequestModal, setShowRequestModal] = React.useState(false);
  const [confirmApprove, setConfirmApprove] = React.useState(false);
  const [toast, showToast] = useToast();
  const s = { ...base, status };

  const handleApprove = () => {
    setStatus("approved");
    setConfirmApprove(false);
    showToast(`อนุมัติ ${s.company} เรียบร้อยแล้ว`);
  };

  const handleDocRequest = (requests) => {
    setDocRequests(prev => [...prev, ...requests]);
    setRequestingDocs(true);
    setTab("extra-docs");
    setShowRequestModal(false);
    showToast(`ส่งคำขอเอกสาร ${requests.length} รายการไปยัง Vendor แล้ว`, "warn");
  };

  return (
    <div className="fade-in">
      <Toast toast={toast} />

      {/* Confirm approve modal */}
      {confirmApprove && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,.4)",
          backdropFilter: "blur(2px)", display: "flex", alignItems: "center",
          justifyContent: "center", padding: 24 }}
          onClick={() => setConfirmApprove(false)}>
          <div className="card" style={{ maxWidth: 420, width: "100%", padding: 28 }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 10px", fontSize: 17 }}>ยืนยันการอนุมัติ</h3>
            <p style={{ margin: "0 0 20px", color: "var(--text-2)", fontSize: 14, lineHeight: 1.65 }}>
              อนุมัติใบสมัครของ <b>{s.company}</b> เลขที่ <span className="mono">{s.id}</span>?<br />
              หลังอนุมัติแล้วสถานะจะเปลี่ยนเป็น "อนุมัติ" และ Vendor จะเห็นผลในหน้าตรวจสอบสถานะ
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmApprove(false)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleApprove}>
                <Icon name="check" size={14} /> ยืนยันอนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequestModal && (
        <RequestDocsModal company={s.company}
          onClose={() => setShowRequestModal(false)}
          onSave={handleDocRequest} />
      )}

      <button className="btn btn-ghost btn-sm" onClick={() => goto("admin-submissions")}
        style={{ marginBottom: 14 }}>
        <Icon name="arrowLeft" size={14} /> รายการใบสมัคร
      </button>

      {/* Header */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Avatar name={s.company} size={56} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4,
                flexWrap: "wrap" }}>
                <span className="mono" style={{ fontSize: 12.5, color: "var(--text-3)" }}>{s.id}</span>
                <span style={{ color: "var(--text-3)" }}>·</span>
                <StatusChip status={s.status} />
              </div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{s.company}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10,
                marginTop: 2, flexWrap: "wrap" }}>
                <span style={{ color: "var(--text-2)", fontSize: 13.5 }}>
                  {s.category} · ยื่นเมื่อ {fmtDateTime(s.submittedAt)}
                </span>
                {s.annoId && (
                  <span className="mono" style={{
                    fontSize: 12, padding: "2px 9px",
                    background: "var(--primary-soft)", color: "var(--primary-ink)",
                    borderRadius: 6, fontWeight: 600,
                  }}>{s.annoId}</span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {status !== "approved" && (
              <button className="btn btn-ghost btn-sm"
                onClick={() => setShowRequestModal(true)}>
                <Icon name="paperclip" size={14} /> ขอเอกสารเพิ่ม
              </button>
            )}
            {status === "approved" ? (
              <span className="chip-status st-approved" style={{ padding: "6px 14px", fontSize: 13 }}>
                อนุมัติแล้ว
              </span>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setConfirmApprove(true)}>
                <Icon name="check" size={14} /> อนุมัติ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid var(--line)" }}>
        {[
          { id: "info",       label: "ข้อมูลบริษัท" },
          { id: "docs",       label: "เอกสารแนบ" },
          { id: "extra-docs", label: `เอกสารเพิ่มเติม${docRequests.length > 0 ? ` (${docRequests.length})` : ""}`, show: requestingDocs },
          { id: "history",    label: "ประวัติ" },
        ].filter(t => t.id !== "extra-docs" || t.show).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: "10px 16px", border: "none", background: "transparent",
              borderBottom: tab === t.id ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: -1, color: tab === t.id ? "var(--text)" : "var(--text-3)",
              fontWeight: tab === t.id ? 600 : 500, cursor: "pointer", fontSize: 14,
            }}>{t.label}</button>
        ))}
      </div>

      {tab === "info"       && <DetailInfo s={s} />}
      {tab === "docs"       && <DetailDocs s={s} />}
      {tab === "extra-docs" && <DetailExtraDocs docRequests={docRequests} setDocRequests={setDocRequests} />}
      {tab === "history"    && <DetailHistory />}
    </div>
  );
}

const DetailInfo = ({ s }) => (
  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) 1fr", gap: 16 }}>
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>ข้อมูลบริษัท</h3>
      <InfoGrid rows={[
        ["ชื่อ Vendor", s.company],
        ["เลขผู้เสียภาษี",  s.taxId, true],
        ["ประกาศที่สมัคร",  s.annoId || "-", true],
        ["ประเภทกลุ่มงาน", s.category],
        ["ทุนจดทะเบียน",   "20,000,000 บาท"],
        ["ระยะเวลาทำธุรกิจ", "12 ปี"],
        ["ที่อยู่",        "999/12 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง"],
        ["จังหวัด / รหัสไปรษณีย์", "กรุงเทพมหานคร 10310"],
        ["โทรศัพท์บริษัท",  "02-555-1234", true],
        ["อีเมล",          "contact@safeguard-th.co.th", true],
      ]} />
      <h3 style={{ margin: "28px 0 16px", fontSize: 15, fontWeight: 600 }}>ผู้ติดต่อ</h3>
      <InfoGrid rows={[
        ["ชื่อ-นามสกุล", s.contact],
        ["ตำแหน่ง",     "ผู้จัดการฝ่ายขาย"],
        ["อีเมล",       s.email, true],
        ["โทรศัพท์",    "081-234-5678", true],
      ]} />
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--primary)",
          letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12,
          fontFamily: "var(--font-en)" }}>สถานะ</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--text-3)" }}>ความครบถ้วนเอกสาร</span>
            <span className="num" style={{ fontWeight: 600 }}>{s.completeness}%</span>
          </div>
          <Progress value={s.completeness} />
          <div style={{ height: 1, background: "var(--line)", margin: "6px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--text-3)" }}>เอกสารแนบ</span>
            <span className="num">{s.docs} / {s.docs + s.missing}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--text-3)" }}>ผู้รับผิดชอบ</span>
            <span style={{ fontWeight: 500 }}>คุณอาภา</span>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--primary)",
          letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12,
          fontFamily: "var(--font-en)" }}>บันทึกภายใน</div>
        <textarea className="textarea" rows={4}
          placeholder="เพิ่มความเห็นภายใน (ผู้สมัครจะไม่เห็น)"
          defaultValue="ตรวจสอบประวัติผลงานเรียบร้อย รอเอกสารรับรองมาตรฐานการรักษาความปลอดภัย ฉบับล่าสุด" />
        <button className="btn btn-soft btn-sm" style={{ marginTop: 10, width: "100%" }}>
          บันทึก
        </button>
      </div>
    </div>
  </div>
);

const InfoGrid = ({ rows }) => (
  <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", rowGap: 12, columnGap: 16,
    fontSize: 13.5 }}>
    {rows.map(([k, v, mono], i) => (
      <React.Fragment key={i}>
        <div style={{ color: "var(--text-3)" }}>{k}</div>
        <div style={{ fontFamily: mono ? "var(--font-mono)" : "inherit", color: "var(--text)" }}>{v}</div>
      </React.Fragment>
    ))}
  </div>
);

const DetailDocs = ({ s }) => (
  <div className="card" style={{ padding: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: 16, gap: 16 }}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
        เอกสารที่แนบมา
        <span style={{ color: "var(--text-3)", fontWeight: 400, marginLeft: 8 }}>
          ({s.docs} ไฟล์)
        </span>
      </h3>
      <button className="btn btn-primary btn-sm"
        onClick={() => simDownload(`${s.id}_documents.zip`)}>
        <Icon name="download" size={14} /> ดาวน์โหลดทั้งหมด (ZIP)
      </button>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {REQUIRED_DOCS.map((d, i) => {
        const has = i < s.docs;
        return (
          <div key={d.id} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 10,
            background: has ? "var(--surface)" : "var(--surface-2)",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: has ? "var(--primary-soft)" : "var(--surface)",
              color: has ? "var(--primary)" : "var(--text-3)",
              display: "grid", placeItems: "center",
            }}>
              <Icon name="file" size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                {d.th}{d.required && <span style={{ color: "var(--danger)" }}> *</span>}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                {has ? (
                  <span className="mono">
                    {["PreQual_security.pdf","doc_cert.pdf","doc_pp20.pdf","doc_fin.pdf","doc_id.pdf","doc_iso.pdf","doc_port.pdf","doc_profile.pdf"][i]}
                    {" · "}{[412, 245, 180, 1400, 320, 540, 2100, 880][i]} KB
                  </span>
                ) : "ยังไม่ได้แนบ"}
              </div>
            </div>
            {has ? (
              <>
                <button className="btn btn-ghost btn-sm"
                  onClick={() => alert(`แสดงเอกสาร: ${["PreQual_security.pdf","doc_cert.pdf","doc_pp20.pdf","doc_fin.pdf","doc_id.pdf","doc_iso.pdf","doc_port.pdf","doc_profile.pdf"][i]}`)}>
                  <Icon name="eye" size={14} /> ดู
                </button>
                <button className="btn btn-ghost btn-sm"
                  onClick={() => simDownload(["PreQual_security.pdf","doc_cert.pdf","doc_pp20.pdf","doc_fin.pdf","doc_id.pdf","doc_iso.pdf","doc_port.pdf","doc_profile.pdf"][i])}>
                  <Icon name="download" size={14} />
                </button>
              </>
            ) : (
              <span className="chip-status st-rejected">ขาด</span>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const DetailHistory = () => (
  <div className="card" style={{ padding: 24 }}>
    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>ประวัติการดำเนินการ</h3>
    {TIMELINE.map((t, i) => (
      <div key={t.id} style={{ display: "grid", gridTemplateColumns: "20px 1fr",
        gap: 14, padding: "10px 0", position: "relative" }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%",
            background: i === TIMELINE.length - 1 ? "var(--primary)" : "var(--success)",
            marginTop: 4, marginLeft: 4,
            boxShadow: i === TIMELINE.length - 1
              ? "0 0 0 4px var(--primary-soft)" : "0 0 0 4px var(--success-soft)" }} />
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
);


const RequestDocsModal = ({ company, onClose, onSave }) => {
  const [items, setItems] = React.useState([{ id: Date.now(), name: "", desc: "", deadline: "" }]);
  const addItem = () => setItems(prev => [...prev, { id: Date.now(), name: "", desc: "", deadline: "" }]);
  const removeItem = (id) => setItems(prev => prev.filter(it => it.id !== id));
  const updateItem = (id, key, val) => setItems(prev => prev.map(it => it.id === id ? { ...it, [key]: val } : it));
  const canSave = items.some(it => it.name.trim());

  const handleSave = () => {
    const now = new Date().toLocaleString("th-TH");
    const valid = items
      .filter(it => it.name.trim())
      .map(it => ({ ...it, requestedAt: now, uploaded: false, uploadedFiles: [] }));
    onSave(valid);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.4)",
      backdropFilter: "blur(2px)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24 }}
      onClick={onClose}>
      <div className="card" style={{ width: "100%", maxWidth: 560, padding: 28,
        maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 600 }}>ขอเอกสารเพิ่มเติม</h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>
              ระบุเอกสารที่ต้องการให้ <b>{company}</b> อัปโหลดเพิ่มเติม
            </p>
          </div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {items.map((it, i) => (
            <div key={it.id} style={{ padding: "14px 16px", border: "1px solid var(--line)",
              borderRadius: 10, background: "var(--surface)",
              display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary)" }}>
                  เอกสารที่ {i + 1}
                </span>
                {items.length > 1 && (
                  <button className="btn btn-ghost btn-sm btn-icon" style={{ color: "var(--danger)" }}
                    onClick={() => removeItem(it.id)}>
                    <Icon name="trash" size={13} />
                  </button>
                )}
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-2)",
                  display: "block", marginBottom: 4 }}>
                  ชื่อเอกสาร <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input className="input" value={it.name}
                  onChange={e => updateItem(it.id, "name", e.target.value)}
                  placeholder="เช่น ใบรับรองมาตรฐาน ISO 9001" style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-2)",
                  display: "block", marginBottom: 4 }}>
                  รายละเอียด / คำแนะนำ
                </label>
                <input className="input" value={it.desc}
                  onChange={e => updateItem(it.id, "desc", e.target.value)}
                  placeholder="เช่น ต้องเป็นฉบับปัจจุบัน อายุไม่เกิน 1 ปี" style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-2)",
                  display: "block", marginBottom: 4 }}>
                  กำหนดส่ง (ไม่บังคับ)
                </label>
                <input className="input" type="date" value={it.deadline}
                  onChange={e => updateItem(it.id, "deadline", e.target.value)}
                  style={{ width: "100%" }} />
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-ghost btn-sm"
          style={{ width: "100%", borderStyle: "dashed", marginBottom: 20 }}
          onClick={addItem}>
          <Icon name="plus" size={14} /> เพิ่มรายการเอกสาร
        </button>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!canSave}>
            <Icon name="paperclip" size={14} /> ส่งคำขอไปยัง Vendor
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailExtraDocs = ({ docRequests, setDocRequests }) => {
  const inputRefs = React.useRef({});

  const onFile = (id) => (e) => {
    const list = [...(e.target.files || [])].map(f => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(0)} KB`,
      uploadedAt: new Date().toLocaleString("th-TH"),
    }));
    setDocRequests(prev => prev.map(r =>
      r.id === id ? { ...r, uploaded: true, uploadedFiles: [...r.uploadedFiles, ...list] } : r
    ));
    e.target.value = "";
  };

  if (docRequests.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-3)" }}>
        <Icon name="paperclip" size={32} style={{ display: "block", margin: "0 auto 12px" }} />
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>ยังไม่มีคำขอเอกสาร</div>
        <div style={{ fontSize: 12.5 }}>กดปุ่ม "ขอเอกสารเพิ่ม" เพื่อส่งคำขอไปยัง Vendor</div>
      </div>
    );
  }

  const uploadedCount = docRequests.filter(r => r.uploaded).length;

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600 }}>เอกสารเพิ่มเติม</h3>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>
            รายการเอกสารที่ EnCo ขอเพิ่มเติมจาก Vendor
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
          background: uploadedCount === docRequests.length ? "var(--success-soft)" : "var(--warn-soft)",
          borderRadius: 8, fontSize: 12.5, fontWeight: 500,
          color: uploadedCount === docRequests.length ? "oklch(38% 0.11 155)" : "oklch(45% 0.12 70)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor",
            display: "inline-block" }} />
          อัปโหลดแล้ว {uploadedCount} / {docRequests.length} รายการ
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {docRequests.map((req) => (
          <div key={req.id} style={{
            border: `1px solid ${req.uploaded ? "oklch(75% 0.10 155)" : "var(--line)"}`,
            borderRadius: 12, overflow: "hidden",
          }}>
            <div style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start",
              background: req.uploaded ? "var(--success-soft)" : "var(--surface)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: req.uploaded ? "oklch(38% 0.11 155 / .15)" : "var(--surface-2)",
                color: req.uploaded ? "oklch(38% 0.11 155)" : "var(--text-3)",
                display: "grid", placeItems: "center" }}>
                <Icon name={req.uploaded ? "check" : "paperclip"} size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{req.name}</div>
                {req.desc && (
                  <div style={{ fontSize: 12.5, color: "var(--text-2)", marginBottom: 2 }}>{req.desc}</div>
                )}
                {req.deadline && (
                  <div style={{ fontSize: 12, color: "oklch(45% 0.12 70)", fontWeight: 500 }}>
                    กำหนดส่ง: {req.deadline}
                  </div>
                )}
                <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 3 }}>
                  ขอเมื่อ {req.requestedAt}
                </div>
              </div>
              <span className={`chip-status ${req.uploaded ? "st-approved" : "st-review"}`}
                style={{ fontSize: 12, flexShrink: 0 }}>
                {req.uploaded ? "อัปโหลดแล้ว" : "รอเอกสาร"}
              </span>
            </div>

            {req.uploadedFiles.length > 0 && (
              <div style={{ borderTop: "1px solid var(--line)", padding: "10px 16px",
                background: "var(--surface)", display: "flex", flexDirection: "column", gap: 6 }}>
                {req.uploadedFiles.map((f, fi) => (
                  <div key={fi} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                    <Icon name="file" size={14} style={{ color: "oklch(38% 0.11 155)", flexShrink: 0 }} />
                    <span className="mono" style={{ flex: 1, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                    <span style={{ fontSize: 12, color: "var(--text-3)", flexShrink: 0 }}>{f.size}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => simDownload(f.name)}>
                      <Icon name="download" size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: "1px solid var(--line)", padding: "9px 16px",
              background: "var(--surface-2)", fontSize: 12, color: "var(--text-3)" }}>
              <b style={{ color: "var(--text-2)" }}>ทดสอบ:</b>{" "}
              <button onClick={() => inputRefs.current[req.id]?.click()}
                style={{ color: "var(--primary)", background: "none", border: "none",
                  cursor: "pointer", font: "inherit", textDecoration: "underline", padding: 0 }}>
                จำลองการอัปโหลดจาก Vendor
              </button>
              <input ref={el => inputRefs.current[req.id] = el}
                type="file" multiple style={{ display: "none" }} onChange={onFile(req.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Announcements management ────────────────────────────────────────────────
function AdminAnnouncements({ goto }) {
  const { groups, announcements, setAnnouncements } = useData();
  const [editing, setEditing] = React.useState(null);
  const groupById = Object.fromEntries(groups.map(g => [g.id, g]));

  const saveAnnouncement = async (data) => {
    try {
      if (data.id && announcements.find(a => a.id === data.id)) {
        // Update existing announcement
        await window.updateAnnouncementInDb(data.id, {
          title: data.title,
          description: data.description,
          status: data.status,
          categories: data.categories,
          opened_at: data.openedAt,
          closed_at: data.closedAt,
          summary: data.summary,
          docs: data.docs
        });
        setAnnouncements(announcements.map(a => a.id === data.id ? { ...a, ...data } : a));
      } else {
        // Create new announcement
        const newId = `AN-${new Date().getFullYear()}-${String(announcements.filter(a => a.id.startsWith('AN-')).length + 1).padStart(3, '0')}`;
        const annoData = { ...data, id: data.id || newId };
        await window.createAnnouncementInDb({
          id: annoData.id,
          title: annoData.title,
          description: annoData.description,
          status: annoData.status || 'open',
          categories: annoData.categories,
          openedAt: annoData.openedAt,
          closedAt: annoData.closedAt,
          summary: annoData.summary,
          docs: annoData.docs
        });
        setAnnouncements([annoData, ...announcements]);
      }
      setEditing(null);
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกประกาศ');
    }
  };
  const deleteAnnouncement = async (id) => {
    if (confirm(`ลบประกาศ ${id}?`)) {
      try {
        await window.deleteAnnouncementInDb(id);
        setAnnouncements(announcements.filter(a => a.id !== id));
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('เกิดข้อผิดพลาดในการลบประกาศ');
      }
    }
  };

  return (
    <div className="fade-in">
      {/* Modal */}
      {editing && (
        <AnnouncementEditor
          id={editing}
          onClose={() => setEditing(null)}
          onSave={saveAnnouncement}
        />
      )}

      <SectionHeader
        eyebrow="Admin · Announcements"
        title="จัดการประกาศรับสมัคร"
        desc="สร้าง แก้ไข และจัดการประกาศรับสมัครคู่ค้า รวมถึงอัปโหลดเอกสารประกอบ"
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setEditing("new")}>
            <Icon name="plus" size={14} /> ประกาศใหม่
          </button>
        } />

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 120 }}>เลขที่</th>
              <th>ประกาศ</th>
              <th style={{ width: 220 }}>กลุ่มงานที่เปิด</th>
              <th style={{ width: 140 }}>ช่วงเวลา</th>
              <th style={{ width: 110 }}>สถานะ</th>
              <th style={{ width: 70 }}></th>
            </tr>
          </thead>
          <tbody>
            {announcements.map(a => (
              <tr key={a.id}>
                <td className="mono" style={{ fontSize: 12.5, color: "var(--text-2)" }}>{a.id}</td>
                <td>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2,
                    maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap" }}>{a.summary}</div>
                </td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(a.categories || []).slice(0, 3).map(cid => {
                      const g = groupById[cid];
                      if (!g) return null;
                      return (
                        <span key={cid} className="pill" style={{
                          background: "var(--surface-2)", color: "var(--text-2)",
                          fontSize: 11.5, padding: "2px 8px",
                        }}>{g.icon} {g.th}</span>
                      );
                    })}
                    {(a.categories || []).length > 3 ? (
                      <span className="pill" style={{ background: "var(--surface-2)",
                        color: "var(--text-3)", fontSize: 11.5 }}>
                        +{a.categories.length - 3}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td style={{ color: "var(--text-2)", fontSize: 12.5 }}>
                  {fmtDate(a.openedAt)}<br />
                  <span style={{ color: "var(--text-3)" }}>→ {fmtDate(a.closedAt)}</span>
                </td>
                <td><StatusChip status={computeAnnoStatus(a.closedAt, a.openedAt)} map={ANNC_STATUS_LABEL} /></td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => setEditing(a.id)}>
                      <Icon name="edit" size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => deleteAnnouncement(a.id)}>
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {announcements.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "48px 16px",
                  color: "var(--text-3)", fontSize: 13 }}>
                  ยังไม่มีประกาศ — กด <b>ประกาศใหม่</b> เพื่อเริ่มต้น
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const AnnouncementEditor = ({ id, onClose, onSave }) => {
  const { groups, announcements } = useData();
  const existing = announcements.find(a => a.id === id);
  const [v, setV] = React.useState(existing || {
    title: "", categories: [], openedAt: "", closedAt: "",
    summary: "", status: "open", docs: [],
  });
  const [uploading, setUploading] = React.useState(false);
  const inputId = React.useId ? React.useId() : `file-input-${id}`;

  const toggleCat = (cid) => {
    const has = (v.categories || []).includes(cid);
    setV({ ...v, categories: has ? v.categories.filter(c => c !== cid)
                                 : [...(v.categories || []), cid] });
  };

  // อัปโหลดไฟล์ Pre-Q สำหรับกลุ่มงานที่ระบุ
  const handlePreqUpload = async (categoryId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await window.uploadFileToStorage(file, 'announcements');
      if (!result?.url) throw new Error('ไม่ได้รับ URL จาก Storage');
      setV(prev => ({
        ...prev,
        docs: [
          ...(prev.docs || []).filter(d => d.categoryId !== categoryId),
          { ...result, categoryId },
        ],
      }));
    } catch (err) {
      console.error('Pre-Q upload error:', err);
      alert(
        'อัปโหลดไม่สำเร็จ ❌\n\n' +
        (err.message || 'ไม่ทราบสาเหตุ') + '\n\n' +
        'กรุณารัน setup-storage.sql ใน Supabase SQL Editor ก่อน'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // อัปโหลดเอกสารแนบทั่วไป (ไม่มี categoryId)
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const uploaded = [];
    const failed = [];
    for (const f of files) {
      try {
        const result = await window.uploadFileToStorage(f, 'announcements');
        if (!result?.url) throw new Error('no URL');
        uploaded.push(result);
      } catch {
        failed.push(f.name);
      }
    }
    setUploading(false);
    e.target.value = '';
    if (uploaded.length > 0) {
      setV(prev => ({ ...prev, docs: [...(prev.docs || []), ...uploaded] }));
    }
    if (failed.length > 0) {
      alert('อัปโหลดไม่สำเร็จ: ' + failed.join(', ') + '\n\nกรุณารัน setup-storage.sql ก่อน');
    }
  };

  const removeDoc = async (doc, i) => {
    try { if (doc.path) await window.deleteFileFromStorage(doc.path); } catch {}
    setV(prev => ({ ...prev, docs: prev.docs.filter((_, j) => j !== i) }));
  };

  const removePreq = async (categoryId) => {
    const doc = (v.docs || []).find(d => d.categoryId === categoryId);
    try { if (doc?.path) await window.deleteFileFromStorage(doc.path); } catch {}
    setV(prev => ({ ...prev, docs: prev.docs.filter(d => d.categoryId !== categoryId) }));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          zIndex: 1000,
        }}
      />
      {/* Dialog */}
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1001, padding: "24px 16px",
        pointerEvents: "none",
      }}>
      <div className="card fade-in" style={{
        width: "100%", maxWidth: 660,
        maxHeight: "calc(100vh - 48px)", overflowY: "auto",
        padding: 28, pointerEvents: "auto",
        boxShadow: "var(--shadow-lg)",
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--primary)",
            letterSpacing: ".08em", textTransform: "uppercase",
            fontFamily: "var(--font-en)" }}>
            {id === "new" ? "สร้างประกาศใหม่" : `แก้ไข ${id}`}
          </div>
          <h3 style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 600 }}>
            {id === "new" ? "ประกาศรับสมัครคู่ค้า" : v.title}
          </h3>
        </div>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>
          <Icon name="x" size={18} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="หัวข้อประกาศ" required>
          <input className="input" value={v.title}
            onChange={(e) => setV({ ...v, title: e.target.value })} />
        </Field>

        <Field label="กลุ่มงานที่เปิดรับสมัคร" required
               hint={`เลือกได้หลายกลุ่ม — เลือกแล้ว ${(v.categories || []).length} กลุ่ม`}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {groups.map(g => {
              const checked = (v.categories || []).includes(g.id);
              return (
                <label key={g.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px",
                  border: `1px solid ${checked ? "var(--primary)" : "var(--line)"}`,
                  background: checked ? "var(--primary-soft)" : "var(--surface)",
                  borderRadius: 8, cursor: "pointer", fontSize: 12.5,
                }}>
                  <input type="checkbox" checked={checked} onChange={() => toggleCat(g.id)}
                    style={{ accentColor: "var(--primary)" }} />
                  <span style={{ fontSize: 14 }}>{g.icon}</span>
                  <span style={{ fontWeight: 500, lineHeight: 1.2,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.th}</span>
                </label>
              );
            })}
          </div>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="วันเปิดรับ" required>
            <input className="input" type="date" value={v.openedAt}
              onChange={(e) => setV({ ...v, openedAt: e.target.value })} />
          </Field>
          <Field label="วันปิดรับ" required>
            <input className="input" type="date" value={v.closedAt}
              onChange={(e) => setV({ ...v, closedAt: e.target.value })} />
          </Field>
        </div>

        <Field label="สถานะ (อัตโนมัติ)" hint="คำนวณจากวันปิดรับ — ไม่ต้องตั้งเอง">
          {(() => {
            const autoStatus = computeAnnoStatus(v.closedAt, v.openedAt);
            const labels = { open: "เปิดรับสมัคร", closing: "ใกล้ปิดรับ", closed: "ปิดรับสมัคร", draft: "ร่าง" };
            const colors = { open: "var(--success-soft)", closing: "var(--warn-soft)", closed: "var(--line)", draft: "var(--surface-2)" };
            const ink = { open: "oklch(38% 0.11 155)", closing: "oklch(45% 0.12 70)", closed: "var(--text-2)", draft: "var(--text-3)" };
            return (
              <div style={{ padding: "10px 14px", background: colors[autoStatus] || "var(--surface-2)",
                borderRadius: "var(--radius)", border: "1px solid var(--line)",
                color: ink[autoStatus], fontWeight: 500, fontSize: 14 }}>
                {labels[autoStatus] || autoStatus}
              </div>
            );
          })()}
        </Field>

        <Field label="รายละเอียดประกาศ">
          <textarea className="textarea" rows={5} value={v.summary}
            onChange={(e) => setV({ ...v, summary: e.target.value })} />
        </Field>

        {/* ── ส่วนที่ 1: Pre-Q ต่อกลุ่มงาน ── */}
        {(v.categories || []).length > 0 && (
          <div>
            <div className="label" style={{ marginBottom: 4 }}>ฟอร์ม Pre-Qualification ต่อกลุ่มงาน</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}>
              อัปโหลดไฟล์ Pre-Q แยกต่อกลุ่มงาน — ผู้ค้าจะเห็นปุ่มดาวน์โหลดในหน้าประกาศ
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(v.categories || []).map(cid => {
                const g = groups.find(x => x.id === cid);
                if (!g) return null;
                const preqDoc = (v.docs || []).find(d => d.categoryId === cid);
                return (
                  <div key={cid} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px",
                    border: `1px solid ${preqDoc ? "var(--success)" : "var(--line)"}`,
                    background: preqDoc ? "var(--success-soft)" : "var(--surface)",
                    borderRadius: 8,
                  }}>
                    <span style={{ fontSize: 16 }}>{g.icon}</span>
                    <span style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{g.th}</span>
                    {preqDoc ? (
                      <>
                        <Icon name="file" size={13} style={{ color: "oklch(38% 0.11 155)" }} />
                        {preqDoc.url ? (
                          <a href={preqDoc.url} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 12, color: "oklch(38% 0.11 155)", fontWeight: 500,
                              maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis",
                              whiteSpace: "nowrap" }}>
                            {preqDoc.name}
                          </a>
                        ) : (
                          <span style={{ fontSize: 12, color: "oklch(38% 0.11 155)", fontWeight: 500 }}>
                            {preqDoc.name}
                          </span>
                        )}
                        <button className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => removePreq(cid)}>
                          <Icon name="trash" size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>ยังไม่มีไฟล์</span>
                        <label style={{ cursor: uploading ? "not-allowed" : "pointer" }}>
                          <span className="btn btn-ghost btn-sm"
                            style={{ pointerEvents: uploading ? "none" : "auto",
                              opacity: uploading ? 0.5 : 1 }}>
                            <Icon name="upload" size={12} />
                            {uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
                          </span>
                          <input type="file" disabled={uploading}
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            style={{ display: "none" }}
                            onChange={(e) => handlePreqUpload(cid, e)} />
                        </label>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ส่วนที่ 2: เอกสารแนบทั่วไป ── */}
        <div>
          <div className="label" style={{ marginBottom: 8 }}>
            <span>เอกสารแนบทั่วไป</span>
            <span style={{ color: "var(--text-3)", fontWeight: 400, fontSize: 12 }}>
              ({(v.docs || []).filter(d => !d.categoryId).length} ไฟล์)
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
            {(v.docs || []).filter(d => !d.categoryId).map((d, i) => {
              const realIdx = (v.docs || []).indexOf(d);
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  border: "1px solid var(--line)", borderRadius: 8, fontSize: 12.5,
                }}>
                  <Icon name="file" size={14} style={{ color: "var(--primary)" }} />
                  {d.url ? (
                    <a href={d.url} target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap", color: "var(--primary)", fontSize: 12.5 }}>
                      {d.name}
                    </a>
                  ) : (
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap", fontSize: 12.5 }}>{d.name}</span>
                  )}
                  <span style={{ color: "var(--text-3)", fontSize: 11.5 }}>{d.size}</span>
                  <button className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => removeDoc(d, realIdx)}>
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              );
            })}
          </div>
          <label htmlFor={inputId} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, width: "100%", padding: "7px 12px",
            border: "1px dashed var(--line)", borderRadius: "var(--radius)",
            cursor: uploading ? "not-allowed" : "pointer",
            fontSize: 13, fontWeight: 500, color: "var(--text-2)",
            background: "var(--surface)", opacity: uploading ? 0.6 : 1,
          }}>
            <Icon name="upload" size={14} />
            {uploading ? "กำลังอัปโหลด..." : "เพิ่มไฟล์แนบทั่วไป"}
            <input id={inputId} type="file" multiple disabled={uploading}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              style={{ display: "none" }} onChange={handleFileUpload} />
          </label>
        </div>

        <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>ยกเลิก</button>
          <button className="btn btn-primary" style={{ flex: 1 }}
            onClick={() => onSave(v)}>
            <Icon name="check" size={14} />
            {id === "new" ? "เผยแพร่ประกาศ" : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </div>
    </div>
    </div>
    </>
  );
};


// ── Vendor groups management (NEW) ──────────────────────────────────────────
function AdminGroups() {
  const { groups, setGroups, announcements } = useData();
  const [editing, setEditing] = React.useState(null);

  const usageCount = (gid) => announcements.filter(a => (a.categories || []).includes(gid)).length;

  const save = async (data) => {
    try {
      if (data.id && groups.find(g => g.id === data.id)) {
        // Update existing
        await window.updateCategoryInDb(data.id, data);
        setGroups(groups.map(g => g.id === data.id ? { ...g, ...data } : g));
      } else {
        // Create new
        const newId = data.id || data.th?.toLowerCase().replace(/\s+/g, '_') || `grp_${Date.now()}`;
        const lastNum = parseInt(groups[groups.length - 1]?.num || "0", 10);
        const newData = { ...data, id: newId, num: String(lastNum + 1).padStart(2, "0") };
        await window.createCategoryInDb(newData);
        setGroups([...groups, newData]);
      }
      setEditing(null);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกกลุ่มงาน กรุณาตรวจสอบ SQL ใน Supabase');
    }
  };
  const remove = async (gid) => {
    if (usageCount(gid) > 0) {
      alert("ไม่สามารถลบกลุ่มงานที่ถูกใช้ในประกาศได้");
      return;
    }
    if (confirm("ลบกลุ่มงานนี้?")) {
      try {
        await window.deleteCategoryInDb(gid);
        setGroups(groups.filter(g => g.id !== gid));
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('เกิดข้อผิดพลาดในการลบกลุ่มงาน');
      }
    }
  };

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow="Admin · Vendor Groups"
        title="กลุ่มงาน"
        desc="จัดการกลุ่มงานที่ใช้สำหรับเปิดรับสมัครคู่ค้า เพิ่ม/แก้ไข/ลบกลุ่มงาน — กลุ่มที่เพิ่มจะปรากฏในตัวเลือกเมื่อสร้างประกาศและในฟอร์มสมัคร"
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setEditing("new")}>
            <Icon name="plus" size={14} /> เพิ่มกลุ่มงาน
          </button>
        } />

      <div style={{ display: "grid", gridTemplateColumns: editing ? "minmax(0, 1.5fr) 1fr" : "1fr",
        gap: 16, alignItems: "start" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 14 }}>
          {groups.map((g, i) => {
            const tints = [
              { bg: "oklch(96% 0.04 250)", num: "var(--primary)",      br: "oklch(85% 0.06 250)" },
              { bg: "oklch(96% 0.05 155)", num: "oklch(52% 0.13 155)", br: "oklch(85% 0.07 155)" },
              { bg: "oklch(96% 0.06 70)",  num: "oklch(58% 0.15 70)",  br: "oklch(86% 0.08 70)" },
              { bg: "oklch(96% 0.05 30)",  num: "oklch(58% 0.14 30)",  br: "oklch(86% 0.08 30)" },
            ][i % 4];
            const use = usageCount(g.id);
            return (
              <div key={g.id} className="card" style={{
                padding: 18, display: "flex", flexDirection: "column", gap: 12,
                background: tints.bg, border: `1px solid ${tints.br}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="num" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1,
                    color: tints.num, fontFamily: "var(--font-en)", letterSpacing: "-.02em" }}>
                    {g.num}
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 9,
                    background: "rgba(255,255,255,.7)", display: "grid", placeItems: "center",
                    fontSize: 20 }}>{g.icon}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text)",
                    lineHeight: 1.3 }}>{g.th}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2,
                    fontFamily: "var(--font-en)" }}>{g.en}</div>
                  {g.desc ? (
                    <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 8,
                      lineHeight: 1.5 }}>{g.desc}</div>
                  ) : null}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", paddingTop: 8, borderTop: "1px solid rgba(0,0,0,.06)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                      ใช้งานใน <b className="num" style={{ color: "var(--text-2)" }}>{use}</b> ประกาศ
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                      ขอผลงาน <b className="num" style={{ color: "var(--text-2)" }}>{g.worksRequired || 0}</b> ผลงาน
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn btn-ghost btn-sm btn-icon"
                      style={{ background: "rgba(255,255,255,.6)" }}
                      onClick={() => setEditing(g.id)}>
                      <Icon name="edit" size={13} />
                    </button>
                    <button className="btn btn-ghost btn-sm btn-icon"
                      style={{ background: "rgba(255,255,255,.6)", color: use > 0 ? "var(--text-3)" : "var(--danger)" }}
                      onClick={() => remove(g.id)} disabled={use > 0}>
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add new card */}
          <button onClick={() => setEditing("new")} style={{
            padding: 18, display: "flex", flexDirection: "column", gap: 8,
            justifyContent: "center", alignItems: "center", minHeight: 200,
            border: "1.5px dashed var(--line)", background: "transparent",
            borderRadius: 16, cursor: "pointer", color: "var(--text-3)",
            transition: "all .15s",
          }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)";
                                     e.currentTarget.style.color = "var(--primary)"; }}
             onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)";
                                     e.currentTarget.style.color = "var(--text-3)"; }}>
            <Icon name="plus" size={28} stroke={1.5} />
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>เพิ่มกลุ่มงานใหม่</div>
          </button>
        </div>

        {editing && <GroupEditor id={editing} onClose={() => setEditing(null)} onSave={save} />}
      </div>
    </div>
  );
}

const GroupEditor = ({ id, onClose, onSave }) => {
  const { groups } = useData();
  const existing = groups.find(g => g.id === id);
  const [v, setV] = React.useState(existing || {
    th: "", en: "", desc: "", icon: "🏷", worksRequired: 3,
  });
  const iconOptions = ["🛡","🧹","🔧","🛠","🏗","⚡","📐","📦","🖥","🛎","💻","🌳","🚛","📋","🧰","🏷"];
  return (
    <div className="card" style={{ padding: 22, position: "sticky", top: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--primary)",
            letterSpacing: ".08em", textTransform: "uppercase",
            fontFamily: "var(--font-en)" }}>
            {id === "new" ? "เพิ่มกลุ่มงาน" : "แก้ไขกลุ่มงาน"}
          </div>
          <h3 style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 600 }}>
            {id === "new" ? "กลุ่มงานใหม่" : v.th}
          </h3>
        </div>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>
          <Icon name="x" size={16} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="ชื่อกลุ่ม (ภาษาไทย)" required>
          <input className="input" value={v.th}
            onChange={(e) => setV({ ...v, th: e.target.value })}
            placeholder="เช่น งานภูมิทัศน์" />
        </Field>
        <Field label="ชื่อกลุ่ม (ภาษาอังกฤษ)">
          <input className="input" value={v.en}
            onChange={(e) => setV({ ...v, en: e.target.value })}
            placeholder="e.g. Landscaping" />
        </Field>
        <Field label="ไอคอน">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4 }}>
            {iconOptions.map(ic => (
              <button key={ic} onClick={() => setV({ ...v, icon: ic })}
                style={{
                  padding: 8, fontSize: 18, border: "1px solid",
                  borderColor: v.icon === ic ? "var(--primary)" : "var(--line)",
                  background: v.icon === ic ? "var(--primary-soft)" : "var(--surface)",
                  borderRadius: 8, cursor: "pointer", lineHeight: 1,
                }}>{ic}</button>
            ))}
          </div>
        </Field>
        <Field label="คำอธิบาย" hint="แสดงในการ์ดประเภทคู่ค้าหน้า Landing">
          <textarea className="textarea" rows={3} value={v.desc}
            onChange={(e) => setV({ ...v, desc: e.target.value })}
            placeholder="ระบุงานหรือบริการที่อยู่ในกลุ่มนี้สั้น ๆ" />
        </Field>

        <Field label="จำนวนผลงานที่ต้องส่ง" required
               hint="ผู้สมัครต้องอัปโหลดผลงานตามจำนวนนี้ สำหรับกลุ่มนี้">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn btn-ghost btn-sm btn-icon"
              onClick={() => setV({ ...v, worksRequired: Math.max(1, (v.worksRequired || 1) - 1) })}>
              <Icon name="minus" size={14} />
            </button>
            <input className="input num" type="number" min={1} max={20}
              value={v.worksRequired || 1}
              onChange={(e) => setV({ ...v, worksRequired: parseInt(e.target.value, 10) || 1 })}
              style={{ flex: 1, textAlign: "center" }} />
            <button className="btn btn-ghost btn-sm btn-icon"
              onClick={() => setV({ ...v, worksRequired: Math.min(20, (v.worksRequired || 1) + 1) })}>
              <Icon name="plus" size={14} />
            </button>
            <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>ผลงาน</span>
          </div>
        </Field>

        <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>ยกเลิก</button>
          <button className="btn btn-primary" style={{ flex: 1 }}
            onClick={() => v.th && onSave(v)}
            disabled={!v.th}>
            {id === "new" ? "เพิ่มกลุ่ม" : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { AdminDashboard, AdminSubmissions, AdminDetail, AdminAnnouncements, AdminGroups });
