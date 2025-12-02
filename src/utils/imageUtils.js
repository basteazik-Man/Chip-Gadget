// src/utils/imageUtils.js
// Утилиты для работы с изображениями

/**
 * Сжимает изображение до указанных размеров и качества
 * @param {File} file - Файл изображения
 * @param {Object} options - Параметры сжатия
 * @param {number} options.maxWidth - Максимальная ширина (по умолчанию 1200)
 * @param {number} options.maxHeight - Максимальная высота (по умолчанию 1200)
 * @param {number} options.quality - Качество (0-1, по умолчанию 0.8)
 * @param {number} options.maxSizeKB - Максимальный размер в КБ (по умолчанию 500)
 * @returns {Promise<string>} - Base64 строка сжатого изображения
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      maxSizeKB = 500
    } = options;

    // Проверяем, является ли файл изображением
    if (!file.type.match('image.*')) {
      reject(new Error('Файл не является изображением'));
      return;
    }

    // Проверяем размер файла
    if (file.size > maxSizeKB * 1024) {
      console.log(`Изображение слишком большое (${(file.size / 1024).toFixed(2)}KB), сжимаем...`);
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Создаем canvas для сжатия
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Рассчитываем новые размеры с сохранением пропорций
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        // Устанавливаем размеры canvas
        canvas.width = width;
        canvas.height = height;
        
        // Заполняем canvas белым фоном для PNG с прозрачностью
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Рисуем изображение
        ctx.drawImage(img, 0, 0, width, height);
        
        // Получаем base64 с нужным качеством
        const compressedBase64 = canvas.toDataURL(file.type, quality);
        
        // Проверяем размер после сжатия
        const base64Size = (compressedBase64.length * 3) / 4; // Примерный размер в байтах
        
        if (base64Size > maxSizeKB * 1024) {
          // Если все еще слишком большое, сжимаем сильнее
          console.log('Повторное сжатие с более низким качеством...');
          const lowerQuality = Math.max(0.3, quality - 0.2);
          const moreCompressed = canvas.toDataURL(file.type, lowerQuality);
          resolve(moreCompressed);
        } else {
          resolve(compressedBase64);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Ошибка загрузки изображения'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Создает миниатюру изображения
 * @param {string} base64 - Base64 строка исходного изображения
 * @param {number} width - Ширина миниатюры (по умолчанию 200)
 * @param {number} height - Высота миниатюры (по умолчанию 200)
 * @returns {Promise<string>} - Base64 строка миниатюры
 */
export const createThumbnail = (base64, width = 200, height = 200) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Устанавливаем размеры для миниатюры
      canvas.width = width;
      canvas.height = height;
      
      // Заполняем фон белым
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      
      // Рисуем изображение по центру с сохранением пропорций
      const scale = Math.min(width / img.width, height / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;
      
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    
    img.onerror = () => {
      reject(new Error('Ошибка создания миниатюры'));
    };
    
    img.src = base64;
  });
};

/**
 * Проверяет, является ли файл изображением
 * @param {File} file - Файл для проверки
 * @returns {boolean}
 */
export const isImageFile = (file) => {
  return file.type.match('image.*') !== null;
};

/**
 * Проверяет размер файла
 * @param {File} file - Файл для проверки
 * @param {number} maxSizeMB - Максимальный размер в МБ
 * @returns {Object} - { isValid: boolean, sizeMB: number, error: string }
 */
export const validateFileSize = (file, maxSizeMB = 5) => {
  const sizeMB = file.size / (1024 * 1024);
  
  if (sizeMB > maxSizeMB) {
    return {
      isValid: false,
      sizeMB: sizeMB.toFixed(2),
      error: `Файл слишком большой (${sizeMB.toFixed(2)}MB). Максимум: ${maxSizeMB}MB`
    };
  }
  
  return {
    isValid: true,
    sizeMB: sizeMB.toFixed(2),
    error: null
  };
};

/**
 * Получает размеры изображения из base64
 * @param {string} base64 - Base64 строка изображения
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (base64) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height
      });
    };
    
    img.onerror = () => {
      reject(new Error('Не удалось получить размеры изображения'));
    };
    
    img.src = base64;
  });
};

/**
 * Конвертирует base64 в Blob
 * @param {string} base64 - Base64 строка
 * @returns {Blob}
 */
export const base64ToBlob = (base64) => {
  const byteString = atob(base64.split(',')[1]);
  const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
};

/**
 * Конвертирует base64 в File
 * @param {string} base64 - Base64 строка
 * @param {string} filename - Имя файла
 * @returns {File}
 */
export const base64ToFile = (base64, filename) => {
  const blob = base64ToBlob(base64);
  return new File([blob], filename, { type: blob.type });
};

/**
 * Массовое сжатие нескольких изображений
 * @param {File[]} files - Массив файлов изображений
 * @param {Object} options - Параметры сжатия
 * @returns {Promise<Array<{original: File, compressed: string, thumbnail: string}>>}
 */
