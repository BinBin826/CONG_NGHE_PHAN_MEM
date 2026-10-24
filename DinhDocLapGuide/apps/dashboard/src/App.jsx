import { useEffect, useMemo, useState } from "react";
import { supabase, configured } from "./supabase.js";

const LANGS = [["vi", "Tiếng Việt"], ["en", "English"], ["zh", "中文"], ["ja", "日本語"], ["ko", "한국어"]];
const ROLE = { admin: "Quản trị", editor: "Biên tập", viewer: "Xem thống kê" };
const WEB_URL = import.meta.env.VITE_WEB_URL || (import.meta.env.DEV ? "http://localhost:5173" : "");

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr("Email hoặc mật khẩu không đúng.");
    setBusy(false);
  };
  return (
    <main className="gate">
      <form onSubmit={submit}>
        <h1>Dashboard Dinh Độc Lập</h1>
        <p>Chỉ dành cho nhân viên được cấp tài khoản.</p>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /></label>
        <label>Mật khẩu<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="primary" disabled={busy}>{busy ? "Đang đăng nhập…" : "Đăng nhập"}</button>
        {WEB_URL && <a className="back-link" href={WEB_URL}>← Về trang web</a>}
      </form>
    </main>
  );
}

function Content() {
  const [stops, setStops] = useState([]);
  const [tr, setTr] = useState({});
  const [sel, setSel] = useState(null);
  const [lang, setLang] = useState("vi");
  const [draft, setDraft] = useState({});
  const [pub, setPub] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const [a, b] = await Promise.all([
        supabase.from("stops").select("*").order("sort_order"),
        supabase.from("stop_translations").select("*")
      ]);
      const error = a.error || b.error;
      if (error) { setMsg("Không tải được dữ liệu: " + error.message); return; }
      setStops(a.data);
      setTr(Object.fromEntries(b.data.map((r) => [r.stop_id + ":" + r.lang, r])));
      setSel(a.data[0]?.id ?? null);
    })();
  }, []);

  const stop = stops.find((s) => s.id === sel);
  useEffect(() => {
    if (!stop) return;
    setDraft(tr[sel + ":" + lang] || {}); setPub(stop.published); setMsg("");
  }, [sel, lang, stop, tr]);

  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));
  const save = async () => {
    const row = { stop_id: sel, lang, title: draft.title || "", floor: draft.floor || "", summary: draft.summary || "", body: draft.body || "" };
    const r1 = await supabase.from("stop_translations").upsert(row);
    const r2 = await supabase.from("stops").update({ published: pub }).eq("id", sel);
    const error = r1.error || r2.error;
    if (error) { setMsg("Chưa lưu được: " + error.message); return; }
    setTr((t) => ({ ...t, [sel + ":" + lang]: row }));
    setStops((s) => s.map((x) => (x.id === sel ? { ...x, published: pub } : x)));
    setMsg("Đã lưu thay đổi.");
  };

  if (!stops.length) return <p className="empty">{msg || "Chưa có điểm tham quan nào. Hãy chạy file seed.sql trong Supabase."}</p>;
  return (
    <div className="split">
      <ul className="list">
        {stops.map((s) => (
          <li key={s.id}>
            <button className={s.id === sel ? "on" : ""} onClick={() => setSel(s.id)}>
              <span>{s.icon} {tr[s.id + ":vi"]?.title || s.id}</span>
              {!s.published && <small>Đang ẩn</small>}
            </button>
          </li>
        ))}
      </ul>
      <section className="editor">
        <div className="langs">
          {LANGS.map(([c, n]) => <button key={c} className={c === lang ? "on" : ""} onClick={() => setLang(c)}>{n}</button>)}
        </div>
        <label>Tên điểm<input value={draft.title || ""} onChange={set("title")} /></label>
        <label>Vị trí<input value={draft.floor || ""} onChange={set("floor")} /></label>
        <label>Mô tả ngắn<textarea rows={2} value={draft.summary || ""} onChange={set("summary")} /></label>
        <label>Bài thuyết minh<textarea rows={10} value={draft.body || ""} onChange={set("body")} /></label>
        <label className="check"><input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} /> Hiển thị cho khách tham quan</label>
        <div className="bar">
          <button className="primary" onClick={save}>Lưu thay đổi</button>
          {msg && <span role="status">{msg}</span>}
        </div>
      </section>
    </div>
  );
}

