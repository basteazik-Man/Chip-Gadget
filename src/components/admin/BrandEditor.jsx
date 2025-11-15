// === BrandEditor.jsx ===
// Адаптирован для работы с новой структурой brandData.js (модели по категориям)

import React, { useState, useMemo } from "react";
import ModelEditor from "./ModelEditor";
import { brandData } from "../../data/brandData";
import { getBrandStatus } from "../../utils/priceUtils";

export default function BrandEditor({ brandKey, data, onChange }) {
  const brand = data[brandKey];
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Получаем категории и модели из brandData
  const brandCategories = useMemo(() => {
    const brandInfo = brandData[brandKey];
    return brandInfo?.categories || {};
  }, [brandKey]);

  // Получаем все модели из всех категорий
  const allModelsFromBrandData = useMemo(() => {
    const models = [];
    Object.values(brandCategories).forEach(category => {
      if (Array.isArray(category)) {
        models.push(...category);
      }
    });
    return models;
  }, [brandCategories]);

  const colorMap = {
    red: "border-red-400 bg-red-50",
    yellow: "border-yellow-400 bg-yellow-50",
    green: "border-green-400 bg-green-50",
  };

  // --- Управление изменениями бренда ---
  const updateBrand = (changes) => {
    const updated = { ...brand, ...changes };
    onChange(brandKey, updated);
  };

  // Добавление ВСЕХ моделей из выбранной категории
  const addModelsFromCategory = () => {
    if (!selectedCategory) {
      alert("Выберите категорию");
      return;
    }

    const modelsInCategory = brandCategories[selectedCategory] || [];
    if (modelsInCategory.length === 0) {
      alert("В выбранной категории нет моделей");
      return;
    }

    const newModels = { ...brand.models };
    let addedCount = 0;

    modelsInCategory.forEach((modelInfo) => {
      const modelKey = modelInfo.id || modelInfo.name?.toLowerCase()?.replace(/\s+/g, "-");
      
      // Проверяем, не добавлена ли модель уже
      if (!newModels[modelKey]) {
        // Создаем пустые услуги для новой модели
        newModels[modelKey] = [];
        addedCount++;
      }
    });

    if (addedCount === 0) {
      alert("Все модели из этой категории уже добавлены!");
      return;
    }

    updateBrand({ models: newModels });
    setSelectedCategory("");
    alert(`Добавлено моделей: ${addedCount}`);
  };

  // Добавление кастомной модели (не из каталога)
  const addCustomModel = () => {
    const name = prompt("Введите название модели:");
    if (!name) return;
    const key = name.toLowerCase().replace(/\s+/g, "-");
    
    if (brand.models[key]) {
      alert("Такая модель уже существует!");
      return;
    }

    const servicesArray = [];

    const newModels = { ...brand.models, [key]: servicesArray };
    updateBrand({ models: newModels });
  };

  const deleteModel = (key) => {
    if (!confirm(`Удалить модель ${key}?`)) return;
    const newModels = { ...brand.models };
    delete newModels[key];
    updateBrand({ models: newModels });
    if (selectedModel === key) setSelectedModel("");
  };

  const handleModelChange = (modelKey, updated) => {
    const newBrand = {
      ...brand,
      models: { ...brand.models, [modelKey]: updated },
    };
    onChange(brandKey, newBrand);
  };

  const handleCurrencyChange = () => {
    const newCurrency = prompt("Введите валюту:", brand.currency || "₽");
    if (newCurrency) updateBrand({ currency: newCurrency });
  };

  const handleRenameBrand = () => {
    const newName = prompt("Новое название бренда:", brand.brand);
    if (newName) updateBrand({ brand: newName });
  };

  const deleteBrand = () => {
    if (!confirm(`Удалить бренд ${brand.brand}?`)) return;
    onChange(brandKey, null);
  };

  // Используем утилиту из priceUtils.js и преобразуем статус к нужному формату
  const brandStatusObj = getBrandStatus(brand);
  const statusMap = {
    full: "green",
    partial: "yellow", 
    empty: "red"
  };
  const brandStatus = statusMap[brandStatusObj.status] || "red";
  
  const modelKeys = Object.keys(brand.models || {});
  
  // При изменении категории обновляем список моделей в выпадающем списке редактирования
  const availableModelsForEditing = useMemo(() => {
    if (!selectedCategory) return modelKeys;
    
    const modelsInCategory = brandCategories[selectedCategory] || [];
    const categoryModelKeys = modelsInCategory.map(model => 
      model.id || model.name?.toLowerCase()?.replace(/\s+/g, "-")
    );
    
    return modelKeys.filter(modelKey => 
      categoryModelKeys.includes(modelKey)
    );
  }, [selectedCategory, modelKeys, brandCategories]);

  return (
    <div
      className={`p-4 rounded-2xl border shadow-md mb-8 ${colorMap[brandStatus]}`}
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          {brand.brand}
          {brandStatus === "green" && "🟢"}
          {brandStatus === "yellow" && "🟡"}
          {brandStatus === "red" && "🔴"}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleRenameBrand}
            className="px-2 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
          >
            ✏️ Переименовать
          </button>
          <button
            onClick={handleCurrencyChange}
            className="px-2 py-1 text-sm rounded bg-blue-200 hover:bg-blue-300"
          >
            💱 Валюта ({brand.currency})
          </button>
          <button
            onClick={deleteBrand}
            className="px-2 py-1 text-sm rounded bg-red-200 hover:bg-red-300"
          >
            🗑️ Удалить
          </button>
        </div>
      </div>

      {/* Добавление моделей из каталога - УПРОЩЕННАЯ ВЕРСИЯ */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        <h3 className="font-semibold text-gray-700 mb-2">Добавить модели из категории:</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg p-2"
          >
            <option value="">— выбрать категорию —</option>
{Object.keys(brandCategories).map(category => (
              <option key={category} value={category}>
                {category.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>

          <button
            onClick={addModelsFromCategory}
            disabled={!selectedCategory}
            className="px-3 py-2 rounded bg-green-200 hover:bg-green-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ➕ Добавить все моделей из категории
          </button>

          <button
            onClick={addCustomModel}
            className="px-3 py-2 rounded bg-blue-200 hover:bg-blue-300 text-sm"
          >
            ➕ Создать свою модель
          </button>
        </div>
      </div>

      {/* Выбор модели для редактирования */}
      <div className="flex items-center gap-2 mb-4">
        <label className="text-gray-700 font-medium">Редактировать модель:</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 flex-1 focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">— выбрать модель —</option>
          {availableModelsForEditing.map((key) => (
            <option key={key} value={key}>
              {brand.models[key]?.[0]?.customName || key.replace(/-/g, " ").toUpperCase()}
            </option>
          ))}
        </select>
        
        {selectedModel && (
          <button
            onClick={() => deleteModel(selectedModel)}
            className="px-3 py-2 rounded bg-red-200 hover:bg-red-300 text-sm"
          >
            ❌ Удалить
          </button>
        )}
      </div>

      {/* Редактор модели */}
      {selectedModel ? (
        <ModelEditor
          modelKey={selectedModel}
          services={brand.models[selectedModel]}
          onChange={(updated) => handleModelChange(selectedModel, updated)}
        />
      ) : (
        <div className="text-gray-500 italic text-center py-4">
          Выберите модель, чтобы редактировать услуги.
        </div>
      )}
    </div>
  );
}