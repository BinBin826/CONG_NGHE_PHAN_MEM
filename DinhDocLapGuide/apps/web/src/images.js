// Ảnh minh họa của từng điểm: packages/shared/images/<id>.png
// Muốn dùng ảnh thật: ghi đè file PNG cùng tên (giữ nguyên tên).
const files = import.meta.glob("../../../packages/shared/images/*.png", { eager: true, query: "?url", import: "default" });

const byId = {};
for (const [path, url] of Object.entries(files)) {
  byId[path.split("/").pop().replace(".png", "")] = url;
}

export const imageFor = (id) => byId[id] || null;
