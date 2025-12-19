import { defineConfig } from "vite";

export default defineConfig({
  root: __dirname,
  server: {
    port: 5173,
    allowedHosts: [
      "localhost",
      "unmeanderingly-nontheosophic-alex.ngrok-free.dev",
    ],
  },
  build: {
    outDir: "dist",
  },
});
