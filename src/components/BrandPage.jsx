import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { brandData } from "../data/brandData";

export default function BrandPage() {
  const { brand } = useParams();
  const navigate = useNavigate();
  
  // Получаем сохраненную категорию из localStorage
  const getInitialCategory = () => {
    const saved = localStorage.getItem(`selectedCategory_${brand}`);
    const data = brandData[brand?.toLowerCase()];
    const categories = data?.categories ? Object.keys(data.categories) : [];
    return saved && categories.includes(saved) ? saved : (categories[0] || null);
  };

  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory);

  const data = brandData[brand?.toLowerCase()];

  // Обработка ошибок
  if (!brand) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Бренд не найден</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Бренд "{brand}" не поддерживается</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  const hasCategories = data?.categories !== undefined;
  const categories = hasCategories ? Object.keys(data.categories) : [];

  // Сохраняем выбранную категорию
  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem(`selectedCategory_${brand}`, selectedCategory);
    }
  }, [selectedCategory, brand]);

  // Получить модели для выбранной категории ТОЛЬКО из brandData
  const getModelsForCategory = () => {
    if (!selectedCategory || !hasCategories) return [];
    return data.categories[selectedCategory] || [];
  };

  const modelsToDisplay = getModelsForCategory();

  // Получить отображаемое имя категории
  const getCategoryDisplayName = (category) => {
    return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Назад
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 capitalize">
          {data?.brand || brand}
        </h1>

        {hasCategories && categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-3 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                }`}
              >
                {getCategoryDisplayName(cat)}
                {data.categories[cat]?.length > 0 && ` (${data.categories[cat].length})`}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {modelsToDisplay.length > 0 ? (
            modelsToDisplay.map((model) => (
              <button
                key={model.id}
                onClick={() => navigate(`/brand/${brand}/model/${encodeURIComponent(model.id)}`)}
                className="bg-white rounded-2xl py-4 px-6 text-gray-800 font-semibold border border-gray-200 shadow-md hover:shadow-xl transition-all text-base md:text-lg w-full text-center hover:border-blue-300 hover:bg-blue-50"
              >
                {model.name}
              </button>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              {hasCategories && categories.length > 0
                ? "В этой категории пока нет моделей."
                : "Модели не найдены."}
            </p>
          )}
        </div>

        {/* Блок доставки */}
        <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl text-center">
          <h3 className="text-xl font-semibold text-green-800 mb-3">
            🚚 Нужна доставка устройства?
          </h3>
          <p className="text-green-700 mb-4">
            Мы бесплатно заберем ваш {data?.brand || brand} на ремонт и доставим обратно
          </p>
          <button
            onClick={() => navigate('/delivery-order', { 
              state: { 
                brand: brand,
                deviceType: 'smartphone'
              }
            })}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            Заказать доставку
          </button>
        </div>
      </div>
    </div>
  );
}