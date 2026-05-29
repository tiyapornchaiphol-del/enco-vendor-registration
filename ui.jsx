// Shared UI primitives: Logo, StatusChip, Field, FileSlot, Stepper, Icon, etc.

// SVG inner HTML for each icon — stored as plain strings to avoid large JSX
// object compilation issues in Babel Standalone.
const ICON_SVG = {
  home:        '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
  file:        '<path d="M14 3H6v18h12V7l-4-4z"/><path d="M14 3v4h4"/>',
  upload:      '<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M5 20h14"/>',
  download:    '<path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>',
  track:       '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  dashboard:   '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/>',
  inbox:       '<path d="M3 13l3-9h12l3 9"/><path d="M3 13v7h18v-7"/><path d="M3 13h5l1 3h6l1-3h5"/>',
  settings:    '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.4 2.4-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/>',
  bell:        '<path d="M6 8a6 6 0 0 1 12 0v5l2 3H4l2-3V8z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  search:      '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  chevron:     '<path d="M9 6l6 6-6 6"/>',
  check:       '<path d="M4 12l5 5L20 6"/>',
  x:           '<path d="M6 6l12 12M18 6L6 18"/>',
  plus:        '<path d="M12 5v14M5 12h14"/>',
  minus:       '<path d="M5 12h14"/>',
  edit:        '<path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M14 6l4 4"/>',
  trash:       '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
  filter:      '<path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/>',
  arrowRight:  '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft:   '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  eye:         '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  paperclip:   '<path d="M21 12l-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8"/>',
  building:    '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/>',
  users:       '<circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14c3.5 0 6 2 6 5"/>',
  megaphone:   '<path d="M3 11v3l11 4V7L3 11z"/><path d="M14 8.5v8"/><path d="M18 9a3 3 0 0 1 0 6"/>',
  logout:      '<path d="M9 5H5v14h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H10"/>',
  sparkle:     '<path d="M12 3l1.5 5L19 9.5l-5.5 1.5L12 17l-1.5-6L5 9.5l5.5-1.5L12 3z"/>',
  menu:        '<path d="M3 6h18M3 12h18M3 18h18"/>',
  refresh:     '<path d="M4 12a8 8 0 0 1 14-5.3L20 8h-4"/><path d="M20 12a8 8 0 0 1-14 5.3L4 16h4"/>',
  mail:        '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  phone:       '<path d="M6.6 10.8a15.4 15.4 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.6 3.6a1 1 0 0 1-.25 1L6.6 10.8z"/>',
  // ── Category icons ────────────────────────────────────────────────────────
  wrench:      '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3-3a8 8 0 0 1-11 11l-4.1 4.1a2 2 0 0 1-2.8-2.8L6.9 10.5A8 8 0 0 1 14.7 6.3z"/>',
  hammer:      '<path d="M15 12l-8 8"/><path d="M17.5 7.5l-2.3 2.3 2.3 2.3 2.3-2.3a3.3 3.3 0 0 0-4.6-4.6L13 7.5"/>',
  hardhat:     '<path d="M12 2a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"/><path d="M3 11v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-1"/><path d="M12 2v9"/>',
  ruler:       '<path d="M3 21L21 3"/><path d="M7 3L3 7l3 3 2-2"/><path d="M17 21l4-4-3-3-2 2"/>',
  zap:         '<path d="M13 2L4 12a1 1 0 0 0 .76 1.64H11l-2 8.36 9-10a1 1 0 0 0-.76-1.64H12L13 2z"/>',
  lightbulb:   '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.4-1.2 4.5-3 5.7V17H8v-2.3C6.2 13.5 5 11.4 5 9a7 7 0 0 1 7-7z"/>',
  plug:        '<path d="M7 6V3M17 6V3"/><rect x="3" y="6" width="18" height="7" rx="2"/><path d="M12 13v9M8 17h8"/>',
  flame:       '<path d="M8.5 14.5A4.5 4.5 0 0 0 17 11c0-5-5-9-5-9s0 4.5-3.5 6.5C7 9.5 5 11 5 13.5A7 7 0 0 0 12 20a7 7 0 0 0 2-13.7"/>',
  monitor:     '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  server:      '<rect x="2" y="3" width="20" height="6" rx="2"/><rect x="2" y="13" width="20" height="6" rx="2"/><path d="M6 6h.01M6 16h.01"/>',
  cpu:         '<rect x="7" y="7" width="10" height="10" rx="1"/><path d="M9 2v5M15 2v5M9 17v5M15 17v5M2 9h5M2 15h5M17 9h5M17 15h5"/>',
  database:    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
  wifi:        '<path d="M1.5 8.5a19 19 0 0 1 21 0M5 12a14 14 0 0 1 14 0M8.5 15.5a9 9 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>',
  hardDrive:   '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 2L20 7H4l4-5h8z"/><circle cx="12" cy="14" r="1"/>',
  truck:       '<path d="M5 17H3V7h14v10h-2M17 7l4 6h-4"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  car:         '<path d="M6 17H3V10l2.5-4h13L21 10v7h-3"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>',
  leaf:        '<path d="M17 8C8 10 5.9 16.17 3.82 22"/><path d="M9.5 2.21C9.5 8.5 14 11 20.5 9"/>',
  droplet:     '<path d="M12 2.7L6 11.3a7 7 0 1 0 12 0L12 2.7z"/>',
  recycle:     '<path d="M7 19l-4.5-7.8 2-3.4M7 19l2-3.5M17 5l4.5 7.8-2 3.4M17 5l-2 3.5M9 10l3-5 3 5M9 14l3 5 3-5"/>',
  thermometer: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
  briefcase:   '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3M3 14h18"/>',
  clipboard:   '<path d="M9 5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/><path d="M9 12h6M9 16h4"/>',
  folder:      '<path d="M4 4h5l2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>',
  printer:     '<path d="M6 18H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2"/><path d="M6 9V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5"/><rect x="6" y="14" width="12" height="8"/>',
  barChart:    '<path d="M3 21h18M3 21V9l4-3v15M11 21V4l4-3v20M19 21V10l-4-3v14"/>',
  shield:      '<path d="M12 3L4 7v5c0 4.4 3.4 8.5 8 9.8C17.6 20.5 21 16.4 21 12V7l-9-4z"/>',
  shieldCheck: '<path d="M12 3L4 7v5c0 4.4 3.4 8.5 8 9.8C17.6 20.5 21 16.4 21 12V7l-9-4z"/><path d="M9 12l2 2 4-4"/>',
  lock:        '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  key:         '<circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15 3l3 3"/>',
  paintbrush:  '<path d="M18.4 2.6l3 3L11 16l-4 1 1-4L18.4 2.6z"/><path d="M4.5 21a2.5 2.5 0 0 1 0-5c2 0 3 1.5 3 3.5 0 .6.5 1.5 1.5 1.5"/>',
  factory:     '<path d="M2 21V9l7-4v4l7-4v4l4-2v14H2z"/><path d="M6 21v-5h4v5M14 17h2M14 13h2"/>',
  camera:      '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  globe:       '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  award:       '<circle cx="12" cy="8" r="6"/><path d="M8.56 13.95l-1.56 8.05 5-3 5 3-1.56-8.05"/>',
  star:        '<path d="M12 2l2.4 7.3H22l-6.2 4.5 2.4 7.3L12 16.6l-6.2 4.5 2.4-7.3L2 9.3h7.6L12 2z"/>',
  cross:       '<path d="M9 3v6H3v6h6v6h6v-6h6V9h-6V3z"/>',
  package:     '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96L12 12l8.73-5.04M12 22.08V12"/>',
};

