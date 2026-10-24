// Tải nội dung do dashboard sửa từ Supabase và ghi lượt nghe (không cần cài thêm thư viện).
// Thiếu .env, mất mạng hoặc lỗi thì app dùng dữ liệu có sẵn trong code.
import { applyRemoteContent } from "@palaceguide/shared";

const BASE = process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const get = async (path) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${BASE}/rest/v1/${path}`, { headers: { apikey: KEY }, signal: ctrl.signal });
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

export async function syncContent() {
  if (!BASE || !KEY) return false;
  try {
    const [s, t] = await Promise.all([
      get("stops?select=id,published"),
      get("stop_translations?select=stop_id,lang,title,floor,summary,body")
    ]);
    if (!Array.isArray(s) || !Array.isArray(t) || !s.length) return false;
    applyRemoteContent(s, t);
    return true;
  } catch {
    return false;
  }
}

// Ẩn danh: chỉ ghi điểm nghe, ngôn ngữ và đã nghe hết bài hay chưa
export function logListen(stopId, lang, completed) {
  if (!BASE || !KEY) return;
  fetch(`${BASE}/rest/v1/listen_events`, {
    method: "POST",
    headers: { apikey: KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ stop_id: stopId, lang, completed })
  }).catch(() => {});
}
