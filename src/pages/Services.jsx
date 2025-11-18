// Services.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SERVICES_BY_CATEGORY as exportedServices } from "../data/category-services";

export default function Services() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const category = params.get("category") || null;

  // ВСЕГДА используем данные из файла category-services.js
  const items = category ? (exportedServices[category] || []) : [];

  const getCategoryTitle = () => {
    switch (category) {
      case 'laptops': return 'Ноутбуки';
      case 'tv': return 'Телевизоры';
      default: return 'Услуги';
    }
  };

  // Функция для получения типа устройства и текста для кнопки
  const getDeviceInfo = () => {
    switch (category) {
      case 'laptops': 
        return {
          deviceType: 'laptop',
          deviceName: 'ноутбук',
          emoji: '💻',
          placeholder: 'Модель обычно указана на нижней панели или под аккумулятором',
          modelHint: 'Модель обычно указана на нижней панели или под аккумулятором'
        };
      case 'tv': 
        return {
          deviceType: 'tv',
          deviceName: 'телевизор', 
          emoji: '📺',
          placeholder: 'Модель обычно указана на задней панели или в меню настроек',
          modelHint: 'Модель обычно указана на задней панели или в меню настроек'
        };
      default: 
        return {
          deviceType: 'smartphone',
          deviceName: 'устройство',
          emoji: '📱',
          placeholder: 'Например: iPhone 14, Samsung Galaxy S23 и т.д.',
          modelHint: 'Например: iPhone 14, Samsung Galaxy S23 и т.д.'
        };
    }
  };

  const deviceInfo = getDeviceInfo();

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
                  {/* УБРАНЫ КНОПКИ "ЗАКАЗАТЬ" - оставлено только название и цена */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-blue-600 font-medium text-base">
                      {service.price}
                    </p>
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
              🚚 Нужна доставка {deviceInfo.deviceName}?
            </h3>
            <p className="text-green-700 mb-4">
              Мы бесплатно заберем ваш {deviceInfo.deviceName} на ремонт и доставим обратно после выполнения работ
            </p>
            <button
              onClick={() => navigate('/delivery-order', { 
                state: { 
                  deviceType: deviceInfo.deviceType,
                  modelHint: deviceInfo.modelHint,
                  emoji: deviceInfo.emoji
                }
              })}
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