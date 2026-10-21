import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.svg",
        "kesh.png",
      ],

      manifest: {
        id: "/",
        name: "VibeHub",
        short_name: "VibeHub",
        description:
          "Connect, share moments, exchange support, and build meaningful vibes with VibeHub.",

        start_url: "/",
        scope: "/",
        display: "standalone",

        background_color: "#ffffff",
        theme_color: "#7c3aed",

        icons: [
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        // Cache only the static application shell.
        // Do not add runtime caching for Supabase or private user data.
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,woff2}",
        ],

        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],

  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg"],
  },
});

