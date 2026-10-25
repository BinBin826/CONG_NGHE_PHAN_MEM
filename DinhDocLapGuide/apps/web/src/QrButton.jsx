import { useEffect, useState } from "react";
import QRCode from "qrcode";
import "./qr.css";

// QR mở giao diện dành cho điện thoại (bản web của app Expo, đặt ở thư mục /m/).
// VITE_MOBILE_URL là địa chỉ thật sau khi deploy; chưa có thì lấy theo địa chỉ trang đang mở.
const defaultUrl = () => {
  const explicit = import.meta.env.VITE_MOBILE_URL;
  const base = explicit || (import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:8081/`
    : `${window.location.origin}${import.meta.env.BASE_URL}m/`);
  return `${base.replace(/\/?$/, "/")}?src=qr`;
};
const isLocal = (u) => /^(https?:\/\/)?(localhost|127\.|0\.0\.0\.0)/i.test(u.trim());

export default function QrButton() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [svg, setSvg] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (open && !url) setUrl(defaultUrl()); }, [open, url]);

  useEffect(() => {
    if (!open || !url.trim()) { setSvg(""); return undefined; }
    let alive = true;
    QRCode.toString(url.trim(), { type: "svg", margin: 2, errorCorrectionLevel: "M" })
      .then((s) => { if (alive) setSvg(s); })
      .catch(() => { if (alive) setSvg(""); });
    return () => { alive = false; };
  }, [open, url]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url.trim()); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { /* bỏ qua */ }
  };
  const src = svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : "";

  return (
    <>
      <button type="button" className="lang staff-link" onClick={() => setOpen(true)}>📱 QR</button>
      {open && (
        <div className="qr-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="qr-card" role="dialog" aria-modal="true" aria-label="Mã QR mở trên điện thoại">
            <button type="button" className="qr-close" onClick={() => setOpen(false)} aria-label="Đóng" autoFocus>×</button>
            <h2>Mở trên điện thoại</h2>
            <p className="qr-hint">Mở camera trên điện thoại và quét mã bên dưới.</p>
            <div className="qr-img">{src ? <img src={src} alt="Mã QR mở trang web" width="240" height="240" /> : <span>Đang tạo mã…</span>}</div>
            <label className="qr-label">Địa chỉ trong mã QR
              <input value={url} onChange={(e) => setUrl(e.target.value)} spellCheck={false} />
            </label>
            {isLocal(url) && (
              <p className="qr-warn" role="note">
                Địa chỉ này chỉ mở được trên máy tính của bạn. Để thử trên điện thoại cùng wifi, chạy
                <b>npm run mobile:web</b> rồi dùng địa chỉ dạng <b>http://192.168.x.x:8081/?src=qr</b>,
                hoặc dùng địa chỉ trang đã đưa lên mạng.
              </p>
            )}
            <div className="qr-actions">
              <button type="button" onClick={copy}>{copied ? "Đã sao chép" : "Sao chép địa chỉ"}</button>
              {src && <a href={src} download="qr-thuyet-minh-dinh-doc-lap.svg">Tải mã QR</a>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
