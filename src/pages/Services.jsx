// Services.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Services() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const category = params.get("category") || null;
  
  const [servicesData, setServicesData] = useState({});
  const [items, setItems] = useState([]);

  // Загружаем данные из localStorage при монтировании
  useEffect(() => {
    const loadServicesData = () => {
      try {
        const saved = localStorage.getItem("chipgadget_category_services");
        if (saved) {
          const parsed = JSON.parse(saved);
          setServicesData(parsed);
          
          // Устанавливаем элементы для отображения
          if (category && parsed[category]) {
            setItems(parsed[category]);
          } else if (parsed.default) {
            setItems(parsed.default);
          } else {
            setItems([]);
          }
        } else {
          // Если в localStorage нет данных, используем данные по умолчанию
          import("../data/services").then(module => {
            const defaultData = module.SERVICES_BY_CATEGORY;
            setServicesData(defaultData);
            
            if (category && defaultData[category]) {
              setItems(defaultData[category]);
            } else {
              setItems(defaultData.default || []);
            }
          });
        }
      } catch (error) {
        console.error("Ошибка загрузки данных услуг:", error);
        setItems([]);
      }
    };

    loadServicesData();
  }, [category]);

  const getCategoryTitle = () => {
    switch (category) {
      case 'laptops': return 'Ноутбуки';
      case 'tv': return 'Телевизоры';
      default: return 'Услуги';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">{getCategoryTitle()}</h1>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Назад
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            {category ? `Услуги по ремонту ${getCategoryTitle().toLowerCase()}` : 'Все услуги'}
          </h2>

          {items.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((service, index) => (
                <div 
                  key={index}
                  className="p-4 bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {service.name}
                      </h3>
                      <p className="text-blue-600 font-medium text-sm">
                        {service.price}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Заказать
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Услуги не найдены</p>
              <p className="text-gray-400 mt-2">
                {category ? `Для категории "${getCategoryTitle()}" пока нет услуг` : 'Нет доступных услуг'}
              </p>
            </div>
          )}
        </div>

        {/* Информационный блок */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Информация</h3>
          <p className="text-blue-700">
            Все цены указаны ориентировочно. Точную стоимость ремонта можно узнать после диагностики устройства.
            Диагностика проводится бесплатно при последующем ремонте.
          </p>
        </div>
      </div>
    </div>
  );
}