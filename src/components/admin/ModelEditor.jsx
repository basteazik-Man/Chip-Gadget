// ModelEditor.jsx (с рабочим перетаскиванием)
import React, { useState } from "react";
import { motion } from "framer-motion";
import { calculateFinalPrice } from "../../utils/priceUtils";

export default function ModelEditor({ modelKey, services, onChange }) {
  const [localServices, setLocalServices] = useState(services || []);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const updateService = (index, updates) => {
    const updated = [...localServices];
    updated[index] = { ...updated[index], ...updates };
    
    if (updates.price !== undefined || updates.discount !== undefined) {
      const price = updates.price !== undefined ? updates.price : updated[index].price;
      const discount = updates.discount !== undefined ? updates.discount : updated[index].discount;
      updated[index].finalPrice = calculateFinalPrice(price, discount);
    }
    
    setLocalServices(updated);
    onChange(updated);
  };

  const addService = () => {
    const newService = {
      name: "Новая услуга",
      price: 0,
      discount: 0,
      finalPrice: 0,
      active: true
    };
    const updated = [...localServices, newService];
    setLocalServices(updated);
    onChange(updated);
  };

  const removeService = (index) => {
    const updated = localServices.filter((_, i) => i !== index);
    setLocalServices(updated);
    onChange(updated);
  };

  // Функции для drag & drop
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newServices = [...localServices];
    const draggedItem = newServices[draggedIndex];
    
    // Удаляем элемент из старой позиции и вставляем в новую
    newServices.splice(draggedIndex, 1);
    newServices.splice(index, 0, draggedItem);
    
    setLocalServices(newServices);
    setDraggedIndex(index);
    onChange(newServices);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Услуги модели</h3>
        <button
          onClick={addService}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          ➕ Добавить услугу
        </button>
      </div>

      {localServices.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-4xl mb-4">🔧</div>
          <p className="text-lg font-medium">Нет услуг</p>
          <p className="text-sm">Добавьте первую услугу для этой модели</p>
        </div>
      ) : (
        <div className="space-y-3">
          {localServices.map((service, index) => (
            <motion.div
              key={index}
              className={`p-3 border rounded-lg bg-white transition-all ${
                draggedIndex === index 
                  ? "border-blue-500 bg-blue-50 shadow-lg" 
                  : "border-gray-200 hover:shadow-md"
              }`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => {
                e.preventDefault();
                handleDragOver(index);
              }}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3">
                {/* Handle для перетаскивания */}
                <div 
                  className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 text-lg"
                  draggable
                >
                  ≡
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                  {/* Название услуги */}
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      value={service.name || ""}
                      onChange={(e) => updateService(index, { name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Название услуги"
                    />
                  </div>

                  {/* Цена */}
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      value={service.price || 0}
                      onChange={(e) => updateService(index, { price: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min="0"
                      step="100"
                    />
                  </div>

                  {/* Скидка */}
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      value={service.discount || 0}
                      onChange={(e) => updateService(index, { discount: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min="0"
                      max="100"
                      step="5"
                    />
                  </div>

                  {/* Итоговая цена */}
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      value={service.finalPrice || service.price || 0}
                      readOnly
                      className="w-full p-2 border border-gray-300 bg-gray-50 rounded text-sm"
                    />
                  </div>

                  {/* Статус и удаление */}
                  <div className="md:col-span-2 flex gap-1">
                    <button
                      onClick={() => updateService(index, { active: !service.active })}
                      className={`flex-1 px-2 py-1 rounded text-sm font-medium ${
                        service.active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {service.active ? "Вкл" : "Выкл"}
                    </button>
                    <button
                      onClick={() => removeService(index)}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {localServices.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="text-center">
              <div className="font-semibold text-gray-700">Всего услуг</div>
              <div className="text-lg font-bold text-blue-600">{localServices.length}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700">Активных</div>
              <div className="text-lg font-bold text-green-600">
                {localServices.filter(s => s.active).length}
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700">Неактивных</div>
              <div className="text-lg font-bold text-red-600">
                {localServices.filter(s => !s.active).length}
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700">Со скидкой</div>
              <div className="text-lg font-bold text-orange-600">
                {localServices.filter(s => s.discount > 0).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}