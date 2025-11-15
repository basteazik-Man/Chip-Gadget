// === ModelPage.jsx ===
import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PRICES } from "../data/prices";
import { normalizeKey, normalizeService } from '../utils/priceUtils';

export default function ModelPage() {
  const { brand, model } = useParams();
  const navigate = useNavigate();

  // Защита от отсутствующих данных
  if (!brand || !model) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Модель не найдена</h1>
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

  const brandPrices = PRICES[brand];
  const modelKey = normalizeKey(model);

  const mergedPrices = useMemo(() => {
    if (!brandPrices) return [];

    // Находим цены для конкретной модели
    let modelPrices = [];
    
    // Прямое совпадение
    if (brandPrices.models?.[modelKey]) {
      modelPrices = brandPrices.models[modelKey];
    } else {
      // Поиск по нормализованному ключу
      const found = Object.entries(brandPrices.models || {}).find(
        ([key]) => normalizeKey(key) === modelKey
      );
      modelPrices = found?.[1] || [];
    }
    
    // Нормализуем цены модели
    const normalizedModelPrices = modelPrices.map(normalizeService);
    
    // Теперь мы не мерджим с defaults, а просто возвращаем нормализованные цены модели
    return normalizedModelPrices.filter((p) => p.active !== false);
  }, [brand, model, brandPrices]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(`/brand/${brand}`)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Назад к моделям
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          {model.replace(/%20/g, " ")}
        </h1>

        {brandPrices ? (
          <div className="bg-white/90 p-6 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Цены на услуги для {model}
            </h2>

            {mergedPrices.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {mergedPrices.map((item, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center py-3 hover:bg-blue-50 px-3 rounded-lg transition"
                  >
                    <div>
                      <span className="text-gray-700">{item.title}</span>
                      {item.note && (
                        <span className="text-sm text-gray-500 ml-2">({item.note})</span>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">
                      {item.finalPrice?.toLocaleString()} {brandPrices.currency || "₽"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">
                Для этой модели пока нет данных о ценах.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white/90 p-6 rounded-2xl shadow-md border border-gray-200">
            <p className="text-gray-500">
              Не найдены цены для бренда <strong>{brand}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}