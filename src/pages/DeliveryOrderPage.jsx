// === DeliveryOrderPage.jsx ===
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CONTACT } from '../data/contact';
import { PRICES } from '../data/prices';
import { normalizeKey, normalizeService } from '../utils/priceUtils';

const DeliveryOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Функция для определения модели из различных источников
  const detectModelFromNavigation = () => {
    // 1. Попробуем получить из состояния навигации
    if (location.state?.model) {
      return {
        model: location.state.model,
        brand: location.state.brand,
        deviceType: location.state.deviceType,
        autoDetected: true
      };
    }
    
    // 2. Попробуем извлечь из URL (если перешли со страницы модели)
    const pathParts = location.pathname.split('/');
    const modelIndex = pathParts.indexOf('model') + 1;
    const brandIndex = pathParts.indexOf('brand') + 1;
    
    if (modelIndex > 0 && modelIndex < pathParts.length && brandIndex > 0 && brandIndex < pathParts.length) {
      return {
        model: decodeURIComponent(pathParts[modelIndex]),
        brand: decodeURIComponent(pathParts[brandIndex]),
        deviceType: location.state?.deviceType,
        autoDetected: true
      };
    }
    
    return { model: '', brand: '', deviceType: '', autoDetected: false };
  };

  const detectedData = detectModelFromNavigation();
  
  const [formData, setFormData] = useState({
    address: '',
    deviceModel: detectedData.model,
    problem: '',
    customerName: '',
    phone: '',
    contactMethod: 'whatsapp'
  });

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [showCustomProblem, setShowCustomProblem] = useState(false);
  const [isModelAutoDetected] = useState(detectedData.autoDetected);

  // Улучшенная функция определения типа устройства - ОБНОВЛЕНО
  const getDeviceTypeInfo = () => {
    // Если передан emoji и modelHint из состояния навигации - используем их
    if (location.state?.emoji && location.state?.modelHint) {
      return {
        emoji: location.state.emoji,
        placeholder: location.state.modelHint
      };
    }

    // Если тип устройства передан явно
    if (detectedData.deviceType) {
      switch(detectedData.deviceType.toLowerCase()) {
        case 'laptop':
        case 'notebook':
        case 'macbook':
          return {
            emoji: '💻',
            placeholder: 'Модель обычно указана на нижней панели или под аккумулятором'
          };
        case 'tv':
        case 'television':
          return {
            emoji: '📺', 
            placeholder: 'Модель обычно указана на задней панели или в меню настроек'
          };
        default:
          return {
            emoji: '📱',
            placeholder: 'Например: iPhone 14, Samsung Galaxy S23 и т.д.'
          };
      }
    }

    // Определяем по названию модели
    const model = formData.deviceModel.toLowerCase();
    
    // Ключевые слова для ноутбуков
    const laptopKeywords = ['macbook', 'mac book', 'notebook', 'laptop', 'ultrabook', 'mbp', 'mba', 'mac'];
    const isLaptop = laptopKeywords.some(keyword => model.includes(keyword));
    
    // Ключевые слова для телевизоров  
    const tvKeywords = ['tv', 'television', 'телевизор', 'smart tv', 'led tv', 'oled tv', 'qled tv'];
    const isTV = tvKeywords.some(keyword => model.includes(keyword));

    if (isLaptop) {
      return {
        emoji: '💻',
        placeholder: 'Модель обычно указана на нижней панели или под аккумулятором'
      };
    }
    
    if (isTV) {
      return {
        emoji: '📺',
        placeholder: 'Модель обычно указана на задней панели или в меню настроек'
      };
    }
    
    // По умолчанию для смартфонов и других устройств
    return {
      emoji: '📱',
      placeholder: 'Например: iPhone 14, Samsung Galaxy S23 и т.д.'
    };
  };

  const deviceTypeInfo = getDeviceTypeInfo();

  // Загружаем услуги для текущей модели
  useEffect(() => {
    if (formData.deviceModel && isModelAutoDetected && detectedData.brand) {
      const brandKey = detectedData.brand.toLowerCase();
      
      if (PRICES[brandKey]) {
        const brandPrices = PRICES[brandKey];
        const modelKey = normalizeKey(formData.deviceModel);
        
        let modelServices = [];
        
        // Прямое совпадение
        if (brandPrices.models?.[modelKey]) {
          modelServices = brandPrices.models[modelKey];
        } else {
          // Поиск по нормализованному ключу
          const found = Object.entries(brandPrices.models || {}).find(
            ([key]) => normalizeKey(key) === modelKey
          );
          modelServices = found?.[1] || [];
        }
        
        // Нормализуем и фильтруем активные услуги
        const normalizedServices = modelServices
          .map(normalizeService)
          .filter(service => service.active !== false);
        
        setServices(normalizedServices);
        
        // Автоматически выбираем первую услугу, если есть
        if (normalizedServices.length > 0 && !selectedService) {
          setSelectedService(normalizedServices[0].id);
          setFormData(prev => ({ 
            ...prev, 
            problem: normalizedServices[0].title 
          }));
        }
      }
    } else {
      setServices([]);
    }
  }, [formData.deviceModel, isModelAutoDetected, detectedData.brand, selectedService]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (e) => {
    const value = e.target.value;
    setSelectedService(value);
    
    if (value === 'custom') {
      setShowCustomProblem(true);
      setFormData(prev => ({ ...prev, problem: '' }));
    } else {
      setShowCustomProblem(false);
      const selectedServiceObj = services.find(s => s.id === value);
      setFormData(prev => ({ 
        ...prev, 
        problem: selectedServiceObj ? selectedServiceObj.title : '' 
      }));
    }
  };

  const handleCustomProblemChange = (e) => {
    setFormData(prev => ({
      ...prev,
      problem: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Проверяем, что проблема описана
    if (!formData.problem.trim()) {
      alert('Пожалуйста, выберите услугу или опишите проблему');
      return;
    }
    
    // Формируем сообщение для отправки
    const message = `📦 НОВЫЙ ЗАКАЗ ДОСТАВКИ:%0A%0A
👤 Имя: ${formData.customerName}%0A
📞 Телефон: ${formData.phone}%0A
📍 Адрес: ${formData.address}%0A
${deviceTypeInfo.emoji} Модель устройства: ${formData.deviceModel}%0A
🔧 Неисправность: ${formData.problem}%0A
💬 Предпочтительный способ связи: ${formData.contactMethod === 'whatsapp' ? 'WhatsApp' : 'Telegram'}`;

    // Открываем соответствующее приложение
    const url = formData.contactMethod === 'whatsapp' 
      ? `${CONTACT.wa}?text=${message}`
      : `${CONTACT.tg}?text=${message}`;
    
    window.open(url, '_blank');
    
    // Показываем сообщение об успехе
    alert('Заявка отправлена! С вами свяжутся в ближайшее время для уточнения стоимости доставки.');
    
    // Очищаем форму
    setFormData({
      address: '',
      deviceModel: isModelAutoDetected ? detectedData.model : '',
      problem: '',
      customerName: '',
      phone: '',
      contactMethod: 'whatsapp'
    });
    setSelectedService('');
    setShowCustomProblem(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Кнопка назад */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Назад
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Заголовок */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">🚚 Заказать доставку</h1>
            <p className="text-green-100">Заполните форму и мы свяжемся с вами для расчета стоимости доставки</p>
          </div>

          {/* УЛУЧШЕННАЯ Кнопка условий доставки */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="text-blue-700 font-medium">Хотите узнать подробности о доставке?</span>
              <button
                onClick={() => navigate('/delivery')}
                className="bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <span className="text-lg">📋</span>
                Условия доставки
              </button>
            </div>
          </div>

          {/* Форма */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Адрес */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📍 Адрес доставки *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Укажите полный адрес для забора устройства"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Модель устройства */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {deviceTypeInfo.emoji} Модель устройства *
                </label>
                <input
                  type="text"
                  name="deviceModel"
                  value={formData.deviceModel}
                  onChange={handleInputChange}
                  required
                  readOnly={isModelAutoDetected}
                  placeholder={deviceTypeInfo.placeholder}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    isModelAutoDetected ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
                {isModelAutoDetected && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Модель определена автоматически
                  </p>
                )}
              </div>

              {/* Неисправность - динамический выпадающий список */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔧 {isModelAutoDetected && services.length > 0 ? 'Выберите услугу' : 'Описание неисправности'} *
                </label>
                
                {isModelAutoDetected && services.length > 0 ? (
                  <>
                    <select
                      value={selectedService}
                      onChange={handleServiceChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-3"
                      required
                    >
                      <option value="">-- Выберите услугу --</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.title} {service.finalPrice ? `- ${service.finalPrice.toLocaleString()} ₽` : ''}
                        </option>
                      ))}
                      <option value="custom">❌ Нет нужной услуги</option>
                    </select>

                    {showCustomProblem && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Опишите проблему подробнее *
                        </label>
                        <textarea
                          value={formData.problem}
                          onChange={handleCustomProblemChange}
                          required
                          rows="3"
                          placeholder="Опишите что случилось с устройством, какие симптомы..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <textarea
                    name="problem"
                    value={formData.problem}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    placeholder="Опишите что случилось с устройством, какие симптомы..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                )}
                
                {isModelAutoDetected && services.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Для этой модели нет доступных услуг в базе данных
                  </p>
                )}
              </div>

              {/* Имя */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 Ваше имя *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  placeholder="Как к вам обращаться?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Телефон */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📞 Телефон для связи *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+7 XXX XXX-XX-XX"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Способ связи */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💬 Предпочтительный способ связи
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="whatsapp"
                      checked={formData.contactMethod === 'whatsapp'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="flex items-center gap-1">
                      <span className="text-green-500">💚</span> WhatsApp
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="telegram"
                      checked={formData.contactMethod === 'telegram'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="flex items-center gap-1">
                      <span className="text-blue-500">💙</span> Telegram
                    </span>
                  </label>
                </div>
              </div>

              {/* Кнопка отправки */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
              >
                📨 Отправить заявку на доставку
              </button>
            </form>

            {/* Информация */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                После отправки заявки мы свяжемся с вами в течение 15 минут для уточнения деталей и расчета стоимости доставки
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrderPage;