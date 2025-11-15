// AdminPanel.jsx (добавлена вкладка для услуг категорий)
import React, { useState, useEffect, useRef } from "react";
import { PRICES } from "../data/prices";
import { brandData } from "../data/brandData";
import { SERVICES } from "../data/services";
import BrandEditor from "../components/admin/BrandEditor";
import CategoryServicesEditor from "../components/admin/CategoryServicesEditor";
import { getModelStatus, getBrandStatus } from '../utils/priceUtils';
import AdminAuth from "../components/AdminAuth";

// ... (остальные функции остаются такими же)

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
  const [activeTab, setActiveTab] = useState("brands"); // "brands" или "categories"
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

  // Автосохранение категорий
  useEffect(() => {
    localStorage.setItem("chipgadget_category_services", JSON.stringify(categoryServices));
  }, [categoryServices]);

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

  // ... (остальные функции остаются такими же)

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
        {/* ... остальные кнопки ... */}
      </div>

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
          {brandKey ? (
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