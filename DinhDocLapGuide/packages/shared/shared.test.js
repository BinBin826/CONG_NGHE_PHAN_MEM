import { describe, it, expect } from "vitest";
import { LANGUAGES, ui, stops, stopsByCategory, detectLang, estimateSeconds, getNextStop, pickVoice, searchStops, speechLang } from "./index.js";

describe("dữ liệu đa ngôn ngữ", () => {
  it("mọi điểm có đủ tiêu đề, vị trí và nội dung cho mọi ngôn ngữ", () => {
    for (const s of stops) for (const l of LANGUAGES) for (const f of ["title", "floor", "summary", "text"]) {
      expect(s[f][l.code], `${s.id}.${f}.${l.code}`).toBeTruthy();
    }
  });
  it("UI có cùng bộ khóa ở mọi ngôn ngữ", () => {
    const keys = Object.keys(ui.vi).sort();
    for (const l of LANGUAGES) expect(Object.keys(ui[l.code]).sort()).toEqual(keys);
  });
  it("thứ tự điểm liên tục từ 1", () => {
    expect(stops.map((s) => s.order)).toEqual(stops.map((_, i) => i + 1));
  });
});

describe("helper", () => {
  it("detectLang", () => {
    expect(detectLang("ja-JP")).toBe("ja");
    expect(detectLang("zh_TW")).toBe("zh");
    expect(detectLang("fr-FR")).toBe("vi");
  });
  it("speechLang", () => expect(speechLang("ko")).toBe("ko-KR"));
  it("estimateSeconds tăng khi chậm đi", () => {
    expect(estimateSeconds("a b c d e f g h", "en", 0.5)).toBeGreaterThan(estimateSeconds("a b c d e f g h", "en", 1));
  });
  it("getNextStop chặn ở hai đầu", () => {
    expect(getNextStop(stops[0].id, -1)).toBeNull();
    expect(getNextStop(stops.at(-1).id, 1)).toBeNull();
    expect(getNextStop(stops[0].id, 1).id).toBe(stops[1].id);
  });
  it("pickVoice ưu tiên khớp chính xác rồi khớp tiền tố", () => {
    const v = [{ lang: "en-GB" }, { lang: "en-US" }];
    expect(pickVoice(v, "en").lang).toBe("en-US");
    expect(pickVoice([{ lang: "en-GB" }], "en").lang).toBe("en-GB");
    expect(pickVoice(v, "ja")).toBeNull();
  });
  it("searchStops theo ngôn ngữ", () => {
    expect(searchStops("bunker", "en").map((s) => s.id)).toEqual(["bunker"]);
  });
  it("getNextStop không vượt ranh giới nhóm", () => {
    const lastPalace = stopsByCategory("palace").at(-1);
    expect(getNextStop(lastPalace.id, 1)).toBeNull();
  });
  it("id duy nhất và mô tả ngắn không rỗng", () => {
    expect(new Set(stops.map((s) => s.id)).size).toBe(stops.length);
    expect(stopsByCategory("palace").length).toBeGreaterThanOrEqual(15);
  });
});