const Icon = ({ name, size = 18, stroke = 1.6, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
    style={style}
    dangerouslySetInnerHTML={{ __html: ICON_SVG[name] || '' }} />
);

// Renders an SVG icon if name is a known key, otherwise renders emoji/text as-is.
// Used for category group icons — allows backward-compat with old emoji values.
const CatIcon = ({ icon, size = 18, style }) => {
  if (!icon) return null;
  const isName = /^[a-zA-Z][a-zA-Z0-9]*$/.test(icon);
  if (isName) return <Icon name={icon} size={size} style={style} />;
  return <span style={{ fontSize: size, lineHeight: 1, ...style }}>{icon}</span>;
};

const Logo = ({ size = 28, color }) => {
  const ctx = useData();
  const s = ctx?.settings || {};
  const orgName = s.orgName || "EnCo";
  const subtitle = s.portalSubtitle || "Vendor Portal";
  const initials = s.logoInitials || orgName.slice(0, 1) || "E";
  const logoUrl  = s.logoUrl || "";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: 8,
        background: color || "var(--primary)",
        display: "grid", placeItems: "center",
        color: "#fff", fontWeight: 700, fontSize: size * 0.46,
        fontFamily: "var(--font-en)", letterSpacing: "-.02em",
        boxShadow: "inset 0 -2px 0 rgba(0,0,0,.12)",
        overflow: "hidden", flexShrink: 0,
      }}>
        {logoUrl
          ? <img src={logoUrl} alt={orgName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : initials}
      </div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: ".01em" }}>{orgName}</span>
        <span style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: ".06em",
          textTransform: "uppercase", fontFamily: "var(--font-en)" }}>{subtitle}</span>
      </div>
    </div>
  );
};

