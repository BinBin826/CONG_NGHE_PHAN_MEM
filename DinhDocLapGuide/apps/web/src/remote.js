// Tải nội dung do dashboard sửa từ Supabase và ghi lượt nghe.
// Không có .env hoặc lỗi mạng thì app dùng dữ liệu có sẵn trong code (không bị lỗi).
import { createClient } from "@supabase/supabase-js";
import { applyRemoteContent } from "@palaceguide/shared";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const client = url && key ? createClient(url, key) : null;

export async function syncContent() {
  if (!client) return false;
  try {
    const [s, t] = await Promise.all([
      client.from("stops").select("id,published"),
      client.from("stop_translations").select("stop_id,lang,title,floor,summary,body")
    ]);
    if (s.error || t.error || !s.data?.length) return false;
    applyRemoteContent(s.data, t.data);
    return true;
  } catch {
    return false;
  }
}

// Ẩn danh: chỉ ghi điểm nghe, ngôn ngữ và đã nghe hết bài hay chưa
export function logListen(stopId, lang, completed) {
  if (!client) return;
  client.from("listen_events").insert({ stop_id: stopId, lang, completed }).then(() => {}, () => {});
}
