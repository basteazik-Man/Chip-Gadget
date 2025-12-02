// Скрипт для фиксации путей после сборки
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, 'dist');

// Удаляем старые сервис-воркеры если есть
const swFiles = [
  'service-worker.js',
  'sw.js',
  'registerSW.js',
  'workbox-*.js'
];

swFiles.forEach(pattern => {
  try {
    const files = fs.readdirSync(distPath).filter(f => f.includes(pattern.replace('*', '')));
    files.forEach(file => {
      fs.unlinkSync(path.join(distPath, file));
      console.log(`Удален: ${file}`);
    });
  } catch (e) {
    // Игнорируем ошибки
  }
});

// Проверяем наличие .htaccess
const htaccessPath = path.join(distPath, '.htaccess');
if (!fs.existsSync(htaccessPath)) {
  fs.copyFileSync(
    path.join(__dirname, 'public/.htaccess'),
    htaccessPath
  );
  console.log('Скопирован .htaccess в dist');
}

console.log('✅ Файлы подготовлены для Beget');