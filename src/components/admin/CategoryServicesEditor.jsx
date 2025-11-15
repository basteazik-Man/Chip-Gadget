// CategoryServicesEditor.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryServicesEditor = ({ data, onChange }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const categories = [
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
        
        <p className="text-gray-600 mb-6">
          Здесь вы можете редактировать услуги, которые отображаются при нажатии на кнопки "Ноутбуки" и "Телевизоры" на главной странице.
        </p>

        <div className="space-y-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              className="border border-gray-200 rounded-xl overflow-hidden"
              initial={false}
            >
              <button
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold hover:from-purple-600 hover:to-blue-700 transition-all"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">{category.icon}</span>
                  <span className="text-lg">{category.title}</span>
                </div>
                <span className="text-lg">
                  {expandedCategory === category.id ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence>
                {expandedCategory === category.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Услуги для {category.title}
                        </h3>
                        <button
                          onClick={() => handleAddService(category.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                        >
                          ➕ Добавить услугу
                        </button>
                      </div>

                      {(!data[category.id] || data[category.id].length === 0) ? (
                        <div className="text-center py-8 text-gray-500">
                          Услуги пока не добавлены
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {data[category.id].map((service, index) => (
                            <motion.div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Название услуги
                                  </label>
                                  <input
                                    type="text"
                                    value={service.name}
                                    onChange={(e) => handleServiceChange(category.id, index, 'name', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Например: Замена экрана"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Цена
                                  </label>
                                  <input
                                    type="text"
                                    value={service.price}
                                    onChange={(e) => handleServiceChange(category.id, index, 'price', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Например: от 3500₽"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveService(category.id, index)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Пользовательские категории */}
        {Object.keys(data)
          .filter(key => !categories.find(cat => cat.id === key))
          .map((categoryId) => (
            <motion.div
              key={categoryId}
              className="border border-gray-200 rounded-xl overflow-hidden mt-4"
              initial={false}
            >
              <button
                onClick={() => setExpandedCategory(expandedCategory === categoryId ? null : categoryId)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold hover:from-gray-600 hover:to-gray-700 transition-all"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">📁</span>
                  <span className="text-lg capitalize">{categoryId.replace(/-/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {expandedCategory === categoryId ? '−' : '+'}
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {expandedCategory === categoryId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Услуги для {categoryId.replace(/-/g, ' ')}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddService(categoryId)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                          >
                            ➕ Добавить услугу
                          </button>
                        </div>
                      </div>

                      {(!data[categoryId] || data[categoryId].length === 0) ? (
                        <div className="text-center py-8 text-gray-500">
                          Услуги пока не добавлены
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {data[categoryId].map((service, index) => (
                            <motion.div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Название услуги
                                  </label>
                                  <input
                                    type="text"
                                    value={service.name}
                                    onChange={(e) => handleServiceChange(categoryId, index, 'name', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Цена
                                  </label>
                                  <input
                                    type="text"
                                    value={service.price}
                                    onChange={(e) => handleServiceChange(categoryId, index, 'price', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveService(categoryId, index)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
              </AnimatePresence>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default CategoryServicesEditor;