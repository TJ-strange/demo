import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const indexHtml = join(distDir, "index.html");
const notFoundHtml = join(distDir, "404.html");

if (!existsSync(indexHtml)) {
  throw new Error("dist/index.html does not exist. Run vite build before preparing GitHub Pages.");
}

// GitHub Pages 对 SPA 子路由没有服务器 fallback。
// 复制一份 index.html 为 404.html 后，/demo/tasks/task-media 这类直达路径也会回到 React 应用。
copyFileSync(indexHtml, notFoundHtml);

console.log("Prepared GitHub Pages fallback: dist/404.html");
