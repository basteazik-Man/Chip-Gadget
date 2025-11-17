import React, { useState, useEffect } from 'react';
import { getDeliveryData, saveDeliveryData } from '../../data/deliveryData';

const DeliveryEditor = () => {
  const [deliveryData, setDeliveryData] = useState(getDeliveryData());
  const [newCity, setNewCity] = useState('');
  const [newSuburb, setNewSuburb] = useState('');
  const [newService, setNewService] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDeliveryData(getDeliveryData());
  }, []);

  const updateData = (newData) => {
    setDeliveryData(newData);
    saveDeliveryData(newData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addCityLocation = () => {
    if (newCity.trim()) {
      const updated = {
        ...deliveryData,
        cityLocations: [...deliveryData.cityLocations, newCity.trim()]
      };
      updateData(updated);
      setNewCity('');
    }
  };

  const removeCityLocation = (index) => {
    const updated = {
      ...deliveryData,
      cityLocations: deliveryData.cityLocations.filter((_, i) => i !== index)
    };
    updateData(updated);
  };

  const addSuburbLocation = () => {
    if (newSuburb.trim()) {
      const updated = {
        ...deliveryData,
        suburbLocations: [...deliveryData.suburbLocations, newSuburb.trim()]
      };
      updateData(updated);
      setNewSuburb('');
    }
  };

  const removeSuburbLocation = (index) => {
    const updated = {
      ...deliveryData,
      suburbLocations: deliveryData.suburbLocations.filter((_, i) => i !== index)
    };
    updateData(updated);
  };

  const addService = () => {
    if (newService.trim()) {
      const updated = {
        ...deliveryData,
        services: [...deliveryData.services, newService.trim()]
      };
      updateData(updated);
      setNewService('');
    }
  };

  const removeService = (index) => {
    const updated = {
      ...deliveryData,
      services: deliveryData.services.filter((_, i) => i !== index)
    };
    updateData(updated);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Редактирование страницы доставки</h2>

        {saved && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ✅ Данные сохранены
          </div>
        )}

        {/* Основная информация */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
          <input
            type="text"
            value={deliveryData.title}
            onChange={(e) => updateData({...deliveryData, title: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Описание под заголовком</label>
          <input
            type="text"
            value={deliveryData.description}
            onChange={(e) => updateData({...deliveryData, description: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Городские локации */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Населенные пункты (городская зона)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="Добавить населенный пункт"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addCityLocation}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Добавить
            </button>
          </div>
          <div className="space-y-2">
            {deliveryData.cityLocations.map((location, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-800">• {location}</span>
                <button
                  onClick={() => removeCityLocation(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Пригородные локации */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Населенные пункты (пригородная зона)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSuburb}
              onChange={(e) => setNewSuburb(e.target.value)}
              placeholder="Добавить населенный пункт"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addSuburbLocation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Добавить
            </button>
          </div>
          <div className="space-y-2">
            {deliveryData.suburbLocations.map((location, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-800">• {location}</span>
                <button
                  onClick={() => removeSuburbLocation(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Услуги */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Что входит в услугу
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Добавить услугу"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addService}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Добавить
            </button>
          </div>
          <div className="space-y-2">
            {deliveryData.services.map((service, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-800">• {service}</span>
                <button
                  onClick={() => removeService(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Примечание */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Примечание для других населенных пунктов
          </label>
          <textarea
            value={deliveryData.note}
            onChange={(e) => updateData({...deliveryData, note: e.target.value})}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryEditor;