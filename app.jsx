// Main app shell: sidebar nav + page routing + Tweaks panel + topbar.

// ── Error boundary (prevents blank page on render error) ─────────────────────
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("🔴 App render error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", padding: 24, background: "#f5f6f8",
          fontFamily: "system-ui, sans-serif",
        }}>
          <div style={{
            maxWidth: 480, width: "100%", background: "#fff",
            border: "1px solid #e6e8ec", borderRadius: 16,
            padding: "40px 36px", textAlign: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,.06)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
              เกิดข้อผิดพลาดในการโหลดหน้าเว็บ
            </div>
            <div style={{ fontSize: 13, color: "#6e7681", marginBottom: 24, lineHeight: 1.6 }}>
              กรุณารีเฟรชหน้านี้ใหม่ หากปัญหายังคงอยู่ โปรดติดต่อผู้ดูแลระบบ
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 24px", background: "oklch(45% 0.13 250)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}>
              รีเฟรชหน้า
            </button>
            {this.state.error && (
              <details style={{ marginTop: 20, textAlign: "left" }}>
                <summary style={{ fontSize: 12, color: "#8a93a0", cursor: "pointer" }}>รายละเอียดข้อผิดพลาด</summary>
                <pre style={{
                  marginTop: 8, padding: 12, background: "#f5f6f8",
                  borderRadius: 6, fontSize: 11, color: "#4a525e",
                  overflowX: "auto", whiteSpace: "pre-wrap",
                }}>{this.state.error.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Admin Login Page (standalone full-page — accessed via #admin URL) ────────
function AdminLoginPage({ onLogin }) {
  const ctx = useData();
  const orgName = ctx?.settings?.orgName || "EnCo";
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPwd, setShowPwd] = React.useState(false);

  const login = async () => {
    if (!email.trim() || !password) { setErr("กรุณากรอกอีเมลและรหัสผ่าน"); return; }
    setLoading(true);
    setErr("");
    try {
      const admin = await window.getAdminByEmail(email.trim(), password);
      if (!admin) { setErr("อีเมลหรือรหัสผ่านไม่ถูกต้อง"); setLoading(false); return; }
      onLogin({ id: admin.id, email: admin.email, name: admin.name,
        role: admin.role, permissions: admin.permissions || [] });
    } catch (e) {
      console.error("Login error:", e);
      setErr("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
    }}>
      {/* Card */}
      <div className="card fade-in" style={{ width: "100%", maxWidth: 400, padding: "40px 36px" }}>
        {/* Logo & header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Logo />
          <div style={{ marginTop: 20, padding: "6px 14px", display: "inline-block",
            background: "var(--surface-2)", border: "1px solid var(--line)",
            borderRadius: 8, fontSize: 12, color: "var(--text-3)",
            fontFamily: "var(--font-en)", letterSpacing: ".04em" }}>
            STAFF PORTAL
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 13.5, color: "var(--text-2)" }}>
            เข้าสู่ระบบสำหรับเจ้าหน้าที่ {orgName} เท่านั้น
          </p>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-2)",
              display: "block", marginBottom: 6 }}>อีเมล</label>
            <input className="input" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@enco.co.th" disabled={loading}
              onKeyDown={e => e.key === "Enter" && !loading && login()}
              style={{ width: "100%" }} autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-2)",
              display: "block", marginBottom: 6 }}>รหัสผ่าน</label>
            <div style={{ position: "relative" }}>
              <input className="input" type={showPwd ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" disabled={loading}
                onKeyDown={e => e.key === "Enter" && !loading && login()}
                style={{ width: "100%", paddingRight: 40 }} />
              <button onClick={() => setShowPwd(v => !v)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-3)", padding: 4, display: "flex", alignItems: "center" }}
                tabIndex={-1} type="button">
                <Icon name={showPwd ? "eye" : "eye"} size={15} />
              </button>
            </div>
          </div>

          {err && (
            <div style={{ padding: "10px 14px", background: "var(--danger-soft)",
              color: "oklch(42% 0.14 25)", borderRadius: 8, fontSize: 13,
              display: "flex", gap: 8, alignItems: "center" }}>
              <Icon name="x" size={13} stroke={2.4} /> {err}
            </div>
          )}

          <button className="btn btn-primary" onClick={login} disabled={loading}
            style={{ marginTop: 4, height: 44, fontSize: 14.5 }}>
            {loading
              ? <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> กำลังเข้าสู่ระบบ...</>
              : "เข้าสู่ระบบ"
            }
          </button>
        </div>
      </div>

      {/* Footer */}
      <p style={{ marginTop: 28, fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>
        {orgName} Vendor Registration System · v2.6.0
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

  // ── Admin route detection ─────────────────────────────────────────────────
  // Admin area is ONLY accessible via the URL hash "#admin"
  // Vendor portal has zero indication that an admin area exists
  const [adminRoute] = React.useState(() => window.location.hash === "#admin");

  const [adminUser, setAdminUser] = React.useState(() => {
    // Restore admin session — only valid if user had come through #admin route
    try {
      const saved = localStorage.getItem("enco_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch (_e) { return null; }
  });
  const isAdmin = adminUser !== null;

  // Restore last page from localStorage — vendor always starts at landing,
  // only admin sessions restore their last page.
  const [page, setPage] = React.useState(() => {
    try {
      const isAdminSaved = !!localStorage.getItem("enco_admin_user");
      if (!isAdminSaved) return "landing"; // vendor ใหม่ทุกครั้ง
      const savedPage = localStorage.getItem("enco_page") || "admin-dashboard";
      if (savedPage === "track" || !savedPage.startsWith("admin")) return "admin-dashboard";
      return savedPage;
    } catch (_e) { return "landing"; }
  });
  const [detailId, setDetailId] = React.useState(() => {
    try { return localStorage.getItem("enco_detail_id") || null; } catch (_e) { return null; }
  });
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Save page to localStorage on change
  React.useEffect(() => {
    try {
      localStorage.setItem("enco_page", page);
      if (detailId) localStorage.setItem("enco_detail_id", detailId);
      else localStorage.removeItem("enco_detail_id");
    } catch (_e) {}
  }, [page, detailId]);

  // Save admin session to localStorage
  React.useEffect(() => {
    try {
      if (adminUser) localStorage.setItem("enco_admin_user", JSON.stringify(adminUser));
      else localStorage.removeItem("enco_admin_user");
    } catch (_e) {}
  }, [adminUser]);

  // Fetch data from Supabase (includes groups, announcements, submissions, categories, settings)
  const {
    submissions, setSubmissions,
    announcements, setAnnouncements,
    categories, setCategories,
    settings, setSettings,
    loading, error
  } = useSupabaseData();

  // Use categories from Supabase as groups
  const [groups, setGroups] = React.useState([]);
  React.useEffect(() => {
    if (categories && categories.length > 0) {
      setGroups(categories);
    }
  }, [categories]);

  const dataValue = {
    groups, setGroups,
    announcements, setAnnouncements,
    submissions, setSubmissions,
    categories, setCategories,
    settings, setSettings,
    loading, error
  };

  // Sync primary color to CSS var
  React.useEffect(() => {
    const colors = {
      "#1e4ea3": { primary: "oklch(45% 0.13 250)", soft: "oklch(95% 0.03 250)", ink: "oklch(35% 0.13 250)", border: "oklch(85% 0.06 250)" },
      "#2d7a4f": { primary: "oklch(48% 0.13 155)", soft: "oklch(95% 0.04 155)", ink: "oklch(35% 0.13 155)", border: "oklch(82% 0.07 155)" },
      "#5b3da3": { primary: "oklch(45% 0.16 290)", soft: "oklch(95% 0.04 290)", ink: "oklch(35% 0.15 290)", border: "oklch(82% 0.08 290)" },
      "#a1421f": { primary: "oklch(48% 0.15 35)",  soft: "oklch(96% 0.04 35)",  ink: "oklch(35% 0.14 35)",  border: "oklch(85% 0.08 35)" },
      "#1a1a1a": { primary: "oklch(25% 0.01 250)", soft: "oklch(94% 0.005 250)", ink: "oklch(20% 0.01 250)", border: "oklch(80% 0.005 250)" },
    };
    const c = colors[t.primary] || colors["#1e4ea3"];
    document.documentElement.style.setProperty("--primary", c.primary);
    document.documentElement.style.setProperty("--primary-soft", c.soft);
    document.documentElement.style.setProperty("--primary-ink", c.ink);
    document.documentElement.style.setProperty("--primary-border", c.border);
  }, [t.primary]);

  // When admin logs in/out, reset page
  React.useEffect(() => {
    if (isAdmin && !page.startsWith("admin")) setPage("admin-dashboard");
    if (!isAdmin && page.startsWith("admin")) setPage("landing");
  }, [isAdmin]);

  const goto = (p, id) => {
    if (id !== undefined) setDetailId(id);
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Vendor nav items
  const vendorNav = [
    { id: "landing",      label: "ประกาศรับสมัคร",      icon: "megaphone" },
    { id: "avl-registry", label: "ทะเบียนรายชื่อผู้ค้า", icon: "building" },
  ];
  const adminNav = [
    { id: "admin-dashboard",     label: "Dashboard",            icon: "dashboard" },
    { id: "admin-submissions",   label: "ใบสมัครคู่ค้า",          icon: "inbox" },
    { id: "admin-announcements", label: "ประกาศรับสมัคร",        icon: "megaphone" },
    { id: "admin-groups",        label: "กลุ่มงาน",                 icon: "sparkle" },
    { id: "admin-vendors",       label: "ทะเบียนผู้ค้า",            icon: "building" },
    { id: "admin-users",         label: "ผู้ใช้งานระบบ",          icon: "users" },
    { id: "admin-settings",      label: "การตั้งค่า",              icon: "settings" },
  ];
  const nav = isAdmin ? adminNav : vendorNav;

  // ── Standalone admin login page ───────────────────────────────────────────
  // Shown ONLY when URL hash is #admin and no session exists.
  // Vendor users who never visit #admin will never see this.
  if (adminRoute && !isAdmin) {
    return (
      <DataContext.Provider value={dataValue}>
        <div data-density={t.density} data-dark={t.dark ? "true" : "false"}>
          <AdminLoginPage onLogin={(account) => {
            setAdminUser(account);
            setPage("admin-dashboard");
          }} />
        </div>
      </DataContext.Provider>
    );
  }

  return (
    <DataContext.Provider value={dataValue}>
    <div data-density={t.density} data-dark={t.dark ? "true" : "false"}>
      <div className="app-shell">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div style={{ padding: "4px 8px 18px", borderBottom: "1px solid var(--line)",
            marginBottom: 12 }}>
            <Logo />
          </div>
          {isAdmin && (
            <div style={{ padding: "0 8px 10px", fontSize: 10.5, fontWeight: 600,
              color: "var(--text-3)", letterSpacing: ".08em", textTransform: "uppercase",
              fontFamily: "var(--font-en)" }}>Admin Panel</div>
          )}
          {nav.map(n => {
            const isActive = page === n.id ||
              (n.id === "admin-submissions" && page === "admin-detail") ||
              (n.id === "avl-registry"      && page === "avl-registry");
            return (
              <button key={n.id} onClick={() => { goto(n.id); setSidebarOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 8, border: "none",
                  background: isActive ? "var(--primary-soft)" : "transparent",
                  color: isActive ? "var(--primary-ink)" : "var(--text-2)",
                  cursor: "pointer", textAlign: "left", fontSize: 13.5,
                  fontWeight: isActive ? 600 : 500, transition: "all .15s",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--surface-2)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                <Icon name={n.icon} size={17} stroke={isActive ? 2 : 1.7} />
                <span>{n.label}</span>
              </button>
            );
          })}

          <div style={{ marginTop: "auto", padding: "12px 8px",
            borderTop: "1px solid var(--line)" }}>
            {isAdmin ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={adminUser.name} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{adminUser.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{adminUser.role}</div>
                </div>
                <button className="btn btn-ghost btn-sm btn-icon" title="ออกจากระบบ"
                  onClick={() => {
                    setAdminUser(null);
                    // Clear session and return to vendor portal (no #admin hash)
                    window.location.href = window.location.pathname;
                  }}>
                  <Icon name="logout" size={14} />
                </button>
              </div>
            ) : (
              // Vendor view: no admin login button — admin access is via #admin URL only
              <div style={{ fontSize: 11.5, color: "var(--text-3)", padding: "0 4px" }}>
                <div style={{ marginBottom: 2 }}>{dataValue.settings?.orgName || "EnCo"} Vendor Portal</div>
                <div className="mono">v2.6.0 · © 2569</div>
              </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          {/* Topbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 24, gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
              <button className="btn btn-ghost btn-icon hamburger-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Icon name={sidebarOpen ? "x" : "menu"} size={18} />
              </button>
              <Breadcrumb page={page} detailId={detailId} role={isAdmin ? "admin" : "vendor"} goto={goto} />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {isAdmin && (
                <button className="btn btn-ghost btn-sm btn-icon" style={{ position: "relative" }}>
                  <Icon name="bell" size={16} />
                  <span style={{ position: "absolute", top: 4, right: 4,
                    width: 8, height: 8, borderRadius: "50%",
                    background: "var(--danger)", border: "2px solid var(--surface)" }} />
                </button>
              )}
            </div>
          </div>

          {/* Pages */}
          {page === "landing"             && <VendorLanding goto={goto} />}
          {page === "avl-registry"        && <VendorRegistry goto={goto} />}
          {page === "form"                && <VendorForm key={detailId || "default"} goto={goto} annoId={detailId} />}
          {page === "admin-dashboard"     && <AdminDashboard goto={goto} />}
          {page === "admin-submissions"   && <AdminSubmissions goto={goto} />}
          {page === "admin-detail"        && <AdminDetail goto={goto} id={detailId} />}
          {page === "admin-announcements" && <AdminAnnouncements goto={goto} />}
          {page === "admin-groups"        && <AdminGroups />}
          {page === "admin-vendors"       && <AdminVendorRegistry goto={goto} />}
          {page === "admin-users"         && <AdminUsersPlaceholder />}
          {page === "admin-settings"      && <AdminSettings />}
        </main>
      </div>

      {/* Tweaks panel */}
      <TweaksPanel>
        <TweakSection label="View" />
        <TweakRadio label="Density" value={t.density} options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak("density", v)} />
        <TweakToggle label="Dark mode" value={t.dark}
          onChange={(v) => setTweak("dark", v)} />

        <TweakSection label="Theme" />
        <TweakColor label="Primary" value={t.primary}
          options={["#1e4ea3", "#2d7a4f", "#5b3da3", "#a1421f", "#1a1a1a"]}
          onChange={(v) => setTweak("primary", v)} />

        <TweakSection label="Jump to" />
        {!isAdmin ? (
          <>
            <TweakButton label="ประกาศรับสมัคร" onClick={() => goto("landing")} />
            <TweakButton label="ทะเบียนรายชื่อผู้ค้า" onClick={() => goto("avl-registry")} />
            <TweakButton label="ฟอร์มสมัคร" onClick={() => goto("form")} />
          </>
        ) : (
          <>
            <TweakButton label="Dashboard" onClick={() => goto("admin-dashboard")} />
            <TweakButton label="ใบสมัครคู่ค้า" onClick={() => goto("admin-submissions")} />
            <TweakButton label="รายละเอียดใบสมัคร" onClick={() => goto("admin-detail", "AVL-26-0142")} />
            <TweakButton label="จัดการประกาศ" onClick={() => goto("admin-announcements")} />
          </>
        )}
      </TweaksPanel>
    </div>
    </DataContext.Provider>
  );
}

const Breadcrumb = ({ page, detailId, role, goto }) => {
  const titles = {
    "landing":             ["Vendor", "ประกาศรับสมัคร"],
    "avl-registry":        ["Vendor", "ทะเบียนรายชื่อผู้ค้า"],
    "form":                ["Vendor", "สมัครคู่ค้า"],
    "admin-dashboard":     ["Admin", "Dashboard"],
    "admin-submissions":   ["Admin", "ใบสมัครคู่ค้า"],
    "admin-detail":        ["Admin", "ใบสมัครคู่ค้า", detailId || ""],
    "admin-announcements": ["Admin", "ประกาศรับสมัคร"],
    "admin-groups":        ["Admin", "กลุ่มงาน"],
    "admin-vendors":       ["Admin", "ทะเบียนผู้ค้า"],
    "admin-users":         ["Admin", "ผู้ใช้งานระบบ"],
    "admin-settings":      ["Admin", "การตั้งค่าระบบ"],
  };
  const parts = titles[page] || [""];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13,
      color: "var(--text-3)" }}>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          <span style={{ color: i === parts.length - 1 ? "var(--text)" : "var(--text-3)",
            fontWeight: i === parts.length - 1 ? 500 : 400,
            fontFamily: i === 2 ? "var(--font-mono)" : "inherit",
            fontSize: i === 2 ? 12.5 : 13 }}>{p}</span>
          {i < parts.length - 1 ? <Icon name="chevron" size={12} stroke={2} /> : null}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── ทะเบียนรายชื่อผู้ค้า (Vendor-facing) ────────────────────────────────────
function VendorRegistry({ goto }) {
  const [docs, setDocs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fmtDate = (str) => {
    if (!str) return "—";
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
  };

  React.useEffect(() => {
    (async () => {
      try {
        const data = await window.getAvlDocumentsFromDb();
        setDocs(data || []);
      } catch (e) {
        console.error("AVL fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow="Vendor Portal · AVL"
        title="ทะเบียนรายชื่อผู้ค้า"
        desc="ประกาศรายชื่อผู้ค้าที่ผ่านการคัดเลือกและขึ้นทะเบียนกับ EnCo (Approved Vendor List)"
        action={
          <button className="btn btn-ghost btn-sm" onClick={() => goto("landing")}>
            <Icon name="arrowLeft" size={14} /> กลับหน้าหลัก
          </button>
        }
      />

      {loading ? (
        <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--text-3)" }}>
          กำลังโหลด...
        </div>
      ) : docs.length === 0 ? (
        <div className="card" style={{ padding: "72px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>
            ยังไม่มีประกาศทะเบียนรายชื่อผู้ค้า
          </div>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>
            เมื่อ EnCo ประกาศผลการคัดเลือก เอกสารจะปรากฏที่นี่
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {docs.map(doc => (
            <div key={doc.id} className="card" style={{
              padding: "20px 24px",
              display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
            }}>
              {/* PDF icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                background: "var(--danger-soft)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>📄</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>
                  {doc.note || doc.name}
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                    {doc.name}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                    เผยแพร่ {fmtDate(doc.uploadedAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm">
                  <Icon name="eye" size={14} /> เปิดดู
                </a>
                <a href={doc.url} download={doc.name}
                  className="btn btn-soft btn-sm">
                  <Icon name="download" size={14} /> ดาวน์โหลด
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ทะเบียนรายชื่อผู้ค้า (Admin-facing) ─────────────────────────────────────
function AdminVendorRegistry({ goto }) {
  const [docs, setDocs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [noteModal, setNoteModal] = React.useState(null); // pending file waiting for note
  const [noteText, setNoteText] = React.useState("");
  const fileRef = React.useRef();

  const fmtDateTime = (str) => {
    if (!str) return "—";
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) +
      " " + d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  };

  const loadDocs = async () => {
    try {
      const data = await window.getAvlDocumentsFromDb();
      setDocs(data || []);
    } catch (e) {
      console.error("AVL load error:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { loadDocs(); }, []);

  // Step 1: pick file → show note modal
  const handlePickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setNoteText("");
    setNoteModal(file);
  };

  // Step 2: confirm note → upload + save to DB
  const handleConfirmUpload = async () => {
    if (!noteModal) return;
    setUploading(true);
    setNoteModal(null);
    try {
      const result = await window.uploadFileToStorage(noteModal, "avl");
      const saved = await window.createAvlDocumentInDb({
        name:  result.name,
        url:   result.url,
        path:  result.path,
        note:  noteText.trim(),
      });
      setDocs(prev => [saved, ...prev]);
    } catch (e) {
      alert("อัปโหลดไม่สำเร็จ: " + (e.message || e));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!confirm(`ลบไฟล์ "${doc.note || doc.name}" ออกจากระบบ?`)) return;
    try {
      await window.deleteFileFromStorage(doc.path);
      await window.deleteAvlDocumentInDb(doc.id);
      setDocs(prev => prev.filter(d => d.id !== doc.id));
    } catch (e) {
      alert("ลบไม่สำเร็จ: " + (e.message || e));
    }
  };

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow="Admin · Approved Vendor List"
        title="ทะเบียนรายชื่อผู้ค้า"
        desc="อัปโหลดเอกสารประกาศรายชื่อผู้ค้าที่ผ่านการคัดเลือก (PDF)"
        action={
          <>
            <input ref={fileRef} type="file" accept=".pdf"
              style={{ display: "none" }} onChange={handlePickFile} />
            <button className="btn btn-primary btn-sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}>
              {uploading
                ? <><span style={{ display: "inline-block", width: 13, height: 13, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> กำลังอัปโหลด...</>
                : <><Icon name="upload" size={14} /> อัปโหลด PDF</>
              }
            </button>
          </>
        }
      />

      {loading ? (
        <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--text-3)" }}>
          กำลังโหลด...
        </div>
      ) : docs.length === 0 ? (
        <div className="card" style={{ padding: "72px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📂</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>
            ยังไม่มีเอกสารทะเบียนผู้ค้า
          </div>
          <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 20 }}>
            กดปุ่ม "อัปโหลด PDF" เพื่อเพิ่มประกาศรายชื่อผู้ค้าที่ผ่านการคัดเลือก
          </div>
          <button className="btn btn-primary btn-sm"
            onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Icon name="upload" size={14} /> อัปโหลด PDF
          </button>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>ชื่อประกาศ</th>
                <th>ไฟล์</th>
                <th style={{ width: 160 }}>วันที่อัปโหลด</th>
                <th style={{ width: 110 }}></th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: 500 }}>
                    {doc.note || <span style={{ color: "var(--text-3)", fontStyle: "italic" }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>📄</span>
                      <span className="mono" style={{ fontSize: 12.5, color: "var(--text-2)" }}>
                        {doc.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: "var(--text-2)" }}>
                    {fmtDateTime(doc.uploadedAt)}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm btn-icon" title="เปิดดู">
                        <Icon name="eye" size={14} />
                      </a>
                      <button className="btn btn-ghost btn-sm btn-icon" title="ลบ"
                        style={{ color: "var(--danger)" }}
                        onClick={() => handleDelete(doc)}>
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Note modal — กรอกชื่อประกาศก่อนอัปโหลด */}
      {noteModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,.45)", backdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={() => setNoteModal(null)}>
          <div className="card" style={{ width: "100%", maxWidth: 480, padding: 28 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>อัปโหลดเอกสาร AVL</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setNoteModal(null)}>
                <Icon name="x" size={16} />
              </button>
            </div>

            {/* File info */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              background: "var(--surface-2)", borderRadius: 10, border: "1px solid var(--line)",
              marginBottom: 18 }}>
              <span style={{ fontSize: 22 }}>📄</span>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{noteModal.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                  {(noteModal.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>

            {/* Note input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)",
                display: "block", marginBottom: 6 }}>
                ชื่อประกาศ <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(ไม่บังคับ)</span>
              </label>
              <input className="input" value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="เช่น ประกาศรายชื่อผู้ค้าที่ผ่านการคัดเลือก ปี 2568"
                style={{ width: "100%" }}
                autoFocus
                onKeyDown={e => e.key === "Enter" && handleConfirmUpload()} />
              <div className="help" style={{ marginTop: 6 }}>
                ชื่อนี้จะแสดงให้ผู้ค้าเห็นในหน้าทะเบียนรายชื่อผู้ค้า
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setNoteModal(null)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleConfirmUpload}>
                <Icon name="upload" size={14} /> อัปโหลด
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const ROLE_OPTIONS = [
  { value: "Super Admin",        label: "Super Admin",        perms: ["approve","request-docs","manage-announcements","manage-groups","manage-users","manage-admins"] },
  { value: "Procurement Admin",  label: "Procurement Admin",  perms: ["approve","request-docs","manage-announcements","manage-groups","manage-users"] },
  { value: "Reviewer",           label: "Reviewer",           perms: ["approve","request-docs"] },
  { value: "Read Only",          label: "Read Only",          perms: [] },
];

const PERM_LABELS = {
  "approve":               "อนุมัติใบสมัคร",
  "request-docs":          "ขอเอกสารเพิ่ม",
  "manage-announcements":  "จัดการประกาศ",
  "manage-groups":         "จัดการกลุ่มงาน",
  "manage-users":          "จัดการผู้ใช้",
  "manage-admins":         "จัดการ Admin",
};

const BLANK_USER = { name: "", email: "", role: "Reviewer", active: true, password: "", confirmPassword: "" };

function AdminUsersPlaceholder() {
  const [users, setUsers] = React.useState([
    { id: 1, name: "Administrator", email: "admin@enco.co.th", role: "Super Admin", active: true, lastSeen: "วันนี้" },
  ]);
  const [editing, setEditing] = React.useState(null); // null | user obj
  const [isNew, setIsNew] = React.useState(false);
  const [form, setForm] = React.useState(BLANK_USER);
  const [formErr, setFormErr] = React.useState("");
  const [resetPwdUser, setResetPwdUser] = React.useState(null);
  const [resetPwdForm, setResetPwdForm] = React.useState({ password: "", confirm: "" });
  const [resetPwdErr, setResetPwdErr] = React.useState("");

  const openAdd = () => {
    setForm(BLANK_USER);
    setIsNew(true);
    setEditing({});
    setFormErr("");
  };
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, role: u.role, active: u.active });
    setIsNew(false);
    setEditing(u);
    setFormErr("");
  };
  const closeModal = () => { setEditing(null); setFormErr(""); };

  const saveUser = () => {
    if (!form.name.trim()) { setFormErr("กรุณากรอกชื่อ"); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormErr("อีเมลไม่ถูกต้อง"); return;
    }
    if (isNew && users.find(u => u.email === form.email.trim())) {
      setFormErr("อีเมลนี้มีในระบบแล้ว"); return;
    }
    if (isNew && (!form.password || form.password.length < 6)) {
      setFormErr("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return;
    }
    if (isNew && form.password !== form.confirmPassword) {
      setFormErr("รหัสผ่านไม่ตรงกัน"); return;
    }
    if (isNew) {
      setUsers([...users, { id: Date.now(), ...form, email: form.email.trim(), lastSeen: "ยังไม่เคยเข้า" }]);
    } else {
      setUsers(users.map(u => u.id === editing.id ? { ...u, ...form, email: form.email.trim() } : u));
    }
    closeModal();
  };

  const toggleActive = (id) => setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  const deleteUser = (id) => { if (confirm("ลบผู้ใช้นี้?")) setUsers(users.filter(u => u.id !== id)); };

  const rolePerms = ROLE_OPTIONS.find(r => r.value === form.role)?.perms || [];

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow="Admin · System Users"
        title="ผู้ใช้งานระบบ"
        desc="จัดการบัญชีเจ้าหน้าที่และสิทธิ์การเข้าถึง"
        action={<button className="btn btn-primary btn-sm" onClick={openAdd}><Icon name="plus" size={14} /> เพิ่มผู้ใช้</button>} />

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr><th>ชื่อ</th><th>อีเมล</th><th>บทบาท</th><th>เข้าใช้ล่าสุด</th><th>สถานะ</th><th></th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar name={u.name} size={32} />
                    <span style={{ fontWeight: 500, fontSize: 13.5, color: u.active ? "var(--text)" : "var(--text-3)" }}>{u.name}</span>
                  </div>
                </td>
                <td className="mono" style={{ fontSize: 12.5, color: "var(--text-2)" }}>{u.email}</td>
                <td>
                  <span className="pill" style={{ background: "var(--primary-soft)", color: "var(--primary-ink)" }}>{u.role}</span>
                </td>
                <td style={{ fontSize: 13, color: "var(--text-2)" }}>{u.lastSeen}</td>
                <td>
                  <span className="pill" style={{
                    background: u.active ? "var(--success-soft)" : "var(--line)",
                    color: u.active ? "oklch(38% 0.11 155)" : "var(--text-3)",
                  }}>
                    <span className="pill-dot" /> {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" title="แก้ไข" onClick={() => openEdit(u)}>
                      <Icon name="edit" size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm btn-icon" title="รีเซ็ตรหัสผ่าน"
                      onClick={() => { setResetPwdUser(u); setResetPwdForm({ password: "", confirm: "" }); setResetPwdErr(""); }}
                      style={{ fontSize: 13 }}>🔑</button>
                    <button className="btn btn-ghost btn-sm btn-icon" title={u.active ? "ระงับ" : "เปิดใช้"}
                      onClick={() => toggleActive(u.id)}
                      style={{ color: u.active ? "var(--warn)" : "var(--success)" }}>
                      <Icon name={u.active ? "x" : "check"} size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm btn-icon" title="ลบ"
                      onClick={() => deleteUser(u.id)} style={{ color: "var(--danger)" }}>
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Password reset modal */}
      {resetPwdUser !== null && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,.4)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setResetPwdUser(null)}>
          <div className="card" style={{ width: "100%", maxWidth: 420, padding: 28 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>รีเซ็ตรหัสผ่าน</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setResetPwdUser(null)}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <div style={{ padding: "10px 14px", background: "var(--primary-soft)", borderRadius: 8,
              fontSize: 13, color: "var(--primary-ink)", marginBottom: 18 }}>
              ตั้งรหัสผ่านใหม่สำหรับ <b>{resetPwdUser.name}</b>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)",
                  display: "block", marginBottom: 6 }}>
                  รหัสผ่านใหม่ <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input className="input" type="password" value={resetPwdForm.password}
                  onChange={e => setResetPwdForm({ ...resetPwdForm, password: e.target.value })}
                  placeholder="อย่างน้อย 6 ตัวอักษร" style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)",
                  display: "block", marginBottom: 6 }}>
                  ยืนยันรหัสผ่านใหม่ <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input className="input" type="password" value={resetPwdForm.confirm}
                  onChange={e => setResetPwdForm({ ...resetPwdForm, confirm: e.target.value })}
                  placeholder="กรอกรหัสผ่านอีกครั้ง" style={{ width: "100%" }} />
              </div>
              {resetPwdErr && (
                <div style={{ padding: "10px 14px", background: "var(--danger-soft)",
                  color: "oklch(42% 0.14 25)", borderRadius: 8, fontSize: 13 }}>
                  ✕ {resetPwdErr}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={() => setResetPwdUser(null)}>ยกเลิก</button>
                <button className="btn btn-primary" onClick={() => {
                  if (!resetPwdForm.password || resetPwdForm.password.length < 6) {
                    setResetPwdErr("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return;
                  }
                  if (resetPwdForm.password !== resetPwdForm.confirm) {
                    setResetPwdErr("รหัสผ่านไม่ตรงกัน"); return;
                  }
                  const name = resetPwdUser.name;
                  setResetPwdUser(null);
                  alert(`รีเซ็ตรหัสผ่านสำหรับ ${name} เรียบร้อยแล้ว`);
                }}>
                  <Icon name="check" size={14} /> บันทึกรหัสผ่าน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {editing !== null && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,.4)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={closeModal}>
          <div className="card" style={{ width: "100%", maxWidth: 500, padding: 28 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>
                {isNew ? "เพิ่มผู้ใช้ใหม่" : `แก้ไข — ${editing.name}`}
              </h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={closeModal}>
                <Icon name="x" size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                  ชื่อ-นามสกุล <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input className="input" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="ชื่อ นามสกุล" style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                  อีเมล <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input className="input" type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="email@enco.co.th" style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                  บทบาท (Role)
                </label>
                <select className="select" value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })} style={{ width: "100%" }}>
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              {/* Password fields — new user only */}
              {isNew && (
                <>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)",
                      display: "block", marginBottom: 6 }}>
                      รหัสผ่าน <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <input className="input" type="password" value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="อย่างน้อย 6 ตัวอักษร" style={{ width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)",
                      display: "block", marginBottom: 6 }}>
                      ยืนยันรหัสผ่าน <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <input className="input" type="password" value={form.confirmPassword}
                      onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="กรอกรหัสผ่านอีกครั้ง" style={{ width: "100%" }} />
                  </div>
                </>
              )}

              {/* Permissions preview */}
              <div style={{ padding: "12px 14px", background: "var(--surface-2)",
                borderRadius: 10, border: "1px solid var(--line)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)",
                  textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10,
                  fontFamily: "var(--font-en)" }}>สิทธิ์ที่ได้รับ</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.entries(PERM_LABELS).map(([key, label]) => {
                    const has = rolePerms.includes(key);
                    return (
                      <span key={key} className="pill" style={{
                        background: has ? "var(--success-soft)" : "var(--line)",
                        color: has ? "oklch(38% 0.11 155)" : "var(--text-3)",
                        fontSize: 12,
                      }}>
                        {has ? "✓" : "✕"} {label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {formErr && (
                <div style={{ padding: "10px 14px", background: "var(--danger-soft)",
                  color: "oklch(42% 0.14 25)", borderRadius: 8, fontSize: 13 }}>
                  ✕ {formErr}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={closeModal}>ยกเลิก</button>
                <button className="btn btn-primary" onClick={saveUser}>
                  {isNew ? "เพิ่มผู้ใช้" : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
