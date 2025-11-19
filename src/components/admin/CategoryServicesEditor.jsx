// CategoryServicesEditor.jsx (обновленная версия с редактированием названий и перемещением)
import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';

const CategoryServicesEditor = ({ data, onChange }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

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

  const handleServiceReorder = (categoryId, reorderedServices) => {
    const newData = { ...data };
    newData[categoryId] = reorderedServices;
    onChange(newData);
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

  // Объединяем предопределенные и пользовательские категории
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
        
        <p className="text-gray-600 mb-6">
          Здесь вы можете редактировать услуги, которые отображаются при нажатии на кнопки "Ноутбуки" и "Телевизоры" на главной странице.
          <strong> Все категории (включая созданные вручную) будут экспортированы при нажатии кнопки "📺 Экспорт ТВ/ноутбуки".</strong>
        </p>

        <div className="space-y-4">
          {allCategories.map((category) => (
            <motion.div
              key={category.id}
              className="border border-gray-200 rounded-xl overflow-hidden"
              initial={false}
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  className={`flex-1 flex items-center justify-between p-4 text-white font-semibold transition-all ${
                    category.isCustom 
                      ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                      : "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{category.icon}</span>
                    <span className="text-lg capitalize">{category.title}</span>
                    {category.isCustom && (
                      <span className="ml-2 text-xs bg-yellow-500 px-2 py-1 rounded-full">Кастомная</span>
                    )}
                  </div>
                  <span className="text-lg">
                    {expandedCategory === category.id ? '−' : '+'}
                  </span>
                </button>
                
                {category.isCustom && (
                  <button
                    onClick={() => handleRemoveCategory(category.id)}
                    className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
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

                    {(!data || !data[category.id] || data[category.id].length === 0) ? (
                      <div className="text-center py-8 text-gray-500">
                        Услуги пока не добавлены
                      </div>
                    ) : (
                      <Reorder.Group 
                        axis="y" 
                        values={data[category.id] || []} 
                        onReorder={(reordered) => handleServiceReorder(category.id, reordered)}
                        className="space-y-3"
                      >
                        {(data[category.id] || []).map((service, index) => (
                          <Reorder.Item key={index} value={service}>
                            <motion.div
                              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              {/* Handle для перетаскивания */}
                              <div className="flex flex-col items-center">
                                <button className="text-gray-400 hover:text-gray-600 cursor-grab text-lg">
                                  ⋮⋮
                                </button>
                              </div>

                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Название услуги
                                  </label>
                                  <input
                                    type="text"
                                    value={service.name || ''}
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
                                    value={service.price || ''}
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

                            {/* Подсказка по перетаскиванию */}
                            <div className="mt-1 text-xs text-gray-500 flex items-center gap-1 pl-10">
                              <span>⋮⋮</span>
                              <span>Перетащите для изменения порядка</span>
                            </div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
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