const StatusChip = ({ status, map, lang = "th" }) => {
  const m = (map || STATUS_LABEL)[status];
  if (!m) return null;
  return <span className={`chip-status ${m.cls}`}>{m[lang]}</span>;
};

const Field = ({ label, required, hint, error, children, span = 1 }) => (
  <div style={{ gridColumn: `span ${span}`, display: "flex", flexDirection: "column", gap: 6 }}>
    {label ? (
      <div className="label">
        <span>{label}</span>
        {required ? <span className="req">*</span> : null}
      </div>
    ) : null}
    {children}
    {error ? <div style={{ fontSize: 12, color: "var(--danger)" }}>{error}</div>
           : hint ? <div className="help">{hint}</div> : null}
  </div>
);

const Stepper = ({ steps, current }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%" }}>
    {steps.map((s, i) => {
      const state = i < current ? "done" : i === current ? "active" : "todo";
      return (
        <React.Fragment key={s.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              display: "grid", placeItems: "center", fontSize: 13, fontWeight: 600,
              background: state === "active" ? "var(--primary)" :
                          state === "done"   ? "var(--success-soft)" : "var(--surface)",
              color:      state === "active" ? "#fff" :
                          state === "done"   ? "oklch(38% 0.11 155)" : "var(--text-3)",
              border:     state === "todo"   ? "1px solid var(--line)" : "1px solid transparent",
              fontFamily: "var(--font-en)",
              transition: "all .2s",
            }}>
              {state === "done" ? <Icon name="check" size={14} stroke={2.4} /> : i + 1}
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-en)" }}>
                STEP {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 13.5, fontWeight: state === "active" ? 600 : 500,
                color: state === "todo" ? "var(--text-3)" : "var(--text)" }}>
                {s.label}
              </span>
            </div>
          </div>
          {i < steps.length - 1 ? (
            <div style={{
              flex: 1, height: 1, margin: "0 16px",
              background: i < current ? "var(--success)" : "var(--line)",
              transition: "background .2s",
            }} />
          ) : null}
        </React.Fragment>
      );
    })}
  </div>
);

const FileSlot = ({ doc, file, onPick, onRemove }) => {
  const inputRef = React.useRef(null);
  const has = !!file;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px",
      border: `1px ${has ? "solid" : "dashed"} ${has ? "var(--success)" : "var(--line)"}`,
      background: has ? "var(--success-soft)" : "var(--surface)",
      borderRadius: "var(--radius)", transition: "all .15s",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: has ? "rgba(255,255,255,.6)" : "var(--surface-2)",
        display: "grid", placeItems: "center",
        color: has ? "oklch(38% 0.11 155)" : "var(--text-3)",
        flexShrink: 0,
      }}>
        <Icon name={has ? "check" : "file"} size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}>
          {doc.th}{doc.required ? <span style={{ color: "var(--danger)", marginLeft: 4 }}>*</span> : null}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-3)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {has ? `${file.name} · ${file._displaySize || file.size || ""}` : "PDF, JPG, PNG, DOC — ขนาดไม่เกิน 10 MB"}
        </div>
      </div>
      <input type="file" ref={inputRef} style={{ display: "none" }}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            // ส่ง File object จริง พร้อม metadata สำหรับแสดงผล
            f._displaySize = f.size < 1024 * 1024
              ? `${(f.size / 1024).toFixed(0)} KB`
              : `${(f.size / (1024 * 1024)).toFixed(1)} MB`;
            onPick(f);
          }
          e.target.value = ""; // reset เพื่อเลือกไฟล์เดิมซ้ำได้
        }} />
      {has ? (
        <button className="btn btn-ghost btn-sm" onClick={onRemove}>
          <Icon name="x" size={14} /> ลบ
        </button>
      ) : (
        <button className="btn btn-soft btn-sm" onClick={() => inputRef.current?.click()}>
          <Icon name="upload" size={14} /> อัปโหลด
        </button>
      )}
    </div>
  );
};

const SectionHeader = ({ eyebrow, title, desc, action }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between",
    gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
    <div>
      {eyebrow ? (
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--primary)",
          letterSpacing: ".09em", textTransform: "uppercase",
          fontFamily: "var(--font-en)", marginBottom: 8 }}>{eyebrow}</div>
      ) : null}
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: "-.01em",
        lineHeight: 1.2 }}>{title}</h1>
      {desc ? <div style={{ marginTop: 6, color: "var(--text-2)", fontSize: 14.5,
        maxWidth: 720 }}>{desc}</div> : null}
    </div>
    {action ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{action}</div> : null}
  </div>
);

