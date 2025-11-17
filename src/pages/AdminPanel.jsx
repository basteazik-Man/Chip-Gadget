// AdminPanel.jsx
import React, { useState, useEffect, useRef } from "react";
import BrandEditor from "../components/admin/BrandEditor";
import CategoryServicesEditor from "../components/admin/CategoryServicesEditor";
import DeliveryEditor from "../components/admin/DeliveryEditor";
import AdminAuth from "../components/AdminAuth";
import { getBrandStatus } from "../utils/priceUtils";
import { BRANDS } from "../data/brands";
import { brandData } from "../data/brandData";

// Вспомогательная функция для получения всех моделей из brandData
const getAllModelsFromBrandData = (brandKey) => {
  const brandInfo = brandData[brandKey];
  if (!brandInfo || !brandInfo.categories) return [];
  
  const models = [];
  Object.values(brandInfo.categories).forEach((category) => {
    if (Array.isArray(category)) {
      category.forEach((model) => {
        models.push(model.id);
      });
    }
  });
  return models;
};

const buildInitialData = () => {
  const data = {};
  
  // Пробуем загрузить из localStorage
  const saved = localStorage.getItem("chipgadget_prices");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      
      // Валидация структуры данных
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid data structure in localStorage');
      }
      return parsed;
    } catch (e) {
      console.error("Ошибка загрузки из localStorage:", e);
      localStorage.removeItem("chipgadget_prices");
    }
  }

  // Используем все бренды из BRANDS вместо фиксированного списка
  BRANDS.forEach((brand) => {
    const key = brand.id;
    const modelsObj = {};
    const allModels = getAllModelsFromBrandData(key);
    
    allModels.forEach((model) => {
      const modelKey = typeof model === 'string' ? model : (model.id || "unknown-model");
      modelsObj[modelKey] = [];
    });

    data[key] = {
      brand: brand.title, // Используем title из BRANDS
      currency: "₽",
      discount: { type: "none", value: 0 },
      models: modelsObj,
    };
  });

  return data;
};

const saveToLocal = (data) => {
  try {
    localStorage.setItem("chipgadget_prices", JSON.stringify(data));
    console.log("✅ Данные сохранены в localStorage");
    return true;
  } catch (e) {
    console.error("❌ Ошибка сохранения в localStorage:", e);
    return false;
  }
};

