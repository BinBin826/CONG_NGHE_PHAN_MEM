# Thuyết minh đa ngôn ngữ Dinh Độc Lập

Ứng dụng hướng dẫn tham quan **Dinh Độc Lập (Hội trường Thống Nhất)** với thuyết minh 5 ngôn ngữ:
🇻🇳 Tiếng Việt · 🇬🇧 English · 🇨🇳 中文 · 🇯🇵 日本語 · 🇰🇷 한국어.

Cấu trúc monorepo giống BookFlow: **React.js (web)** + **React Native / Expo (mobile)** + **package dùng chung** + **CI/CD GitHub Actions**.
Nội dung lấy từ **Supabase** (có bản dự phòng trong code); thuyết minh được **đọc bằng giọng nói của thiết bị** (Web Speech API trên web, `expo-speech` trên mobile).

## Chức năng

- Chọn ngôn ngữ (tự đoán theo ngôn ngữ thiết bị, web nhớ lựa chọn trong localStorage).
- 15 điểm tham quan trong Dinh, mỗi điểm có mô tả ngắn và bài thuyết minh đầy đủ 5 ngôn ngữ: cổng chính & xe tăng, lịch sử Dinh, kiến trúc Ngô Viết Thụ, Phòng Quốc thư, Phòng khánh tiết, Phòng tiếp khách của Tổng thống, Phòng họp Nội các, Phòng làm việc, khu sinh hoạt & phòng chiếu phim, sân thượng, hầm chỉ huy, khu vườn & máy bay F-5E, xe Jeep & Mercedes, nhà trưng bày, Hội trường Thống Nhất.
- Nghe / tạm dừng / dừng, điểm trước – điểm sau, chỉnh tốc độ đọc, hiển thị văn bản thuyết minh.
- "Bắt đầu tham quan": tự phát lần lượt các điểm.
- **Hình minh họa** cho cả 15 điểm (tự vẽ vector, không dùng ảnh có bản quyền) trong `packages/shared/images/`.
- Tìm kiếm điểm tham quan; cảnh báo nếu thiết bị chưa có giọng đọc cho ngôn ngữ đang chọn.
- **Sơ đồ tham quan**: web và mobile dùng chung một sơ đồ minh họa vẽ bằng SVG, gồm khuôn viên ngoài Dinh và từng tầng (hầm, trệt, tầng 1–4, sân thượng). Bấm vào khu vực để chọn điểm tương ứng.

## Cấu trúc

```text
DinhDocLapGuide/
├── apps/
│   ├── web/            # React + Vite (Web Speech API)
│   ├── mobile/         # React Native + Expo (expo-speech, react-native-svg)
│   └── dashboard/      # Trang quản trị (React + Vite + Supabase)
├── packages/shared/    # Dữ liệu 5 ngôn ngữ, chuỗi UI, helper, unit test
├── .github/workflows/
│   ├── ci.yml          # test + build web + export mobile
│   └── deploy-web.yml  # CD: deploy web lên GitHub Pages
├── supabase/           # schema.sql (bảng + phân quyền), seed.sql (dữ liệu mẫu)
└── package.json
```

## Thiết lập Supabase

1. Tạo project trên supabase.com. Vào Authentication → Sign In / Providers, tắt "Allow new users to sign up".
2. Mở SQL Editor, chạy `supabase/schema.sql` rồi `supabase/seed.sql`.
3. Tạo tài khoản ở Authentication → Users (Add user, tick Auto Confirm User), rồi gán vai trò trong SQL Editor:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'email-cua-ban');
   ```
   Chỉ vai trò `admin` và `editor` vào được dashboard.
4. Tạo file `.env` cho từng app theo `.env.example` (web và dashboard dùng `VITE_...`, mobile dùng `EXPO_PUBLIC_...`). Không đưa khóa `secret` hay `service_role` vào các file này.
5. Chạy lại ứng dụng. Sửa nội dung trong dashboard thì web và mobile nhận bản mới khi tải lại.


## Chạy

Yêu cầu Node.js 20+. Chạy tại thư mục gốc:

```bash
cd DinhDocLapGuide
npm install
npm run dev:all        # chạy cái này sẽ chạy cả web và dashboard luôn
npm run web:dev        # http://localhost:5173
npm run mobile:start   # quét QR bằng Expo Go
npm run dashboard:dev  # 
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
- **Sơ đồ tham quan** là hình vẽ minh họa SVG, không dùng bản đồ thật nên không cần Google Maps API key hay máy chủ tile. Dữ liệu sơ đồ nằm trong `apps/web/src/MapView.jsx` (web) và hàm `StopMap` trong `apps/mobile/App.js` (mobile), hai nơi cần giữ đồng bộ.
- **Mobile**: chạy trong Expo Go không cần khoá, dùng thư viện `react-native-svg` để vẽ sơ đồ.

## Thêm ngôn ngữ / điểm tham quan

- Ngôn ngữ: thêm vào `LANGUAGES` và `ui`, rồi thêm bản dịch cho mọi `stops[*]` (test sẽ báo thiếu).
- Điểm: thêm object vào `packages/shared/places.js` (`palaceMore`) với `title`, `floor`, `summary`, `text` đủ 5 ngôn ngữ, rồi thêm `id` vào `TOUR_ORDER` trong `index.js`, gán điểm vào khu vực/tầng tương ứng trong `apps/web/src/MapView.jsx` (và dữ liệu sơ đồ trong `apps/mobile/App.js`), thêm ảnh `images/<id>.png` và dòng `require` trong `apps/mobile/images.js`.

## Lưu ý

- Nội dung thuyết minh là bản demo; **cần đối chiếu với tư liệu chính thức** của Hội trường Thống Nhất và nhờ người bản ngữ rà soát bản dịch trước khi dùng thật.
- Chất lượng giọng đọc phụ thuộc thiết bị. Nếu thiếu giọng (thường là tiếng Việt/Hàn trên Linux/Android cũ), hãy cài thêm trong cài đặt hệ thống.
- Hướng nâng cấp: file audio thu sẵn (MP3) theo từng ngôn ngữ để giọng ổn định và chạy offline; QR/GPS kích hoạt theo vị trí; backend + CMS để cập nhật nội dung.
- Sơ đồ khuôn viên và các tầng chỉ mang tính minh họa, không theo tỷ lệ thật; vị trí phòng cần đối chiếu với tư liệu chính thức. Mô tả khu sinh hoạt gia đình dựa trên một nguồn hướng dẫn tham quan, cần kiểm chứng.
