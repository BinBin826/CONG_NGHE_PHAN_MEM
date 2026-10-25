// Tải nội dung do dashboard sửa (bảng places) và ghi lượt nghe (bảng analytics_events).
// Không có .env hoặc lỗi mạng thì app dùng dữ liệu có sẵn trong code (không bị lỗi).
import { createClient } from "@supabase/supabase-js";
import { applyRemotePlaces } from "@palaceguide/shared";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const client = url && key ? createClient(url, key) : null;

export async function syncContent() {
  if (!client) return false;
  try {
    const { data, error } = await client
      .from("places")
      .select("id,icon,sort_order,floor,title,summary,text,image_url,latitude,longitude")
      .order("sort_order", { ascending: true });
    if (error || !data?.length) return false;
    return applyRemotePlaces(data);
  } catch {
    return false;
  }
}

// Ẩn danh: chỉ ghi điểm nghe, ngôn ngữ và đã nghe hết bài hay chưa
export function logListen(placeId, lang, completed) {
  if (!client) return;
  client
    .from("analytics_events")
    .insert({ event_type: completed ? "audio_complete" : "audio_play", place_id: placeId, language: lang })
    .then(() => {}, () => {});
}
