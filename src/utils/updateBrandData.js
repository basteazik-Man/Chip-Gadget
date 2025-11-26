// src/utils/updateBrandData.js
// ГЕНЕРАТОР ФАЙЛА brandData.js

import { brandData as existingBrandData } from '../data/brandData';

/**
 * Генерирует обновленный brandData.js с учетом удаленных моделей
 */
export const generateUpdatedBrandData = (pricesData) => {
  const updatedBrandData = JSON.parse(JSON.stringify(existingBrandData));
  let addedModels = [];
  let removedModels = [];

  // Перебираем все бренды из админки
  Object.entries(pricesData).forEach(([brandKey, brandInfo]) => {
    if (!updatedBrandData[brandKey]) {
      console.log(`Пропускаем бренд ${brandKey} - нет в brandData`);
      return;
    }

    // Получаем все модели из админки для этого бренда
    const adminModels = new Set(Object.keys(brandInfo.models || {}));

    // Перебираем все категории в brandData
    Object.entries(updatedBrandData[brandKey].categories).forEach(([categoryName, categoryModels]) => {
      const modelsToKeep = [];
      
      // 1. Сначала обрабатываем существующие модели в brandData (очистка удаленных)
      categoryModels.forEach(existingModel => {
        const modelId = existingModel.id;
        
        // Проверяем, есть ли эта модель в админке
        const existsInAdmin = adminModels.has(modelId);
        
        if (existsInAdmin) {
          // Модель есть в админке - оставляем
          modelsToKeep.push(existingModel);
        } else {
          // Модели нет в админке - помечаем на удаление
          removedModels.push({
            brand: brandKey,
            model: modelId,
            name: existingModel.name,
            category: categoryName
          });
        }
      });

      // 2. Добавляем новые модели из админки
      adminModels.forEach(modelKey => {
        // Проверяем, есть ли уже эта модель в текущей категории (чтобы не дублировать)
        const modelExists = modelsToKeep.some(model => model.id === modelKey);
        
        if (!modelExists) {
          const modelData = brandInfo.models[modelKey];
          
          // ВАЖНО: По умолчанию targetCategory = null.
          let targetCategory = null;
          
          // Определяем категорию ТОЛЬКО если она явно указана в админке (для новых моделей)
          if (modelData && typeof modelData === 'object' && modelData._category) {
            targetCategory = modelData._category;
          }
          
          // Добавляем модель, ТОЛЬКО если она явно предназначена для текущей категории цикла
          if (targetCategory && targetCategory === categoryName) {
            const modelName = getModelDisplayName(modelKey, modelData);
            
            modelsToKeep.push({
              id: modelKey,
              name: modelName,
              image: "/logos/default-phone.jpg" // Дефолтная картинка для новых
            });

            addedModels.push({
              brand: brandKey,
              model: modelKey,
              name: modelName,
              category: targetCategory
            });
          }
        }
      });

      // Обновляем категорию очищенным списком
      updatedBrandData[brandKey].categories[categoryName] = modelsToKeep;
    });
  });

  // Формируем содержимое файла
  const content = `// === brandData.js ===
// Автоматически обновлено через админку Chip&Gadget
// Сгенерировано: ${new Date().toLocaleString()}
// Новые модели: ${addedModels.length}
// Удаленные модели: ${removedModels.length}

export const brandData = ${JSON.stringify(updatedBrandData, null, 2)};
`;

  return {
    content,
    addedModels,
    removedModels,
    hasChanges: addedModels.length > 0 || removedModels.length > 0
  };
};

/**
 * Получить отображаемое название модели
 */
const getModelDisplayName = (modelKey, modelData) => {
  if (modelData && typeof modelData === 'object' && modelData._customName) {
    return modelData._customName;
  }
  
  return modelKey
    .replace(/-/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
};