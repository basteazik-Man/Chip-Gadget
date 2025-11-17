// Services.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SERVICES_BY_CATEGORY } from "../data/services";

export default function Services() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const category = params.get("category") || null;
  
  const [servicesData, setServicesData] = useState({});
  const [items, setItems] = useState([]);

  // Загружаем данные из localStorage или из файла
  useEffect(() => {
    const loadServicesData = () => {
      try {
        const saved = localStorage.getItem("chipgadget_category_services");
        if (saved) {
          const parsed = JSON.parse(saved);
          setServicesData(parsed);
          
          if (category && parsed[category]) {
            setItems(parsed[category]);
          } else {
            setItems([]);
          }
        } else {
          // Если в localStorage нет данных - используем данные из файла
          setServicesData(SERVICES_BY_CATEGORY);
          
          if (category && SERVICES_BY_CATEGORY[category]) {
            setItems(SERVICES_BY_CATEGORY[category]);
          } else {
            setItems([]);
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки данных услуг:", error);
        // Fallback на файловые данные
        setServicesData(SERVICES_BY_CATEGORY);
        
        if (category && SERVICES_BY_CATEGORY[category]) {
          setItems(SERVICES_BY_CATEGORY[category]);
        } else {
          setItems([]);
        }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Кнопка назад как на других страницах */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Назад
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">{getCategoryTitle()}</h1>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            {category ? `Услуги по ремонту ${getCategoryTitle().toLowerCase()}` : 'Все услуги'}
          </h2>

          {items.length > 0 ? (
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
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
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

          {/* Кнопка заказа доставки */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl text-center">
            <h3 className="text-xl font-semibold text-green-800 mb-3">
              🚚 Нужна доставка устройства?
            </h3>
            <p className="text-green-700 mb-4">
              Мы бесплатно заберем ваш {category === 'laptops' ? 'ноутбук' : category === 'tv' ? 'телевизор' : 'устройство'} на ремонт и доставим обратно после выполнения работ
            </p>
            <button
              onClick={() => navigate('/delivery-order')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              Заказать доставку
            </button>
          </div>
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