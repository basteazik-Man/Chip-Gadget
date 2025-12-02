import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// ЗАКОММЕНТИРОВАНО: временно отключаем PWA
// import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // ЗАКОММЕНТИРОВАНО: временно отключаем PWA
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.svg', 'favicon.ico', 'logo-192.png', 'logo-512.png'],
    //   manifest: {
    //     name: 'Чип&Гаджет Ремонт',
    //     short_name: 'Чип&Гаджет',
    //     description: 'Ремонт электроники: смартфоны, планшеты, ноутбуки',
    //     theme_color: '#2563EB',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     scope: '/',
    //     start_url: '/',
    //     icons: [
    //       {
    //         src: 'logo-192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //       },
    //       {
    //         src: 'logo-512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //       },
    //       {
    //         src: 'logo-512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable',
    //       },
    //     ],
    //   }
    // })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false, // Отключаем sourcemaps для уменьшения ошибок
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  // Для Beget хостинга используем абсолютные пути
  base: '/'
});