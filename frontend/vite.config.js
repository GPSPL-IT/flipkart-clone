import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    // Proxy /api calls to the backend during local development.
    // This removes the need for a hardcoded VITE_API_URL in dev.
    proxy: {
      '/api': {
        target:      'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
