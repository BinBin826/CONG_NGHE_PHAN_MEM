import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Khi deploy GitHub Pages: VITE_BASE=/<ten-repo>/
  base: process.env.VITE_BASE || "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.js"],
    include: ["src/**/*.test.{js,jsx}", "../../packages/shared/*.test.js"]
  }
});
