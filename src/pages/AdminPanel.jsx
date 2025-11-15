// AdminPanel.jsx
// ЗАМЕНИТЬ существующий файл в: src/pages/AdminPanel.jsx

import React, { useState, useEffect, useRef } from "react";
import { PRICES } from "../data/prices";
import { brandData } from "../data/brandData";
import { SERVICES } from "../data/services";
import BrandEditor from "../components/admin/BrandEditor";
import { getModelStatus, getBrandStatus } from '../utils/priceUtils';
import AdminAuth from "../components/AdminAuth";

// Вспомогательная функция для получения всех моделей из brandData
const getAllModelsFromBrandData = (brandKey) => {
  const brand = brandData[brandKey];
  if (!brand || !brand.categories) return [];
  
  const allModels = [];
  Object.values(brand.categories).forEach(category => {
    if (Array.isArray(category)) {
      allModels.push(...category);
    }
  });
  return allModels;
};

const buildInitialData = () => {
  const data = {};
  
  // Пробуем загрузить из localStorage
  const saved = localStorage.getItem("chipgadget_prices");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      
      // ДОБАВЛЕНО: валидация структуры данных
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid data structure in localStorage');
      }
      
      // Убедимся, что все необходимые бренды есть в данных
      Object.keys(brandData).forEach((key) => {
        if (!parsed[key]) {
          // Если бренда нет в сохраненных данных, создаем его
          const brandInfo = brandData[key];
          const brandName = brandInfo.brand || key.charAt(0).toUpperCase() + key.slice(1);
          const modelsObj = {};

          // Получаем все модели из brandData
          const allModels = getAllModelsFromBrandData(key);
          
          allModels.forEach((model) => {
            const modelKey = model.id || model.name?.toLowerCase?.().replace(/\s+/g, "-") || "unknown-model";
            // Для каждой модели используем пустой массив
            modelsObj[modelKey] = [];
          });

          parsed[key] = {
            brand: brandName,
            currency: "₽",
            discount: { type: "none", value: 0 },
            models: modelsObj,
          };
        } else {
          // ДОБАВЛЕНО: валидация существующих брендов
          if (!parsed[key].models || typeof parsed[key].models !== 'object') {
            parsed[key].models = {};
          }
          
          // ДОБАВЛЕНО: валидация обязательных полей
          if (!parsed[key].brand) {
            parsed[key].brand = key.charAt(0).toUpperCase() + key.slice(1);
          }
          if (!parsed[key].currency) {
            parsed[key].currency = "₽";
          }
          if (!parsed[key].discount || typeof parsed[key].discount !== 'object') {
            parsed[key].discount = { type: "none", value: 0 };
          }
        }
      });
      return parsed;
    } catch (e) {
      console.error("Ошибка загрузки из localStorage:", e);
      // ДОБАВЛЕНО: очистка поврежденных данных
      localStorage.removeItem("chipgadget_prices");
    }
  }

  // Создаем новую структуру из brandData
  Object.keys(brandData).forEach((key) => {
    const brandInfo = brandData[key];
    const brandName = brandInfo.brand || key.charAt(0).toUpperCase() + key.slice(1);
    const modelsObj = {};

    // Получаем все модели из brandData
    const allModels = getAllModelsFromBrandData(key);
    
    allModels.forEach((model) => {
      const modelKey = model.id || model.name?.toLowerCase?.().replace(/\s+/g, "-") || "unknown-model";
      // Для каждой модели создаем пустой массив услуг
      modelsObj[modelKey] = [];
    });

    data[key] = {
      brand: brandName,
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
}

const exportJSON = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `chipgadget-prices-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};

// Функция для преобразования данных в правильный формат экспорта
const transformDataForExport = (data) => {
  const transformed = JSON.parse(JSON.stringify(data)); // глубокое копирование
  
  Object.keys(transformed).forEach(brandKey => {
    const brand = transformed[brandKey];
    
    Object.keys(brand.models).forEach(modelKey => {
      const services = brand.models[modelKey];
      
      // Преобразуем каждую услугу в правильный формат
      brand.models[modelKey] = services.map(service => {
        const transformedService = {
          name: service.name || service.title || "Услуга",
          price: service.price || service.basePrice || 0,
          finalPrice: service.finalPrice || service.price || service.basePrice || 0,
          active: service.active !== undefined ? service.active : true
        };
        
        // Добавляем discount только если он есть и не равен 0
        if (service.discount && service.discount !== 0) {
          transformedService.discount = service.discount;
        }
        
        return transformedService;
      });
    });
  });
  
  return transformed;
};

// Функция для создания и скачивания ZIP архива
const exportJSFilesAsZip = async (data) => {
  try {
    // Преобразуем данные в правильный формат
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

// === Функция слияния данных ===
const mergeImportedData = (currentData, importedData) => {
  const merged = { ...currentData };
  
  Object.keys(importedData).forEach(brandKey => {
    const importedBrand = importedData[brandKey];
    
    // Если бренд существует в текущих данных
    if (merged[brandKey]) {
      console.log(`Обновляем бренд: ${brandKey}`);
      
      // Сохраняем валюту и скидки из импорта
      if (importedBrand.currency) {
        merged[brandKey].currency = importedBrand.currency;
      }
      
      if (importedBrand.discount) {
        merged[brandKey].discount = importedBrand.discount;
      }
      
      if (importedBrand.defaults) {
        merged[brandKey].defaults = importedBrand.defaults;
      }
      
      // Сливаем модели
      if (importedBrand.models) {
        Object.keys(importedBrand.models).forEach(modelKey => {
          // Если модель существует в текущих данных, обновляем услуги
          if (merged[brandKey].models[modelKey]) {
            const importedServices = importedBrand.models[modelKey];
            
            if (Array.isArray(importedServices) && importedServices.length > 0) {
              // Создаем карту услуг для быстрого поиска
              const serviceMap = {};
              importedServices.forEach(service => {
                // Обрабатываем оба формата (name/title и price/basePrice)
                const serviceName = service.name || service.title;
                if (serviceName) {
                  serviceMap[serviceName] = service;
                }
              });
              
              // Обновляем существующие услуги
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
          } else {
            console.log(`Модель ${modelKey} не найдена в текущей структуре, пропускаем`);
          }
        });
      }
    } else {
      console.log(`Бренд ${brandKey} не найден в текущей структуре, пропускаем`);
    }
  });
  
  return merged;
};

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [data, setData] = useState(() => buildInitialData());
  const [brandKey, setBrandKey] = useState("");
  const [message, setMessage] = useState("");
  const [unsaved, setUnsaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const saveTimer = useRef(null);
  const importJsonRef = useRef(null);
  const importJsRef = useRef(null);

  // Если не аутентифицирован, показываем форму входа
  if (!authenticated) {
    return <AdminAuth onAuthenticate={setAuthenticated} />;
  }

  const brands = Object.keys(data);

  // Автосохранение при изменении данных
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToLocal(data);
      setUnsaved(false);
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [data]);

  // Проверяем наличие данных при загрузке
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

  // === Функция импорта данных ===
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

        // Создаем резервную копию текущих данных
        const backupData = { ...data };
        
        try {
          const mergedData = mergeImportedData(data, importedData);
          setData(mergedData);
          saveToLocal(mergedData);
          setUnsaved(false);
          setMessage(`✅ Данные успешно импортированы! Обновлено ${Object.keys(importedData).length} брендов`);
          
          // Даем возможность отката
          setTimeout(() => {
            if (confirm('Сохранить импортированные данные? Если что-то пошло не так, нажмите "Отмена" для отката.')) {
              setMessage('✅ Импорт подтвержден');
            } else {
              // Откат к резервной копии
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
    
    // Сбрасываем input чтобы можно было загрузить тот же файл снова
    event.target.value = '';
  };

  // === Функция импорта из JS файлов ===
  const handleImportJS = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target.result;
        
        // Пытаемся извлечь данные из JS файла (формат: export default { ... })
        const match = fileContent.match(/export default (\{[\s\S]*\});?$/);
        if (!match) {
          throw new Error('Неверный формат JS файла');
        }
        
        // Безопасное выполнение для извлечения объекта
        const dataStr = match[1];
        // Заменяем возможные проблемы с JSON
        const jsonStr = dataStr
          .replace(/(\w+):/g, '"$1":') // Ключи без кавычек
          .replace(/'/g, '"'); // Одинарные кавычки на двойные
        
        const importedData = JSON.parse(jsonStr);
        
        // Определяем brandKey из имени файла
        const brandKey = file.name.replace('.js', '');
        
        if (!confirm(`Импортировать данные для бренда ${brandKey}?`)) {
          return;
        }
        
        const mergedData = { ...data };
        if (mergedData[brandKey] && importedData.models) {
          // Преобразуем импортированные данные в единый формат
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

  // === Добавить бренд ===
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

  // === Удалить бренд ===
  const deleteBrand = () => {
    if (!brandKey) return alert("Сначала выберите бренд!");
    if (!confirm(`Удалить бренд "${data[brandKey].brand}"?`)) return;
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

  // === НОВЫЕ ФУНКЦИИ ДЛЯ СИНХРОНИЗАЦИИ ===
  
  // Генерация QR-кода с данными
  const generateQRCode = () => {
    const dataStr = JSON.stringify(data);
    
    // Если данные слишком большие для QR-кода
    if (dataStr.length > 2000) {
      alert('Данные слишком большие для QR-кода. Используйте экспорт файла.');
      return;
    }
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(dataStr)}`;
    window.open(qrUrl, '_blank');
    setMessage("📱 QR-код с данными открыт в новом окне");
    setTimeout(() => setMessage(""), 3000);
  };

  // Импорт данных из текста (из QR-кода)
  const importFromText = () => {
    const textData = prompt('Введите данные для импорта (из QR-кода или текстового файла):');
    if (!textData) return;
    
    try {
      const importedData = JSON.parse(textData);
      
      if (!confirm(`Импортировать данные? Будут обновлены цены для ${Object.keys(importedData).length} брендов.`)) {
        return;
      }
      
      const mergedData = mergeImportedData(data, importedData);
      setData(mergedData);
      saveToLocal(mergedData);
      setUnsaved(false);
      setMessage(`✅ Данные успешно импортированы! Обновлено ${Object.keys(importedData).length} брендов`);
    } catch (error) {
      setMessage('❌ Ошибка: неверный формат данных');
    }
    
    setTimeout(() => setMessage(""), 3000);
  };

  // Копирование данных в буфер обмена
  const copyToClipboard = async () => {
    try {
      const dataStr = JSON.stringify(data);
      await navigator.clipboard.writeText(dataStr);
      setMessage('✅ Данные скопированы в буфер обмена');
    } catch (error) {
      setMessage('❌ Ошибка копирования в буфер');
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const currentBrand = brandKey ? data[brandKey] : null;

  const getBrandStyle = (key) => {
    const { status } = getBrandStatus(data[key]);
    if (status === "empty")
      return { color: "#b91c1c", backgroundColor: "#fee2e2" }; // красный
    if (status === "partial")
      return { color: "#92400e", backgroundColor: "#fef3c7" }; // жёлтый
    if (status === "full")
      return { color: "#065f46", backgroundColor: "#d1fae5" }; // зелёный
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8">
      <div className="bg-gradient-to-r from-cyan-700 to-purple-700 text-white text-sm py-2 px-4 rounded-b-lg shadow-md mb-6 text-center">
        ⚙️ Админка Chip&Gadget — редактирование брендов, моделей и услуг
      </div>

      {/* Кнопки */}
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

        {/* НОВЫЕ КНОПКИ СИНХРОНИЗАЦИИ */}
        <button
          onClick={generateQRCode}
          className="px-4 py-2 rounded-lg text-white font-medium bg-pink-600 hover:bg-pink-700"
        >
          📱 QR для телефона
        </button>
        <button
          onClick={importFromText}
          className="px-4 py-2 rounded-lg text-white font-medium bg-indigo-600 hover:bg-indigo-700"
        >
          📥 Импорт из текста
        </button>
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 rounded-lg text-white font-medium bg-amber-600 hover:bg-amber-700"
        >
          📋 Копировать данные
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

      {/* Редактор */}
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
    </div>
  );
}