import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // 👈 Добавлен импорт PWA

export default defineConfig({
  plugins: [
    react(),
    
    // ⚙️ КОНФИГУРАЦИЯ PWA
    VitePWA({
      registerType: 'autoUpdate', 
      
      // Иконки и ассеты, которые нужно кэшировать
      includeAssets: ['favicon.svg', 'logo-192.png', 'logo-512.png'], 
      
      manifest: {
        name: 'Чип&Гаджет Ремонт',
        short_name: 'Чип&Гаджет',
        description: 'Ремонт электроники: смартфоны, планшеты, ноутбуки',
        theme_color: '#2563EB', // Цвет шапки (для Android)
        background_color: '#ffffff', // Цвет фона при загрузке (важно для устранения "клеточки")
        display: 'standalone', // Запуск как отдельное приложение
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
          // 💡 Важно: эта запись нужна для адаптивных иконок Android и для решения проблемы с фоном
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
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  base: ''
});