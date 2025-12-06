// src/utils/updateBrandData.js
// ИСПРАВЛЕНО: Используем normalizeKey для корректного сравнения моделей

import { brandData as existingBrandData } from '../data/brandData';
import { normalizeKey } from './priceUtils';

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

    // Получаем все модели из админки для этого бренда (нормализованные ключи)
    const adminModels = new Map();
    Object.keys(brandInfo.models || {}).forEach(modelKey => {
      const normalizedKey = normalizeKey(modelKey);
      adminModels.set(normalizedKey, modelKey); // Сохраняем и оригинальный ключ
    });

    // Перебираем все категории в brandData
    Object.entries(updatedBrandData[brandKey].categories).forEach(([categoryName, categoryModels]) => {
      const modelsToKeep = [];
      
      // 1. Сначала обрабатываем существующие модели в brandData (очистка удаленных)
      categoryModels.forEach(existingModel => {
        const modelId = existingModel.id;
        const normalizedModelId = normalizeKey(modelId);
        
        // Проверяем, есть ли эта модель в админке (по нормализованному ключу)
        const existsInAdmin = adminModels.has(normalizedModelId);
        
        if (existsInAdmin) {
          // Модель есть в админке - оставляем
          modelsToKeep.push(existingModel);
          // Удаляем из карты, чтобы не добавлять повторно
          adminModels.delete(normalizedModelId);
        } else {
          // Модели нет в админке - помечаем на удаление
          removedModels.push({
            brand: brandKey,
            model: modelId,
            name: existingModel.name,
            category: categoryName
          });
          console.log(`🗑️ Удаляем модель: ${brandKey} -> ${categoryName} -> ${modelId}`);
        }
      });

      // 2. Добавляем новые модели из админки
      adminModels.forEach((originalKey, normalizedKey) => {
        // Проверяем, не добавлена ли уже эта модель в другую категорию
        const alreadyAdded = modelsToKeep.some(model => normalizeKey(model.id) === normalizedKey);
        
        if (!alreadyAdded) {
          const modelData = brandInfo.models[originalKey];
          
          let targetCategory = null;
          
          // Определяем категорию ТОЛЬКО если она явно указана в админке
          if (modelData && typeof modelData === 'object' && modelData._category) {
            targetCategory = modelData._category;
          }
          
          // Если модель не привязана к категории, пробуем определить по названию
          if (!targetCategory) {
            // Для брендов с категорией "все_модели"
            if (categoryName === "все_модели") {
              targetCategory = categoryName;
            }
          }
          
          // Добавляем модель, если она предназначена для текущей категории
          if (targetCategory && targetCategory === categoryName) {
            const modelName = getModelDisplayName(originalKey, modelData);
            
            modelsToKeep.push({
              id: normalizedKey, // Сохраняем нормализованный ключ
              name: modelName,
              image: "/logos/default-phone.jpg"
            });

            addedModels.push({
              brand: brandKey,
              model: normalizedKey,
              name: modelName,
              category: targetCategory
            });
            
            console.log(`✅ Добавляем модель: ${brandKey} -> ${targetCategory} -> ${modelName}`);
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
  
  // Убираем лишние дефисы в начале/конце
  const cleanedKey = modelKey.replace(/^-+|-+$/g, '');
  
  return cleanedKey
    .replace(/-/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
};

export const checkForNewModels = (pricesData) => {
  const result = generateUpdatedBrandData(pricesData);
  return result.addedModels;
};