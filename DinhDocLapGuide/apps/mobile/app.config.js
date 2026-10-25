// Bổ sung cấu hình để xuất app Expo thành trang web (chạy trên trình duyệt điện thoại).
// Nội dung trong app.json được giữ nguyên. Khi deploy vào thư mục con, đặt EXPO_BASE_URL (ví dụ /ten-kho/m).
module.exports = ({ config }) => ({
  ...config,
  web: { ...(config.web || {}), bundler: "metro", output: "single" },
  experiments: { ...(config.experiments || {}), baseUrl: process.env.EXPO_BASE_URL || undefined }
});
