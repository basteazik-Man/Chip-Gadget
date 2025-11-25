// src/utils/updateBrandData.js
// Этот файл создает обновленную структуру моделей на основе данных из админки

import { brandData as existingBrandData } from '../data/brandData';

/**
 * Генерирует обновленный brandData.js с новыми моделями из админки
 * @param {Object} pricesData - Данные цен из админки
 * @returns {Object} { content: string, addedModels: array, hasChanges: boolean }
 */
export const generateUpdatedBrandData = (pricesData) => {
  // Создаем копию существующих данных
  const updatedBrandData = JSON.parse(JSON.stringify(existingBrandData));
  let addedModels = [];

  // Перебираем все бренды из цен
  Object.entries(pricesData).forEach(([brandKey, brandInfo]) => {
    // Пропускаем бренды, которых нет в основном каталоге
    if (!updatedBrandData[brandKey]) {
      console.log(`Пропускаем бренд ${brandKey} - нет в основном каталоге`);
      return;
    }

    // Перебираем все модели этого бренда из цен
    Object.keys(brandInfo.models || {}).forEach(modelKey => {
      // Проверяем, есть ли уже эта модель в основном каталоге
      let modelExists = false;
      
      // Ищем модель во всех категориях бренда
      Object.values(updatedBrandData[brandKey].categories).forEach(category => {
        if (category.find(model => model.id === modelKey)) {
          modelExists = true;
        }
      });

      // Если модели нет - добавляем в категорию "other"
      if (!modelExists) {
        // Создаем категорию "other" если её нет
        if (!updatedBrandData[brandKey].categories.other) {
          updatedBrandData[brandKey].categories.other = [];
        }

        // Создаем красивый заголовок из ID модели
        const modelName = modelKey
          .replace(/-/g, ' ')
          .replace(/\b\w/g, letter => letter.toUpperCase());

        // Добавляем новую модель
        updatedBrandData[brandKey].categories.other.push({
          id: modelKey,
          name: modelName,
          image: "/logos/default-phone.jpg" // стандартное изображение
        });

        addedModels.push({ 
          brand: brandKey, 
          model: modelKey,
          name: modelName
        });
        
        console.log(`Добавлена модель: ${brandKey} -> ${modelName}`);
      }
    });
  });

  // Формируем содержимое нового файла
  const content = `// === brandData.js ===
// Автоматически обновлено через админку Chip&Gadget
// Сгенерировано: ${new Date().toLocaleString()}
// Новые модели: ${addedModels.length}

export const brandData = ${JSON.stringify(updatedBrandData, null, 2)};
`;

  return {
    content,
    addedModels,
    hasChanges: addedModels.length > 0
  };
};

/**
 * Простая проверка новых моделей без генерации файла
 */
export const checkForNewModels = (pricesData) => {
  const result = generateUpdatedBrandData(pricesData);
  return result.addedModels;
};