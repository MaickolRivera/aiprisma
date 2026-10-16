import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  // laya-ts importa "onnxruntime-web" por nombre (lo resuelve el import map de index.html).
  // Si Vite lo pre-empaqueta, convierte ese import en un literal que intenta resolver en node_modules y falla.
  optimizeDeps: { exclude: ["laya-ts"] },
});
