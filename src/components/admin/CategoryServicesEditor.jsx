// CategoryServicesEditor.jsx (с рабочим перетаскиванием)
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CategoryServicesEditor = ({ data, onChange }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const predefinedCategories = [
    { id: 'laptops', title: 'Ноутбуки', icon: '💻' },
    { id: 'tv', title: 'Телевизоры', icon: '📺' }
  ];

  const handleAddService = (categoryId) => {
    const newData = { ...data };
    if (!newData[categoryId]) {
      newData[categoryId] = [];
    }
    
    const newService = {
      name: 'Новая услуга',
      price: 'от 0₽'
    };
    
    newData[categoryId].push(newService);
    onChange(newData);
  };

  const handleRemoveService = (categoryId, index) => {
    const newData = { ...data };
    if (newData[categoryId] && newData[categoryId][index]) {
      newData[categoryId].splice(index, 1);
      onChange(newData);
    }
  };

  const handleServiceChange = (categoryId, index, field, value) => {
    const newData = { ...data };
    if (newData[categoryId] && newData[categoryId][index]) {
      newData[categoryId][index][field] = value;
      onChange(newData);
    }
  };

  // Функции для drag & drop
  const handleDragStart = (categoryId, index) => {
    setDraggedIndex({ categoryId, index });
  };

  const handleDragOver = (categoryId, index, e) => {
    e.preventDefault();
    
    if (!draggedIndex || draggedIndex.categoryId !== categoryId) return;
    if (draggedIndex.index === index) return;
    
    const newData = { ...data };
    const services = [...newData[categoryId]];
    const draggedItem = services[draggedIndex.index];
    
    // Удаляем элемент из старой позиции и вставляем в новую
    services.splice(draggedIndex.index, 1);
    services.splice(index, 0, draggedItem);
    
    newData[categoryId] = services;
    setDraggedIndex({ categoryId, index });
    onChange(newData);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddCategory = () => {
    const categoryName = prompt('Введите название новой категории:');
    if (!categoryName) return;
    
    const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
    const newData = { ...data };
    
    if (!newData[categoryId]) {
      newData[categoryId] = [];
      onChange(newData);
    } else {
      alert('Категория с таким названием уже существует!');
    }
  };

  const handleRemoveCategory = (categoryId) => {
    if (!confirm(`Удалить категорию "${categoryId.replace(/-/g, ' ')}"? Все услуги в этой категории будут удалены.`)) {
      return;
    }
    
    const newData = { ...data };
    delete newData[categoryId];
    onChange(newData);
    
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    }
  };

  const allCategories = [
    ...predefinedCategories,
    ...Object.keys(data || {})
      .filter(key => !predefinedCategories.find(cat => cat.id === key))
      .map(key => ({
        id: key,
        title: key.replace(/-/g, ' '),
        icon: '📁',
        isCustom: true
      }))
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Услуги по категориям</h2>
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            ➕ Добавить категорию
          </button>
        </div>
        
        <p className="text-gray-600 mb-6 text-sm">
          Редактирование услуг для категорий "Ноутбуки" и "Телевизоры" на главной странице.
        </p>

        <div className="space-y-3">
          {allCategories.map((category) => (
            <motion.div
              key={category.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
              initial={false}
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  className={`flex-1 flex items-center justify-between p-3 text-white font-semibold transition-all ${
                    category.isCustom 
                      ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                      : "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{category.icon}</span>
                    <span className="text-base capitalize">{category.title}</span>
                    {category.isCustom && (
                      <span className="ml-2 text-xs bg-yellow-500 px-1 py-0.5 rounded">Кастомная</span>
                    )}
                  </div>
                  <span className="text-base">
                    {expandedCategory === category.id ? '−' : '+'}
                  </span>
                </button>
                
                {category.isCustom && (
                  <button
                    onClick={() => handleRemoveCategory(category.id)}
                    className="px-3 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
                    title="Удалить категорию"
                  >
                    🗑️
                  </button>
                )}
              </div>

              {expandedCategory === category.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-base font-semibold text-gray-800">
                        Услуги для {category.title}
                      </h3>
                      <button
                        onClick={() => handleAddService(category.id)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        ➕ Добавить услугу
                      </button>
                    </div>

                    {(!data || !data[category.id] || data[category.id].length === 0) ? (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Услуги пока не добавлены
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {data[category.id].map((service, index) => (
                          <motion.div
                            key={index}
                            className={`flex items-center gap-2 p-2 bg-white rounded border transition-all ${
                              draggedIndex?.categoryId === category.id && draggedIndex?.index === index
                                ? "border-blue-500 bg-blue-50 shadow-md"
                                : "border-gray-200 hover:shadow-sm"
                            }`}
                            draggable
                            onDragStart={() => handleDragStart(category.id, index)}
                            onDragOver={(e) => handleDragOver(category.id, index, e)}
                            onDragEnd={handleDragEnd}
                            whileDrag={{ scale: 1.02 }}
                          >
                            <div 
                              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 text-lg"
                              draggable
                            >
                              ≡
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={service.name || ''}
                                onChange={(e) => handleServiceChange(category.id, index, 'name', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="Название услуги"
                              />
                              <input
                                type="text"
                                value={service.price || ''}
                                onChange={(e) => handleServiceChange(category.id, index, 'price', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="Цена (от 1000₽)"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveService(category.id, index)}
                              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                              title="Удалить услугу"
                            >
                              🗑️
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryServicesEditor;