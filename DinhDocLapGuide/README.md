# Thuyết minh đa ngôn ngữ Dinh Độc Lập

Ứng dụng hướng dẫn tham quan **Dinh Độc Lập (Hội trường Thống Nhất)** với thuyết minh 5 ngôn ngữ:
🇻🇳 Tiếng Việt · 🇬🇧 English · 🇨🇳 中文 · 🇯🇵 日本語 · 🇰🇷 한국어.

Cấu trúc monorepo giống BookFlow: **React.js (web)** + **React Native / Expo (mobile)** + **package dùng chung** + **CI/CD GitHub Actions**.
Chưa có backend: thuyết minh được **đọc bằng giọng nói của thiết bị** (Web Speech API trên web, `expo-speech` trên mobile).

## Chức năng
- Chọn ngôn ngữ (tự đoán theo ngôn ngữ thiết bị, web nhớ lựa chọn trong localStorage).
- 20 điểm, chia 2 tab, mỗi điểm có mô tả ngắn và bài thuyết minh đầy đủ 5 ngôn ngữ:
  - **Trong Dinh (15)**: cổng chính & xe tăng, lịch sử Dinh, kiến trúc Ngô Viết Thụ, Phòng Quốc thư, Phòng khánh tiết, Phòng tiếp khách của Tổng thống, Phòng họp Nội các, Phòng làm việc, khu sinh hoạt & phòng chiếu phim, sân thượng, hầm chỉ huy, khu vườn & máy bay F-5E, xe Jeep & Mercedes, nhà trưng bày, Hội trường Thống Nhất.
  - **Địa danh lân cận (5)**: Nhà thờ Đức Bà, Bưu điện Trung tâm, Bảo tàng TP.HCM (Dinh Gia Long), Bảo tàng Chứng tích Chiến tranh, Chợ Bến Thành.
- Nghe / tạm dừng / dừng, điểm trước – điểm sau, chỉnh tốc độ đọc, hiển thị văn bản thuyết minh.
- "Bắt đầu tham quan": tự phát lần lượt các điểm.
- **Hình minh họa** cho cả 20 điểm (tự vẽ vector, không dùng ảnh có bản quyền) trong `packages/shared/images/`.
- **Bản đồ**: web dùng OpenStreetMap (Leaflet), mobile dùng `react-native-maps`. Bản đồ hiện Dinh và 5 địa danh lân cận, bấm marker để chọn điểm; có nút mở Google Maps và chỉ đường đi bộ từ Dinh.
- Tìm kiếm điểm tham quan; cảnh báo nếu thiết bị chưa có giọng đọc cho ngôn ngữ đang chọn.

## Cấu trúc
```text
DinhDocLapGuide/
├── apps/
│   ├── web/            # React + Vite (Web Speech API)
│   └── mobile/         # React Native + Expo (expo-speech)
├── packages/shared/    # Dữ liệu 5 ngôn ngữ, chuỗi UI, helper, unit test
├── .github/workflows/
│   ├── ci.yml          # test + build web + export mobile
│   └── deploy-web.yml  # CD: deploy web lên GitHub Pages
└── package.json
```

## Chạy
Yêu cầu Node.js 20+. Chạy tại thư mục gốc:
```bash
npm install
npm run web:dev        # http://localhost:5173
npm run mobile:start   # quét QR bằng Expo Go
npm test               # test shared + web
npm run web:build
```

## CI/CD
- `ci.yml`: mỗi push/PR vào `main`/`develop` → cài đặt, test, build web, export mobile, lưu artifact `web-dist`.
- `deploy-web.yml`: push vào `main` → test, build với `VITE_BASE=/<tên-repo>/`, deploy GitHub Pages
  (bật **Settings → Pages → Source: GitHub Actions** một lần).
- Phát hành mobile lên Google Play/App Store chưa có. Hướng tiếp theo: EAS Build/Submit (`eas.json` + token `EXPO_TOKEN`).

## Hình ảnh và bản đồ
- **Dùng ảnh thật thay hình minh họa**: ghi đè file `packages/shared/images/<id>.png` (giữ nguyên tên, ví dụ `gate.png`). Chỉ dùng ảnh bạn chụp hoặc có giấy phép; nếu lấy từ Wikimedia Commons thì phải ghi nguồn theo giấy phép của ảnh.
- **Vẽ lại hình minh họa**: `python3 tools/gen_illustrations.py` (cần `pip install playwright` và Chromium; đặt `CHROMIUM_PATH` nếu cần).
- **Toạ độ** nằm trong `packages/shared/index.js` (`PALACE_COORDS`, `NEARBY_COORDS`) và là ước lượng; hãy kiểm tra lại trên bản đồ thật. Các điểm trong Dinh dùng chung toạ độ của Dinh.
- **Ảnh nền bản đồ web** lấy từ máy chủ OpenStreetMap, phù hợp cho demo và lưu lượng nhỏ. Nếu phát hành rộng, hãy dùng nhà cung cấp tile riêng theo [chính sách tile của OSM](https://operations.osmfoundation.org/policies/tiles/).
- **Mobile**: chạy trong Expo Go không cần khoá. Khi build bản cài độc lập cho Android, cần Google Maps API key trong `app.json` (`expo.android.config.googleMaps.apiKey`); iOS dùng Apple Maps mặc định.

## Thêm ngôn ngữ / điểm tham quan
- Ngôn ngữ: thêm vào `LANGUAGES` và `ui`, rồi thêm bản dịch cho mọi `stops[*]` (test sẽ báo thiếu).
- Điểm: thêm object vào `packages/shared/places.js` (`palaceMore` hoặc `nearby`) với `title`, `floor`, `summary`, `text` đủ 5 ngôn ngữ, rồi thêm `id` vào `TOUR_ORDER` trong `index.js`, thêm toạ độ (nếu là địa danh lân cận), thêm ảnh `images/<id>.png` và dòng `require` trong `apps/mobile/images.js`.

## Lưu ý
- Vị trí phòng được ghi theo khu vực, không ghi số tầng, vì các nguồn tham khảo không thống nhất. Khoảng cách và toạ độ địa danh lân cận là ước lượng. Mô tả khu sinh hoạt gia đình dựa trên một nguồn hướng dẫn tham quan, cần kiểm chứng.
- Nội dung thuyết minh là bản demo; **cần đối chiếu với tư liệu chính thức** của Hội trường Thống Nhất và nhờ người bản ngữ rà soát bản dịch trước khi dùng thật.
- Chất lượng giọng đọc phụ thuộc thiết bị. Nếu thiếu giọng (thường là tiếng Việt/Hàn trên Linux/Android cũ), hãy cài thêm trong cài đặt hệ thống.
- Hướng nâng cấp: file audio thu sẵn (MP3) theo từng ngôn ngữ để giọng ổn định và chạy offline; QR/GPS kích hoạt theo vị trí; backend + CMS để cập nhật nội dung.
