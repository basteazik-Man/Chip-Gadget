import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// ВРЕМЕННО КОММЕНТИРУЕМ PWA для отладки
// import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // ВРЕМЕННО КОММЕНТИРУЕМ PWA для отладки
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.svg', 'logo-192.png', 'logo-512.png'],
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
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  base: '/'
});