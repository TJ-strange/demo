import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages 项目站路径为 /demo/；本地开发也可用这个 base，
// 访问 http://localhost:5173/demo/
export default defineConfig({
  base: "/demo/",
  plugins: [react()],
});
