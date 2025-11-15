import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { brandData } from "../data/brandData";

export default function BrandPage() {
  const { brand } = useParams();
  const navigate = useNavigate();
  
  // Получаем сохраненную категорию из localStorage или используем первую
  const getInitialCategory = () => {
    const saved = localStorage.getItem(`selectedCategory_${brand}`);
    const data = brandData[brand?.toLowerCase()];
    const categories = data?.categories ? Object.keys(data.categories) : [];
    return saved && categories.includes(saved) ? saved : (categories[0] || null);
  };

  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory);

  const data = brandData[brand?.toLowerCase()];

  // Обработка ошибок - проверка наличия бренда
  if (!brand) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Бренд не найден</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  // Обработка ошибок - проверка наличия данных о бренде
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Бренд "{brand}" не поддерживается</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  const hasCategories = data?.categories !== undefined;
  const categories = hasCategories ? Object.keys(data.categories) : [];

  // Сохраняем выбранную категорию в localStorage
  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem(`selectedCategory_${brand}`, selectedCategory);
    }
  }, [selectedCategory, brand]);

  // Получаем модели для выбранной категории
  const models = hasCategories && selectedCategory
    ? data.categories[selectedCategory] || []
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4" style={{ position: 'relative', zIndex: 1 }}>
      <div className="max-w-6xl mx-auto" style={{ position: 'relative', zIndex: 2 }}>
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium relative z-10"
        >
          ← Назад
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 capitalize relative z-10">
          {data?.brand || brand}
        </h1>

        {hasCategories && categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8 relative z-20">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-3 rounded-2xl font-semibold transition-all relative z-30 ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-blue-50"
                }`}
                style={{ cursor: 'pointer' }}
              >
                {cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 relative z-10">
          {models.length > 0 ? (
            models.map((model) => (
              <button
                key={model.id}
                onClick={() => navigate(`/brand/${brand}/model/${encodeURIComponent(model.id)}`)}
                className="bg-white rounded-2xl py-4 px-6 text-gray-800 font-semibold border border-gray-200 hover:shadow-lg transition-all text-base md:text-lg w-full text-center relative z-10"
                style={{ cursor: 'pointer' }}
              >
                {model.name}
              </button>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 relative z-10">
              {hasCategories && categories.length > 0
                ? "Выберите серию, чтобы увидеть модели."
                : "Модели не найдены."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}