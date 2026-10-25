// Ảnh minh họa của từng điểm: packages/shared/images/<id>.png
// Muốn dùng ảnh thật: ghi đè file PNG cùng tên (giữ nguyên tên).
import { remoteImages } from "@palaceguide/shared";

const files = import.meta.glob("../../../packages/shared/images/*.png", { eager: true, query: "?url", import: "default" });

const byId = {};
for (const [path, url] of Object.entries(files)) {
  byId[path.split("/").pop().replace(".png", "")] = url;
}

// Ảnh tải lên từ dashboard được ưu tiên, nếu không có thì dùng ảnh trong code
export const imageFor = (id) => remoteImages[id] || byId[id] || null;
