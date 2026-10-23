# Bản cập nhật bản đồ Dinh Độc Lập

## Thay đổi chính

- Bản đồ khuôn viên và các mặt bằng tầng được vẽ nội bộ bằng SVG/React Native; không tải Google Maps để hiển thị khuôn viên Dinh.
- Web có 8 sơ đồ tách biệt: khuôn viên, tầng hầm, tầng trệt, tầng 1, tầng 2, tầng 3, tầng 4 và sân thượng.
- Mobile cũng tách từng khu vực, đồng thời tách riêng tầng 4 và sân thượng.
- Các điểm được đánh số có thể bấm. Thuyết minh, mô tả ngắn và nút phát giọng đọc xuất hiện trong phần nội dung của điểm tham quan.
- Khi chọn điểm từ danh sách tham quan, bản đồ chuyển sang khu vực tương ứng.
- Các địa điểm ngoài Dinh không được đưa vào sơ đồ khuôn viên Dinh.

## File đã chỉnh

- `apps/web/src/MapView.jsx` — cấu trúc bản đồ SVG, các sơ đồ từng khu vực, marker tương tác và phần thuyết minh.
- `apps/web/src/styles.css` — giao diện xanh rêu/kem/vàng, tab khu vực và bố cục responsive.
- `apps/web/src/App.jsx` — chỉ hiển thị bản đồ Dinh cho các điểm thuộc Dinh; không còn liên kết Google Maps trong bản đồ Dinh.
- `apps/mobile/App.js` — tách khuôn viên và sơ đồ tầng, thêm tab sân thượng riêng và hành vi chọn điểm theo khu vực.

## Ghi chú

Các mặt bằng tầng là sơ đồ minh họa định hướng tham quan, không phải bản vẽ kiến trúc kỹ thuật. Nội dung thuyết minh dùng lại dữ liệu sẵn có của dự án.
