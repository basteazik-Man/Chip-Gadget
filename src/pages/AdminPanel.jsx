import React, { useState, useEffect, useRef } from "react";
import BrandEditor from "../components/admin/BrandEditor";
import CategoryServicesEditor from "../components/admin/CategoryServicesEditor";
import DeliveryEditor from "../components/admin/DeliveryEditor";
import ProductEditor from "../components/admin/ProductEditor"; // ← ДОБАВЛЕНО
import AdminAuth from "../components/AdminAuth";
import { getBrandStatus } from "../utils/priceUtils";
import { BRANDS } from "../data/brands";
import { brandData } from "../data/brandData";

const validateSession = () => {
  try {
    let sessionData = sessionStorage.getItem('admin_session') || localStorage.getItem('admin_session');
    
    if (!sessionData) return false;

    const session = JSON.parse(sessionData);
    
    if (Date.now() > session.expires) {
      localStorage.removeItem('admin_session');
      sessionStorage.removeItem('admin_session');
      localStorage.removeItem('admin_authenticated');
      return false;
    }
    
    if (session.userAgent !== navigator.userAgent) {
      localStorage.removeItem('admin_session');
      sessionStorage.removeItem('admin_session');
      localStorage.removeItem('admin_authenticated');
      return false;
    }
    
    return true;
  } catch {
    localStorage.removeItem('admin_session');
    sessionStorage.removeItem('admin_session');
    localStorage.removeItem('admin_authenticated');
    return false;
  }
};

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
  
  const saved = localStorage.getItem("chipgadget_prices");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid data structure in localStorage');
      }
      return parsed;
    } catch (e) {
      console.error("Ошибка загрузки из localStorage:", e);
      localStorage.removeItem("chipgadget_prices");
    }
  }

  BRANDS.forEach((brand) => {
    const key = brand.id;
    const modelsObj = {};
    const allModels = getAllModelsFromBrandData(key);
    
    allModels.forEach((model) => {
      const modelKey = typeof model === 'string' ? model : (model.id || "unknown-model");
      modelsObj[modelKey] = [];
    });

    data[key] = {
      brand: brand.title,
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

// === ФУНКЦИИ ДЛЯ ТОВАРОВ ===
const exportProducts = () => {
  try {
    const productsData = localStorage.getItem("chipgadget_products");
    if (!productsData) {
      alert("Нет товаров для экспорта");
      return false;
    }
    
    const blob = new Blob([productsData], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `chipgadget-products-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    return true;
  } catch (error) {
    console.error('Ошибка при экспорте товаров:', error);
    return false;
  }
};

const importProducts = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedProducts = JSON.parse(e.target.result);
      
      if (!confirm(`Импортировать товары? Будет добавлено/обновлено ${Object.keys(importedProducts).length} товаров.`)) {
        return;
      }

      // Получаем текущие товары
      const currentProducts = JSON.parse(localStorage.getItem("chipgadget_products") || "{}");
      
      // Объединяем старые и новые (новые перезаписывают старые при совпадении ID)
      const mergedProducts = { ...currentProducts, ...importedProducts };
      
      // Сохраняем обратно
      localStorage.setItem("chipgadget_products", JSON.stringify(mergedProducts));
      
      alert(`✅ Товары успешно импортированы! Теперь у вас ${Object.keys(mergedProducts).length} товаров.`);
      
      // Перезагружаем страницу, чтобы обновить данные
      window.location.reload();
      
    } catch (error) {
      console.error('Ошибка парсинга JSON:', error);
      alert('❌ Ошибка: неверный формат файла JSON');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
};

// === ИСПРАВЛЕННАЯ ФУНКЦИЯ ТРАНСФОРМАЦИИ ===
const transformDataForExport = (data) => {
  const transformed = JSON.parse(JSON.stringify(data));
  
  Object.keys(transformed).forEach(brandKey => {
    const brand = transformed[brandKey];
    const normalizedModels = {};
    
    Object.keys(brand.models).forEach(modelKey => {
      // НОРМАЛИЗУЕМ КЛЮЧ МОДЕЛИ ПРИ ЭКСПОРТЕ
      const normalizedKey = normalizeKey(modelKey);
      
      // Если модель с таким нормализованным ключом уже есть, объединяем услуги
      if (normalizedModels[normalizedKey]) {
        // Объединяем услуги из обеих моделей (уникальные по названию)
        const existingServices = normalizedModels[normalizedKey];
        const newServices = brand.models[modelKey];
        
        const serviceMap = {};
        
        // Добавляем существующие услуги
        existingServices.forEach(service => {
          const serviceName = normalizeKey(service.name || service.title || "");
          serviceMap[serviceName] = service;
        });
        
        // Добавляем новые услуги (перезаписываем при совпадении)
        newServices.forEach(service => {
          const serviceName = normalizeKey(service.name || service.title || "");
          serviceMap[serviceName] = {
            name: service.name || service.title || "Услуга",
            price: service.price || service.basePrice || 0,
            finalPrice: service.finalPrice || service.price || service.basePrice || 0,
            active: service.active !== undefined ? service.active : true,
            discount: service.discount || 0
          };
        });
        
        normalizedModels[normalizedKey] = Object.values(serviceMap);
      } else {
        // Первая модель с таким нормализованным ключом
        normalizedModels[normalizedKey] = brand.models[modelKey].map(service => {
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
      }
    });
    
    brand.models = normalizedModels;
  });
  
  return transformed;
};

// === ИСПРАВЛЕННАЯ ФУНКЦИЯ ИМПОРТА ===
const mergeImportedData = (currentData, importedData) => {
  const merged = { ...currentData };
  
  Object.keys(importedData).forEach(brandKey => {
    const importedBrand = importedData[brandKey];
    
    if (merged[brandKey]) {
      if (importedBrand.currency) merged[brandKey].currency = importedBrand.currency;
      if (importedBrand.discount) merged[brandKey].discount = importedBrand.discount;
      
      if (importedBrand.models) {
        Object.keys(importedBrand.models).forEach(modelKey => {
          if (merged[brandKey].models[modelKey]) {
            // Получаем текущий массив услуг (даже если он внутри объекта)
            let currentServices = [];
            let isObjectStructure = false;
            
            if (Array.isArray(merged[brandKey].models[modelKey])) {
              currentServices = merged[brandKey].models[modelKey];
            } else {
              currentServices = merged[brandKey].models[modelKey].services || [];
              isObjectStructure = true;
            }

            const importedServices = importedBrand.models[modelKey];
            
            if (Array.isArray(importedServices) && importedServices.length > 0) {
              const serviceMap = {};
              importedServices.forEach(service => {
                const serviceName = service.name || service.title;
                if (serviceName) serviceMap[serviceName] = service;
              });
              
              const updatedServices = currentServices.map(currentService => {
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

              // Сохраняем обновленные услуги обратно в правильную структуру
              if (isObjectStructure) {
                merged[brandKey].models[modelKey].services = updatedServices;
              } else {
                merged[brandKey].models[modelKey] = updatedServices;
              }
            }
          }
        });
      }
    }
  });

  if (importedData._categoryServices) {
    try {
      localStorage.setItem("chipgadget_category_services", JSON.stringify(importedData._categoryServices));
      console.log("✅ Категории услуг импортированы");
    } catch (e) { console.error("❌ Ошибка импорта категорий услуг:", e); }
  }

  if (importedData._deliveryData) {
    try {
      localStorage.setItem("chipgadget_delivery", JSON.stringify(importedData._deliveryData));
      console.log("✅ Данные доставки импортированы");
    } catch (e) { console.error("❌ Ошибка импорта данных доставки:", e); }
  }
  
  return merged;
};

const exportJSFilesAsZip = async (data) => {
  try {
    const transformedData = transformDataForExport(data);
    
    const JSZip = await import('jszip');
    const zip = new JSZip.default();
    
    Object.keys(transformedData).forEach((key) => {
      const content = `// Автоматически сгенерировано Chip&Gadget Admin\nexport default ${JSON.stringify(
        transformedData[key],
        null,
        2
      )};`;
      zip.file(`${key}.js`, content);
    });

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

    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `chipgadget-brands-${new Date().toISOString().split('T')[0]}.zip`;
    a.click();
    
    URL.revokeObjectURL(a.href);
    
    return true;
  } catch (error) {
    console.error('Ошибка при создании ZIP архива:', error);
    
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
    if (fileName === 'category-services') {
      const servicesMatch = fileContent.match(/export const SERVICES_BY_CATEGORY = (\{[\s\S]*?\});/);
      if (servicesMatch) {
        const dataStr = servicesMatch[1]
          .replace(/(\w+):/g, '"$1":').replace(/'/g, '"').replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        return JSON.parse(dataStr);
      }
      throw new Error('Не найден SERVICES_BY_CATEGORY в файле');
    }
    
    if (fileName === 'delivery-data') {
      const deliveryMatch = fileContent.match(/export const DELIVERY_DATA = (\{[\s\S]*?\});/);
      if (deliveryMatch) {
        const dataStr = deliveryMatch[1]
          .replace(/(\w+):/g, '"$1":').replace(/'/g, '"').replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        return JSON.parse(dataStr);
      }
      throw new Error('Не найден DELIVERY_DATA в файле');
    }
    
    const defaultMatch = fileContent.match(/export default (\{[\s\S]*?\});/);
    if (defaultMatch) {
      const dataStr = defaultMatch[1]
        .replace(/(\w+):/g, '"$1":').replace(/'/g, '"').replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
      return JSON.parse(dataStr);
    }
    
    throw new Error('Не найден export default в файле');
  } catch (error) {
    console.error('Ошибка парсинга JS файла:', error);
    throw new Error(`Неверный формат JS файла: ${error.message}`);
  }
};

// ФУНКЦИЯ ЭКСПОРТА BRANDDATA
const exportBrandData = async (data) => {
  try {
    const { generateUpdatedBrandData } = await import('../utils/updateBrandData');
    const result = generateUpdatedBrandData(data);
    
    if (!result.hasChanges) {
      alert("ℹ️ Нет изменений для добавления в brandData");
      return false;
    }

    const blob = new Blob([result.content], { type: "application/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `brandData.js`;
    a.click();
    URL.revokeObjectURL(a.href);
    
    let reportMessage = `✅ BrandData обновлен!\n\n`;
    if (result.addedModels.length > 0) {
      const addedList = result.addedModels.map(item => `• ${item.brand} - ${item.name} (${item.category})`).join('\n');
      reportMessage += `Добавлено моделей: ${result.addedModels.length}\n${addedList}\n\n`;
    }
    if (result.removedModels && result.removedModels.length > 0) {
      const removedList = result.removedModels.map(item => `• ${item.brand} - ${item.name} (${item.category})`).join('\n');
      reportMessage += `Удалено моделей: ${result.removedModels.length}\n${removedList}\n\n`;
    }
    reportMessage += `Файл "brandData.js" готов для замены существующего файла!`;
    
    alert(reportMessage);
    return true;
  } catch (error) {
    console.error('Ошибка при экспорте BrandData:', error);
    alert('❌ Ошибка при обновлении brandData: ' + error.message);
    return false;
  }
};

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(() => {
    return validateSession();
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
  const [activeTab, setActiveTab] = useState("brands"); // ← ПО УМОЛЧАНИЮ БРЕНДЫ
  const saveTimer = useRef(null);
  const importJsonRef = useRef(null);
  const importJsRef = useRef(null);
  const importProductsRef = useRef(null); // ← ДОБАВЛЕН ДЛЯ ТОВАРОВ

  const handleLogout = () => {
    if (confirm("Вы уверены, что хотите выйти из админ-панели?")) {
      localStorage.removeItem('admin_session');
      sessionStorage.removeItem('admin_session');
      localStorage.removeItem('admin_authenticated');
      localStorage.removeItem('admin_auth_attempts');
      localStorage.removeItem('admin_last_attempt_time');
      
      setAuthenticated(false);
      setMessage("✅ Вы успешно вышли из системы");
      
      setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  };

  // ВСЕ ХУКИ useEffect ВЫЗЫВАЮТСЯ БЕЗУСЛОВНО
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
          if (!confirm(`Импортировать данные для бренда ${fileName}?`)) {
            return;
          }
          
          const mergedData = { ...data };
          if (mergedData[fileName] && importedData.models) {
            Object.keys(importedData.models).forEach(modelKey => {
              if (mergedData[fileName].models[modelKey]) {
                const modelData = mergedData[fileName].models[modelKey];
                const importedModels = importedData.models[modelKey];
                
                // Поддержка новой структуры
                const newServices = importedModels.map(service => ({
                  name: service.name || service.title || "Услуга",
                  price: service.price || service.basePrice || 0,
                  finalPrice: service.finalPrice || service.price || service.basePrice || 0,
                  active: service.active !== undefined ? service.active : true,
                  discount: service.discount || 0
                }));

                if (Array.isArray(modelData)) {
                  mergedData[fileName].models[modelKey] = newServices;
                } else if (typeof modelData === 'object') {
                  mergedData[fileName].models[modelKey].services = newServices;
                }
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

  // === ФУНКЦИИ ДЛЯ ТОВАРОВ ===
  const handleExportProducts = () => {
    const success = exportProducts();
    if (success) {
      setMessage("✅ Товары экспортированы в JSON файл");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("❌ Ошибка при экспорте товаров");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleImportProducts = (event) => {
    importProducts(event);
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

  // ФУНКЦИЯ ЭКСПОРТА BRANDDATA
  const handleExportBrandData = async () => {
    setIsExporting(true);
    setMessage("🔄 Генерация обновленного BrandData...");
    try {
      await exportBrandData(data);
    } catch (error) {
      setMessage("❌ Ошибка при обновлении BrandData");
    } finally {
      setIsExporting(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const restoreAllBrands = () => {
    if (!confirm("Восстановить все бренды? Это добавит отсутствующие бренды в текущие данные.")) return;
    
    const updatedData = { ...data };
    let addedCount = 0;
    
    BRANDS.forEach((brand) => {
      const key = brand.id;
      if (!updatedData[key]) {
        const modelsObj = {};
        const allModels = getAllModelsFromBrandData(key);
        
        allModels.forEach((model) => {
          const modelKey = typeof model === 'string' ? model : (model.id || "unknown-model");
          modelsObj[modelKey] = [];
        });

        updatedData[key] = {
          brand: brand.title,
          currency: "₽",
          discount: { type: "none", value: 0 },
          models: modelsObj,
        };
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      setData(updatedData);
      saveToLocal(updatedData);
      setMessage(`✅ Добавлено ${addedCount} отсутствующих брендов`);
    } else {
      setMessage("✅ Все бренды уже присутствуют");
    }
    
    setTimeout(() => setMessage(""), 3000);
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

  // УСЛОВНЫЙ РЕНДЕРИНГ КОМПОНЕНТОВ - ПОСЛЕ ВСЕХ ХУКОВ
  if (!authenticated) {
    return <AdminAuth onAuthenticate={setAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8">
      <div className="bg-gradient-to-r from-cyan-700 to-purple-700 text-white text-sm py-2 px-4 rounded-b-lg shadow-md mb-6 relative">
        <div className="text-center">
          ⚙️ Админка Chip&Gadget — редактирование брендов, моделей, услуг и товаров
        </div>
        <button
          onClick={handleLogout}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-xs font-medium transition-colors"
          title="Выйти из админ-панели"
        >
          🚪 Выйти
        </button>
      </div>

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
          {/* ← НОВАЯ КНОПКА ДЛЯ ТОВАРОВ */}
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "products" 
                ? "bg-blue-600 text-white" 
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            🛒 Товары магазина
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {/* Кнопки для товаров */}
        {activeTab === "products" ? (
          <>
            <button
              onClick={handleExportProducts}
              className="px-4 py-2 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700"
            >
              📤 Экспорт товаров
            </button>
            <button
              onClick={() => importProductsRef.current?.click()}
              className="px-4 py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700"
            >
              📥 Импорт товаров
            </button>
          </>
        ) : (
          <>
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
              onClick={handleExportBrandData}
              disabled={isExporting}
              className={`px-4 py-2 rounded-lg text-white font-medium ${
                isExporting ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              📝 Экспорт BrandData
            </button>
            <button
              onClick={handleExportCategoryServices}
              className="px-4 py-2 rounded-lg text-white font-medium bg-orange-600 hover:bg-orange-700"
            >
              📺 Экспорт ТВ/ноутбуки
            </button>
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
            <button
              onClick={restoreAllBrands}
              className="px-4 py-2 rounded-lg text-white font-medium bg-amber-600 hover:bg-amber-700"
            >
              🔄 Восстановить бренды
            </button>
          </>
        )}
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
      <input
        type="file"
        accept=".json"
        ref={importProductsRef}
        onChange={handleImportProducts}
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

      {/* Рендерим активную вкладку */}
      {activeTab === "brands" ? (
        <>
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
              {Object.keys(data).map((key) => (
                <option key={key} value={key} style={getBrandStyle(key)}>
                  {getBrandLabel(key)}
                </option>
              ))}
            </select>
          </div>

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
        <CategoryServicesEditor 
          data={categoryServices} 
          onChange={setCategoryServices} 
        />
      ) : activeTab === "delivery" ? (
        <DeliveryEditor />
      ) : activeTab === "products" ? (
        <ProductEditor />
      ) : null}
    </div>
  );
}