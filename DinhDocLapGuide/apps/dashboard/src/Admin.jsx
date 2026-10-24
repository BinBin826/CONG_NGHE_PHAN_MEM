import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { LANGUAGES, stops as seedStops, localized } from "@palaceguide/shared";
import { fromDatabasePlace, toDatabasePlace } from "@palaceguide/shared/remotePlaces.js";
import { imageFor } from "./images.js";
import { supabase, isSupabaseConfigured } from "./lib/supabase.js";
import "./admin.css";

const blankLocalized = () => Object.fromEntries(LANGUAGES.map((l) => [l.code, ""]));
const emptyStop = () => ({ id: `place-${Date.now()}`, icon: "📍", category: "palace", order: 999, floor: blankLocalized(), title: blankLocalized(), summary: blankLocalized(), text: blankLocalized(), image_url: null, latitude: null, longitude: null });
const clone = (v) => JSON.parse(JSON.stringify(v));

function AdminApp() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [language, setLanguage] = useState("vi");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [analyticsRows, setAnalyticsRows] = useState([]);
  const [analyticsStatus, setAnalyticsStatus] = useState("loading");
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);
  const [adminPage, setAdminPage] = useState(() => window.location.hash.replace(/^#/, "") || "overview");
  const [settings, setSettings] = useState(() => {
    try { return { siteName: "Dinh Độc Lập Guide", defaultLanguage: "vi", showAnalytics: true, confirmDelete: true, ...JSON.parse(localStorage.getItem("palaceguide-admin-settings") || "{}") }; }
    catch { return { siteName: "Dinh Độc Lập Guide", defaultLanguage: "vi", showAnalytics: true, confirmDelete: true }; }
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [accountError, setAccountError] = useState("");
  const selected = items.find((x) => x.id === selectedId) || null;
  const filtered = useMemo(() => items.filter((x) => (category === "all" || x.category === category) && `${localized(x, "title", "vi")} ${x.id}`.toLowerCase().includes(search.toLowerCase())), [items, category, search]);

  const loadPlaces = async () => {
    if (!supabase) return;
    const { data, error: dbError } = await supabase.from("places").select("*").order("sort_order", { ascending: true });
    if (dbError) throw dbError;
    const rows = (data || []).map(fromDatabasePlace);
    setItems(rows.length ? rows : seedStops.map((x) => ({ ...clone(x), image_url: null })));
    if (rows.length === 0) setNotice("Database chưa có địa điểm. Hãy chạy supabase/seed.sql theo README.");
  };

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return undefined; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setAuthReady(true); });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || !supabase) return undefined;
    let alive = true;
    const loadAnalytics = async () => {
      setAnalyticsStatus("loading");
      const { data, error: analyticsError } = await supabase
        .from("analytics_events").select("event_type, place_id, language, created_at")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false }).limit(5000);
      if (!alive) return;
      if (analyticsError) {
        setAnalyticsRows([]);
        setAnalyticsStatus(analyticsError.code === "42P01" || /analytics_events/i.test(analyticsError.message)
          ? "missing" : "error");
        return;
      }
      setAnalyticsRows(data || []);
      setAnalyticsStatus("ready");
    };
    loadAnalytics();
    return () => { alive = false; };
  }, [session, analyticsRefreshKey]);

  const analyticsSummary = useMemo(() => {
    const audio = analyticsRows.filter((e) => e.event_type === "audio_play");
    const qr = analyticsRows.filter((e) => e.event_type === "qr_scan");
    const languages = audio.reduce((m, e) => { const k = e.language || "vi"; m[k] = (m[k] || 0) + 1; return m; }, {});
    const places = audio.reduce((m, e) => { if (e.place_id) m[e.place_id] = (m[e.place_id] || 0) + 1; return m; }, {});
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - (6 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return { key, label: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
        count: audio.filter((e) => { if (!e.created_at) return false; const t = new Date(e.created_at); const eventKey = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`; return eventKey === key; }).length };
    });
    const langNames = { vi: "Tiếng Việt", en: "Tiếng Anh", zh: "Tiếng Trung", ja: "Tiếng Nhật", ko: "Tiếng Hàn", fr: "Tiếng Pháp" };
    const popularLanguage = Object.entries(languages).sort((a,b) => b[1]-a[1])[0];
    const topPlace = Object.entries(places).sort((a,b) => b[1]-a[1])[0];
    return { audio: audio.length, qr: qr.length,
      popularLanguage: popularLanguage ? `${langNames[popularLanguage[0]] || popularLanguage[0]} (${popularLanguage[1]})` : "Chưa có dữ liệu",
      topPlace: topPlace ? `${localized(items.find((x) => x.id === topPlace[0]) || { title: {} }, "title", "vi") || topPlace[0]} (${topPlace[1]})` : "Chưa có dữ liệu", days };
  }, [analyticsRows, items]);

  useEffect(() => {
    if (!session || !supabase) return undefined;
    let alive = true;
    const refresh = async () => {
      try {
        const { data, error: dbError } = await supabase.from("places").select("*").order("sort_order", { ascending: true });
        if (!alive) return;
        if (dbError) throw dbError;
        const rows = (data || []).map(fromDatabasePlace);
        setItems(rows.length ? rows : seedStops.map((x) => ({ ...clone(x), image_url: null })));
      } catch (e) { if (alive) setNotice(`Không tải được dữ liệu: ${e.message}`); }
    };
    refresh();
    const channel = supabase.channel("admin-places")
      .on("postgres_changes", { event: "*", schema: "public", table: "places" }, refresh)
      .subscribe();
    return () => { alive = false; supabase.removeChannel(channel); };
  }, [session]);

  const chartMax = Math.max(1, ...analyticsSummary.days.map((d) => d.count));
  const chartPoints = analyticsSummary.days.map((d, i) => ({
    ...d,
    x: 54 + i * (812 / Math.max(1, analyticsSummary.days.length - 1)),
    y: 218 - (d.count / chartMax) * 178,
  }));
  const chartLine = chartPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const chartArea = `${chartLine} L${chartPoints[chartPoints.length - 1]?.x || 866},218 L${chartPoints[0]?.x || 54},218 Z`;

  const login = async (e) => {
    e.preventDefault(); setError(""); setBusy(true);
    if (!supabase) { setError("Chưa cấu hình Supabase. Hãy tạo file .env ở thư mục gốc theo .env.example rồi khởi động lại Vite."); setBusy(false); return; }
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (authError) setError("Đăng nhập thất bại. Kiểm tra email/mật khẩu và tài khoản Admin trong Supabase Auth.");
    else { setSession(data.session); setPassword(""); }
  };
  const logout = async () => { await supabase?.auth.signOut(); setSession(null); };
  const saveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem("palaceguide-admin-settings", JSON.stringify(settings));
    setSettingsSaved(true);
    setNotice("Đã lưu cài đặt trên trình duyệt này.");
    window.setTimeout(() => setSettingsSaved(false), 2500);
  };
  const updateAdminPassword = async (e) => {
    e.preventDefault(); setAccountMessage(""); setAccountError("");
    if (newPassword.length < 8) { setAccountError("Mật khẩu mới cần ít nhất 8 ký tự."); return; }
    if (newPassword !== confirmPassword) { setAccountError("Hai mật khẩu chưa trùng khớp."); return; }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (updateError) setAccountError(`Không đổi được mật khẩu: ${updateError.message}`);
    else { setAccountMessage("Đã cập nhật mật khẩu tài khoản Supabase Auth."); setNewPassword(""); setConfirmPassword(""); }
  };
  const openNew = () => { setEditing(emptyStop()); setImageFile(null); setShowForm(true); setConfirmDelete(false); };
  const openEdit = (item) => { setEditing(clone(item)); setImageFile(null); setShowForm(true); setConfirmDelete(false); };
  const updateField = (field, value) => setEditing((prev) => ({ ...prev, [field]: value }));
  const updateTranslation = (field, value) => setEditing((prev) => ({ ...prev, [field]: { ...prev[field], [language]: value } }));

  const uploadImage = async () => {
    if (!imageFile) return editing.image_url || null;
    if (!supabase || !session) throw new Error("Bạn cần đăng nhập Admin trước khi tải ảnh.");
    if (!imageFile.type?.startsWith("image/")) throw new Error("Vui lòng chọn tệp hình ảnh.");
    if (imageFile.size > 8 * 1024 * 1024) throw new Error("Ảnh vượt quá 8 MB. Hãy nén ảnh trước khi tải lên.");
    const ext = (imageFile.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${editing.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("place-images").upload(path, imageFile, { upsert: false, contentType: imageFile.type, cacheControl: "3600" });
    if (uploadError) throw uploadError;
    return supabase.storage.from("place-images").getPublicUrl(path).data.publicUrl;
  };

  const saveForm = async (e) => {
    e.preventDefault();
    if (!editing.title?.vi?.trim() || !editing.text?.vi?.trim()) { setNotice("Vui lòng nhập ít nhất tiêu đề và nội dung tiếng Việt."); return; }
    setBusy(true); setNotice("");
    try {
      const image_url = await uploadImage();
      const payload = toDatabasePlace({ ...editing, image_url });
      const { data, error: saveError } = await supabase.from("places").upsert(payload, { onConflict: "id" }).select().single();
      if (saveError) throw saveError;
      const saved = fromDatabasePlace(data);
      setItems((current) => [...current.filter((x) => x.id !== saved.id), saved].sort((a, b) => (a.order || 0) - (b.order || 0)));
      setSelectedId(saved.id); setShowForm(false); setEditing(null); setImageFile(null); setNotice("Đã lưu lên Supabase. Website và mobile sẽ nhận dữ liệu mới.");
    } catch (e2) { setNotice(`Không thể lưu: ${e2.message}`); }
    finally { setBusy(false); }
  };
  const deleteSelected = async () => {
    if (!editing?.id || !supabase) return;
    setBusy(true);
    const { error: deleteError } = await supabase.from("places").delete().eq("id", editing.id);
    setBusy(false);
    if (deleteError) { setNotice(`Không thể xóa: ${deleteError.message}`); return; }
    const next = items.filter((x) => x.id !== editing.id);
    setItems(next); setSelectedId(next[0]?.id || null); setConfirmDelete(false); setShowForm(false); setEditing(null); setNotice("Đã xóa địa điểm khỏi dữ liệu trực tuyến.");
  };
  const exportJson = () => { const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "dinh-doc-lap-content-backup.json"; a.click(); URL.revokeObjectURL(url); };
  const importJson = async (e) => {
    const file = e.target.files?.[0]; if (!file || !supabase) return;
    setBusy(true);
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed) || !parsed.every((x) => x.id && x.title && x.text)) throw new Error("File JSON không đúng định dạng địa điểm.");
      const { error: importError } = await supabase.from("places").upsert(parsed.map(toDatabasePlace), { onConflict: "id" });
      if (importError) throw importError;
      await loadPlaces(); setNotice("Đã nhập dữ liệu JSON lên Supabase.");
    } catch (e2) { setNotice(`Không thể nhập JSON: ${e2.message}`); }
    finally { setBusy(false); e.target.value = ""; }
  };
  const seedDatabase = async () => {
    if (!window.confirm("Đưa 20 địa điểm mẫu lên database? Các ID trùng sẽ được cập nhật.")) return;
    setBusy(true);
    const { data: existing, error: readError } = await supabase.from("places").select("id");
    if (readError) { setBusy(false); setNotice(`Không thể đọc dữ liệu hiện có: ${readError.message}`); return; }
    const known = new Set((existing || []).map((x) => x.id));
    const missing = seedStops.filter((x) => !known.has(x.id)).map((x) => toDatabasePlace({ ...x, image_url: null }));
    if (missing.length === 0) { setBusy(false); setNotice("Database đã có đủ ID dữ liệu mẫu; không ghi đè nội dung hoặc ảnh hiện tại."); return; }
    const { error: seedError } = await supabase.from("places").insert(missing);
    setBusy(false);
    if (seedError) setNotice(`Không thể thêm dữ liệu mẫu còn thiếu: ${seedError.message}`);
    else { await loadPlaces(); setNotice(`Đã thêm ${missing.length} địa điểm mẫu còn thiếu, không ghi đè nội dung hiện có.`); }
  };

  if (!authReady) return <div className="login-page"><div className="login-card"><div className="seal">✦</div><h1>Đang kiểm tra phiên đăng nhập…</h1></div></div>;
  if (!session) return <div className="login-page"><div className="login-card"><div className="seal">✦</div><p className="overline">DINH DOC LAP GUIDE</p><h1>Đăng nhập quản trị</h1><p className="muted">Đăng nhập bằng tài khoản Admin đã tạo trong Supabase Auth.</p>{!isSupabaseConfigured && <p className="error">Chưa cấu hình Supabase. Sao chép .env.example thành .env ở thư mục gốc và điền URL + anon key.</p>}<form onSubmit={login}><label>Email quản trị<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="admin@example.com" required /></label><label>Mật khẩu<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Mật khẩu Supabase Auth" required /></label>{error && <p className="error">{error}</p>}<button className="primary wide" disabled={busy || !isSupabaseConfigured}>{busy ? "Đang đăng nhập…" : "Đăng nhập →"}</button></form><div className="demo-note"><b>Bảo mật</b><p>Không còn tài khoản/mật khẩu demo cố định. Tạo duy nhất tài khoản quản trị trong Supabase Auth và tắt đăng ký công khai.</p></div><a className="back-link" href="/">← Quay lại trang tham quan</a></div></div>;

  return <div className="admin-layout">
    <aside className="sidebar">
      <a className="admin-brand" href="/"><span className="brand-symbol">✦</span><span><b>Dinh Độc Lập</b><small>ADMIN CONSOLE</small></span></a>
      <div className="sidebar-nav">
        <div className="side-label">QUẢN LÝ CHUNG</div>
        <a className={`side-item ${adminPage === "overview" ? "active" : ""}`} href="#overview" onClick={() => setAdminPage("overview")}><span className="side-icon">▦</span><span>Tổng quan</span></a>
        <a className={`side-item ${adminPage === "analytics-dashboard" ? "active" : ""}`} href="#analytics-dashboard" onClick={() => setAdminPage("analytics-dashboard")}><span className="side-icon">▥</span><span>Thống kê &amp; Báo cáo</span></a>
        <div className="side-label side-label-spaced">QUẢN TRỊ NỘI DUNG</div>
        <a className="side-item" href="#places"><span className="side-icon">☆</span><span>Địa điểm tham quan</span></a>
        <a className="side-item" href="#translations"><span className="side-icon">文</span><span>Nội dung đa ngôn ngữ</span></a>
        <a className="side-item" href="#places"><span className="side-icon">♧</span><span>Lộ trình Tour</span><span className="side-soon">Sắp có</span></a>
        <a className="side-item" href="#places"><span className="side-icon">▦</span><span>Quản lý Mã QR</span><span className="side-soon">Sắp có</span></a>
        <div className="side-label side-label-spaced">HỆ THỐNG</div>
        <a className={`side-item ${adminPage === "settings" ? "active" : ""}`} href="#settings" onClick={() => setAdminPage("settings")}><span className="side-icon">⚙</span><span>Cài đặt</span></a>
        <a className={`side-item ${adminPage === "account" ? "active" : ""}`} href="#account" onClick={() => setAdminPage("account")}><span className="side-icon">♙</span><span>Quản lý tài khoản</span></a>
      </div>
      <div className="sidebar-bottom"><div className="avatar">AD</div><div className="sidebar-user"><b>Quản trị viên</b><small>{session.user?.email}</small></div><button title="Đăng xuất" onClick={logout}>↪</button></div>
    </aside>
    <main className="admin-main"><header className="admin-topbar"><div><p className="overline">BẢNG ĐIỀU KHIỂN</p><h1>Quản trị nội dung</h1><p className="muted">Dữ liệu được lưu trên Supabase và dùng chung cho web + mobile.</p></div><div className="top-actions"><a className="outline" href="/" target="_blank" rel="noreferrer">↗ Xem website</a><button className="primary" onClick={openNew}>＋ Thêm địa điểm</button></div></header>
    {notice && <div className="toast" role="status">{notice}</div>}
    <section className={`stats ${["settings", "account"].includes(adminPage) ? "page-hidden" : ""}`} id="overview"><div className="stat-card"><span className="stat-icon burgundy">⌖</span><div><small>Tổng địa điểm</small><strong>{items.length}</strong><em>Trực tuyến</em></div></div><div className="stat-card"><span className="stat-icon gold">文</span><div><small>Ngôn ngữ hỗ trợ</small><strong>05</strong><em>VI · EN · ZH · JA · KO</em></div></div><div className="stat-card"><span className="stat-icon green">✓</span><div><small>Có nội dung tiếng Việt</small><strong>{items.filter((x) => x.title?.vi?.trim() && x.text?.vi?.trim()).length}</strong><em>Tiêu đề và thuyết minh</em></div></div></section>
    <section className={`content-card ${["settings", "account"].includes(adminPage) || !settings.showAnalytics ? "page-hidden" : ""}`} id="analytics-dashboard">
      <div className="card-heading"><div><h2>Phân tích hoạt động</h2><p>Dữ liệu thật trong 30 ngày gần nhất, chỉ ghi nhận từ lúc triển khai thống kê. Không lưu danh tính khách tham quan.</p></div><button className="outline" onClick={() => setAnalyticsRefreshKey((n) => n + 1)}>↻ Làm mới thống kê</button></div>
      {analyticsStatus === "missing" ? <div className="analytics-notice"><b>Chưa cài bảng thống kê Supabase</b><p>Chạy file <code>supabase/migrations/20261024_analytics_events.sql</code> trong Supabase SQL Editor, thay YOUR_ADMIN_EMAIL@example.com bằng email Admin đang dùng trong chính sách RLS, rồi tải lại.</p></div> : null}
      {analyticsStatus === "error" ? <div className="analytics-notice"><b>Không đọc được thống kê</b><p>Kiểm tra quyền SELECT của Admin trong RLS và email được khai báo trong migration SQL.</p></div> : null}
      <div className="stats analytics-stats">
        <div className="stat-card"><span className="stat-icon burgundy">▶</span><div><small>Lượt bắt đầu phát âm thanh</small><strong>{analyticsStatus === "ready" ? analyticsSummary.audio : "—"}</strong><em>30 ngày gần nhất</em></div></div>
        <div className="stat-card"><span className="stat-icon gold">▦</span><div><small>Lượt mở từ mã QR</small><strong>{analyticsStatus === "ready" ? analyticsSummary.qr : "—"}</strong><em>QR cần dẫn tới URL có ?qr=ID</em></div></div>
        <div className="stat-card"><span className="stat-icon green">文</span><div><small>Ngôn ngữ được nghe nhiều nhất</small><strong className="analytics-text-value">{analyticsStatus === "ready" ? analyticsSummary.popularLanguage : "—"}</strong><em>Tính từ lượt phát âm thanh</em></div></div>
      </div>
      <div className="analytics-grid">
        <div className="analytics-panel analytics-line-panel"><h3>Lượt phát theo ngày</h3><p>7 ngày gần nhất · dữ liệu thực từ Supabase</p><div className="analytics-line-chart"><svg viewBox="0 0 920 270" role="img" aria-label="Biểu đồ lượt phát thuyết minh theo ngày" preserveAspectRatio="none"><defs><linearGradient id="analyticsArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8a3434" stopOpacity=".14"/><stop offset="100%" stopColor="#8a3434" stopOpacity=".02"/></linearGradient></defs>{[40,84,128,172,218].map((y) => <g key={y}><line x1="54" y1={y} x2="866" y2={y} className="chart-grid-line"/><text x="42" y={y + 4} textAnchor="end" className="chart-axis-label">{Math.round((218-y)/178*chartMax)}</text></g>)}<path d={chartArea} fill="url(#analyticsArea)"/><path d={chartLine} className="chart-line" fill="none" strokeLinecap="round" strokeLinejoin="round"/>{chartPoints.map((point) => <g key={point.key}><circle cx={point.x} cy={point.y} r="5" className="chart-point"/><text x={point.x} y={Math.max(22, point.y - 13)} textAnchor="middle" className="chart-value">{point.count}</text><text x={point.x} y="248" textAnchor="middle" className="chart-axis-label">{point.label}</text></g>)}</svg></div></div>
        <div className="analytics-panel"><h3>Địa điểm được nghe nhiều nhất</h3><p>Trong 30 ngày gần nhất</p><strong className="analytics-top-place">{analyticsStatus === "ready" ? analyticsSummary.topPlace : "—"}</strong><div className="analytics-footnote">{analyticsStatus === "ready" && analyticsRows.length === 0 ? "Chưa có sự kiện mới được ghi nhận." : "Số liệu tổng hợp, không theo dõi từng khách."}</div></div>
      </div>
      {analyticsStatus === "ready" && analyticsRows.length === 0 && <div className="analytics-empty">Chưa có dữ liệu lịch sử. Sự kiện sẽ bắt đầu được ghi nhận sau khi migration được cài và người dùng phát âm thanh hoặc mở liên kết QR hợp lệ.</div>}
    </section>
    <section className={`content-card ${["settings", "account"].includes(adminPage) ? "page-hidden" : ""}`} id="place-statistics">
      <div className="card-heading"><div><h2>Thống kê địa điểm</h2><p>Số liệu được tính trực tiếp từ danh sách đã tải từ Supabase; không tạo số lượt xem/QR/âm thanh giả.</p></div></div>
      <div className="stats">
        <div className="stat-card"><span className="stat-icon burgundy">🏛</span><div><small>Điểm trong Dinh</small><strong>{items.filter((x) => x.category === "palace").length}</strong><em>Khu vực tham quan nội khu</em></div></div>
        <div className="stat-card"><span className="stat-icon gold">📍</span><div><small>Địa danh lân cận</small><strong>{items.filter((x) => x.category === "nearby").length}</strong><em>Điểm tham quan xung quanh</em></div></div>
        <div className="stat-card"><span className="stat-icon green">📝</span><div><small>Đủ thuyết minh tiếng Việt</small><strong>{items.filter((x) => x.title?.vi?.trim() && x.text?.vi?.trim()).length}</strong><em>Có tiêu đề và nội dung</em></div></div>
      </div>
      <div className="table-wrap"><table className="admin-table"><thead><tr><th>Tầng / khu vực</th><th>Số địa điểm</th></tr></thead><tbody>
        {Array.from(items.filter((x) => x.category === "palace").reduce((acc, x) => { const floor = (typeof x.floor === "object" ? (x.floor?.vi || "Chưa phân tầng") : x.floor) || "Chưa phân tầng"; acc.set(floor, (acc.get(floor) || 0) + 1); return acc; }, new Map()).entries()).sort((a,b) => a[0].localeCompare(b[0], "vi")).map(([floor, count]) => <tr key={floor}><td>{floor}</td><td><strong>{count}</strong></td></tr>)}
        {items.filter((x) => x.category === "palace").length === 0 && <tr><td colSpan="2">Chưa có địa điểm nội khu để thống kê.</td></tr>}
      </tbody></table></div>
    </section>
    <section className={`content-card ${["settings", "account"].includes(adminPage) ? "page-hidden" : ""}`} id="places"><div className="card-heading"><div><h2>Danh sách địa điểm</h2><p>Thay đổi được đồng bộ qua Supabase Realtime khi đã bật Realtime cho bảng places.</p></div><div className="toolbar"><input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="⌕ Tìm địa điểm..."/><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">Tất cả khu vực</option><option value="palace">Trong Dinh</option><option value="nearby">Địa danh lân cận</option></select></div></div>
    <div className="table-wrap"><table><thead><tr><th>ĐỊA ĐIỂM</th><th>KHU VỰC</th><th>NGÔN NGỮ</th><th>TRẠNG THÁI</th><th></th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className={selectedId === item.id ? "chosen" : ""} onClick={() => setSelectedId(item.id)}><td><div className="place-cell">{item.image_url ? <img src={item.image_url} alt="" style={{ width: 42, height: 42, borderRadius: 8, objectFit: "cover" }} /> : <span className="place-emoji">{item.icon || "📍"}</span>}<span><b>{localized(item, "title", "vi") || "Chưa có tiêu đề"}</b><small>{item.id}</small></span></div></td><td><span className="category-pill">{item.category === "nearby" ? "Lân cận" : "Trong Dinh"}</span></td><td><div className="language-dots">{LANGUAGES.map((l) => <span key={l.code} title={l.label} className={(item.title?.[l.code]?.trim() && item.text?.[l.code]?.trim()) ? "filled" : ""}>{l.code.toUpperCase()}</span>)}</div></td><td><span className={`status ${item.title?.vi?.trim() && item.text?.vi?.trim() ? "published" : "draft"}`}><i/> {item.title?.vi?.trim() && item.text?.vi?.trim() ? "Có nội dung" : "Thiếu nội dung"}</span></td><td><button className="small-action" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>Sửa ↗</button></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state">Không tìm thấy địa điểm phù hợp.</div>}</div>
    <div className="table-footer"><span>Hiển thị <b>{filtered.length}</b> / {items.length} địa điểm</span><div><button className="text-button" onClick={exportJson}>↓ Xuất bản sao JSON</button><label className="text-button import-button">↑ Nhập JSON<input type="file" accept="application/json,.json" onChange={importJson}/></label><button className="text-button" onClick={seedDatabase} disabled={busy}>↻ Đồng bộ dữ liệu mẫu</button></div></div></section>
    <section className="content-card language-card" id="translations"><div className="card-heading"><div><h2>Quản lý bản dịch</h2><p>Chọn địa điểm và ngôn ngữ để xem nội dung.</p></div></div><div className="translation-tools"><select value={selectedId || ""} onChange={(e) => setSelectedId(e.target.value)}><option value="">Chọn địa điểm...</option>{items.map((x) => <option key={x.id} value={x.id}>{localized(x, "title", "vi") || x.id}</option>)}</select><select value={language} onChange={(e) => setLanguage(e.target.value)}>{LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}</select>{selected && <button className="primary" onClick={() => openEdit(selected)}>Chỉnh sửa bản dịch</button>}</div>{selected ? <div className="translation-preview"><div><small>TIÊU ĐỀ</small><b>{localized(selected, "title", language) || "Chưa có bản dịch"}</b></div><div><small>TÓM TẮT</small><p>{localized(selected, "summary", language) || "Chưa có bản dịch"}</p></div><div><small>NỘI DUNG THUYẾT MINH</small><p>{localized(selected, "text", language) || "Chưa có bản dịch"}</p></div></div> : <div className="empty-state">Chọn một địa điểm để xem bản dịch.</div>}</section>
    <section className={`content-card settings-page ${adminPage === "settings" ? "page-visible" : "page-hidden"}`} id="settings">
      <div className="card-heading"><div><p className="overline">HỆ THỐNG</p><h2>Cài đặt hệ thống</h2><p>Tùy chỉnh cách hiển thị bảng quản trị trên trình duyệt này.</p></div></div>
      <form className="settings-form" onSubmit={saveSettings}>
        <div className="settings-section-title"><span className="settings-section-icon">⚙</span><div><h3>Thông tin chung</h3><p>Các thiết lập hiển thị cho bảng quản trị.</p></div></div>
        <label>Tên hệ thống<input value={settings.siteName} onChange={e => setSettings(v => ({ ...v, siteName: e.target.value }))} maxLength={80} required/><small>Tên này dùng trong phần cài đặt, không tự đổi tên miền website.</small></label>
        <label>Ngôn ngữ mặc định<select value={settings.defaultLanguage} onChange={e => setSettings(v => ({ ...v, defaultLanguage: e.target.value }))}>{LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}</select><small>Ghi nhớ lựa chọn cho quản trị viên trên trình duyệt hiện tại.</small></label>
        <div className="settings-section-title"><span className="settings-section-icon">▤</span><div><h3>Hiển thị &amp; thao tác</h3><p>Bật hoặc tắt các tiện ích trong bảng quản trị.</p></div></div>
        <label className="setting-toggle"><span><b>Hiển thị thống kê hoạt động</b><small>Cho phép xem số lượt phát âm thanh và mở mã QR trong bảng tổng quan.</small></span><input type="checkbox" checked={settings.showAnalytics} onChange={e => setSettings(v => ({ ...v, showAnalytics: e.target.checked }))}/></label>
        <label className="setting-toggle"><span><b>Xác nhận trước khi xóa</b><small>Khuyến nghị bật để tránh xóa nhầm nội dung.</small></span><input type="checkbox" checked={settings.confirmDelete} onChange={e => setSettings(v => ({ ...v, confirmDelete: e.target.checked }))}/></label>
        <div className="settings-actions"><span className="muted">Cài đặt được lưu trong trình duyệt hiện tại, chưa đồng bộ sang thiết bị khác.</span><button className="primary" type="submit">{settingsSaved ? "✓ Đã lưu" : "Lưu cài đặt"}</button></div>
      </form>
    </section>
    <section className={`content-card settings-page ${adminPage === "account" ? "page-visible" : "page-hidden"}`} id="account">
      <div className="card-heading"><div><p className="overline">HỆ THỐNG</p><h2>Quản lý tài khoản</h2><p>Thông tin phiên quản trị hiện tại và bảo mật tài khoản.</p></div></div>
      <div className="account-profile"><div className="account-avatar">{(session.user?.email || "A").slice(0,1).toUpperCase()}</div><div><h3>Quản trị viên</h3><p>{session.user?.email || "Không xác định email"}</p><span className="account-status"><i/> Đã đăng nhập qua Supabase Auth</span></div></div>
      <form className="settings-form account-form" onSubmit={updateAdminPassword}>
        <div className="settings-section-title"><span className="settings-section-icon">♙</span><div><h3>Đổi mật khẩu</h3><p>Mật khẩu mới được cập nhật qua Supabase Auth.</p></div></div>
        <label>Mật khẩu mới<input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" minLength={8} placeholder="Ít nhất 8 ký tự" required/><small>Không dùng lại mật khẩu đang sử dụng ở dịch vụ khác.</small></label>
        <label>Nhập lại mật khẩu mới<input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={8} placeholder="Nhập lại mật khẩu mới" required/></label>
        {accountError && <p className="account-message error">{accountError}</p>}{accountMessage && <p className="account-message success">{accountMessage}</p>}
        <div className="settings-actions"><span className="muted">Nếu đổi mật khẩu thành công, hãy sử dụng mật khẩu mới ở lần đăng nhập sau.</span><button className="primary" disabled={busy}>{busy ? "Đang cập nhật…" : "Cập nhật mật khẩu"}</button></div>
      </form>
      <div className="account-security"><div><b>Phiên đăng nhập</b><p>Đăng xuất khỏi tài khoản quản trị trên trình duyệt này.</p></div><button className="danger-outline" type="button" onClick={logout}>↪ Đăng xuất</button></div>
    </section>
    <footer className="admin-footer">Dinh Độc Lập Guide <span>•</span> Supabase cloud database + image storage</footer></main>
    {showForm && editing && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) { setShowForm(false); setEditing(null); } }}><form className="edit-modal" onSubmit={saveForm}><div className="modal-head"><div><p className="overline">QUẢN LÝ NỘI DUNG</p><h2>{items.some((x) => x.id === editing.id) ? "Chỉnh sửa địa điểm" : "Thêm địa điểm mới"}</h2></div><button type="button" className="close" onClick={() => { setShowForm(false); setEditing(null); }}>×</button></div><div className="modal-body"><div className="form-grid"><label>Mã định danh<input value={editing.id} onChange={(e) => updateField("id", e.target.value.trim().replace(/\s+/g, "-").toLowerCase())} required disabled={items.some((x) => x.id === editing.id)}/></label><label>Biểu tượng<input value={editing.icon || "📍"} onChange={(e) => updateField("icon", e.target.value)} maxLength={8}/></label><label>Khu vực<select value={editing.category} onChange={(e) => updateField("category", e.target.value)}><option value="palace">Trong Dinh</option><option value="nearby">Địa danh lân cận</option></select></label><label>Thứ tự<input type="number" value={editing.order || 1} onChange={(e) => updateField("order", Number(e.target.value))}/></label><label>Vĩ độ (tùy chọn)<input type="number" step="any" value={editing.latitude ?? ""} onChange={(e) => updateField("latitude", e.target.value === "" ? null : Number(e.target.value))}/></label><label>Kinh độ (tùy chọn)<input type="number" step="any" value={editing.longitude ?? ""} onChange={(e) => updateField("longitude", e.target.value === "" ? null : Number(e.target.value))}/></label></div><label>Ảnh thật của địa điểm (JPG, PNG, WebP; tối đa 8 MB)<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setImageFile(e.target.files?.[0] || null)}/></label>{(imageFile || editing.image_url || imageFor(editing.id)) && <div style={{ margin: "8px 0 16px" }}><img src={imageFile ? URL.createObjectURL(imageFile) : editing.image_url || imageFor(editing.id)} alt="Xem trước ảnh địa điểm" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12 }} />{editing.image_url && <small>Ảnh đang lưu trên Supabase Storage.</small>}</div>}<div className="language-tabs">{LANGUAGES.map((l) => <button type="button" key={l.code} className={language === l.code ? "selected" : ""} onClick={() => setLanguage(l.code)}>{l.flag} {l.code.toUpperCase()}</button>)}</div><p className="translation-hint">Đang chỉnh sửa: <b>{LANGUAGES.find((l) => l.code === language)?.label}</b>.</p><label>Tiêu đề địa điểm<input value={editing.title?.[language] || ""} onChange={(e) => updateTranslation("title", e.target.value)} placeholder="Tên địa điểm" required={language === "vi"}/></label><label>Vị trí / tầng / khu vực<input value={editing.floor?.[language] || ""} onChange={(e) => updateTranslation("floor", e.target.value)} placeholder="Ví dụ: Sảnh chính"/></label><label>Tóm tắt<textarea rows="2" value={editing.summary?.[language] || ""} onChange={(e) => updateTranslation("summary", e.target.value)} placeholder="Mô tả ngắn"/></label><label>Nội dung thuyết minh<textarea rows="6" value={editing.text?.[language] || ""} onChange={(e) => updateTranslation("text", e.target.value)} placeholder="Nội dung thuyết minh cho ngôn ngữ đã chọn" required={language === "vi"}/></label><p className="form-note">Ảnh sẽ được lưu trong Supabase Storage; thông tin địa điểm và bản dịch được lưu trong PostgreSQL.</p></div><div className="modal-actions">{items.some((x) => x.id === editing.id) && <button type="button" className="danger-outline" onClick={() => setConfirmDelete(true)}>Xóa địa điểm</button>}<span/><button type="button" className="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Hủy</button><button className="primary" disabled={busy}>{busy ? "Đang lưu…" : "Lưu trực tuyến"}</button></div>{confirmDelete && <div className="confirm-box"><b>Xóa địa điểm này?</b><p>Thao tác sẽ xóa địa điểm khỏi database trực tuyến.</p><button type="button" className="outline" onClick={() => setConfirmDelete(false)}>Không xóa</button><button type="button" className="danger" onClick={deleteSelected} disabled={busy}>Xác nhận xóa</button></div>}</form></div>}
  </div>;
}

createRoot(document.getElementById("admin-root")).render(<AdminApp />);
