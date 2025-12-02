// src/utils/productUtils.js (обновленная версия)
// Утилиты для работы с товарами

import { compressImage, optimizeForWeb } from './imageUtils';

export const normalizeProductKey = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, '')
    .replace(/\s+/g, '-')
    .trim();
};

export const getProductsFromStorage = () => {
  try {
    const saved = localStorage.getItem("chipgadget_products");
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error("Ошибка загрузки товаров:", e);
    return {};
  }
};

export const saveProductsToStorage = (products) => {
  try {
    localStorage.setItem("chipgadget_products", JSON.stringify(products));
    return true;
  } catch (e) {
    console.error("Ошибка сохранения товаров:", e);
    return false;
  }
};

export const getCategories = () => {
  return [
    { id: "smartphones", title: "Смартфоны", emoji: "📱" },
    { id: "laptops", title: "Ноутбуки", emoji: "💻" },
    { id: "tablets", title: "Планшеты", emoji: "📱" },
    { id: "accessories", title: "Аксессуары", emoji: "🎧" },
    { id: "used", title: "Б/У техника", emoji: "🔧" },
    { id: "other", title: "Другое", emoji: "📦" },
  ];
};

export const getBrandsForProducts = () => {
  return [
    { id: "apple", name: "Apple" },
    { id: "samsung", name: "Samsung" },
    { id: "xiaomi", name: "Xiaomi" },
    { id: "huawei", name: "Huawei" },
    { id: "honor", name: "Honor" },
    { id: "oneplus", name: "OnePlus" },
    { id: "google", name: "Google" },
    { id: "asus", name: "ASUS" },
    { id: "lenovo", name: "Lenovo" },
    { id: "acer", name: "Acer" },
    { id: "dell", name: "Dell" },
    { id: "hp", name: "HP" },
    { id: "sony", name: "Sony" },
    { id: "lg", name: "LG" },
    { id: "other", name: "Другой" },
  ];
};

/**
 * Обрабатывает загрузку изображений с автоматическим сжатием
 * @param {File[]} files - Массив файлов изображений
 * @returns {Promise<Array<{original: File, compressed: string, thumbnail: string}>>}
 */
export const processProductImages = async (files) => {
  try {
    const results = [];
    
    for (const file of files) {
      // Оптимизируем для web
      const optimizedImage = await optimizeForWeb(file);
      
      // Создаем thumbnail (первый в списке - главное фото)
      const isFirst = results.length === 0;
      const thumbnail = isFirst ? await compressImage(file, { 
        maxWidth: 400, 
        maxHeight: 400, 
        quality: 0.7 
      }) : null;
      
      results.push({
        original: file,
        compressed: optimizedImage,
        thumbnail,
        name: file.name,
        size: file.size,
        compressedSize: estimateBase64Size(optimizedImage)
      });
    }
    
    return results;
  } catch (error) {
    console.error("Ошибка обработки изображений:", error);
    throw error;
  }
};

/**
 * Оценивает размер base64 в КБ
 * @param {string} base64 
 * @returns {number}
 */
export const estimateBase64Size = (base64) => {
  // Примерный расчет размера
  const bytes = (base64.length * 3) / 4;
  return Math.round(bytes / 1024);
};

/**
 * Удаляет изображение из массива
 * @param {Array} imagesArray - Массив изображений
 * @param {number} index - Индекс для удаления
 * @returns {Array} - Новый массив без удаленного изображения
 */
export const removeImageFromArray = (imagesArray, index) => {
  return imagesArray.filter((_, i) => i !== index);
};

/**
 * Проверяет валидность товара перед сохранением
 * @param {Object} product - Объект товара
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateProduct = (product) => {
  const errors = [];
  
  if (!product.name || product.name.trim().length === 0) {
    errors.push("Название товара обязательно");
  }
  
  if (!product.price || product.price <= 0) {
    errors.push("Цена должна быть больше 0");
  }
  
  if (!product.category) {
    errors.push("Категория обязательна");
  }
  
  if (!product.brand) {
    errors.push("Бренд обязателен");
  }
  
  if (product.stock === undefined || product.stock < 0) {
    errors.push("Количество должно быть неотрицательным");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Форматирует цену товара
 * @param {number} price - Цена
 * @param {string} currency - Валюта (по умолчанию '₽')
 * @returns {string}
 */
export const formatProductPrice = (price, currency = '₽') => {
  return `${price.toLocaleString('ru-RU')} ${currency}`;
};

/**
 * Генерирует ID для нового товара
 * @param {string} name - Название товара
 * @returns {string}
 */
export const generateProductId = (name) => {
  const timestamp = Date.now();
  const normalizedName = normalizeProductKey(name).substring(0, 20);
  return `product-${normalizedName}-${timestamp}`;
};

/**
 * Экспортирует товары в JSON файл
 * @param {Object} products - Объект товаров
 * @returns {boolean}
 */
export const exportProductsToJSON = (products) => {
  try {
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const a = document.createElement('a');
    a.href = URL.createObjectURL(dataBlob);
    a.download = `chipgadget-products-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    return true;
  } catch (error) {
    console.error('Ошибка экспорта товаров:', error);
    return false;
  }
};

/**
 * Импортирует товары из JSON файла
 * @param {File} file - JSON файл
 * @returns {Promise<Object>}
 */
export const importProductsFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const products = JSON.parse(e.target.result);
        resolve(products);
      } catch (error) {
        reject(new Error('Неверный формат JSON файла'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'));
    };
    
    reader.readAsText(file);
  });
};

export default {
  normalizeProductKey,
  getProductsFromStorage,
  saveProductsToStorage,
  getCategories,
  getBrandsForProducts,
  processProductImages,
  estimateBase64Size,
  removeImageFromArray,
  validateProduct,
  formatProductPrice,
  generateProductId,
  exportProductsToJSON,
  importProductsFromJSON
};