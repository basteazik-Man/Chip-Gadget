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
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем данные из localStorage при монтировании
  useEffect(() => {
    const loadServicesData = () => {
      try {
        setIsLoading(true);
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
            // Если в localStorage нет данных для категории, используем данные по умолчанию
            loadDefaultServices();
          }
        } else {
          // Если в localStorage нет данных, используем данные по умолчанию
          loadDefaultServices();
        }
      } catch (error) {
        console.error("Ошибка загрузки данных услуг:", error);
        loadDefaultServices();
      } finally {
        setIsLoading(false);
      }
    };

    const loadDefaultServices = () => {
      import("../data/services").then(module => {
        const defaultData = module.SERVICES_BY_CATEGORY;
        setServicesData(defaultData);
        
        if (category && defaultData[category]) {
          setItems(defaultData[category]);
        } else {
          setItems(defaultData.default || []);
        }
      }).catch(error => {
        console.error("Ошибка загрузки данных по умолчанию:", error);
        setItems([]);
      });
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

  const handleOrder = (serviceName) => {
    // Здесь можно добавить логику для заказа услуги
    alert(`Заказана услуга: ${serviceName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок и кнопка назад */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{getCategoryTitle()}</h1>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Назад
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">
              {category ? `Услуги по ремонту ${getCategoryTitle().toLowerCase()}` : 'Все услуги'}
            </h2>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-4">Загрузка услуг...</p>
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((service, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {service.name}
                        </h3>
                        <p className="text-blue-600 font-medium text-base">
                          {service.price}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button 
                          onClick={() => handleOrder(service.name)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          Заказать
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔧</div>
                <p className="text-gray-500 text-lg mb-2">Услуги не найдены</p>
                <p className="text-gray-400">
                  {category 
                    ? `Для категории "${getCategoryTitle()}" пока нет услуг` 
                    : 'Нет доступных услуг'
                  }
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Добавьте услуги через панель администратора
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Информационный блок */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span>💡</span> Информация
          </h3>
          <p className="text-blue-700 leading-relaxed">
            Все цены указаны ориентировочно. Точную стоимость ремонта можно узнать после диагностики устройства.
            Диагностика проводится бесплатно при последующем ремонте.
          </p>
        </div>
      </div>
    </div>
  );
}