import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Saat pengembangan, /api/* diteruskan ke server Express lokal (npm run api).
  server: { proxy: { '/api': 'http://localhost:3000' } },
  preview: { proxy: { '/api': 'http://localhost:3000' } },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'PokeDraft Guide',
        short_name: 'PokeDraft',
        description: 'Panduan roster dan meta strategi tim PokeDraft',
        theme_color: '#ef4444',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Cangkang aplikasi (termasuk font dan foto profil) tersimpan di perangkat agar bisa dibuka offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        // Hanya subset font latin yang dipakai teks aplikasi; subset lain tidak perlu disimpan.
        globIgnores: ['**/*-{cyrillic,cyrillic-ext,vietnamese,greek,greek-ext,symbols2,latin-ext}-*.woff2'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Data API: ambil dari jaringan, jika offline pakai salinan terakhir.
            urlPattern: ({ url, request }) => url.pathname.startsWith('/api/') && request.method === 'GET',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pokedraft-api',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Artwork Pokémon: tersimpan setelah pernah dilihat, jadi tampil juga saat offline.
            urlPattern: ({ url }) => url.hostname === 'raw.githubusercontent.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokedraft-artwork',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
