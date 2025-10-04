import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@images": path.resolve(__dirname, "./src/assets/images"),
      "@icons": path.resolve(__dirname, "./src/assets/icons"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  root: ".",
  build: {
    outDir: "dist",
  },
});
