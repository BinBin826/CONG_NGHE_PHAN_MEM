// Tạo supabase/seed.sql (bảng places) từ dữ liệu trong packages/shared.
// Chạy ở thư mục gốc dự án: node tools/export_seed.mjs   (cần Node 22+, hoặc 20.19+)
import { writeFileSync, mkdirSync } from "node:fs";
import { stops } from "../packages/shared/index.js";

const q = (v) => "'" + String(v ?? "").replace(/'/g, "''") + "'";
const j = (o) => q(JSON.stringify(o ?? {})) + "::jsonb";
const rows = stops.map((s) =>
  `  (${q(s.id)}, ${q(s.icon)}, 'palace', ${s.order}, ${j(s.floor)}, ${j(s.title)}, ${j(s.summary)}, ${j(s.text)})`
).join(",\n");

const sql = `-- Tạo tự động bởi tools/export_seed.mjs. Chạy SAU schema.sql.
-- Chỉ thêm điểm còn thiếu, không ghi đè nội dung đã sửa trong dashboard.
insert into public.places (id, icon, category, sort_order, floor, title, summary, text) values
${rows}
on conflict (id) do nothing;
`;
mkdirSync(new URL("../supabase/", import.meta.url), { recursive: true });
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(`Đã tạo supabase/seed.sql: ${stops.length} điểm`);
