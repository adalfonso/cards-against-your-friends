import path from "path";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  root: "./client",
  build: { outDir: "../dist/client" },
  plugins: [preact()],
  resolve: {
    alias: {
      "@common": path.resolve(__dirname, "./common"),
    },
  },
});
