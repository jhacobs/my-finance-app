import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["better-sqlite3-multiple-ciphers", "argon2"],
    },
    lib: {
      entry: "src/main.ts",
      fileName: "main",
      formats: ["es"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
