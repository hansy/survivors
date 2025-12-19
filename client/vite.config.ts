import { defineConfig } from "vite";

export default defineConfig({
  root: __dirname,
  server: {
    port: 5173,
    allowedHosts: [
      "localhost",
      "unmeanderingly-nontheosophic-alex.ngrok-free.dev",
    ],
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
