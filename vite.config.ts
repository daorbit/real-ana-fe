import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // `CLOUDFLARE_SITE_KEY` already exists under that exact name, and Vite only
  // exposes `VITE_`-prefixed variables by default — so the prefix list is
  // widened rather than the variable renamed. Only the *site* key matches:
  // `CLOUDFLARE_SECRET_KEY` is a backend variable, is never set in this
  // project's env files, and must never be bundled. Widening the prefix to
  // `CLOUDFLARE_` rather than `CLOUDFLARE_SITE` would be enough rope to ship
  // the secret to the browser the day someone pastes it into the wrong .env.
  envPrefix: ['VITE_', 'CLOUDFLARE_SITE_KEY'],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // The entry is split by route (React.lazy in App.tsx), so the remaining
    // "large" chunks are deliberate vendor bundles, not an oversight.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Pull the biggest third-party libraries into their own long-lived
        // chunks. They change far less often than app code, so a deploy that
        // only touches features leaves these cached in the browser. Written as
        // a function because this toolchain types `manualChunks` that way.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]react(-dom|-router-dom)?[\\/]/.test(id)) return 'vendor-react';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
          if (id.includes('@mantine')) return 'vendor-mantine';
          if (id.includes('i18next')) return 'vendor-i18n';
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
