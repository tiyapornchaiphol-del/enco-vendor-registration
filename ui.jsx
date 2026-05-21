// Shared UI primitives: Logo, StatusChip, Field, FileSlot, Stepper, Icon, etc.

const Icon = ({ name, size = 18, stroke = 1.6, style }) => {
  const paths = {
    home:        <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>,
    file:        <><path d="M14 3H6v18h12V7l-4-4z" /><path d="M14 3v4h4" /></>,
    upload:      <><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M5 20h14" /></>,
    download:    <><path d="M12 4v12" /><path d="M7 11l5 5 5-5" /><path d="M5 20h14" /></>,
    track:       <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
    dashboard:   <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></>,
    inbox:       <><path d="M3 13l3-9h12l3 9" /><path d="M3 13v7h18v-7" /><path d="M3 13h5l1 3h6l1-3h5" /></>,
    settings:    <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.4 2.4-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" /></>,
    bell:        <><path d="M6 8a6 6 0 0 1 12 0v5l2 3H4l2-3V8z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
    search:      <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
    chevron:     <><path d="M9 6l6 6-6 6" /></>,
    check:       <><path d="M4 12l5 5L20 6" /></>,
    x:           <><path d="M6 6l12 12M18 6L6 18" /></>,
    plus:        <><path d="M12 5v14M5 12h14" /></>,
    minus:       <><path d="M5 12h14" /></>,
    edit:        <><path d="M4 20h4l10-10-4-4L4 16v4z" /><path d="M14 6l4 4" /></>,
    trash:       <><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /></>,
    filter:      <><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z" /></>,
    arrowRight:  <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    arrowLeft:   <><path d="M19 12H5M11 18l-6-6 6-6" /></>,
    eye:         <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    paperclip:   <><path d="M21 12l-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8" /></>,
    building:    <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2" /></>,
    users:       <><circle cx="9" cy="8" r="3.5" /><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14c3.5 0 6 2 6 5" /></>,
    megaphone:   <><path d="M3 11v3l11 4V7L3 11z" /><path d="M14 8.5v8" /><path d="M18 9a3 3 0 0 1 0 6" /></>,
    logout:      <><path d="M9 5H5v14h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H10" /></>,
    sparkle:     <><path d="M12 3l1.5 5L19 9.5l-5.5 1.5L12 17l-1.5-6L5 9.5l5.5-1.5L12 3z" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={style}>{paths[name]}</svg>
  );
};

const Logo = ({ size = 28, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: color || "var(--primary)",
      display: "grid", placeItems: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.46,
      fontFamily: "var(--font-en)", letterSpacing: "-.02em",
      boxShadow: "inset 0 -2px 0 rgba(0,0,0,.12)",
    }}>E</div>
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
      <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: ".01em" }}>EnCo</span>
      <span style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: ".06em",
        textTransform: "uppercase", fontFamily: "var(--font-en)" }}>Vendor Portal</span>
    </div>
  </div>
);

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
          {has ? `${file.name} · ${file.size}` : "PDF, JPG, PNG — ขนาดไม่เกิน 10 MB"}
        </div>
      </div>
      <input type="file" ref={inputRef} style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick({ name: f.name, size: `${(f.size / 1024).toFixed(0)} KB` });
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