function Stats() {
  const [rows, setRows] = useState(null);
  const [titles, setTitles] = useState({});
  const [err, setErr] = useState("");
  useEffect(() => {
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    Promise.all([
      supabase.from("listen_events").select("stop_id,lang,completed").gte("created_at", since).limit(10000),
      supabase.from("stop_translations").select("stop_id,title").eq("lang", "vi")
    ]).then(([e, t]) => {
      if (e.error) { setErr(e.error.message); return; }
      setRows(e.data); setTitles(Object.fromEntries((t.data || []).map((x) => [x.stop_id, x.title])));
    });
  }, []);
  const agg = useMemo(() => {
    const starts = (rows || []).filter((r) => !r.completed);
    const count = (key) => Object.entries(starts.reduce((m, r) => ({ ...m, [r[key]]: (m[r[key]] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
    return { starts: starts.length, stop: count("stop_id"), lang: count("lang"), done: (rows || []).length - starts.length };
  }, [rows]);

  if (err) return <p className="err" role="alert">Không tải được thống kê: {err}</p>;
  if (!rows) return <p className="empty">Đang tải…</p>;
  if (!agg.starts) return <p className="empty">Chưa có lượt nghe nào trong 30 ngày qua. Số liệu sẽ xuất hiện khi app ghi sự kiện nghe vào bảng listen_events.</p>;
  const Bars = ({ data, label }) => (
    <ul className="bars">
      {data.map(([k, n]) => (
        <li key={k}><span>{label(k)}</span><i style={{ width: (n / data[0][1]) * 100 + "%" }} /><b>{n}</b></li>
      ))}
    </ul>
  );
  return (
    <div className="stats">
      <p className="lead"><b>{agg.starts}</b> lượt nghe trong 30 ngày, <b>{Math.min(100, Math.round((agg.done / agg.starts) * 100))}%</b> nghe hết bài.</p>
      <h2>Điểm được nghe nhiều nhất</h2>
      <Bars data={agg.stop.slice(0, 10)} label={(k) => titles[k] || k} />
      <h2>Theo ngôn ngữ</h2>
      <Bars data={agg.lang} label={(k) => LANGS.find((l) => l[0] === k)?.[1] || k} />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [denied, setDenied] = useState(false);
  const [tab, setTab] = useState("content");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    setProfile(null); setDenied(false);
    if (!session) return;
    supabase.from("profiles").select("full_name, role").eq("id", session.user.id).maybeSingle()
      .then(({ data }) => (data?.role ? setProfile(data) : setDenied(true)));
  }, [session]);

  if (!configured) return <main className="gate"><div><h1>Chưa cấu hình</h1><p>Tạo file apps/dashboard/.env theo mẫu .env.example rồi chạy lại.</p></div></main>;
  if (session === undefined) return <p className="empty">Đang tải…</p>;
  if (!session) return <Login />;
  if (denied) return (
    <main className="gate"><div>
      <h1>Tài khoản chưa được cấp quyền</h1>
      <p>Hãy liên hệ quản trị viên để được thêm vào hệ thống.</p>
      <button className="primary" onClick={() => supabase.auth.signOut()}>Đăng xuất</button>
    </div></main>
  );
  if (!profile) return <p className="empty">Đang tải…</p>;

  const canEdit = profile.role === "admin" || profile.role === "editor";
  const view = canEdit ? tab : "stats";
  return (
    <div className="shell">
      <header>
        <strong>Dinh Độc Lập</strong>
         {WEB_URL && <a className="back" href={WEB_URL}>← Về trang web</a>}
        <nav>
          {canEdit && <button className={view === "content" ? "on" : ""} onClick={() => setTab("content")}>Nội dung</button>}
          <button className={view === "stats" ? "on" : ""} onClick={() => setTab("stats")}>Thống kê</button>
        </nav>
        <span className="who">{profile.full_name || session.user.email} · {ROLE[profile.role]}</span>
        <button onClick={() => supabase.auth.signOut()}>Đăng xuất</button>
      </header>
      <main>{view === "content" ? <Content /> : <Stats />}</main>
    </div>
  );
}