const exportJSON = (data) => {
  const transformedData = transformDataForExport(data);
  const blob = new Blob([JSON.stringify(transformedData, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `chipgadget-prices-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};

// ФУНКЦИЯ: Экспорт услуг по категориям (ТВ/ноутбуки)
const exportCategoryServices = (categoryServices) => {
  try {
const content = `// Автоматически сгенерировано Chip&Gadget Admin\nexport const SERVICES_BY_CATEGORY = ${JSON.stringify(
  categoryServices,
  null,
  2
)};\n\nexport const SERVICES = Object.values(SERVICES_BY_CATEGORY).flat();`;
    
    const blob = new Blob([content], { type: "application/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `category-services.js`;
    a.click();
    
    return true;
  } catch (error) {
    console.error('Ошибка при экспорте категорий услуг:', error);
    return false;
  }
};

// ФУНКЦИЯ: Экспорт данных доставки
const exportDeliveryData = () => {
  try {
    const deliveryData = localStorage.getItem("chipgadget_delivery");
    if (!deliveryData) {
      alert("Нет данных доставки для экспорта");
      return false;
    }
    
    const content = `// Автоматически сгенерировано Chip&Gadget Admin\nexport const DELIVERY_DATA = ${deliveryData};\n\nexport default DELIVERY_DATA;`;
    
    const blob = new Blob([content], { type: "application/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `delivery-data.js`;
    a.click();
    
    return true;
  } catch (error) {
    console.error('Ошибка при экспорте данных доставки:', error);
    return false;
  }
};

const transformDataForExport = (data) => {
  const transformed = JSON.parse(JSON.stringify(data));
  
  Object.keys(transformed).forEach(brandKey => {
    const brand = transformed[brandKey];
    
    Object.keys(brand.models).forEach(modelKey => {
      const services = brand.models[modelKey];
      
      brand.models[modelKey] = services.map(service => {
        const transformedService = {
          name: service.name || service.title || "Услуга",
          price: service.price || service.basePrice || 0,
          finalPrice: service.finalPrice || service.price || service.basePrice || 0,
          active: service.active !== undefined ? service.active : true
        };
        
        if (service.discount && service.discount !== 0) {
          transformedService.discount = service.discount;
        }
        
        return transformedService;
      });
    });
  });
  
  return transformed;
};

const mergeImportedData = (currentData, importedData) => {
  const merged = { ...currentData };
  
  Object.keys(importedData).forEach(brandKey => {
    const importedBrand = importedData[brandKey];
    
    if (merged[brandKey]) {
      if (importedBrand.currency) {
        merged[brandKey].currency = importedBrand.currency;
      }
      
      if (importedBrand.discount) {
        merged[brandKey].discount = importedBrand.discount;
      }
      
      if (importedBrand.models) {
        Object.keys(importedBrand.models).forEach(modelKey => {
          if (merged[brandKey].models[modelKey]) {
            const importedServices = importedBrand.models[modelKey];
            
            if (Array.isArray(importedServices) && importedServices.length > 0) {
              const serviceMap = {};
              importedServices.forEach(service => {
                const serviceName = service.name || service.title;
                if (serviceName) {
                  serviceMap[serviceName] = service;
                }
              });
              
              merged[brandKey].models[modelKey] = merged[brandKey].models[modelKey].map(currentService => {
                const currentServiceName = currentService.name || currentService.title;
                const importedService = serviceMap[currentServiceName];
                if (importedService) {
                  return {
                    name: currentServiceName,
                    price: importedService.price || importedService.basePrice || 0,
                    finalPrice: importedService.finalPrice || importedService.price || importedService.basePrice || 0,
                    active: importedService.active !== undefined ? importedService.active : true,
                    discount: importedService.discount || currentService.discount
                  };
                }
                return currentService;
              });
            }
          }
        });
      }
    }
  });

  // ДОБАВЛЕНО: Импорт данных категорий услуг
  if (importedData._categoryServices) {
    try {
      localStorage.setItem("chipgadget_category_services", JSON.stringify(importedData._categoryServices));
      console.log("✅ Категории услуг импортированы");
    } catch (e) {
      console.error("❌ Ошибка импорта категорий услуг:", e);
    }
  }

  // ДОБАВЛЕНО: Импорт данных доставки
  if (importedData._deliveryData) {
    try {
      localStorage.setItem("chipgadget_delivery", JSON.stringify(importedData._deliveryData));
      console.log("✅ Данные доставки импортированы");
    } catch (e) {
      console.error("❌ Ошибка импорта данных доставки:", e);
    }
  }
  
  return merged;
};

// Функция для создания и скачивания ZIP архива (ТОЛЬКО БРЕНДЫ)
const exportJSFilesAsZip = async (data) => {
  try {
    const transformedData = transformDataForExport(data);
    
    // Динамически импортируем JSZip
    const JSZip = await import('jszip');
    const zip = new JSZip.default();
    
    // Добавляем каждый бренд как отдельный JS файл в архив
    Object.keys(transformedData).forEach((key) => {
      const content = `// Автоматически сгенерировано Chip&Gadget Admin\nexport default ${JSON.stringify(
        transformedData[key],
        null,
        2
      )};`;
      zip.file(`${key}.js`, content);
    });

    // Добавляем README файл с инструкциями
    const readmeContent = `# Chip&Gadget Price Files

Этот архив содержит файлы с ценами для сайта Chip&Gadget.

## Инструкция по установке:

1. Распакуйте этот архив
2. Скопируйте все .js файлы в папку: src/data/prices/
3. Замените существующие файлы

## Содержимое архива:

${Object.keys(transformedData).map(key => `- ${key}.js → ${transformedData[key].brand}`).join('\n')}

## Важно:
- Этот архив содержит ТОЛЬКО бренды (телефоны, планшеты)
- Услуги по категориям (ТВ, ноутбуки) экспортируются отдельно через кнопку "📺 Экспорт ТВ/ноутбуки"
- Данные доставки экспортируются отдельно через кнопку "🚚 Экспорт доставки"

Сгенерировано: ${new Date().toLocaleString()}
`;
    zip.file("README.txt", readmeContent);

    // Генерируем и скачиваем ZIP
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `chipgadget-brands-${new Date().toISOString().split('T')[0]}.zip`;
    a.click();
    
    // Освобождаем память
    URL.revokeObjectURL(a.href);
    
    return true;
  } catch (error) {
    console.error('Ошибка при создании ZIP архива:', error);
    
    // Fallback: старый способ экспорта с преобразованием данных
    const transformedData = transformDataForExport(data);
    alert('Не удалось создать ZIP архив. Используем старый метод экспорта.');
    Object.keys(transformedData).forEach((key) => {
      const content = `// Автоматически сгенерировано Chip&Gadget Admin\nexport default ${JSON.stringify(
        transformedData[key],
        null,
        2
      )};`;
      const blob = new Blob([content], { type: "application/javascript" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${key}.js`;
      a.click();
    });
    return false;
  }
};

// УПРОЩЕННАЯ ФУНКЦИЯ ДЛЯ ИМПОРТА JS ФАЙЛОВ
const parseJSFile = (fileContent, fileName) => {
  try {
    // Для category-services.js - ищем SERVICES_BY_CATEGORY
    if (fileName === 'category-services') {
      const servicesMatch = fileContent.match(/export const SERVICES_BY_CATEGORY = (\{[\s\S]*?\});/);
      if (servicesMatch) {
        const dataStr = servicesMatch[1];
        // Простая замена для преобразования в валидный JSON
        const jsonStr = dataStr
          .replace(/(\w+):/g, '"$1":')  // Ключи в кавычки
          .replace(/'/g, '"')           // Одинарные кавычки в двойные
          .replace(/,\s*}/g, '}')       // Убираем лишние запятые
          .replace(/,\s*]/g, ']');      // Убираем лишние запятые в массивах
        
        return JSON.parse(jsonStr);
      }
      throw new Error('Не найден SERVICES_BY_CATEGORY в файле');
    }
    
    // Для delivery-data.js - ищем DELIVERY_DATA
    if (fileName === 'delivery-data') {
      const deliveryMatch = fileContent.match(/export const DELIVERY_DATA = (\{[\s\S]*?\});/);
      if (deliveryMatch) {
        const dataStr = deliveryMatch[1];
        const jsonStr = dataStr
          .replace(/(\w+):/g, '"$1":')
          .replace(/'/g, '"')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        
        return JSON.parse(jsonStr);
      }
      throw new Error('Не найден DELIVERY_DATA в файле');
    }
    
    // Для файлов брендов - ищем export default
    const defaultMatch = fileContent.match(/export default (\{[\s\S]*?\});/);
    if (defaultMatch) {
      const dataStr = defaultMatch[1];
      const jsonStr = dataStr
        .replace(/(\w+):/g, '"$1":')
        .replace(/'/g, '"')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      
      return JSON.parse(jsonStr);
    }
    
    throw new Error('Не найден export default в файле');
  } catch (error) {
    console.error('Ошибка парсинга JS файла:', error);
    throw new Error(`Неверный формат JS файла: ${error.message}`);
  }
};

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [data, setData] = useState(() => buildInitialData());
  const [categoryServices, setCategoryServices] = useState(() => {
    const saved = localStorage.getItem("chipgadget_category_services");
    return saved ? JSON.parse(saved) : {};
  });
  const [brandKey, setBrandKey] = useState("");
  const [message, setMessage] = useState("");
  const [unsaved, setUnsaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("brands");
  const saveTimer = useRef(null);
  const importJsonRef = useRef(null);
  const importJsRef = useRef(null);

  if (!authenticated) {
    return <AdminAuth onAuthenticate={setAuthenticated} />;
  }

  const brands = Object.keys(data);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToLocal(data);
      setUnsaved(false);
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [data]);

  useEffect(() => {
    localStorage.setItem("chipgadget_category_services", JSON.stringify(categoryServices));
  }, [categoryServices]);

  useEffect(() => {
    const saved = localStorage.getItem("chipgadget_prices");
    if (saved) {
      setMessage("✅ Данные загружены из сохранения");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("🆕 Создана новая структура данных");
      setTimeout(() => setMessage(""), 3000);
    }
  }, []);

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (!confirm(`Импортировать данные? Будут обновлены цены для ${Object.keys(importedData).length} брендов.`)) {
          return;
        }

        const backupData = { ...data };
        
        try {
          const mergedData = mergeImportedData(data, importedData);
          setData(mergedData);
          saveToLocal(mergedData);
          setUnsaved(false);
          setMessage(`✅ Данные успешно импортированы! Обновлено ${Object.keys(importedData).length} брендов`);
          
          setTimeout(() => {
            if (confirm('Сохранить импортированные данные?')) {
              setMessage('✅ Импорт подтвержден');
            } else {
              setData(backupData);
              saveToLocal(backupData);
              setUnsaved(false);
              setMessage('🔄 Импорт отменен, восстановлены предыдущие данные');
            }
          }, 2000);
          
        } catch (mergeError) {
          console.error('Ошибка при слиянии данных:', mergeError);
          setMessage('❌ Ошибка при обработке импортированных данных');
        }
        
      } catch (error) {
        console.error('Ошибка парсинга JSON:', error);
        setMessage('❌ Ошибка: неверный формат файла JSON');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleImportJS = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target.result;
        const fileName = file.name.replace('.js', '');
        
        console.log('Импортируем файл:', fileName);
        console.log('Содержимое:', fileContent.substring(0, 200) + '...');
        
        let importedData = parseJSFile(fileContent, fileName);
        
        console.log('Распарсенные данные:', importedData);
        
        if (fileName === 'category-services') {
          // Обработка импорта категорий услуг
          if (!confirm(`Импортировать данные категорий услуг?`)) {
            return;
          }
          
          try {
            localStorage.setItem("chipgadget_category_services", JSON.stringify(importedData));
            setCategoryServices(importedData);
            setMessage(`✅ Данные категорий услуг успешно импортированы!`);
          } catch (e) {
            console.error('Ошибка импорта категорий:', e);
            setMessage('❌ Ошибка при импорте категорий услуг');
          }
        } else if (fileName === 'delivery-data') {
          // Обработка импорта данных доставки
          if (!confirm(`Импортировать данные доставки?`)) {
            return;
          }
          
          try {
            localStorage.setItem("chipgadget_delivery", JSON.stringify(importedData));
            setMessage(`✅ Данные доставки успешно импортированы!`);
          } catch (e) {
            console.error('Ошибка импорта доставки:', e);
            setMessage('❌ Ошибка при импорте данных доставки');
          }
        } else {
          // Обработка импорта данных бренда
          if (!confirm(`Импортировать данные для бренда ${fileName}?`)) {
            return;
          }
          
          const mergedData = { ...data };
          if (mergedData[fileName] && importedData.models) {
            Object.keys(importedData.models).forEach(modelKey => {
              if (mergedData[fileName].models[modelKey]) {
                mergedData[fileName].models[modelKey] = importedData.models[modelKey].map(service => ({
                  name: service.name || service.title || "Услуга",
                  price: service.price || service.basePrice || 0,
                  finalPrice: service.finalPrice || service.price || service.basePrice || 0,
                  active: service.active !== undefined ? service.active : true,
                  discount: service.discount || 0
                }));
              }
            });
            
            setData(mergedData);
            saveToLocal(mergedData);
            setUnsaved(false);
            setMessage(`✅ Данные для ${fileName} успешно импортированы!`);
          } else {
            setMessage('❌ Бренд не найден в текущей структуре');
          }
        }
        
      } catch (error) {
        console.error('Ошибка импорта JS:', error);
        setMessage(`❌ Ошибка: ${error.message}`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const addBrand = () => {
    const name = prompt("Введите название нового бренда:");
    if (!name) return;
    const key = name.toLowerCase().replace(/\s+/g, "-");
    if (data[key]) return alert("Такой бренд уже существует!");

    const newBrand = {
      brand: name,
      currency: "₽",
      discount: { type: "none", value: 0 },
      models: {},
    };

    const updated = { ...data, [key]: newBrand };
    setData(updated);
    setBrandKey(key);
    saveToLocal(updated);
    setUnsaved(false);
    setMessage(`✅ Бренд "${name}" добавлен`);
    setTimeout(() => setMessage(""), 3000);
  };

  const deleteBrand = () => {
    if (!brandKey) return alert("Сначала выберите бренд!");
    if (!confirm(`Удалить бренд "${data[brandKey]?.brand}"?`)) return;
    const updated = { ...data };
    delete updated[brandKey];
    setData(updated);
    setBrandKey("");
    saveToLocal(updated);
    setUnsaved(false);
    setMessage("🗑️ Бренд удалён");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSave = () => {
    saveToLocal(data);
    setUnsaved(false);
    setMessage("💾 Изменения сохранены локально");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleExport = () => {
    exportJSON(data);
  };

  const handleExportJS = async () => {
    setIsExporting(true);
    setMessage("📦 Создание ZIP архива...");
    
    const success = await exportJSFilesAsZip(data);
    
    if (success) {
      setMessage("✅ Бренды упакованы в ZIP архив");
    } else {
      setMessage("✅ Бренды экспортированы по отдельности");
    }
    
    setTimeout(() => {
      setMessage("");
      setIsExporting(false);
    }, 4000);
  };

  // ФУНКЦИЯ: Экспорт услуг по категориям
  const handleExportCategoryServices = () => {
    const success = exportCategoryServices(categoryServices);
    if (success) {
      setMessage("✅ Услуги по категориям экспортированы в category-services.js");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("❌ Ошибка при экспорте услуг по категориям");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // ФУНКЦИЯ: Экспорт данных доставки
  const handleExportDeliveryData = () => {
    const success = exportDeliveryData();
    if (success) {
      setMessage("✅ Данные доставки экспортированы в delivery-data.js");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("❌ Ошибка при экспорте данных доставки");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const getBrandStyle = (key) => {
    const { status } = getBrandStatus(data[key]);
    if (status === "empty")
      return { color: "#b91c1c", backgroundColor: "#fee2e2" };
    if (status === "partial")
      return { color: "#92400e", backgroundColor: "#fef3c7" };
    if (status === "full")
      return { color: "#065f46", backgroundColor: "#d1fae5" };
    return {};
  };

  const getBrandLabel = (key) => {
    const { status, emptyCount } = getBrandStatus(data[key]);
    const icon = status === "empty" ? "🔴" : status === "partial" ? "🟡" : "🟢";
    const brandName = data[key]?.brand?.toUpperCase?.() || key;
    return `${icon} ${brandName}${
      emptyCount > 0 ? ` (${emptyCount} незаполненных)` : ""
    }`;
  };

  const currentBrand = brandKey ? data[brandKey] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8">
      <div className="bg-gradient-to-r from-cyan-700 to-purple-700 text-white text-sm py-2 px-4 rounded-b-lg shadow-md mb-6 text-center">
        ⚙️ Админка Chip&Gadget — редактирование брендов, моделей и услуг
      </div>

      {/* Переключение вкладок */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg p-1 shadow-md">
          <button
            onClick={() => setActiveTab("brands")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "brands" 
                ? "bg-blue-600 text-white" 
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            📱 Бренды и модели
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "categories" 
                ? "bg-blue-600 text-white" 
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            🛠️ Услуги по категориям
          </button>
          <button
            onClick={() => setActiveTab("delivery")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "delivery" 
                ? "bg-blue-600 text-white" 
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            🚚 Доставка
          </button>
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg text-white font-medium bg-cyan-600 hover:bg-cyan-700"
        >
          💾 Сохранить
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700"
        >
          ⬇️ Экспорт JSON
        </button>
        <button
          onClick={handleExportJS}
          disabled={isExporting}
          className={`px-4 py-2 rounded-lg text-white font-medium ${
            isExporting ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isExporting ? "📦 Архив..." : "📁 Экспорт ZIP"}
        </button>
        {/* КНОПКА: Экспорт ТВ/ноутбуки */}
        <button
          onClick={handleExportCategoryServices}
          className="px-4 py-2 rounded-lg text-white font-medium bg-orange-600 hover:bg-orange-700"
        >
          📺 Экспорт ТВ/ноутбуки
        </button>
        {/* КНОПКА: Экспорт доставки */}
        <button
          onClick={handleExportDeliveryData}
          className="px-4 py-2 rounded-lg text-white font-medium bg-red-600 hover:bg-red-700"
        >
          🚚 Экспорт доставки
        </button>
        <button
          onClick={() => importJsonRef.current?.click()}
          className="px-4 py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700"
        >
          📤 Импорт JSON
        </button>
        <button
          onClick={() => importJsRef.current?.click()}
          className="px-4 py-2 rounded-lg text-white font-medium bg-purple-600 hover:bg-purple-700"
        >
          📤 Импорт JS
        </button>
        <button
          onClick={addBrand}
          className="px-4 py-2 rounded-lg text-white font-medium bg-emerald-600 hover:bg-emerald-700"
        >
          ➕ Добавить бренд
        </button>
        <button
          onClick={deleteBrand}
          className="px-4 py-2 rounded-lg text-white font-medium bg-rose-600 hover:bg-rose-700"
        >
          🗑️ Удалить бренд
        </button>
      </div>

      {/* Скрытые input'ы для импорта */}
      <input
        type="file"
        accept=".json"
        ref={importJsonRef}
        onChange={handleImport}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        accept=".js"
        ref={importJsRef}
        onChange={handleImportJS}
        style={{ display: 'none' }}
      />

      {message && (
        <div className={`text-center font-medium mb-4 ${
          message.includes('❌') ? 'text-red-700' : 'text-green-700'
        }`}>
          {message}
        </div>
      )}

      {unsaved && (
        <div className="text-center text-orange-600 font-medium mb-4">
          ⚠️ Есть несохраненные изменения
        </div>
      )}

      {/* Контент в зависимости от активной вкладки */}
      {activeTab === "brands" ? (
        <>
          {/* Выбор бренда */}
          <div className="max-w-md mx-auto bg-white/90 rounded-2xl shadow p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Выберите бренд:
            </h2>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-cyan-500"
              value={brandKey}
              onChange={(e) => setBrandKey(e.target.value)}
            >
              <option value="">— Не выбран —</option>
              {brands.map((key) => (
                <option key={key} value={key} style={getBrandStyle(key)}>
                  {getBrandLabel(key)}
                </option>
              ))}
            </select>
          </div>

          {/* Редактор брендов */}
          {currentBrand ? (
            <BrandEditor
              brandKey={brandKey}
              data={data}
              onChange={(key, updated) => {
                if (updated === null) {
                  const updatedData = { ...data };
                  delete updatedData[key];
                  setData(updatedData);
                  setBrandKey("");
                } else {
                  setData((prev) => ({ ...prev, [key]: updated }));
                }
              }}
            />
          ) : (
            <div className="text-center text-gray-500 italic">
              Выберите или создайте бренд.
            </div>
          )}
        </>
      ) : activeTab === "categories" ? (
        /* Редактор услуг по категориям */
        <CategoryServicesEditor 
          data={categoryServices} 
          onChange={setCategoryServices} 
        />
      ) : (
        /* Редактор доставки */
        <DeliveryEditor />
      )}
    </div>
  );
}