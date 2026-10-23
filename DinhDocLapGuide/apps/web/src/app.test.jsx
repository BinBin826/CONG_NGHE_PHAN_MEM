import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App.jsx";

vi.mock("./MapView.jsx", () => ({ default: ({ activeId }) => <div data-testid="map" data-active={activeId} /> }));

const speak = vi.fn();
const cancel = vi.fn();

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("palaceguide_lang", "vi");
  speak.mockClear();
  cancel.mockClear();
  window.speechSynthesis = {
    speak, cancel, pause: vi.fn(), resume: vi.fn(),
    getVoices: () => [{ lang: "ja-JP", name: "Kyoko" }, { lang: "en-US", name: "Sam" }, { lang: "vi-VN", name: "Linh" }],
    addEventListener: vi.fn(), removeEventListener: vi.fn()
  };
  window.SpeechSynthesisUtterance = function (text) { this.text = text; };
});

describe("Thuyết minh Dinh Độc Lập (web)", () => {
  it("hiển thị tiếng Việt mặc định và đổi sang English", () => {
    render(<App />);
    expect(screen.getAllByText("Lịch sử Dinh").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /English/ }));
    expect(screen.getAllByText("History of the Palace").length).toBeGreaterThan(0);
    expect(localStorage.getItem("palaceguide_lang")).toBe("en");
  });

  it("đọc đúng nội dung và mã ngôn ngữ khi bấm Nghe", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /日本語/ }));
    fireEvent.click(screen.getByRole("button", { name: "再生" }));
    expect(speak).toHaveBeenCalledTimes(1);
    const u = speak.mock.calls[0][0];
    expect(u.lang).toBe("ja-JP");
    expect(u.text).toContain("独立宮殿");
  });

  it("cảnh báo khi thiếu giọng đọc cho ngôn ngữ", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /한국어/ }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("tìm kiếm lọc danh sách điểm tham quan", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Tìm điểm tham quan..."), { target: { value: "hầm" } });
    expect(screen.getAllByText("Hầm chỉ huy").length).toBeGreaterThan(0);
    expect(screen.queryByText("Phòng Quốc thư")).not.toBeInTheDocument();
  });

  it("chuyển sang tab địa danh lân cận và đọc nội dung", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: "Địa danh lân cận" }));
    expect(screen.getAllByText("Nhà thờ Đức Bà Sài Gòn").length).toBeGreaterThan(0);
    expect(screen.queryByText("Hầm chỉ huy")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Nghe" }));
    expect(speak.mock.calls[0][0].text).toContain("1863");
  });

  it("hiện ảnh minh họa và bản đồ, có liên kết chỉ đường cho địa danh lân cận", () => {
    render(<App />);
    expect(screen.getByRole("img", { name: "Cổng chính & xe tăng" })).toBeInTheDocument();
    expect(screen.getByTestId("map")).toHaveAttribute("data-active", "gate");
    expect(screen.queryByText(/Chỉ đường đi bộ/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Địa danh lân cận" }));
    expect(screen.getByTestId("map")).toHaveAttribute("data-active", "notredame");
    expect(screen.getByText(/Chỉ đường đi bộ từ Dinh/).closest("a")).toHaveAttribute("href", expect.stringContaining("travelmode=walking"));
  });
});
