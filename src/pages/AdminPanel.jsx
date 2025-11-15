// AdminPanel.jsx
import React, { useState, useEffect, useRef } from "react";
import BrandEditor from "../components/admin/BrandEditor";
import CategoryServicesEditor from "../components/admin/CategoryServicesEditor";
import AdminAuth from "../components/AdminAuth";

// Упрощенная функция инициализации данных
const buildInitialData = () => {
  try {
    const saved = localStorage.getItem("chipgadget_prices");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Ошибка загрузки из localStorage:", e);
  }
  return {};
};

const saveToLocal = (data) => {
  try {
    localStorage.setItem("chipgadget_prices", JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("❌ Ошибка сохранения:", e);
    return false;
  }
};

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [data, setData] = useState(() => buildInitialData());
  const [categoryServices, setCategoryServices] = useState(() => {
    try {
      const saved = localStorage.getItem("chipgadget_category_services");
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Ошибка загрузки categoryServices:", error);
      return {};
    }
  });
  const [brandKey, setBrandKey] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("brands");

  // Если не аутентифицирован, показываем форму входа
  if (!authenticated) {
    return <AdminAuth onAuthenticate={setAuthenticated} />;
  }

  const brands = Object.keys(data);

  // Автосохранение при изменении данных
  useEffect(() => {
    saveToLocal(data);
  }, [data]);

  // Автосохранение категорий
  useEffect(() => {
    localStorage.setItem("chipgadget_category_services", JSON.stringify(categoryServices));
  }, [categoryServices]);

  const handleSave = () => {
    saveToLocal(data);
    setMessage("💾 Изменения сохранены");
    setTimeout(() => setMessage(""), 3000);
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
    setMessage("🗑️ Бренд удалён");
    setTimeout(() => setMessage(""), 3000);
  };

  const currentBrand = brandKey ? data[brandKey] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8">
      <div className="bg-gradient-to-r from-cyan-700 to-purple-700 text-white text-sm py-2 px-4 rounded-b-lg shadow-md mb-6 text-center">
        ⚙️ Админка Chip&Gadget
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

      {message && (
        <div className={`text-center font-medium mb-4 ${
          message.includes('❌') ? 'text-red-700' : 'text-green-700'
        }`}>
          {message}
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
                <option key={key} value={key}>
                  {data[key]?.brand || key}
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