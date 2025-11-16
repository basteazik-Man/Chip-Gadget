// BrandEditor.jsx (ПОЛНАЯ ВЕРСИЯ со счетчиком и всеми моделями)
import React, { useState, useMemo } from "react";
import ModelEditor from "./ModelEditor";
import { brandData } from "../../data/brandData";
import { getBrandStatus, getModelStatus } from "../../utils/priceUtils";
import { BRANDS } from "../../data/brands";

export default function BrandEditor({ brandKey, data, onChange }) {
  const brand = data[brandKey];
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Получаем категории и модели из brandData
  const brandCategories = useMemo(() => {
    const brandInfo = brandData[brandKey];
    return brandInfo?.categories || {};
  }, [brandKey]);

  const colorMap = {
    red: "border-red-400 bg-red-50",
    yellow: "border-yellow-400 bg-yellow-50", 
    green: "border-green-400 bg-green-50",
  };

  // Список доступных валют
  const currencies = ["₽", "$", "€", "¥", "£", "₹"];

  // --- Управление изменениями бренда ---
  const updateBrand = (changes) => {
    const updated = { ...brand, ...changes };
    onChange(brandKey, updated);
  };

  // Добавление кастомной модели
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
    setSelectedModel(key);
    setSelectedCategory("custom");
  };

  // Редактирование названия модели
  const editModelName = (modelKey, e) => {
    e.stopPropagation();
    const currentName = getModelDisplayName(modelKey);
    const newName = prompt("Введите новое название модели:", currentName);
    if (!newName || newName === currentName) return;

    // Обновляем кастомное имя в данных модели
    const updatedModels = { ...brand.models };
    if (Array.isArray(updatedModels[modelKey])) {
      // Если это массив услуг, преобразуем в объект с кастомным именем
      updatedModels[modelKey] = {
        services: updatedModels[modelKey],
        _customName: newName
      };
    } else if (typeof updatedModels[modelKey] === 'object') {
      updatedModels[modelKey]._customName = newName;
    }
    
    updateBrand({ models: updatedModels });
  };

  const deleteModel = (modelKey) => {
    if (!confirm(`Удалить модель "${getModelDisplayName(modelKey)}"?`)) return;
    const newModels = { ...brand.models };
    delete newModels[modelKey];
    updateBrand({ models: newModels });
    if (selectedModel === modelKey) setSelectedModel("");
  };

  const handleModelChange = (modelKey, updated) => {
    const newBrand = {
      ...brand,
      models: { ...brand.models, [modelKey]: updated },
    };
    onChange(brandKey, newBrand);
  };

  // Изменение валюты через выпадающий список
  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    if (newCurrency) updateBrand({ currency: newCurrency });
  };

  const handleRenameBrand = () => {
    const newName = prompt("Новое название бренда:", brand.brand);
    if (newName) updateBrand({ brand: newName });
  };

  // Получаем статус бренда с подсчетом незаполненных моделей
  const brandStatusObj = getBrandStatus(brand);
  const statusMap = {
    full: "green",
    partial: "yellow", 
    empty: "red"
  };
  const brandStatus = statusMap[brandStatusObj.status] || "red";

  // Функция для получения статуса модели
  const getModelStatusInfo = (modelKey) => {
    const modelData = brand.models[modelKey];
    let services = [];
    
    if (Array.isArray(modelData)) {
      services = modelData;
    } else if (modelData && modelData.services) {
      services = modelData.services;
    }
    
    return getModelStatus(services);
  };

  // Функция для получения цвета статуса модели
  const getModelStatusColor = (modelKey) => {
    const { status } = getModelStatusInfo(modelKey);
    return status === "full" ? "text-green-600 bg-green-100" :
           status === "partial" ? "text-yellow-600 bg-yellow-100" :
           "text-red-600 bg-red-100";
  };

  // Функция для получения иконки статуса модели
  const getModelStatusIcon = (modelKey) => {
    const { status } = getModelStatusInfo(modelKey);
    return status === "full" ? "🟢" :
           status === "partial" ? "🟡" :
           "🔴";
  };

  // Функция для получения человеко-читаемого имени модели
  const getModelDisplayName = (modelKey) => {
    // Проверяем есть ли кастомное имя
    const modelData = brand.models[modelKey];
    if (modelData && typeof modelData === 'object' && modelData._customName) {
      return modelData._customName;
    }
    
    // Ищем модель в brandData для получения красивого имени
    for (const category of Object.values(brandCategories)) {
      const model = category.find(m => m.id === modelKey);
      if (model) return model.name;
    }
    
    // Если не нашли, преобразуем ключ
    return modelKey.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  // Получаем услуги для модели (универсальный метод)
  const getModelServices = (modelKey) => {
    const modelData = brand.models[modelKey];
    if (Array.isArray(modelData)) {
      return modelData;
    } else if (modelData && modelData.services) {
      return modelData.services;
    }
    return [];
  };

  // Получаем ВСЕ модели бренда (включая кастомные)
  const getAllBrandModels = () => {
    return Object.keys(brand.models || {});
  };

  // Получаем модели для выбранной категории
  const getModelsForCategory = () => {
    if (!selectedCategory) return [];

    if (selectedCategory === "all") {
      // Все модели бренда
      return getAllBrandModels();
    }

    if (selectedCategory === "custom") {
      // Кастомные модели (не из категорий)
      return Object.keys(brand.models || {}).filter(modelKey => {
        for (const category of Object.values(brandCategories)) {
          if (category.find(m => m.id === modelKey)) return false;
        }
        return true;
      });
    }

    // Модели из выбранной категории
    const modelsInCategory = brandCategories[selectedCategory] || [];
    return modelsInCategory
      .map(model => model.id)
      .filter(modelKey => brand.models[modelKey]);
  };

  const modelsToShow = getModelsForCategory();

  // Получаем статистику по моделям для отображения
  const getModelsStats = () => {
    const allModels = getAllBrandModels();
    let filled = 0;
    let partial = 0;
    let empty = 0;

    allModels.forEach(modelKey => {
      const status = getModelStatusInfo(modelKey).status;
      if (status === "full") filled++;
      else if (status === "partial") partial++;
      else empty++;
    });

    return { total: allModels.length, filled, partial, empty };
  };

  const modelsStats = getModelsStats();

  return (
    <div className={`p-6 rounded-2xl border shadow-md mb-8 ${colorMap[brandStatus]}`}>
      {/* Заголовок бренда с кнопками управления и статистикой */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-2">
            {brand.brand}
            <span className="text-lg">
              {brandStatus === "green" && "🟢"}
              {brandStatus === "yellow" && "🟡"} 
              {brandStatus === "red" && "🔴"}
            </span>
          </h2>
          <div className="text-sm text-gray-600">
            Модели: <span className="font-semibold">{modelsStats.total}</span> | 
            Заполнены: <span className="text-green-600 font-semibold">{modelsStats.filled}</span> | 
            Частично: <span className="text-yellow-600 font-semibold">{modelsStats.partial}</span> | 
            Пустые: <span className="text-red-600 font-semibold">{modelsStats.empty}</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleRenameBrand}
            className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium transition-colors"
          >
            ✏️ Переименовать бренд
          </button>
          
          <select
            value={brand.currency || "₽"}
            onChange={handleCurrencyChange}
            className="px-3 py-2 rounded-lg bg-blue-200 hover:bg-blue-300 text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500"
          >
            {currencies.map(currency => (
              <option key={currency} value={currency}>
                💱 {currency}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Блок добавления моделей */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Добавить модель:</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={addCustomModel}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            ➕ Создать свою модель
          </button>
          <span className="text-sm text-gray-500">
            Модели из каталога добавляются автоматически при сохранении
          </span>
        </div>
      </div>

      {/* Выбор категории */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Выберите категорию:</h3>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedModel("");
          }}
          className="w-full max-w-md border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">— Выберите категорию —</option>
          <option value="all">
            📱 Все модели ({getAllBrandModels().length})
          </option>
          {Object.keys(brandCategories).map(category => (
            <option key={category} value={category}>
              {category.replace(/_/g, ' ').toUpperCase()} ({brandCategories[category].filter(model => brand.models[model.id]).length})
            </option>
          ))}
          {/* Опция для кастомных моделей */}
          {Object.keys(brand.models || {}).filter(modelKey => {
            for (const category of Object.values(brandCategories)) {
              if (category.find(m => m.id === modelKey)) return false;
            }
            return true;
          }).length > 0 && (
            <option value="custom">
              🆕 Другие модели ({Object.keys(brand.models || {}).filter(modelKey => {
                for (const category of Object.values(brandCategories)) {
                  if (category.find(m => m.id === modelKey)) return false;
                }
                return true;
              }).length})
            </option>
          )}
        </select>
      </div>

      {/* Список моделей выбранной категории */}
      {selectedCategory && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700 text-lg">
              {selectedCategory === "all" && "📱 Все модели"}
              {selectedCategory === "custom" && "🆕 Другие модели"}
              {!["all", "custom"].includes(selectedCategory) && 
                selectedCategory.replace(/_/g, ' ').toUpperCase()
              } 
              ({modelsToShow.length})
            </h3>
          </div>
          
          {modelsToShow.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modelsToShow.map(modelKey => {
                const isSelected = selectedModel === modelKey;
                const statusColor = getModelStatusColor(modelKey);
                const statusIcon = getModelStatusIcon(modelKey);
                const modelStatus = getModelStatusInfo(modelKey);

                return (
                  <div
                    key={modelKey}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedModel(modelKey)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm">{statusIcon}</span>
                        <h5 className="font-medium text-gray-800 text-sm leading-tight">
                          {getModelDisplayName(modelKey)}
                        </h5>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => editModelName(modelKey, e)}
                          className="text-blue-400 hover:text-blue-600 text-sm"
                          title="Редактировать название"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteModel(modelKey);
                          }}
                          className="text-red-400 hover:text-red-600 text-sm"
                          title="Удалить модель"
                        >
                          ✖
                        </button>
                      </div>
                    </div>
                    
                    <div className={`text-xs px-2 py-1 rounded-full ${statusColor} text-center`}>
                      {modelStatus.status === "full" && "✓ Все услуги заполнены"}
                      {modelStatus.status === "partial" && `⚠ ${modelStatus.emptyCount} незаполненных`}
                      {modelStatus.status === "empty" && "✗ Нет данных"}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              {selectedCategory === "custom" 
                ? "Нет кастомных моделей" 
                : selectedCategory === "all"
                ? "Нет моделей для этого бренда"
                : "В этой категории нет моделей с данными"
              }
            </div>
          )}
        </div>
      )}

      {/* Сообщение когда категория не выбрана */}
      {!selectedCategory && (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-4xl mb-4">📱</div>
          <p className="text-lg font-medium mb-2">Выберите категорию выше</p>
          <p className="text-sm">Чтобы увидеть список моделей для редактирования</p>
          <div className="mt-4 text-xs text-gray-400">
            Всего моделей: {getAllBrandModels().length} | 
            Заполнено: {modelsStats.filled} | 
            Частично: {modelsStats.partial} | 
            Пустых: {modelsStats.empty}
          </div>
        </div>
      )}

      {/* Редактор выбранной модели */}
      {selectedModel && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Редактирование: {getModelDisplayName(selectedModel)}
            </h3>
            <button
              onClick={() => setSelectedModel("")}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            >
              ✕ Закрыть
            </button>
          </div>
          <ModelEditor
            modelKey={selectedModel}
            services={getModelServices(selectedModel)}
            onChange={(updated) => handleModelChange(selectedModel, updated)}
          />
        </div>
      )}
    </div>
  );
}