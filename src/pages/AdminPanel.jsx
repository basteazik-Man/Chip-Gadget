// src/pages/AdminPanel.jsx
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
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid data structure in localStorage');
      }
      return parsed;
    } catch (e) {
      console.error("Ошибка загрузки из localStorage:", e);
      localStorage.removeItem("chipgadget_prices");
    }
  }

  // Используем все бренды из BRANDS
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

// === ИСПРАВЛЕННАЯ ФУНКЦИЯ ТРАНСФОРМАЦИИ (для ZIP экспорта) ===
const transformDataForExport = (data) => {
  const transformed = JSON.parse(JSON.stringify(data));
  
  Object.keys(transformed).forEach(brandKey => {
    const brand = transformed[brandKey];
    
    Object.keys(brand.models).forEach(modelKey => {
      const modelData = brand.models[modelKey];
      let servicesList = [];

      // 1. Извлекаем массив услуг в зависимости от структуры
      if (Array.isArray(modelData)) {
        servicesList = modelData;
      } else if (modelData && typeof modelData === 'object' && modelData.services) {
        servicesList = modelData.services;
      }
      
      // 2. Если услуг нет или структура неверная, ставим пустой массив
      if (!Array.isArray(servicesList)) {
        servicesList = [];
      }

      // 3. Трансформируем услуги для сохранения
      brand.models[modelKey] = servicesList.map(service => {
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

// Функция для создания и скачивания ZIP архива (Использует JSZip)
const exportJSFilesAsZip = async (data) => {
  try {
    const transformedData = transformDataForExport(data);
    
    // Динамический импорт jszip (убедитесь, что выполнен npm install jszip)
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

    const readmeContent = `# Chip&Gadget Price Files\n\nСгенерировано: ${new Date().toLocaleString()}\n\nРаспакуйте в src/data/prices/`;
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
    alert('Не удалось создать ZIP архив. Убедитесь, что установлен jszip (npm install jszip). Ошибка: ' + error.message);
    return false;
  }
};

// === НОВАЯ ФУНКЦИЯ: Экспорт BrandData ===
const exportBrandData = async (data) => {
  try {
    const { generateUpdatedBrandData } = await import('../utils/updateBrandData');
    const result = generateUpdatedBrandData(data);
    
    if (!result.hasChanges) {
      alert("ℹ️ Нет изменений (новых или удаленных моделей) для обновления brandData");
      return false;
    }

    const blob = new Blob([result.content], { type: "application/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `brandData-updated.js`;
    a.click();
    URL.revokeObjectURL(a.href);
    
    let reportMessage = `✅ Файл brandData сгенерирован!\n\n`;
    if (result.addedModels.length > 0) {
      reportMessage += `Добавлено моделей: ${result.addedModels.length}\n`;
    }
    if (result.removedModels && result.removedModels.length > 0) {
      reportMessage += `Удалено моделей: ${result.removedModels.length}\n`;
    }
    reportMessage += `\nВАЖНО: Замените файл "src/data/brandData.js" этим скачанным файлом!`;
    
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

  const handleExport = () => { exportJSON(data); };

  const handleExportJS = async () => {
    setIsExporting(true);
    setMessage("📦 Создание ZIP архива...");
    const success = await exportJSFilesAsZip(data);
    if (success) setMessage("✅ Бренды упакованы в ZIP архив");
    else setMessage("❌ Ошибка при создании ZIP");
    
    setTimeout(() => {
      setMessage("");
      setIsExporting(false);
    }, 4000);
  };

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

  const handleExportCategoryServices = () => {
    if (exportCategoryServices(categoryServices)) setMessage("✅ Услуги по категориям экспортированы");
    else setMessage("❌ Ошибка при экспорте услуг");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleExportDeliveryData = () => {
    if (exportDeliveryData()) setMessage("✅ Данные доставки экспортированы");
    else setMessage("❌ Ошибка при экспорте данных доставки");
    setTimeout(() => setMessage(""), 3000);
  };

  const getBrandStyle = (key) => {
    const { status } = getBrandStatus(data[key]);
    if (status === "empty") return { color: "#b91c1c", backgroundColor: "#fee2e2" };
    if (status === "partial") return { color: "#92400e", backgroundColor: "#fef3c7" };
    if (status === "full") return { color: "#065f46", backgroundColor: "#d1fae5" };
    return {};
  };

  const getBrandLabel = (key) => {
    const { status, emptyCount } = getBrandStatus(data[key]);
    const icon = status === "empty" ? "🔴" : status === "partial" ? "🟡" : "🟢";
    const brandName = data[key]?.brand?.toUpperCase?.() || key;
    return `${icon} ${brandName}${emptyCount > 0 ? ` (${emptyCount} незаполненных)` : ""}`;
  };

  const currentBrand = brandKey ? data[brandKey] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8">
      <div className="bg-gradient-to-r from-cyan-700 to-purple-700 text-white text-sm py-2 px-4 rounded-b-lg shadow-md mb-6 text-center">
        ⚙️ Админка Chip&Gadget — редактирование брендов, моделей и услуг
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg p-1 shadow-md">
          <button onClick={() => setActiveTab("brands")} className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === "brands" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-800"}`}>📱 Бренды и модели</button>
          <button onClick={() => setActiveTab("categories")} className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === "categories" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-800"}`}>🛠️ Услуги по категориям</button>
          <button onClick={() => setActiveTab("delivery")} className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === "delivery" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-800"}`}>🚚 Доставка</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <button onClick={handleSave} className="px-4 py-2 rounded-lg text-white font-medium bg-cyan-600 hover:bg-cyan-700">💾 Сохранить</button>
        <button onClick={handleExport} className="px-4 py-2 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700">⬇️ Экспорт JSON</button>
        <button onClick={handleExportJS} disabled={isExporting} className={`px-4 py-2 rounded-lg text-white font-medium ${isExporting ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"}`}>{isExporting ? "📦 Архив..." : "📁 Экспорт ZIP"}</button>
        <button onClick={handleExportBrandData} disabled={isExporting} className={`px-4 py-2 rounded-lg text-white font-medium ${isExporting ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"}`}>📝 Экспорт BrandData</button>
        <button onClick={handleExportCategoryServices} className="px-4 py-2 rounded-lg text-white font-medium bg-orange-600 hover:bg-orange-700">📺 Экспорт ТВ</button>
        <button onClick={handleExportDeliveryData} className="px-4 py-2 rounded-lg text-white font-medium bg-red-600 hover:bg-red-700">🚚 Экспорт доставки</button>
        <button onClick={addBrand} className="px-4 py-2 rounded-lg text-white font-medium bg-emerald-600 hover:bg-emerald-700">➕ Бренд</button>
        <button onClick={deleteBrand} className="px-4 py-2 rounded-lg text-white font-medium bg-rose-600 hover:bg-rose-700">🗑️ Бренд</button>
      </div>

      {message && <div className={`text-center font-medium mb-4 ${message.includes('❌') ? 'text-red-700' : 'text-green-700'}`}>{message}</div>}
      {unsaved && <div className="text-center text-orange-600 font-medium mb-4">⚠️ Есть несохраненные изменения</div>}

      {activeTab === "brands" ? (
        <>
          <div className="max-w-md mx-auto bg-white/90 rounded-2xl shadow p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Выберите бренд:</h2>
            <select className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-cyan-500" value={brandKey} onChange={(e) => setBrandKey(e.target.value)}>
              <option value="">— Не выбран —</option>
              {brands.map((key) => <option key={key} value={key} style={getBrandStyle(key)}>{getBrandLabel(key)}</option>)}
            </select>
          </div>
          {currentBrand ? <BrandEditor brandKey={brandKey} data={data} onChange={(key, updated) => { if (updated === null) { const updatedData = { ...data }; delete updatedData[key]; setData(updatedData); setBrandKey(""); } else { setData((prev) => ({ ...prev, [key]: updated })); } }} /> : <div className="text-center text-gray-500 italic">Выберите или создайте бренд.</div>}
        </>
      ) : activeTab === "categories" ? (
        <CategoryServicesEditor data={categoryServices} onChange={setCategoryServices} />
      ) : (
        <DeliveryEditor />
      )}
    </div>
  );
}