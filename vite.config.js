import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo-192.png', 'logo-512.png'],
      manifest: {
        name: 'Чип&Гаджет Ремонт',
        short_name: 'Чип&Гаджет',
        description: 'Ремонт электроники: смартфоны, планшеты, ноутбуки',
        theme_color: '#2563EB',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      }
    })
  ],
  build: {
    outDir: 'dist',
    // Добавьте эту настройку для правильных путей
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  // Попробуйте изменить base в зависимости от структуры на Beget
  base: './', // или '/', или оставьте пустым ''
});