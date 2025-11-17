// === DeliveryOrderPage.jsx ===
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONTACT } from '../data/contact';

const DeliveryOrderPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: '',
    deviceModel: '',
    problem: '',
    customerName: '',
    phone: '',
    contactMethod: 'whatsapp'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Формируем сообщение для отправки
    const message = `📦 НОВЫЙ ЗАКАЗ ДОСТАВКИ:%0A%0A
👤 Имя: ${formData.customerName}%0A
📞 Телефон: ${formData.phone}%0A
📍 Адрес: ${formData.address}%0A
📱 Модель устройства: ${formData.deviceModel}%0A
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
      deviceModel: '',
      problem: '',
      customerName: '',
      phone: '',
      contactMethod: 'whatsapp'
    });
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

          {/* Кнопка условий доставки */}
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <button
              onClick={() => navigate('/delivery')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
            >
              📋 Условия доставки
            </button>
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
                  📱 Модель устройства *
                </label>
                <input
                  type="text"
                  name="deviceModel"
                  value={formData.deviceModel}
                  onChange={handleInputChange}
                  required
                  placeholder="Например: iPhone 14, Samsung Galaxy S23 и т.д."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Неисправность */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔧 Описание неисправности *
                </label>
                <textarea
                  name="problem"
                  value={formData.problem}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Опишите что случилось с устройством, какие симптомы..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
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