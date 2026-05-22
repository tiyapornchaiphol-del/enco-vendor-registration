// Main app shell: sidebar nav + page routing + Tweaks panel + topbar.

// Demo admin accounts
const ADMIN_ACCOUNTS = [
  { email: "apha@enco.co.th",    password: "admin123", name: "อาภา จันทร์",       role: "Procurement Admin", permissions: ["approve","request-docs","manage-announcements","manage-groups","manage-users"] },
  { email: "kitti@enco.co.th",   password: "review123", name: "กิตติ สุวรรณ",      role: "Reviewer",          permissions: ["approve","request-docs"] },
  { email: "napas@enco.co.th",   password: "review123", name: "นภัส สุขใจ",        role: "Reviewer",          permissions: ["approve","request-docs"] },
  { email: "manager@enco.co.th", password: "super123",  name: "ผู้จัดการ พิเชษฐ์", role: "Super Admin",       permissions: ["approve","request-docs","manage-announcements","manage-groups","manage-users","manage-admins"] },
];

function AdminLoginForm({ onLogin, onCancel }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState("");

  const login = () => {
    const account = ADMIN_ACCOUNTS.find(a => a.email === email.trim() && a.password === password);
    if (!account) { setErr("อีเมลหรือรหัสผ่านไม่ถูกต้อง"); return; }
    setErr("");
    onLogin(account);
  };

  return (
    <div className="card" style={{ padding: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)",
            display: "block", marginBottom: 6 }}>อีเมล</label>
          <input className="input" type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="your@enco.co.th"
            onKeyDown={e => e.key === "Enter" && login()} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)",
            display: "block", marginBottom: 6 }}>รหัสผ่าน</label>
          <input className="input" type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && login()} style={{ width: "100%" }} />
        </div>
        {err && (
          <div style={{ padding: "10px 14px", background: "var(--danger-soft)",
            color: "oklch(42% 0.14 25)", borderRadius: 8, fontSize: 13,
            display: "flex", gap: 8, alignItems: "center" }}>
            ✕ {err}
          </div>
        )}
        <button className="btn btn-primary" onClick={login} style={{ marginTop: 4 }}>
          เข้าสู่ระบบ
        </button>
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--surface-2)",
        borderRadius: 8, fontSize: 12, color: "var(--text-3)" }}>
        <b style={{ color: "var(--text-2)" }}>ทดสอบ:</b> apha@enco.co.th / admin123
      </div>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button onClick={onCancel}
          style={{ fontSize: 13, color: "var(--text-3)", background: "none",
            border: "none", cursor: "pointer", padding: 0 }}>
          ← กลับหน้า Vendor Portal
        </button>
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const [adminUser, setAdminUser] = React.useState(null);
  const [showAdminLogin, setShowAdminLogin] = React.useState(false);
  const isAdmin = adminUser !== null;
  const [page, setPage] = React.useState("landing");
  const [detailId, setDetailId] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Shared mutable data (admin can edit groups + announcements; vendor views read)
  const [groups, setGroups] = React.useState(VENDOR_CATEGORIES);

  // Fetch data from Supabase
  const { submissions, setSubmissions, announcements, setAnnouncements, loading, error } = useSupabaseData();

  const dataValue = { groups, setGroups, announcements, setAnnouncements,
    submissions, setSubmissions, loading, error };

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
    { id: "landing",      label: "ประกาศรับสมัคร",  icon: "megaphone" },
    { id: "avl-registry", label: "ทะเบียนรายชื่อผู้ค้า",   icon: "building" },
    { id: "track",        label: "ตรวจสอบสถานะ",        icon: "track" },
  ];
  const adminNav = [
    { id: "admin-dashboard",     label: "Dashboard",            icon: "dashboard" },
    { id: "admin-submissions",   label: "ใบสมัครคู่ค้า",          icon: "inbox" },
    { id: "admin-announcements", label: "ประกาศรับสมัคร",        icon: "megaphone" },
    { id: "admin-groups",        label: "กลุ่มงาน",                 icon: "sparkle" },
    { id: "admin-users",         label: "ผู้ใช้งานระบบ",          icon: "users" },
  ];
  const nav = isAdmin ? adminNav : vendorNav;

  return (
    <DataContext.Provider value={dataValue}>
    <div data-density={t.density} data-dark={t.dark ? "true" : "false"}>
      {showAdminLogin && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "var(--bg)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <Logo />
              <p style={{ margin: "14px 0 0", color: "var(--text-2)", fontSize: 14 }}>
                เข้าสู่ระบบสำหรับเจ้าหน้าที่ EnCo
              </p>
            </div>
            <AdminLoginForm onLogin={(account) => {
              if (account) setAdminUser(account);
              setShowAdminLogin(false);
            }} onCancel={() => setShowAdminLogin(false)} />
          </div>
        </div>
      )}
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
              (n.id === "admin-submissions" && page === "admin-detail");
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
                  onClick={() => { setAdminUser(null); }}>
                  <Icon name="logout" size={14} />
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)", padding: "0 4px", marginBottom: 10 }}>
                  <div style={{ marginBottom: 4 }}>EnCo Vendor Portal</div>
                  <div className="mono">v2.6.0 · © 2569</div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ width: "100%", fontSize: 12.5 }}
                  onClick={() => setShowAdminLogin(true)}>
                  <Icon name="logout" size={13} /> เข้าสู่ระบบเจ้าหน้าที่
                </button>
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
          {page === "track"               && <VendorTrack goto={goto} />}
          {page === "admin-dashboard"     && <AdminDashboard goto={goto} />}
          {page === "admin-submissions"   && <AdminSubmissions goto={goto} />}
          {page === "admin-detail"        && <AdminDetail goto={goto} id={detailId} />}
          {page === "admin-announcements" && <AdminAnnouncements goto={goto} />}
          {page === "admin-groups"        && <AdminGroups />}
          {page === "admin-users"         && <AdminUsersPlaceholder />}
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
            <TweakButton label="ตรวจสอบสถานะ" onClick={() => goto("track")} />
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
    "track":               ["Vendor", "ตรวจสอบสถานะ"],
    "admin-dashboard":     ["Admin", "Dashboard"],
    "admin-submissions":   ["Admin", "ใบสมัครคู่ค้า"],
    "admin-detail":        ["Admin", "ใบสมัครคู่ค้า", detailId || ""],
    "admin-announcements": ["Admin", "ประกาศรับสมัคร"],
    "admin-groups":        ["Admin", "กลุ่มงาน"],
    "admin-users":         ["Admin", "ผู้ใช้งานระบบ"],
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