const StatCard = ({ label, value, sub, accent }) => (
  <div className="card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: ".04em",
      textTransform: "uppercase", fontFamily: "var(--font-en)" }}>{label}</div>
    <div className="num" style={{ fontSize: 32, fontWeight: 600, lineHeight: 1,
      color: accent || "var(--text)", letterSpacing: "-.02em" }}>{value}</div>
    {sub ? <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>{sub}</div> : null}
  </div>
);

const Avatar = ({ name, size = 34, color }) => {
  const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const hash = [...(name || "")].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color || `oklch(85% 0.05 ${hue})`,
      color: `oklch(40% 0.10 ${hue})`,
      display: "grid", placeItems: "center",
      fontSize: size * 0.36, fontWeight: 600, fontFamily: "var(--font-en)",
      flexShrink: 0,
    }}>{initials}</div>
  );
};

const Progress = ({ value, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
    <div style={{ flex: 1, height: 5, background: "var(--line)", borderRadius: 99 }}>
      <div style={{
        width: `${value}%`, height: "100%", borderRadius: 99,
        background: color || (value === 100 ? "var(--success)" : "var(--primary)"),
        transition: "width .3s",
      }} />
    </div>
    <span className="num" style={{ fontSize: 12, color: "var(--text-3)", minWidth: 32, textAlign: "right" }}>{value}%</span>
  </div>
);

Object.assign(window, {
  Icon, Logo, StatusChip, Field, Stepper, FileSlot, SectionHeader, StatCard, Avatar, Progress,
  fmtPhone, fmtTaxId, fmtPostal, fmtNumber, fmtYears,
  isValidEmail, isValidPhone, isValidTaxId, isValidPostal, isValidYears, isRequired,
  Toast,
});

// ── Input formatters (apply on every keystroke) ────────────────────────────
function fmtPhone(raw) {
  const d = String(raw || "").replace(/\D/g, "").slice(0, 10);
  if (d.length === 0) return "";
  if (d.startsWith("02")) {
    // Bangkok landline: 02-XXX-XXXX or 02-XXXX-XXXX
    if (d.length <= 2) return d;
    if (d.length <= 6) return `${d.slice(0, 2)}-${d.slice(2)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }
  // Mobile / other: 0X-XXX-XXXX or 0XX-XXX-XXXX
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 10)}`;
}
function fmtTaxId(raw) {
  const d = String(raw || "").replace(/\D/g, "").slice(0, 13);
  // X-XXXX-XXXXX-XX-X
  const parts = [
    d.slice(0, 1), d.slice(1, 5), d.slice(5, 10),
    d.slice(10, 12), d.slice(12, 13),
  ].filter(Boolean);
  return parts.join("-");
}
function fmtPostal(raw) { return String(raw || "").replace(/\D/g, "").slice(0, 5); }
function fmtYears(raw)  { return String(raw || "").replace(/\D/g, "").slice(0, 3); }
function fmtNumber(raw) {
  const d = String(raw || "").replace(/[^\d]/g, "");
  if (!d) return "";
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ── Validators (return true when valid) ─────────────────────────────────────
function isRequired(v)    { return !!String(v || "").trim(); }
function isValidEmail(v)  { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim()); }
function isValidPhone(v)  { const d = String(v || "").replace(/\D/g, ""); return d.length === 9 || d.length === 10; }
function isValidTaxId(v)  { return String(v || "").replace(/\D/g, "").length === 13; }
function isValidPostal(v) { return /^\d{5}$/.test(String(v || "").trim()); }
function isValidYears(v)  { const n = parseInt(v, 10); return Number.isFinite(n) && n >= 1 && n <= 200; }

// ── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, tone = "danger", onClose }) {
  React.useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [message, onClose]);
  if (!message) return null;
  const tones = {
    danger:  { bg: "var(--danger-soft)",  fg: "oklch(42% 0.14 25)",  icon: "x" },
    warn:    { bg: "var(--warn-soft)",    fg: "oklch(45% 0.12 70)",  icon: "bell" },
    success: { bg: "var(--success-soft)", fg: "oklch(38% 0.11 155)", icon: "check" },
  }[tone];
  return (
    <div style={{
      position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 99999, background: tones.bg, color: tones.fg,
      padding: "12px 18px", borderRadius: 10,
      boxShadow: "var(--shadow-lg)",
      display: "flex", alignItems: "center", gap: 10,
      fontSize: 14, fontWeight: 500,
      animation: "fadeIn .2s ease",
      maxWidth: "90vw",
    }}>
      <Icon name={tones.icon} size={16} stroke={2.4} />
      <span>{message}</span>
      <button onClick={onClose} style={{
        appearance: "none", border: "none", background: "transparent",
        color: "currentColor", cursor: "pointer", padding: 4, marginLeft: 6,
        opacity: .7,
      }}>
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}
