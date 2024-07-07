import path from "path";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  root: "./client",
  build: { outDir: "../dist/client" },
  plugins: [preact()],
  resolve: {
    alias: {
      "@server": path.resolve(__dirname, "./server"),
      "@common": path.resolve(__dirname, "./common"),
    },
  },
});
