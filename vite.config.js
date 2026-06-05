import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import basicSsl from "@vitejs/plugin-basic-ssl";
import viteCompression from "vite-plugin-compression"; 

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 10240, 
      filter: /\.(js|mjs|json|css|html|mind)$/i, 
      deleteOriginFile: false,
    }),

    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 10240,
      filter: /\.(js|mjs|json|css|html|mind)$/i, 
      deleteOriginFile: false,
    }),

    VitePWA({
      registerType: "autoUpdate",

      devOptions: {
        //enabled: true,
      },

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "targets.mind",
      ],
      manifest: {
        name: "ArtiFact",
        short_name: "ArtiFact",
        theme_color: "#16120c",
        background_color: "#16120c",
        display: "standalone",
        start_url: "/?mode=standalone",
        orientation: "portrait",
        icons: [
          {
            src: "/logo_trans.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/logo_trans.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 15000000,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,mind}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern:
              /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "artifact-supabase-images",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, 
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion")) return "vendor-framer";
            if (id.includes("@supabase")) return "vendor-supabase";
            if (id.includes("react-router-dom") || id.includes("react-router"))
              return "vendor-router";

            return "vendor";
          }
        },
      },
    },
  },
});