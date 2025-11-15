// AdminPanel.jsx
import React, { useState, useEffect, useRef } from "react";
import BrandEditor from "../components/admin/BrandEditor";
import CategoryServicesEditor from "../components/admin/CategoryServicesEditor";
import AdminAuth from "../components/AdminAuth";
import { getBrandStatus } from "../utils/priceUtils";

// Вспомогательная функция для получения всех моделей из brandData
const getAllModelsFromBrandData = (brandKey) => {
  // В реальном коде здесь должна быть логика из brandData
  // Создаем заглушку для демонстрации
  const mockModels = {
    'apple': ['iphone-13', 'iphone-14', 'iphone-15', 'ipad-pro'],
    'samsung': ['galaxy-s23', 'galaxy-s24', 'galaxy-tab'],
    'xiaomi': ['redmi-note-12', 'poco-x5', 'mi-13'],
    'honor': ['honor-90', 'honor-x8', 'honor-pad']
  };
  return mockModels[brandKey] || [];
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

  // Создаем базовую структуру
  const defaultBrands = ['apple', 'samsung', 'xiaomi', 'honor'];
  defaultBrands.forEach((key) => {
    const modelsObj = {};
    const allModels = getAllModelsFromBrandData(key);
    
    allModels.forEach((model) => {
      const modelKey = typeof model === 'string' ? model : (model.id || "unknown-model");
      modelsObj[modelKey] = [];
    });

    data[key] = {
      brand: key.charAt(0).toUpperCase() + key.slice(1),
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
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `chipgadget-prices-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
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
  
  return merged;
};

// Функция для создания и скачивания ZIP архива
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

Сгенерировано: ${new Date().toLocaleString()}
`;
    zip.file("README.txt", readmeContent);

    // Генерируем и скачиваем ZIP
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `chipgadget-prices-${new Date().toISOString().split('T')[0]}.zip`;
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
        const match = fileContent.match(/export default (\{[\s\S]*\});?$/);
        if (!match) {
          throw new Error('Неверный формат JS файла');
        }
        
        const dataStr = match[1];
        const jsonStr = dataStr
          .replace(/(\w+):/g, '"$1":')
          .replace(/'/g, '"');
        
        const importedData = JSON.parse(jsonStr);
        const brandKey = file.name.replace('.js', '');
        
        if (!confirm(`Импортировать данные для бренда ${brandKey}?`)) {
          return;
        }
        
        const mergedData = { ...data };
        if (mergedData[brandKey] && importedData.models) {
          Object.keys(importedData.models).forEach(modelKey => {
            if (mergedData[brandKey].models[modelKey]) {
              mergedData[brandKey].models[modelKey] = importedData.models[modelKey].map(service => ({
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
          setMessage(`✅ Данные для ${brandKey} успешно импортированы!`);
        } else {
          setMessage('❌ Бренд не найден в текущей структуре');
        }
        
      } catch (error) {
        console.error('Ошибка импорта JS:', error);
        setMessage('❌ Ошибка: неверный формат JS файла');
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
    const transformedData = transformDataForExport(data);
    exportJSON(transformedData);
  };

  const handleExportJS = async () => {
    setIsExporting(true);
    setMessage("📦 Создание ZIP архива...");
    
    const success = await exportJSFilesAsZip(data);
    
    if (success) {
      setMessage("✅ JS-файлы упакованы в ZIP архив");
    } else {
      setMessage("✅ JS-файлы экспортированы по отдельности");
    }
    
    setTimeout(() => {
      setMessage("");
      setIsExporting(false);
    }, 4000);
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
      ) : (
        /* Редактор услуг по категориям */
        <CategoryServicesEditor 
          data={categoryServices} 
          onChange={setCategoryServices} 
        />
      )}
    </div>
  );
}