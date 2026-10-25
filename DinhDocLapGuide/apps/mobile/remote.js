// Tải nội dung do dashboard sửa (bảng places) và ghi lượt nghe (bảng analytics_events).
// Không cần cài thêm thư viện. Thiếu .env, mất mạng hoặc lỗi thì app dùng dữ liệu trong code.
import { applyRemotePlaces } from "@palaceguide/shared";

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
    const rows = await get("places?select=id,icon,sort_order,floor,title,summary,text,image_url,latitude,longitude&order=sort_order.asc");
    return applyRemotePlaces(rows);
  } catch {
    return false;
  }
}

// Ẩn danh: chỉ ghi điểm nghe, ngôn ngữ và đã nghe hết bài hay chưa
export function logListen(placeId, lang, completed) {
  if (!BASE || !KEY) return;
  fetch(`${BASE}/rest/v1/analytics_events`, {
    method: "POST",
    headers: { apikey: KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ event_type: completed ? "audio_complete" : "audio_play", place_id: placeId, language: lang })
  }).catch(() => {});
}

// Khách mở bản web của app từ mã QR (địa chỉ có ?src=qr). Ghi ẩn danh một lượt quét.
export function logQrScan(placeId, lang) {
  if (!BASE || !KEY) return;
  fetch(`${BASE}/rest/v1/analytics_events`, {
    method: "POST",
    headers: { apikey: KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ event_type: "qr_scan", place_id: placeId || null, language: lang || null })
  }).catch(() => {});
}
