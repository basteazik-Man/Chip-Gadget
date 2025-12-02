import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    
    // ⚙️ ИСПРАВЛЕННАЯ КОНФИГУРАЦИЯ PWA ДЛЯ BEGET
    VitePWA({
      // 🔧 ОСНОВНЫЕ НАСТРОЙКИ
      registerType: 'autoUpdate',
      injectRegister: 'auto', // Важно! Автоматически инжектирует registerSW.js
      
      // 🔧 ФАЙЛЫ ДЛЯ КЭШИРОВАНИЯ
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'logo-192.png',
        'logo-512.png',
        'robots.txt',
        'apple-touch-icon.png'
      ],
      
      // 🔧 КОНФИГУРАЦИЯ SERVICE WORKER
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        
        // Безопасное кэширование для SPA
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 дней
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 дней
              }
            }
          }
        ]
      },
      
      // 🔧 МАНИФЕСТ
      manifest: {
        name: 'Чип&Гаджет Ремонт',
        short_name: 'Чип&Гаджет',
        description: 'Ремонт смартфонов, планшетов, ноутбуков и телевизоров',
        theme_color: '#2563EB',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'ru',
        dir: 'ltr',
        
        icons: [
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        
        // 🔧 ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ
        categories: ['utilities', 'productivity'],
        shortcuts: [
          {
            name: 'Посмотреть цены',
            short_name: 'Цены',
            description: 'Узнать стоимость ремонта',
            url: '/services',
            icons: [{ src: 'logo-192.png', sizes: '192x192' }]
          },
          {
            name: 'Заказать доставку',
            short_name: 'Доставка',
            description: 'Заказать бесплатную доставку',
            url: '/delivery',
            icons: [{ src: 'logo-192.png', sizes: '192x192' }]
          }
        ]
      },
      
      // 🔧 НАСТРОЙКИ РАЗРАБОТКИ
      devOptions: {
        enabled: false, // Отключаем в продакшене
        type: 'module'
      },
      
      // 🔧 ДОПОЛНИТЕЛЬНЫЕ ОПЦИИ
      minify: true,
      sourcemap: false,
      outDir: 'dist'
    })
  ],
  
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    // Оптимизация для PWA
    target: 'es2020',
    minify: 'terser',
    cssCodeSplit: true,
    reportCompressedSize: false
  },
  
  // Для Beget используем корневой путь
  base: './'
});