const AdminVendorsPlaceholder = () => (
  <div className="fade-in">
    <SectionHeader
      eyebrow="Admin · Approved Vendors"
      title="ทะเบียนคู่ค้า"
      desc="รายชื่อคู่ค้าที่ขึ้นทะเบียนเรียบร้อยแล้ว" />
    <div className="card" style={{ overflow: "hidden" }}>
      <table className="tbl">
        <thead>
          <tr>
            <th>รหัส</th><th>บริษัท</th><th>ประเภท</th>
            <th>ขึ้นทะเบียน</th><th>เกรด</th><th>ใช้งานล่าสุด</th><th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {SUBMISSIONS.filter(s => s.status === "approved").map((v, i) => (
            <tr key={v.id}>
              <td className="mono" style={{ fontSize: 12.5 }}>{`V-${String(101 + i).padStart(4, "0")}`}</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={v.company} size={32} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }}>{v.company}</div>
                    <div className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>{v.taxId}</div>
                  </div>
                </div>
              </td>
              <td style={{ fontSize: 13, color: "var(--text-2)" }}>{v.category}</td>
              <td style={{ fontSize: 13, color: "var(--text-2)" }}>{v.submittedAt}</td>
              <td>
                <span className="pill" style={{ background: ["var(--success-soft)","var(--primary-soft)","var(--warn-soft)"][i % 3],
                  color: ["oklch(38% 0.11 155)", "var(--primary-ink)", "oklch(45% 0.12 70)"][i % 3] }}>
                  {["A", "A", "B"][i % 3]}
                </span>
              </td>
              <td style={{ fontSize: 13, color: "var(--text-2)" }}>
                {["3 วัน", "1 สัปดาห์", "2 สัปดาห์"][i % 3]}ที่แล้ว
              </td>
              <td>
                <span className="pill" style={{ background: "var(--success-soft)",
                  color: "oklch(38% 0.11 155)" }}>
                  <span className="pill-dot" /> Active
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

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
    { id: 1, name: "อาภา จันทร์",       email: "apha@enco.co.th",    role: "Procurement Admin", active: true,  lastSeen: "วันนี้ 09:24" },
    { id: 2, name: "กิตติ สุวรรณ",      email: "kitti@enco.co.th",   role: "Reviewer",          active: true,  lastSeen: "เมื่อวาน 16:08" },
    { id: 3, name: "นภัส สุขใจ",        email: "napas@enco.co.th",   role: "Reviewer",          active: true,  lastSeen: "2 วันที่แล้ว" },
    { id: 4, name: "ผู้จัดการ พิเชษฐ์", email: "manager@enco.co.th", role: "Super Admin",       active: true,  lastSeen: "วันนี้ 11:42" },
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

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
