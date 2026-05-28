// Admin pages: Dashboard, Submissions list, Submission detail, Announcements management

// Export submissions to Excel using SheetJS
function exportToExcel(rows, announcements, annoId) {
  if (!window.XLSX) { alert("ไม่สามารถ Export ได้ — กรุณาโหลดหน้าใหม่"); return; }
  const annoMap = Object.fromEntries((announcements || []).map(a => [a.id, a.title]));
  const data = rows.map(r => ({
    // ── ข้อมูลการสมัคร ──
    "เลขที่ใบสมัคร":          r.id,
    "ประกาศที่สมัคร":         r.annoId || "-",
    "ชื่อประกาศ":             annoMap[r.annoId] || "-",
    "วันที่ยื่นสมัคร":         r.submittedAt,
    // ── Step 1: ประเภทกลุ่มงาน ──
    "ประเภทกลุ่มงาน":         (r.categories || [r.category]).filter(Boolean).join(', ') || '-',
    // ── Step 2: ข้อมูลทั่วไป ──
    "ชื่อ Vendor":            r.company,
    "เลขผู้เสียภาษี":         r.taxId,
    "ระยะเวลาทำธุรกิจ (ปี)": r.yearsInBusiness || "-",
    "ที่อยู่":                r.address || "-",
    "แขวง/ตำบล":             r.subDistrict || "-",
    "เขต/อำเภอ":             r.district || "-",
    "จังหวัด":               r.province || "-",
    "รหัสไปรษณีย์":          r.postcode || "-",
    "โทรศัพท์บริษัท":        r.phone || "-",
    "โทรศัพท์มือถือ":        r.mobile || "-",
    "อีเมลบริษัท":           r.companyEmail || "-",
    "ทุนจดทะเบียน (บาท)":    r.capital || "-",
    // ── Step 3: ผู้ติดต่อ ──
    "ชื่อผู้ติดต่อ":          r.contact,
    "ตำแหน่ง":               r.position || "-",
    "อีเมลผู้ติดต่อ":        r.email,
    "โทรศัพท์ผู้ติดต่อ":     r.contactPhone || "-",
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [
    {wch:16},{wch:14},{wch:50},{wch:16},
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
  const { submissions = [], groups = [] } = useData();
  const groupList = groups.length > 0 ? groups : VENDOR_CATEGORIES;

  const now = new Date();
  const thaiMonthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
                          "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  const totalCount = submissions.length;
  const thisMonthCount = submissions.filter(s => {
    const d = new Date(s.submittedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const thisYearCount = submissions.filter(s =>
    new Date(s.submittedAt).getFullYear() === now.getFullYear()
  ).length;

  const thaiMonthLabel = thaiMonthNames[now.getMonth()] + " " + (now.getFullYear() + 543);
  const thaiYearLabel  = "พ.ศ. " + (now.getFullYear() + 543);

  // Group submissions by category — a submission with multiple categories
  // appears under each of its selected groups
  const byCategory = groupList
    .map(g => ({
      group: g,
      subs: submissions
        .filter(s => (s.categories || [s.category]).filter(Boolean).includes(g.id))
        .slice().sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
    }))
    .filter(c => c.subs.length > 0);

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow="Admin · Dashboard"
        title="ภาพรวมการรับสมัครคู่ค้า"
        desc="สรุปยอดผู้สมัครทั้งหมด รายเดือน รายปี และแยกตามประเภทกลุ่มงาน"
        action={
          <button className="btn btn-primary btn-sm" onClick={() => goto("admin-announcements")}>
            <Icon name="plus" size={14} /> สร้างประกาศใหม่
          </button>
        } />

      {/* 3 stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 14, marginBottom: 24 }}>
        <StatCard label="ผู้สมัครทั้งหมด"  value={totalCount.toString()}      sub="ทุกประกาศ ทุกปี" />
        <StatCard label="สมัครเดือนนี้"     value={thisMonthCount.toString()}  sub={thaiMonthLabel}
          accent="oklch(52% 0.13 155)" />
        <StatCard label="สมัครปีนี้"        value={thisYearCount.toString()}   sub={thaiYearLabel}
          accent="oklch(58% 0.15 70)" />
      </div>

      {/* Bar chart */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "baseline", marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>การสมัครรายเดือน</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--text-3)" }}>
              6 เดือนล่าสุด · ยอดผู้สมัครรวม
            </p>
          </div>
          <LegendDot color="var(--primary)" label="ยื่นสมัคร" />
        </div>
        <BarChart submissions={submissions} />
      </div>

      {/* Category breakdown */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
        marginBottom: 14, gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>สรุปตามประเภทกลุ่มงาน</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => goto("admin-submissions")}>
          ดูใบสมัครทั้งหมด <Icon name="arrowRight" size={14} />
        </button>
      </div>

      {byCategory.length === 0 ? (
        <div className="card" style={{ padding: "40px 24px", textAlign: "center",
          color: "var(--text-3)", fontSize: 13.5 }}>
          ยังไม่มีใบสมัครในระบบ
        </div>
      ) : (
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {byCategory.map(({ group: g, subs }) => (
            <div key={g.id} className="card" style={{ overflow: "hidden" }}>
              {/* Category header */}
              <div style={{ padding: "14px 20px", background: "var(--surface-2)",
                borderBottom: "1px solid var(--line)",
                display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 22, lineHeight: 1 }}>{g.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {g.th}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>
                    <span className="num" style={{ fontWeight: 600, color: "var(--primary)" }}>
                      {subs.length}
                    </span>{" "}บริษัท
                  </div>
                </div>
              </div>
              {/* Company rows */}
              <div>
                {subs.map((s, i) => (
                  <div key={s.id}
                    onClick={() => goto("admin-detail", s.id)}
                    style={{
                      display: "flex", gap: 10, alignItems: "center",
                      padding: "9px 20px", cursor: "pointer",
                      borderTop: i > 0 ? "1px solid var(--line-2)" : "none",
                      transition: "background .1s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <Avatar name={s.company} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 13.5,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.company}
                      </div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                        {s.taxId || s.id}
                      </div>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-3)", flexShrink: 0 }}>
                      {fmtDate(s.submittedAt)}
                    </div>
                    <Icon name="chevron" size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

    return { m: thaiMonths[month], total: monthSubmissions.length };
  });

  const max = Math.max(...monthlyData.map(d => d.total), 1);

  return (
    <div style={{ height: 220, display: "flex", alignItems: "flex-end",
      gap: 18, padding: "8px 0 0" }}>
      {monthlyData.map((d, i) => {
        const h = d.total > 0 ? (d.total / max) * 100 : 4;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", gap: 8 }}>
            <div className="num" style={{ fontSize: 11, color: "var(--text-3)" }}>{d.total || ""}</div>
            <div style={{ width: "100%", height: `${h}%`, minHeight: 4,
              background: d.total > 0 ? "var(--primary)" : "var(--line-2)",
              borderRadius: "6px 6px 0 0",
              boxShadow: d.total > 0 ? "var(--shadow-sm)" : "none" }} />
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

  // Use submissions from context, fallback to SUBMISSIONS
  const allSubmissions = submissions && submissions.length > 0 ? submissions : SUBMISSIONS;

  const filtered = allSubmissions.filter(s =>
    annoFilter === "all" || s.annoId === annoFilter
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

          {/* Preview summary */}
          <div style={{ padding: "16px", background: "var(--surface-2)",
            borderRadius: 10, border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 10 }}>
              <span className="num" style={{ fontSize: 28, fontWeight: 700,
                color: filtered.length > 0 ? "var(--primary)" : "var(--text-3)" }}>
                {filtered.length}
              </span>
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>ราย</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-3)", lineHeight: 1.65 }}>
              <b style={{ color: "var(--text-2)" }}>คอลัมน์ที่จะส่งออก:</b>{" "}
              เลขที่ใบสมัคร · ประกาศ · ชื่อประกาศ · วันที่สมัคร · ประเภทกลุ่มงาน · ชื่อบริษัท · เลขผู้เสียภาษี · ระยะเวลา · ที่อยู่ · จังหวัด · รหัสไปรษณีย์ · โทรศัพท์ · อีเมลบริษัท · ทุนจดทะเบียน · ผู้ติดต่อ · ตำแหน่ง · อีเมลผู้ติดต่อ · โทรศัพท์ผู้ติดต่อ
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
const PAGE_SIZE = 25;

function AdminSubmissions({ goto }) {
  const { announcements, submissions, setSubmissions } = useData();
  const [annoFilter, setAnnoFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [showExport, setShowExport] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [refreshing, setRefreshing] = React.useState(false);

  // Use submissions from context, fallback to SUBMISSIONS
  const allSubmissions = submissions && submissions.length > 0 ? submissions : SUBMISSIONS;

  const filtered = allSubmissions.filter(s =>
    (annoFilter === "all" || s.annoId === annoFilter) &&
    (search === "" || (s.company || "").includes(search) || s.id.includes(search) || (s.taxId || "").includes(search))
  );

  // Reset to page 1 whenever filter/search changes
  React.useEffect(() => { setPage(1); }, [annoFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Refresh data from Supabase
  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const fresh = await window.getSubmissionsFromDb?.();
      if (fresh) setSubmissions(fresh);
    } catch (_) {}
    setRefreshing(false);
  };

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
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={handleRefresh} disabled={refreshing}
              title="โหลดข้อมูลใหม่จากฐานข้อมูล">
              <Icon name="track" size={14} style={{ animation: refreshing ? "spin .8s linear infinite" : "none" }} />
              {refreshing ? "กำลังโหลด..." : "Refresh"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowExport(true)}>
              <Icon name="download" size={14} /> Export Excel
            </button>
          </div>
        } />

      {/* Filters */}
      <div className="card" style={{ padding: "12px 16px", marginBottom: 16,
        display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        alignItems: "center" }}>
        {/* Result count */}
        <div style={{ fontSize: 13, color: "var(--text-3)" }}>
          แสดง{" "}
          <span className="num" style={{ fontWeight: 600, color: "var(--text)" }}>
            {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
          </span>
          {" "}จาก{" "}
          <span className="num" style={{ fontWeight: 600, color: "var(--text)" }}>{filtered.length}</span>
          {" "}รายการ
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
            minWidth: 260, border: "1px solid var(--line)" }}>
            <Icon name="search" size={14} style={{ color: "var(--text-3)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาบริษัท, เลขที่ใบสมัคร, เลขผู้เสียภาษี..."
              style={{ flex: 1, border: "none", background: "transparent", outline: "none",
                height: 30, fontSize: 13 }} />
            {search && (
              <button onClick={() => setSearch("")}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0,
                  color: "var(--text-3)", display: "flex", alignItems: "center" }}>
                <Icon name="x" size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden", marginBottom: totalPages > 1 ? 0 : undefined }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-3)", fontSize: 13.5 }}>
            {search ? `ไม่พบรายการที่ตรงกับ "${search}"` : "ยังไม่มีใบสมัครในระบบ"}
          </div>
        ) : (
          <SubmissionsTable rows={rows} goto={goto} full />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card" style={{
          padding: "10px 16px", borderTop: "none", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}>
            <Icon name="arrowLeft" size={14} /> ก่อนหน้า
          </button>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce((acc, n, idx, arr) => {
                if (idx > 0 && n - arr[idx - 1] > 1) acc.push("…");
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) => n === "…" ? (
                <span key={`e${i}`} style={{ padding: "0 4px", color: "var(--text-3)", fontSize: 13 }}>…</span>
              ) : (
                <button key={n} onClick={() => setPage(n)}
                  className="btn btn-sm"
                  style={{
                    minWidth: 32, padding: "0 4px",
                    background: n === page ? "var(--primary)" : "transparent",
                    color: n === page ? "#fff" : "var(--text-2)",
                    border: n === page ? "1px solid var(--primary)" : "1px solid transparent",
                    fontWeight: n === page ? 600 : 400,
                  }}>
                  {n}
                </button>
              ))
            }
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}>
            ถัดไป <Icon name="arrowRight" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

const SubmissionsTable = ({ rows, goto, full = false }) => {
  const { groups } = useData();
  const allGroups = groups && groups.length > 0 ? groups : VENDOR_CATEGORIES;
  const catName = (catId) => allGroups.find(g => g.id === catId)?.th || catId || "-";

  return (<table className="tbl">
    <thead>
      <tr>
        <th style={{ width: 110 }}>เลขที่</th>
        <th>บริษัท</th>
        {full && <th style={{ width: 115 }}>ประกาศ</th>}
        {full && <th>ประเภท</th>}
        <th>ยื่นเมื่อ</th>
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
          {full && (
            <td style={{ color: "var(--text-2)", fontSize: 13 }}>
              {(r.categories || [r.category]).filter(Boolean).map(cid => catName(cid)).join(', ') || '-'}
            </td>
          )}
          <td style={{ color: "var(--text-2)", fontSize: 13 }}>{fmtDateTime(r.submittedAt)}</td>
          <td><Icon name="chevron" size={16} style={{ color: "var(--text-3)" }} /></td>
        </tr>
      ))}
    </tbody>
  </table>);
};


// ── Submission detail ───────────────────────────────────────────────────────
function AdminDetail({ goto, id }) {
  const { submissions, loading, groups } = useData();
  const allSubmissions = submissions && submissions.length > 0 ? submissions : SUBMISSIONS;
  const base = allSubmissions.find(x => x.id === id) || allSubmissions[0];

  // Guard: still loading, or submission not found
  if (!base) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center", color: "var(--text-3)" }}>
        {loading
          ? <div style={{ fontSize: 13 }}>กำลังโหลดข้อมูล...</div>
          : (
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>
                ไม่พบใบสมัคร
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => goto("admin-submissions")}>
                ← กลับรายการใบสมัคร
              </button>
            </div>
          )
        }
      </div>
    );
  }

  const s = { ...base };

  // Resolve category ID → display name for the header
  const allGroups = groups && groups.length > 0 ? groups : VENDOR_CATEGORIES;
  const catDisplayName = (s.categories || [s.category]).filter(Boolean)
    .map(cid => allGroups.find(g => g.id === cid)?.th || cid)
    .join(' · ') || '-';

  return (
    <div className="fade-in">
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
              <div style={{ marginBottom: 4 }}>
                <span className="mono" style={{ fontSize: 12.5, color: "var(--text-3)" }}>{s.id}</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{s.company}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10,
                marginTop: 2, flexWrap: "wrap" }}>
                <span style={{ color: "var(--text-2)", fontSize: 13.5 }}>
                  {catDisplayName} · ยื่นเมื่อ {fmtDateTime(s.submittedAt)}
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
        </div>
      </div>

      <DetailInfo s={s} />
    </div>
  );
}

const DetailInfo = ({ s }) => {
  const { groups } = useData();
  // Resolve category IDs → display names (supports multi-category)
  const catName = React.useMemo(() => {
    const catIds = (s.categories && s.categories.length > 0)
      ? s.categories
      : (s.category ? [s.category] : []);
    if (!catIds.length) return "-";
    const all = groups && groups.length > 0 ? groups : VENDOR_CATEGORIES;
    return catIds.map(cid => all.find(g => g.id === cid)?.th || cid).join(', ');
  }, [s.categories, s.category, groups]);

  const fullAddress = [s.address, s.subDistrict ? `แขวง${s.subDistrict}` : "", s.district ? `เขต${s.district}` : ""]
    .filter(Boolean).join(" ") || "-";
  const provincePostal = [s.province, s.postcode].filter(Boolean).join(" ") || "-";

  return (
  <div className="card" style={{ padding: 24 }}>
    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>ข้อมูลบริษัท</h3>
    <InfoGrid rows={[
      ["ชื่อ Vendor",           s.company || "-"],
      ["เลขผู้เสียภาษี",        s.taxId || "-", true],
      ["ประกาศที่สมัคร",        s.annoId || "-", true],
      ["ประเภทกลุ่มงาน",        catName],
      ["ทุนจดทะเบียน",          s.capital ? s.capital + " บาท" : "-"],
      ["ระยะเวลาทำธุรกิจ",      s.yearsInBusiness ? s.yearsInBusiness + " ปี" : "-"],
      ["ที่อยู่",               fullAddress],
      ["จังหวัด / รหัสไปรษณีย์", provincePostal],
      ["โทรศัพท์บริษัท",        s.phone || "-", true],
      ["โทรศัพท์มือถือ",        s.mobile || "-", true],
      ["อีเมลบริษัท",           s.companyEmail || "-", true],
    ]} />
    <h3 style={{ margin: "28px 0 16px", fontSize: 15, fontWeight: 600 }}>ผู้ติดต่อ</h3>
    <InfoGrid rows={[
      ["ชื่อ-นามสกุล", s.contact || "-"],
      ["ตำแหน่ง",     s.position || "-"],
      ["อีเมล",       s.email || "-", true],
      ["โทรศัพท์",    s.contactPhone || "-", true],
    ]} />
  </div>
  );
};

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
      } catch (_err) {
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
    try { if (doc.path) await window.deleteFileFromStorage(doc.path); } catch (_e) {}
    setV(prev => ({ ...prev, docs: prev.docs.filter((_, j) => j !== i) }));
  };

  const removePreq = async (categoryId) => {
    const doc = (v.docs || []).find(d => d.categoryId === categoryId);
    try { if (doc?.path) await window.deleteFileFromStorage(doc.path); } catch (_e) {}
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

// ─── Admin Settings Page ─────────────────────────────────────────────────────
function AdminSettings() {
  const { settings = {}, setSettings } = useData();
  const [form, setForm] = React.useState(() => ({ ...settings }));
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [toast, showToast] = useToast();
  const logoRef = React.useRef();

  // Sync form when settings first arrive from DB (on slow connections)
  const settingsLoaded = React.useRef(false);
  React.useEffect(() => {
    if (!settingsLoaded.current && settings && Object.keys(settings).length > 0) {
      settingsLoaded.current = true;
      setForm({ ...settings });
    }
  }, [settings]);

  const ff = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await window.updateSiteSettingsInDb(form);
      setSettings({ ...form });
      showToast("บันทึกการตั้งค่าเรียบร้อยแล้ว", "success");
    } catch (e) {
      showToast("บันทึกไม่สำเร็จ: " + (e.message || e), "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const result = await window.uploadFileToStorage(file, "logos");
      setForm(f => ({ ...f, logoUrl: result.url }));
      showToast("อัปโหลดโลโก้เรียบร้อย", "success");
    } catch (err) {
      showToast("อัปโหลดไม่สำเร็จ: " + (err.message || err), "danger");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow="Admin · System"
        title="การตั้งค่าระบบ"
        desc="ปรับแต่งชื่อองค์กร โลโก้ และข้อมูลติดต่อที่แสดงบนเว็บไซต์"
        action={
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving || uploading}>
            {saving
              ? <><span style={{ display: "inline-block", width: 13, height: 13,
                  border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff",
                  borderRadius: "50%", animation: "spin .7s linear infinite" }} /> กำลังบันทึก...</>
              : <><Icon name="check" size={14} /> บันทึกการตั้งค่า</>
            }
          </button>
        }
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 860 }}>

        {/* ─── Logo & Org Name ─── */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>โลโก้และชื่อองค์กร</h3>
          <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* Logo preview */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 14,
                background: form.logoUrl ? "var(--surface-2)" : "var(--primary)",
                display: "grid", placeItems: "center",
                color: "#fff", fontWeight: 700, fontSize: 30,
                fontFamily: "var(--font-en)",
                boxShadow: "var(--shadow-sm)",
                overflow: "hidden",
                border: "1px solid var(--line)",
              }}>
                {form.logoUrl
                  ? <img src={form.logoUrl} alt="Logo preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : (form.logoInitials || (form.orgName || "E").slice(0, 1))
                }
              </div>
              <input ref={logoRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleLogoFile} />
              <button className="btn btn-ghost btn-sm"
                onClick={() => logoRef.current?.click()} disabled={uploading}
                style={{ fontSize: 12 }}>
                {uploading
                  ? <><span style={{ display: "inline-block", width: 11, height: 11,
                      border: "2px solid var(--text-3)", borderTopColor: "transparent",
                      borderRadius: "50%", animation: "spin .7s linear infinite" }} /> กำลังอัปโหลด...</>
                  : <><Icon name="upload" size={12} /> อัปโหลดโลโก้</>
                }
              </button>
              {form.logoUrl && (
                <button className="btn btn-ghost btn-sm"
                  style={{ color: "var(--danger)", fontSize: 12 }}
                  onClick={() => setForm(f => ({ ...f, logoUrl: "" }))}>
                  <Icon name="trash" size={12} /> ลบโลโก้
                </button>
              )}
            </div>

            {/* Name fields */}
            <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label" style={{ marginBottom: 6 }}>
                    ชื่อย่อองค์กร <span className="req">*</span>
                  </label>
                  <input className="input" value={form.orgName || ""} onChange={ff("orgName")}
                    placeholder="เช่น EnCo" style={{ width: "100%" }} />
                  <div className="help" style={{ marginTop: 4 }}>แสดงบน Sidebar, หัวข้อ, และหน้า Login</div>
                </div>
                <div>
                  <label className="label" style={{ marginBottom: 6 }}>ตัวอักษรโลโก้ (fallback)</label>
                  <input className="input" value={form.logoInitials || ""} onChange={ff("logoInitials")}
                    placeholder="E" maxLength={3} style={{ width: "100%" }} />
                  <div className="help" style={{ marginTop: 4 }}>1–3 ตัว แสดงเมื่อไม่มีรูปโลโก้</div>
                </div>
              </div>
              <div>
                <label className="label" style={{ marginBottom: 6 }}>ชื่อเต็มองค์กร</label>
                <input className="input" value={form.orgFullName || ""} onChange={ff("orgFullName")}
                  placeholder="บริษัท เอนเนอร์ยี่ คอมเพล็กซ์ จำกัด" style={{ width: "100%" }} />
                <div className="help" style={{ marginTop: 4 }}>แสดงในย่อหน้าแนะนำบนหน้าหลัก</div>
              </div>
              <div>
                <label className="label" style={{ marginBottom: 6 }}>คำบรรยายใต้โลโก้ (Sidebar subtitle)</label>
                <input className="input" value={form.portalSubtitle || ""} onChange={ff("portalSubtitle")}
                  placeholder="Vendor Portal" style={{ width: "100%" }} />
              </div>
              {form.logoUrl && (
                <div>
                  <label className="label" style={{ marginBottom: 6 }}>URL โลโก้ (แก้ไขตรงๆ)</label>
                  <input className="input" value={form.logoUrl || ""} onChange={ff("logoUrl")}
                    placeholder="https://..." style={{ width: "100%" }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Page Content ─── */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>ข้อความบนเว็บไซต์</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="label" style={{ marginBottom: 6 }}>หัวข้อ Hero (banner หน้าหลัก)</label>
              <input className="input" value={form.heroTitle || ""} onChange={ff("heroTitle")}
                placeholder="ระบบขึ้นทะเบียนผู้ค้าของ EnCo" style={{ width: "100%" }} />
            </div>
            <div>
              <label className="label" style={{ marginBottom: 6 }}>ชื่อ Badge AVL (บนหน้าหลัก)</label>
              <input className="input" value={form.avlName || ""} onChange={ff("avlName")}
                placeholder="EnCo Approved Vendor List (AVL)" style={{ width: "100%" }} />
              <div className="help" style={{ marginTop: 4 }}>แสดงใน Badge สีขาวโปร่งแสงด้านบน Hero</div>
            </div>
            <div>
              <label className="label" style={{ marginBottom: 6 }}>ชื่อเว็บไซต์ (แท็บ browser)</label>
              <input className="input" value={form.siteTitle || ""} onChange={ff("siteTitle")}
                placeholder="EnCo Vendor Registration" style={{ width: "100%" }} />
            </div>
          </div>
        </div>

        {/* ─── Contact Info ─── */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>ข้อมูลติดต่อ</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label className="label" style={{ marginBottom: 6 }}>โทรศัพท์</label>
              <input className="input" value={form.contactPhone || ""} onChange={ff("contactPhone")}
                placeholder="02-123-4567 ต่อ 8801" style={{ width: "100%" }} />
              <div className="help" style={{ marginTop: 4 }}>แสดงในส่วน "สอบถามข้อมูลเพิ่มเติม" ด้านล่างหน้าหลัก</div>
            </div>
            <div>
              <label className="label" style={{ marginBottom: 6 }}>อีเมล</label>
              <input className="input" type="email" value={form.contactEmail || ""} onChange={ff("contactEmail")}
                placeholder="procurement@company.co.th" style={{ width: "100%" }} />
            </div>
          </div>
        </div>

        {/* ─── DB setup notice ─── */}
        <div style={{
          padding: "14px 18px", background: "var(--warn-soft)",
          border: "1px solid oklch(85% 0.10 70)", borderRadius: 10,
          fontSize: 13, color: "oklch(42% 0.12 70)",
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <span style={{ flexShrink: 0 }}>⚠️</span>
          <div>
            การตั้งค่าเหล่านี้ต้องมีตาราง{" "}
            <code style={{ fontFamily: "var(--font-mono)", fontSize: 12,
              background: "rgba(0,0,0,.06)", padding: "1px 5px", borderRadius: 4 }}>
              site_settings
            </code>{" "}
            ใน Supabase ก่อน หากยังไม่มีกรุณาสร้างโดยรัน SQL ที่หน้า{" "}
            <b>Supabase → SQL Editor</b> (ดูเอกสารสำหรับ SQL ที่ต้องรัน)
          </div>
        </div>

      </div>

      <Toast toast={toast} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

Object.assign(window, { AdminDashboard, AdminSubmissions, AdminDetail, AdminAnnouncements, AdminGroups, AdminSettings });
