// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command }) => {
  const isDev = command === "serve";

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "prompt",
        includeAssets: ["icon-192.png", "icon-512.png", "maskable-192.png", "maskable-512.png"],
        manifest: false, // usaremos public/manifest.webmanifest
        workbox: isDev
          ? {
              navigateFallback: "/index.html",
              globPatterns: [],
              globIgnores: ["**/node_modules/**/*"]
            }
          : {
              navigateFallback: "/index.html",
              globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,json,txt}"],
              globIgnores: ["**/node_modules/**/*", "sw.js", "workbox-*.js"]
            },
        devOptions: {
          enabled: true
        }
      })
    ]
  };
});
