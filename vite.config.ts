import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'

function git(args: string): string {
  try {
    return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return ''
  }
}

const APP_BUILD = {
  commit: process.env.VERCEL_GIT_COMMIT_SHA || git('rev-parse HEAD'),
  branch: process.env.VERCEL_GIT_COMMIT_REF || git('rev-parse --abbrev-ref HEAD'),
  env: process.env.VERCEL_ENV || 'local',
  builtAt: new Date().toISOString(),
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_BUILD__: JSON.stringify(APP_BUILD),
  },

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
        target: process.env.API_PROXY_TARGET ?? 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
