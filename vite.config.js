import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react()
    // УБИРАЕМ PWA ПЛАГИН
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  base: './'
});