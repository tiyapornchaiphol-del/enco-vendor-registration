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

// ── Temp password generator (cryptographically random, meets all policy rules) ─
function generateTempPassword() {
  const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const nums  = '23456789';
  const spec  = '!@#$%';
  const all   = upper + lower + nums + spec;
  const arr   = new Uint8Array(16);
  crypto.getRandomValues(arr);
  // Guarantee at least one of each required character class
  const pwd = [
    upper[arr[0] % upper.length],
    lower[arr[1] % lower.length],
    nums [arr[2] % nums.length],
    spec [arr[3] % spec.length],
  ];
  for (let i = 4; i < 12; i++) pwd.push(all[arr[i] % all.length]);
  // Fisher-Yates shuffle with the remaining random bytes
  for (let i = pwd.length - 1; i > 0; i--) {
    const j = arr[(i + 4) % arr.length] % (i + 1);
    [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
  }
  return pwd.join('');
}

// ── หน้าเปลี่ยนรหัสผ่านครั้งแรก (บังคับแสดงสำหรับ must_change_password = true) ─
function ChangePasswordScreen({ adminUser, onDone }) {
  const [pwd, setPwd]         = React.useState("");
  const [pwd2, setPwd2]       = React.useState("");
  const [err, setErr]         = React.useState("");
  const [saving, setSaving]   = React.useState(false);
  const [showPwd, setShowPwd] = React.useState(false);
  const v = validatePassword(pwd);

  const handleSave = async () => {
    if (!v.ok) {
      setErr("รหัสผ่านต้องมี 8+ ตัว ตัวพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ");
      return;
    }
    if (pwd !== pwd2) { setErr("รหัสผ่านไม่ตรงกัน"); return; }
    setSaving(true); setErr("");
    try {
      const { error } = await window.supabase.auth.updateUser({ password: pwd });
      if (error) throw error;
      // ใช้ SECURITY DEFINER function เพื่อ bypass RLS
      const { error: rpcErr } = await window.supabase.rpc('clear_must_change_password');
      if (rpcErr) throw new Error('ไม่สามารถอัปเดตสถานะรหัสผ่านได้ — กรุณารัน SQL function clear_must_change_password ใน Supabase ก่อน');
      await window.logAuditEvent?.('admin.first_login_password_changed', { email: adminUser.email });
      onDone();
    } catch (e) {
      setErr(e?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally { setSaving(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>
      <div className="card fade-in" style={{ width:"100%", maxWidth:420, padding:"40px 36px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:44, marginBottom:12 }}>🔐</div>
          <div style={{ fontSize:18, fontWeight:700, marginBottom:10 }}>ตั้งรหัสผ่านใหม่</div>
          <div style={{ fontSize:13.5, color:"var(--text-2)", lineHeight:1.7,
            padding:"8px 12px", background:"var(--primary-soft)", borderRadius:8,
            border:"1px solid var(--primary-border)" }}>
            สวัสดีคุณ <b>{adminUser.name}</b><br/>
            กรุณาตั้งรหัสผ่านส่วนตัวก่อนเริ่มใช้งานระบบ
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* New password */}
          <div>
            <label style={{ fontSize:12.5, fontWeight:500, color:"var(--text-2)",
              display:"block", marginBottom:6 }}>
              รหัสผ่านใหม่ <span style={{ color:"var(--danger)" }}>*</span>
            </label>
            <div style={{ position:"relative" }}>
              <input className="input" type={showPwd ? "text" : "password"} value={pwd}
                onChange={e => { setPwd(e.target.value); setErr(""); }}
                placeholder="••••••••" style={{ width:"100%", paddingRight:40 }} autoFocus />
              <button type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1}
                style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer",
                  color:"var(--text-3)", padding:4, display:"flex", alignItems:"center" }}>
                <Icon name="eye" size={15} />
              </button>
            </div>
            <PasswordStrengthBar password={pwd} />
          </div>

          {/* Confirm password */}
          <div>
            <label style={{ fontSize:12.5, fontWeight:500, color:"var(--text-2)",
              display:"block", marginBottom:6 }}>
              ยืนยันรหัสผ่านใหม่ <span style={{ color:"var(--danger)" }}>*</span>
            </label>
            <input className="input" type={showPwd ? "text" : "password"} value={pwd2}
              onChange={e => { setPwd2(e.target.value); setErr(""); }}
              placeholder="••••••••" style={{ width:"100%" }}
              onKeyDown={e => e.key === "Enter" && !saving && handleSave()} />
            {pwd2 && pwd && (
              <div style={{ fontSize:12, marginTop:5,
                color: pwd === pwd2 ? "var(--success)" : "var(--danger)" }}>
                {pwd === pwd2 ? "✓ รหัสผ่านตรงกัน" : "✕ รหัสผ่านไม่ตรงกัน"}
              </div>
            )}
          </div>

          {/* Error */}
          {err && (
            <div style={{ padding:"10px 14px", background:"var(--danger-soft)",
              color:"oklch(42% 0.14 25)", borderRadius:8, fontSize:13,
              display:"flex", gap:8, alignItems:"center" }}>
              <Icon name="x" size={13} stroke={2.4} /> {err}
            </div>
          )}

          <button className="btn btn-primary" onClick={handleSave}
            disabled={saving || !v.ok || !pwd2 || pwd !== pwd2}
            style={{ marginTop:4, height:44, fontSize:14.5 }}>
            {saving
              ? <><span style={{ display:"inline-block", width:16, height:16,
                  border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff",
                  borderRadius:"50%", animation:"spin .7s linear infinite" }} /> กำลังบันทึก...</>
              : "ตั้งรหัสผ่านและเข้าสู่ระบบ"
            }
          </button>

          <button type="button" onClick={async () => {
            await window.supabase.auth.signOut();
            window.location.href = window.location.pathname + "#admin";
            window.location.reload();
          }} style={{ background:"none", border:"none", cursor:"pointer",
            fontSize:12.5, color:"var(--text-3)", marginTop:4,
            textDecoration:"underline", padding:0 }}>
            ออกจากระบบ
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
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
        role: admin.role, permissions: admin.permissions || [],
        must_change_password: !!admin.must_change_password });
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

  // adminUser: null จนกว่า Supabase session จะถูก verify (async)
  // ทำงานเฉพาะ URL ที่มี #admin เท่านั้น — vendor tab ไม่มีทางเห็น admin
  const [adminUser, setAdminUser] = React.useState(null);
  const [authChecked, setAuthChecked] = React.useState(!adminRoute);
  const isAdmin = adminUser !== null;

  // Restore last page — vendor ขึ้นหน้าหลักเสมอ, admin restore ได้เฉพาะ tab #admin
  const [page, setPage] = React.useState(() => {
    if (window.location.hash !== "#admin") return "landing";
    const savedPage = localStorage.getItem("enco_page") || "admin-dashboard";
    if (savedPage === "track" || !savedPage.startsWith("admin")) return "admin-dashboard";
    return savedPage;
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

  // ── ตรวจสอบ Supabase session ตอนโหลดหน้า (#admin เท่านั้น) ─────────────────
  React.useEffect(() => {
    if (!adminRoute) return;
    window.checkAdminSession?.().then(user => {
      if (user) setAdminUser({ ...user, loginAt: Date.now() });
      setAuthChecked(true);
    });
  }, []);

  // ── ฟัง auth state change จาก Supabase (token หมดอายุ, sign out ฯลฯ) ────────
  React.useEffect(() => {
    if (!adminRoute) return;
    const { data: { subscription } } = window.supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        if (event === "SIGNED_OUT") {
          setAdminUser(null);
          localStorage.removeItem("enco_page");
        }
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

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

  // ── กำลังตรวจสอบ Supabase session (แสดงแค่ครู่เดียวตอนโหลด) ──────────────
  if (adminRoute && !authChecked) {
    return (
      <div data-density={t.density} data-dark={t.dark ? "true" : "false"}
        style={{ display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", background: "var(--bg)", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 32, height: 32, border: "3px solid var(--line)",
          borderTopColor: "var(--primary)", borderRadius: "50%",
          animation: "spin .8s linear infinite" }} />
        <div style={{ fontSize: 13, color: "var(--text-3)" }}>กำลังตรวจสอบสิทธิ์...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Standalone admin login page ───────────────────────────────────────────
  // Shown ONLY when URL hash is #admin and no session exists.
  // Vendor users who never visit #admin will never see this.
  if (adminRoute && !isAdmin) {
    return (
      <DataContext.Provider value={dataValue}>
        <div data-density={t.density} data-dark={t.dark ? "true" : "false"}>
          <AdminLoginPage onLogin={(account) => {
            setAdminUser({ ...account, loginAt: Date.now() });
            setAuthChecked(true);
            setPage("admin-dashboard");
          }} />
        </div>
      </DataContext.Provider>
    );
  }

  // ── บังคับเปลี่ยนรหัสผ่านก่อนเข้าใช้งาน (ผู้ใช้ใหม่ที่ admin สร้างให้) ────────
  if (adminRoute && isAdmin && adminUser?.must_change_password) {
    return (
      <DataContext.Provider value={dataValue}>
        <div data-density={t.density} data-dark={t.dark ? "true" : "false"}>
          <ChangePasswordScreen adminUser={adminUser} onDone={() => {
            setAdminUser(prev => ({ ...prev, must_change_password: false }));
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
                  onClick={async () => {
                    await window.logAuditEvent?.('admin.logout', { email: adminUser?.email });
                    await window.signOutAdmin?.();
                    setAdminUser(null);
                    localStorage.removeItem("enco_page");
                    window.location.href = window.location.pathname + "#admin";
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
          {page === "admin-users"         && <AdminUsers />}
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
  const [dlId, setDlId] = React.useState(null); // id ที่กำลังโหลดอยู่

  const fmtDate = (str) => {
    if (!str) return "—";
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
  };

  // Force-download ผ่าน fetch → blob เพื่อตั้งชื่อไฟล์เองและบังคับโหลด (ไม่เปิดแท็บ)
  const handleDownload = async (doc) => {
    if (dlId) return;
    setDlId(doc.id);
    try {
      const res = await fetch(doc.url);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = doc.name; // ชื่อไฟล์ต้นฉบับ
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (_) {
      window.open(doc.url, "_blank"); // fallback เปิดแท็บถ้า fetch ล้มเหลว
    } finally {
      setDlId(null);
    }
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
                  className="btn btn-ghost btn-sm" title={doc.name}>
                  <Icon name="eye" size={14} /> เปิดดู
                </a>
                <button className="btn btn-soft btn-sm"
                  onClick={() => handleDownload(doc)}
                  disabled={!!dlId}
                  title={`ดาวน์โหลด ${doc.name}`}>
                  {dlId === doc.id
                    ? <><span style={{ display: "inline-block", width: 13, height: 13,
                        border: "2px solid var(--primary-ink)", borderTopColor: "transparent",
                        borderRadius: "50%", animation: "spin .7s linear infinite" }} /> กำลังโหลด...</>
                    : <><Icon name="download" size={14} /> ดาวน์โหลด</>
                  }
                </button>
              </div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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

// ─── Password strength validator ──────────────────────────────────────────────
function validatePassword(pwd) {
  const checks = {
    length:  pwd.length >= 8,
    upper:   /[A-Z]/.test(pwd),
    lower:   /[a-z]/.test(pwd),
    number:  /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  return { checks, passed, total: 5, ok: passed === 5 };
}

function PasswordStrengthBar({ password }) {
  const v = validatePassword(password || "");
  if (!password) return null;
  const colors = ["var(--danger)","var(--danger)","var(--warn)","oklch(65% 0.14 90)","var(--success)"];
  const labels  = ["อ่อนมาก","อ่อน","พอใช้","ดี","แข็งแรง"];
  const color = colors[Math.min(v.passed - 1, 4)] || "var(--line)";
  const label = v.passed === 0 ? "" : labels[Math.min(v.passed - 1, 4)];
  const checkLabels = { length:"8+ ตัว", upper:"A-Z", lower:"a-z", number:"0-9", special:"!@#$" };
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 4, background: "var(--line)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height:"100%", width:`${(v.passed/v.total)*100}%`, background: color, borderRadius:4, transition:"all .3s" }} />
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"5px 14px", marginTop:7 }}>
        {Object.entries(v.checks).map(([k, ok]) => (
          <span key={k} style={{ fontSize:11.5, color: ok ? "var(--success)" : "var(--text-3)", display:"flex", alignItems:"center", gap:3 }}>
            <b>{ok ? "✓" : "○"}</b> {checkLabels[k]}
          </span>
        ))}
        {label && <span style={{ fontSize:11.5, fontWeight:600, color, marginLeft:"auto" }}>{label}</span>}
      </div>
    </div>
  );
}

// ─── Admin Users (connected to Supabase) ──────────────────────────────────────
function AdminUsers() {
  const [users, setUsers]             = React.useState([]);
  const [loading, setLoading]         = React.useState(true);
  const [editing, setEditing]         = React.useState(null);
  const [form, setForm]               = React.useState({});
  const [saving, setSaving]           = React.useState(false);
  const [formErr, setFormErr]         = React.useState("");
  const [togglingId, setTogglingId]   = React.useState(null);
  const [resettingId, setResettingId] = React.useState(null);
  const [toast, showToast]            = useToast();
  // ── Add user modal ─────────────────────────────────────────────────────────
  const [addModal, setAddModal]           = React.useState(false);
  const [addForm, setAddForm]             = React.useState({});
  const [addSaving, setAddSaving]         = React.useState(false);
  const [addErr, setAddErr]               = React.useState("");
  const [createdResult, setCreatedResult] = React.useState(null);
  const [showTempPwd, setShowTempPwd]     = React.useState(false);
  const [pwdCopied, setPwdCopied]         = React.useState(false);

  const loadUsers = () => {
    setLoading(true);
    window.getAllAdmins?.().then(d => { setUsers(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  React.useEffect(loadUsers, []);

  const openEdit  = (u) => { setForm({ name: u.name, role: u.role }); setEditing(u); setFormErr(""); };
  const closeModal = () => { setEditing(null); setFormErr(""); };

  const saveUser = async () => {
    if (!form.name?.trim()) { setFormErr("กรุณากรอกชื่อ-นามสกุล"); return; }
    setSaving(true);
    try {
      await window.updateAdmin(editing.id, { name: form.name.trim(), role: form.role });
      setUsers(users.map(u => u.id === editing.id ? { ...u, name: form.name.trim(), role: form.role } : u));
      showToast("บันทึกสำเร็จ");
      closeModal();
    } catch (err) {
      setFormErr(err?.message || "เกิดข้อผิดพลาด");
    } finally { setSaving(false); }
  };

  const toggleActive = async (u) => {
    setTogglingId(u.id);
    const next = !u.is_active;
    await window.updateAdmin(u.id, { is_active: next });
    setUsers(users.map(x => x.id === u.id ? { ...x, is_active: next } : x));
    window.logAuditEvent?.(next ? 'admin_user.activate' : 'admin_user.deactivate', { target_id: u.id, name: u.name });
    showToast(next ? "เปิดใช้งานแล้ว" : "ระงับผู้ใช้แล้ว");
    setTogglingId(null);
  };

  const sendResetEmail = async (u) => {
    if (!u.email) { showToast("ผู้ใช้นี้ไม่มีอีเมลในระบบ", "error"); return; }
    setResettingId(u.id);
    try {
      const { error } = await window.supabase.auth.resetPasswordForEmail(u.email, {
        redirectTo: window.location.origin + window.location.pathname + "#admin",
      });
      if (error) throw error;
      showToast(`ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ ${u.email} แล้ว`);
    } catch (err) {
      showToast("ส่งอีเมลไม่สำเร็จ: " + (err?.message || ""), "error");
    }
    setResettingId(null);
  };

  // ── Add user helpers ────────────────────────────────────────────────────────
  const openAddModal = () => {
    setAddForm({ email: "", name: "", role: "Reviewer", password: generateTempPassword() });
    setAddModal(true);
    setAddErr("");
    setShowTempPwd(false);
    setPwdCopied(false);
  };

  const regenPassword = () => setAddForm(f => ({ ...f, password: generateTempPassword() }));

  const copyTempPwd = () => {
    navigator.clipboard?.writeText(addForm.password || "").then(() => {
      setPwdCopied(true);
      setTimeout(() => setPwdCopied(false), 2000);
    }).catch(() => {});
  };

  const createUser = async () => {
    const { email, name, role, password } = addForm;
    if (!email?.trim()) { setAddErr("กรุณากรอกอีเมล"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setAddErr("รูปแบบอีเมลไม่ถูกต้อง"); return;
    }
    if (!name?.trim()) { setAddErr("กรุณากรอกชื่อ-นามสกุล"); return; }
    setAddSaving(true); setAddErr("");
    try {
      await window.createAdminUserViaEdge(email, name, role, password);
      setAddModal(false);
      setCreatedResult({ email: email.trim(), name: name.trim(), role, password });
      await window.logAuditEvent?.('admin_user.created', { email: email.trim(), name: name.trim(), role });
      loadUsers();
    } catch (err) {
      setAddErr(err?.message || "เกิดข้อผิดพลาดในการสร้างผู้ใช้");
    } finally { setAddSaving(false); }
  };

  const rolePerms = ROLE_OPTIONS.find(r => r.value === form.role)?.perms || [];

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow="Admin · System Users"
        title="ผู้ใช้งานระบบ"
        desc="จัดการบัญชีเจ้าหน้าที่และสิทธิ์การเข้าถึง"
        action={
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost btn-sm" onClick={loadUsers} title="รีเฟรชรายชื่อ">
              <Icon name="refresh" size={14} /> รีเฟรช
            </button>
            <button className="btn btn-primary btn-sm" onClick={openAddModal}>
              <Icon name="plus" size={14} /> เพิ่มผู้ใช้
            </button>
          </div>
        } />


      <div className="card" style={{ overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:40, textAlign:"center", color:"var(--text-3)" }}>กำลังโหลด...</div>
        ) : users.length === 0 ? (
          <div style={{ padding:48, textAlign:"center", color:"var(--text-3)" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>👤</div>
            <div style={{ fontWeight:500, marginBottom:6 }}>ยังไม่มีผู้ใช้งาน</div>
            <div style={{ fontSize:12 }}>กด "เพิ่มผู้ใช้" สร้างบัญชีใน Supabase แล้วกด รีเฟรช</div>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>ชื่อ / อีเมล</th><th>บทบาท</th><th>สถานะ</th><th>วันที่เพิ่ม</th><th></th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <Avatar name={u.name} size={32} />
                      <div>
                        <div style={{ fontWeight:500, fontSize:13.5, color: u.is_active ? "var(--text)" : "var(--text-3)" }}>{u.name}</div>
                        {u.email && <div className="mono" style={{ fontSize:11.5, color:"var(--text-3)" }}>{u.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td><span className="pill" style={{ background:"var(--primary-soft)", color:"var(--primary-ink)" }}>{u.role}</span></td>
                  <td>
                    <span className="pill" style={{ background: u.is_active ? "var(--success-soft)" : "var(--line)", color: u.is_active ? "oklch(38% 0.11 155)" : "var(--text-3)" }}>
                      <span className="pill-dot" /> {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ fontSize:12.5, color:"var(--text-2)" }}>{fmtDate(u.created_at)}</td>
                  <td>
                    <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
                      <button className="btn btn-ghost btn-sm btn-icon" title="แก้ไขชื่อ / บทบาท" onClick={() => openEdit(u)}>
                        <Icon name="edit" size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm btn-icon" title="ส่งลิงก์รีเซ็ตรหัสผ่านทางอีเมล"
                        disabled={resettingId === u.id} style={{ opacity: u.email ? 1 : 0.35 }}
                        onClick={() => sendResetEmail(u)}>
                        {resettingId === u.id ? "⏳" : "🔑"}
                      </button>
                      <button className="btn btn-ghost btn-sm btn-icon"
                        title={u.is_active ? "ระงับการใช้งาน" : "เปิดใช้งาน"}
                        disabled={togglingId === u.id}
                        onClick={() => toggleActive(u)}
                        style={{ color: u.is_active ? "var(--warn)" : "var(--success)" }}>
                        <Icon name={u.is_active ? "x" : "check"} size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Toast toast={toast} />

      {/* Edit modal */}
      {editing !== null && (
        <div style={{ position:"fixed", inset:0, zIndex:999,
          background:"rgba(0,0,0,.4)", backdropFilter:"blur(2px)",
          display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
          onClick={closeModal}>
          <div className="card" style={{ width:"100%", maxWidth:480, padding:28 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
              <h3 style={{ margin:0, fontSize:17, fontWeight:600 }}>แก้ไข — {editing.name}</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={closeModal}><Icon name="x" size={16} /></button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label className="label" style={{ marginBottom:6 }}>ชื่อ-นามสกุล <span className="req">*</span></label>
                <input className="input" value={form.name || ""}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="ชื่อ นามสกุล" style={{ width:"100%" }} />
              </div>

              <div>
                <label className="label" style={{ marginBottom:6 }}>บทบาท (Role)</label>
                <select className="select" value={form.role || "Reviewer"}
                  onChange={e => setForm({ ...form, role: e.target.value })} style={{ width:"100%" }}>
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              {/* Permissions preview */}
              <div style={{ padding:"12px 14px", background:"var(--surface-2)", borderRadius:10, border:"1px solid var(--line)" }}>
                <div style={{ fontSize:12, fontWeight:600, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:10, fontFamily:"var(--font-en)" }}>สิทธิ์ที่ได้รับ</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {Object.entries(PERM_LABELS).map(([key, label]) => {
                    const has = rolePerms.includes(key);
                    return (
                      <span key={key} className="pill" style={{ background: has ? "var(--success-soft)" : "var(--line)", color: has ? "oklch(38% 0.11 155)" : "var(--text-3)", fontSize:12 }}>
                        {has ? "✓" : "✕"} {label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {formErr && (
                <div style={{ padding:"10px 14px", background:"var(--danger-soft)", color:"oklch(42% 0.14 25)", borderRadius:8, fontSize:13 }}>
                  ✕ {formErr}
                </div>
              )}

              <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
                <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>ยกเลิก</button>
                <button className="btn btn-primary" onClick={saveUser} disabled={saving}>
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add User Modal ── */}
      {addModal && (
        <div style={{ position:"fixed", inset:0, zIndex:999,
          background:"rgba(0,0,0,.4)", backdropFilter:"blur(2px)",
          display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
          onClick={() => !addSaving && setAddModal(false)}>
          <div className="card" style={{ width:"100%", maxWidth:520, padding:28 }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
              <h3 style={{ margin:0, fontSize:17, fontWeight:600 }}>เพิ่มผู้ใช้งานใหม่</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setAddModal(false)} disabled={addSaving}>
                <Icon name="x" size={16} />
              </button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {/* Email */}
              <div>
                <label className="label" style={{ marginBottom:6 }}>อีเมล <span className="req">*</span></label>
                <input className="input" type="email" value={addForm.email || ""}
                  onChange={e => { setAddForm({ ...addForm, email: e.target.value }); setAddErr(""); }}
                  placeholder="user@company.com" style={{ width:"100%" }} autoFocus disabled={addSaving} />
              </div>

              {/* Name */}
              <div>
                <label className="label" style={{ marginBottom:6 }}>ชื่อ-นามสกุล <span className="req">*</span></label>
                <input className="input" value={addForm.name || ""}
                  onChange={e => { setAddForm({ ...addForm, name: e.target.value }); setAddErr(""); }}
                  placeholder="ชื่อ นามสกุล" style={{ width:"100%" }} disabled={addSaving} />
              </div>

              {/* Role */}
              <div>
                <label className="label" style={{ marginBottom:6 }}>บทบาท (Role)</label>
                <select className="select" value={addForm.role || "Reviewer"}
                  onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                  style={{ width:"100%" }} disabled={addSaving}>
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              {/* Temp password */}
              <div>
                <label className="label" style={{ marginBottom:6 }}>รหัสผ่านชั่วคราว</label>
                <div style={{ display:"flex", gap:6 }}>
                  <div style={{ position:"relative", flex:1 }}>
                    <input className="input"
                      type={showTempPwd ? "text" : "password"}
                      value={addForm.password || ""}
                      readOnly
                      style={{ width:"100%", paddingRight:40,
                        fontFamily:"var(--font-mono)", letterSpacing:".04em" }} />
                    <button type="button" onClick={() => setShowTempPwd(v => !v)} tabIndex={-1}
                      style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                        background:"none", border:"none", cursor:"pointer",
                        color:"var(--text-3)", padding:4, display:"flex", alignItems:"center" }}>
                      <Icon name="eye" size={15} />
                    </button>
                  </div>
                  <button className="btn btn-ghost btn-sm" title="สร้างรหัสผ่านใหม่"
                    onClick={regenPassword} disabled={addSaving}>
                    🔄
                  </button>
                  <button className="btn btn-ghost btn-sm" title="คัดลอก"
                    onClick={copyTempPwd} disabled={addSaving}
                    style={{ minWidth:90 }}>
                    {pwdCopied ? "✓ คัดลอกแล้ว" : "📋 คัดลอก"}
                  </button>
                </div>
                <div className="help" style={{ marginTop:5 }}>
                  ผู้ใช้จะถูกบังคับเปลี่ยนรหัสผ่านในครั้งแรกที่เข้าสู่ระบบ
                </div>
              </div>

              {/* Error */}
              {addErr && (
                <div style={{ padding:"10px 14px", background:"var(--danger-soft)",
                  color:"oklch(42% 0.14 25)", borderRadius:8, fontSize:13,
                  display:"flex", gap:8, alignItems:"center" }}>
                  <Icon name="x" size={13} stroke={2.4} /> {addErr}
                </div>
              )}

              <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
                <button className="btn btn-ghost" onClick={() => setAddModal(false)} disabled={addSaving}>ยกเลิก</button>
                <button className="btn btn-primary" onClick={createUser} disabled={addSaving}>
                  {addSaving
                    ? <><span style={{ display:"inline-block", width:14, height:14,
                        border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff",
                        borderRadius:"50%", animation:"spin .7s linear infinite" }} /> กำลังสร้าง...</>
                    : <><Icon name="plus" size={14} /> สร้างผู้ใช้</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Created Result Modal — แสดงรหัสผ่านชั่วคราวหลังสร้างสำเร็จ ── */}
      {createdResult && (
        <div style={{ position:"fixed", inset:0, zIndex:1000,
          background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)",
          display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div className="card" style={{ width:"100%", maxWidth:480, padding:32 }}>

            {/* Header */}
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontSize:44, marginBottom:12 }}>✅</div>
              <h3 style={{ margin:0, fontSize:18, fontWeight:700, marginBottom:8 }}>สร้างผู้ใช้สำเร็จ!</h3>
              <div style={{ fontSize:13.5, color:"var(--text-2)", lineHeight:1.65 }}>
                บัญชีสำหรับ <b>{createdResult.name}</b> ({createdResult.role}) ถูกสร้างแล้ว<br/>
                กรุณาแจ้ง username + รหัสผ่านด้านล่างให้ผู้ใช้
              </div>
            </div>

            {/* Credentials box */}
            <div style={{ background:"var(--surface-2)", border:"1px solid var(--line)",
              borderRadius:12, padding:"18px 20px", marginBottom:20 }}>

              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text-3)",
                  textTransform:"uppercase", letterSpacing:".07em", marginBottom:6, fontFamily:"var(--font-en)" }}>
                  Username (Email)
                </div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:13.5,
                  color:"var(--text)", wordBreak:"break-all" }}>
                  {createdResult.email}
                </div>
              </div>

              <div>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text-3)",
                  textTransform:"uppercase", letterSpacing:".07em", marginBottom:6, fontFamily:"var(--font-en)" }}>
                  รหัสผ่านชั่วคราว
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:18, fontWeight:700,
                    color:"var(--primary-ink)", letterSpacing:".12em", flex:1 }}>
                    {createdResult.password}
                  </div>
                  <button className="btn btn-ghost btn-sm"
                    onClick={() => navigator.clipboard?.writeText(createdResult.password)
                      .then(() => { /* copied silently */ }).catch(() => {})}>
                    📋
                  </button>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div style={{ padding:"10px 14px", background:"var(--warn-soft)",
              borderRadius:8, fontSize:12.5, color:"oklch(45% 0.12 70)",
              marginBottom:20, lineHeight:1.65 }}>
              ⚠️ <b>จดหรือคัดลอกรหัสผ่านนี้ก่อนปิดหน้าต่าง</b> — ระบบไม่สามารถแสดงซ้ำได้<br/>
              ผู้ใช้จะถูกบังคับเปลี่ยนรหัสผ่านในครั้งแรกที่เข้าสู่ระบบ
            </div>

            <button className="btn btn-primary" style={{ width:"100%" }}
              onClick={() => setCreatedResult(null)}>
              รับทราบและปิด
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
