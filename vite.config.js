import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import basicSsl from "@vitejs/plugin-basic-ssl";
import viteCompression from "vite-plugin-compression";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const localLeaderboardPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "local-leaderboard.json",
);

const readLocalLeaderboard = async () => {
  try {
    const contents = await fs.readFile(localLeaderboardPath, "utf8");
    if (!contents.trim()) return [];

    const entries = JSON.parse(contents);
    if (!Array.isArray(entries)) {
      throw new Error("Local leaderboard data must be a JSON array.");
    }
    return entries;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
};

const readRequestBody = (request) =>
  new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10000) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });

const localLeaderboardPlugin = () => ({
  name: "local-leaderboard",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use("/api/leaderboard", async (request, response, next) => {
      if (request.method !== "GET" && request.method !== "POST") {
        next();
        return;
      }

      try {
        if (request.method === "GET") {
          const entries = await readLocalLeaderboard();
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify(entries));
          return;
        }

        const entry = JSON.parse(await readRequestBody(request));
        const entries = await readLocalLeaderboard();
        const existingIndex = entries.findIndex((savedEntry) => savedEntry.id === entry.id);

        if (existingIndex >= 0) {
          entries[existingIndex] = entry;
        } else {
          entries.push(entry);
        }

        await fs.writeFile(localLeaderboardPath, `${JSON.stringify(entries, null, 2)}\n`);
        response.statusCode = 201;
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(entry));
      } catch (error) {
        response.statusCode = 400;
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ error: error.message }));
      }
    });
  },
});

export default defineConfig({
  plugins: [
    localLeaderboardPlugin(),
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
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 15000000,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg}"],
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
            handler: "NetworkFirst",
            options: {
              cacheName: "artifact-supabase-images",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /.*\.mind.*/i,
            handler: "NetworkFirst", 
            options: {
              cacheName: "artifact-ar-targets",
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