export const compressMultipleImages = async (files, options = {}) => {
  const results = [];
  
  for (const file of files) {
    try {
      // Сжимаем основное изображение
      const compressed = await compressImage(file, options);
      
      // Создаем миниатюру
      const thumbnail = await createThumbnail(compressed);
      
      results.push({
        original: file,
        compressed,
        thumbnail,
        name: file.name,
        type: file.type,
        size: file.size,
        compressedSize: compressed.length
      });
    } catch (error) {
      console.error(`Ошибка сжатия ${file.name}:`, error);
      // Если не удалось сжать, используем оригинал как base64
      const reader = new FileReader();
      const originalBase64 = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      
      const thumbnail = await createThumbnail(originalBase64);
      
      results.push({
        original: file,
        compressed: originalBase64,
        thumbnail,
        name: file.name,
        type: file.type,
        size: file.size,
        compressedSize: originalBase64.length,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Рассчитывает примерный размер base64 в КБ
 * @param {string} base64 - Base64 строка
 * @returns {number} - Размер в КБ
 */
export const estimateBase64SizeKB = (base64) => {
  // Примерная формула: размер в байтах ≈ (base64.length * 3) / 4
  const bytes = (base64.length * 3) / 4;
  return Math.round(bytes / 1024);
};

/**
 * Удаляет EXIF данные (поворот) из изображения
 * @param {string} base64 - Base64 строка изображения
 * @returns {Promise<string>} - Base64 строка без EXIF
 */
export const removeExifRotation = (base64) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Устанавливаем правильную ориентацию
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Заполняем фон
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем без поворота
      ctx.drawImage(img, 0, 0);
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    img.onerror = () => {
      reject(new Error('Ошибка обработки EXIF'));
    };
    
    img.src = base64;
  });
};

/**
 * Оптимизирует изображение для web (автоматический выбор параметров)
 * @param {File} file - Файл изображения
 * @returns {Promise<string>} - Оптимизированное base64 изображение
 */
export const optimizeForWeb = async (file) => {
  // Определяем параметры в зависимости от типа изображения
  const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
  const isPng = file.type === 'image/png';
  const isWebP = file.type === 'image/webp';
  
  const options = {
    maxWidth: 1200,
    maxHeight: 1200,
    maxSizeKB: 300 // Более агрессивное сжатие для web
  };
  
  // Разное качество для разных форматов
  if (isJpeg) {
    options.quality = 0.7;
  } else if (isPng) {
    options.quality = 0.8; // PNG сжимается иначе
  } else if (isWebP) {
    options.quality = 0.6; // WebP лучше сжимается
  } else {
    options.quality = 0.8;
  }
  
  try {
    const compressed = await compressImage(file, options);
    
    // Если все еще слишком большой, сжимаем сильнее
    const sizeKB = estimateBase64SizeKB(compressed);
    if (sizeKB > 300) {
      console.log(`Изображение все еще большое (${sizeKB}KB), дополнительное сжатие...`);
      return await compressImage(file, { ...options, quality: 0.5 });
    }
    
    return compressed;
  } catch (error) {
    console.error('Ошибка оптимизации:', error);
    throw error;
  }
};

/**
 * Проверяет и валидирует изображение перед загрузкой
 * @param {File} file - Файл изображения
 * @param {Object} options - Параметры валидации
 * @returns {Promise<{isValid: boolean, errors: string[], file: File, preview: string}>}
 */
export const validateAndProcessImage = async (file, options = {}) => {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    maxWidth = 4000,
    maxHeight = 4000
  } = options;
  
  const errors = [];
  
  // Проверка типа файла
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Неподдерживаемый формат: ${file.type}. Разрешены: ${allowedTypes.join(', ')}`);
  }
  
  // Проверка размера файла
  const sizeCheck = validateFileSize(file, maxSizeMB);
  if (!sizeCheck.isValid) {
    errors.push(sizeCheck.error);
  }
  
  // Если есть ошибки, возвращаем их
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      file,
      preview: null
    };
  }
  
  try {
    // Создаем preview
    const preview = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
    
    // Проверяем размеры изображения
    const dimensions = await getImageDimensions(preview);
    if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
      errors.push(`Изображение слишком большое: ${dimensions.width}x${dimensions.height}. Максимум: ${maxWidth}x${maxHeight}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      file,
      preview,
      dimensions
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Ошибка обработки изображения: ${error.message}`],
      file,
      preview: null
    };
  }
};

// Экспорт по умолчанию для удобства
export default {
  compressImage,
  createThumbnail,
  isImageFile,
  validateFileSize,
  getImageDimensions,
  base64ToBlob,
  base64ToFile,
  compressMultipleImages,
  estimateBase64SizeKB,
  removeExifRotation,
  optimizeForWeb,
  validateAndProcessImage
};