import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Supabase project URL used to scope runtime caching of REST + Storage calls
const SUPABASE_URL_PATTERN = /^https:\/\/[a-z0-9]+\.supabase\.co\/(rest|storage)\//

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Manual de Procesos',
        short_name: 'Manual',
        description: 'Manual vivo de procedimientos operativos',
        theme_color: '#4d7d68',
        background_color: '#f4f0e8',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'es',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff,woff2}'],
        // Don't precache source maps (saves cache space)
        globIgnores: ['**/*.map'],
        // Skip auth requests from precache; they should always go to network
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/auth/],
        runtimeCaching: [
          // Google Fonts: cache stylesheets (CSS) — stale-while-revalidate
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          // Google Fonts: cache font files — cache-first, 1 year
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Supabase Storage images (screenshots): cache-first, 30 days
          {
            urlPattern: ({ url }) =>
              /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\//.test(url.href),
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Supabase REST (data): network-first with cache fallback for offline reads
          {
            urlPattern: ({ url, request }) =>
              SUPABASE_URL_PATTERN.test(url.href) &&
              request.method === 'GET' &&
              url.pathname.startsWith('/rest/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-rest',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // disable SW during dev to avoid stale assets
      },
    }),
  ],
})
