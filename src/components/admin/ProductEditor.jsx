import React, { useState, useEffect, useRef } from 'react';
import { getProductsFromStorage, saveProductsToStorage, getCategories, getBrandsForProducts, processProductImages, validateProduct, generateProductId, estimateBase64Size } from '../../utils/productUtils';

const ProductEditor = () => {
  const [products, setProducts] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Форма товара
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'smartphones',
    brand: 'apple',
    price: '',
    originalPrice: '',
    condition: 'new',
    description: '',
    images: [],
    stock: 1,
    featured: false,
    specs: {
      color: '',
      memory: '',
      storage: '',
      processor: '',
      screen: '',
      battery: ''
    }
  });

  // Загрузка товаров при монтировании
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const loadedProducts = getProductsFromStorage();
    setProducts(loadedProducts);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // Ограничиваем количество файлов
    if (files.length > 10) {
      alert('Максимальное количество изображений: 10');
      return;
    }

    // Проверяем общий размер
    const totalSizeMB = files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024);
    if (totalSizeMB > 50) {
      alert('Общий размер изображений превышает 50MB. Пожалуйста, выберите меньше файлов.');
      return;
    }

    setUploadingImages(true);
    setUploadProgress(10);

    try {
      // Показываем превью сразу
      const tempPreviews = [];
      const tempImages = [];
      
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          tempPreviews.push(reader.result);
          tempImages.push(reader.result);
          
          if (tempPreviews.length === files.length) {
            setImagePreviews(prev => [...prev, ...tempPreviews]);
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, ...tempImages]
            }));
            setUploadProgress(30);
          }
        };
        reader.readAsDataURL(file);
      });

      setUploadProgress(50);

      // Параллельно обрабатываем изображения для сжатия
      try {
        const processedImages = await processProductImages(files);
        setUploadProgress(80);

        // Заменяем временные изображения на сжатые
        const compressedPreviews = processedImages.map(img => img.compressed);
        const compressedImages = processedImages.map(img => img.compressed);

        // Обновляем превью и изображения
        setImagePreviews(prev => {
          // Удаляем временные и добавляем сжатые
          const newPreviews = prev.slice(0, -files.length).concat(compressedPreviews);
          return newPreviews;
        });

        setFormData(prev => {
          const newImages = prev.images.slice(0, -files.length).concat(compressedImages);
          return {
            ...prev,
            images: newImages
          };
        });

        // Показываем статистику сжатия
        const originalSizeMB = (totalSizeMB).toFixed(2);
        const compressedSizeKB = processedImages.reduce((sum, img) => sum + img.compressedSize, 0);
        const compressedSizeMB = (compressedSizeKB / 1024).toFixed(2);
        
        console.log(`Сжатие изображений: ${originalSizeMB}MB → ${compressedSizeMB}MB (уменьшение в ${(totalSizeMB / (compressedSizeKB / 1024)).toFixed(1)} раз)`);
        
        if (totalSizeMB > 5) {
          alert(`✅ Изображения сжаты: ${originalSizeMB}MB → ${compressedSizeMB}MB\nЭкономия: ${(totalSizeMB - (compressedSizeKB / 1024)).toFixed(2)}MB`);
        }

      } catch (compressError) {
        console.warn('Не удалось сжать изображения, используем оригиналы:', compressError);
        // Если сжатие не удалось, оставляем оригинальные изображения
      }

      setUploadProgress(100);
      setTimeout(() => {
        setUploadingImages(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error('Ошибка загрузки изображений:', error);
      alert('❌ Ошибка при загрузке изображений');
      setUploadingImages(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
    
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [name]: value
      }
    }));
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingId(product.id);
    setImagePreviews(product.images || []);
    window.scrollTo(0, 0);
  };

  const handleDelete = (productId) => {
    if (window.confirm('Удалить этот товар?')) {
      const updated = { ...products };
      delete updated[productId];
      setProducts(updated);
      saveProductsToStorage(updated);
      alert('✅ Товар удален');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Валидация товара
    const validation = validateProduct(formData);
    if (!validation.isValid) {
      alert(`Пожалуйста, исправьте ошибки:\n${validation.errors.join('\n')}`);
      return;
    }

    // Проверяем размер изображений
    const totalImagesSizeKB = formData.images.reduce((sum, img) => sum + estimateBase64Size(img), 0);
    if (totalImagesSizeKB > 5000) { // 5MB лимит на все изображения
      alert('Общий размер изображений слишком большой. Пожалуйста, удалите некоторые изображения или используйте изображения меньшего размера.');
      return;
    }

    // Генерируем ID если новый товар
    const productId = editingId || generateProductId(formData.name);
    
    const productToSave = {
      ...formData,
      id: productId,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      stock: Number(formData.stock),
      updatedAt: new Date().toISOString(),
      createdAt: editingId ? formData.createdAt : new Date().toISOString(),
      // Очищаем пустые характеристики
      specs: Object.fromEntries(
        Object.entries(formData.specs).filter(([_, value]) => value.trim() !== '')
      )
    };

    const updatedProducts = {
      ...products,
      [productId]: productToSave
    };

    setProducts(updatedProducts);
    const saveSuccess = saveProductsToStorage(updatedProducts);
    
    if (saveSuccess) {
      // Сброс формы
      setFormData({
        id: '',
        name: '',
        category: 'smartphones',
        brand: 'apple',
        price: '',
        originalPrice: '',
        condition: 'new',
        description: '',
        images: [],
        stock: 1,
        featured: false,
        specs: {
          color: '',
          memory: '',
          storage: '',
          processor: '',
          screen: '',
          battery: ''
        }
      });
      setEditingId(null);
      setImagePreviews([]);
      
      alert(`✅ ${editingId ? 'Товар обновлен!' : 'Товар добавлен!'}\n\nID товара: ${productId}`);
    } else {
      alert('❌ Ошибка при сохранении товара');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Отменить редактирование? Все несохраненные изменения будут потеряны.')) {
      setFormData({
        id: '',
        name: '',
        category: 'smartphones',
        brand: 'apple',
        price: '',
        originalPrice: '',
        condition: 'new',
        description: '',
        images: [],
        stock: 1,
        featured: false,
        specs: {
          color: '',
          memory: '',
          storage: '',
          processor: '',
          screen: '',
          battery: ''
        }
      });
      setEditingId(null);
      setImagePreviews([]);
    }
  };

  const handleClearImages = () => {
    if (imagePreviews.length > 0 && window.confirm('Удалить все изображения?')) {
      setFormData(prev => ({ ...prev, images: [] }));
      setImagePreviews([]);
    }
  };

  const categories = getCategories();
  const brands = getBrandsForProducts();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {editingId ? '✏️ Редактировать товар' : '➕ Добавить новый товар'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название товара *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: iPhone 14 Pro 256GB"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Бренд *
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Состояние *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="new">🆕 Новый (с гарантией)</option>
                <option value="used">🔄 Б/У (без гарантии)</option>
                <option value="refurbished">🔧 Восстановленный (с проверкой)</option>
              </select>
            </div>
          </div>

          {/* Цены */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена (₽) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="100"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="89900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Старая цена (₽) - для скидки
                <span className="text-xs text-gray-500 ml-1">(необязательно)</span>
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                min="0"
                step="100"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="99900"
              />
            </div>
          </div>

          {/* Остаток и хит */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество в наличии *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="featured" className="ml-2 text-gray-700">
                <span className="font-medium">🔥 Отметить как "ХИТ" продаж</span>
                <p className="text-sm text-gray-500">Будет выделен в магазине</p>
              </label>
            </div>
          </div>

          {/* Загрузка изображений */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Изображения товара
                <span className="text-xs text-gray-500 ml-1">(до 10 файлов)</span>
              </label>
              {imagePreviews.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearImages}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  🗑️ Удалить все
                </button>
              )}
            </div>
            
            <div className="mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploadingImages}
              />
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploadingImages}
                  className={`px-4 py-3 rounded-lg font-medium flex items-center gap-2 ${
                    uploadingImages 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {uploadingImages ? '⏳ Обработка...' : '📷 Загрузить изображения'}
                </button>
                
                <div className="text-sm text-gray-500">
                  <p>📏 Форматы: JPG, PNG, WebP</p>
                  <p>⚡ Изображения будут автоматически сжаты</p>
                  <p>📊 Максимальный размер: 5MB на изображение</p>
                </div>
              </div>
              
              {/* Прогресс загрузки */}
              {uploadingImages && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Сжатие изображений...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Статистика изображений */}
            {imagePreviews.length > 0 && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  📊 Загружено изображений: <span className="font-bold">{imagePreviews.length}</span> 
                  {imagePreviews.length >= 10 && (
                    <span className="ml-2 text-orange-600">(максимум достигнут)</span>
                  )}
                </p>
              </div>
            )}

            {/* Превью изображений */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Превью изображений:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {imagePreviews.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-red-700"
                          title="Удалить изображение"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-xs text-center mt-1">
                        {index === 0 && <span className="text-green-600 font-medium">📌 Главное</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Первое изображение будет главным в карточке товара. Перетащите файлы в нужном порядке перед загрузкой.
                </p>
              </div>
            )}
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание товара
              <span className="text-xs text-gray-500 ml-1">(рекомендуется 100-500 символов)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Подробное описание товара, преимущества, особенности..."
              maxLength="1000"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {formData.description.length}/1000 символов
            </div>
          </div>

          {/* Характеристики */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Характеристики (опционально)</h3>
              <span className="text-xs text-gray-500">Заполните хотя бы 1-2 характеристики</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Цвет</label>
                <input
                  type="text"
                  name="color"
                  value={formData.specs.color}
                  onChange={handleSpecChange}
                  placeholder="Например: Черный космос"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Оперативная память</label>
                <input
                  type="text"
                  name="memory"
                  value={formData.specs.memory}
                  onChange={handleSpecChange}
                  placeholder="Например: 8 ГБ"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Встроенная память</label>
                <input
                  type="text"
                  name="storage"
                  value={formData.specs.storage}
                  onChange={handleSpecChange}
                  placeholder="Например: 256 ГБ"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Процессор</label>
                <input
                  type="text"
                  name="processor"
                  value={formData.specs.processor}
                  onChange={handleSpecChange}
                  placeholder="Например: Apple A16 Bionic"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Экран</label>
                <input
                  type="text"
                  name="screen"
                  value={formData.specs.screen}
                  onChange={handleSpecChange}
                  placeholder="Например: 6.1" OLED"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Батарея</label>
                <input
                  type="text"
                  name="battery"
                  value={formData.specs.battery}
                  onChange={handleSpecChange}
                  placeholder="Например: 4323 мАч"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Кнопки формы */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium flex items-center justify-center gap-2"
            >
              {editingId ? '💾 Сохранить изменения' : '➕ Добавить товар'}
            </button>
            
            <div className="flex gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  Отмена
                </button>
              )}
              
              <button
                type="button"
                onClick={() => {
                  // Копируем текущие данные для нового товара
                  if (editingId && window.confirm('Создать копию этого товара?')) {
                    const newProduct = {
                      ...formData,
                      id: '',
                      name: `${formData.name} (копия)`,
                      featured: false,
                      createdAt: new Date().toISOString()
                    };
                    setFormData(newProduct);
                    setEditingId(null);
                    alert('✅ Товар скопирован. Измените название и сохраните как новый товар.');
                  }
                }}
                disabled={!editingId}
                className={`px-6 py-3 rounded-lg font-medium ${editingId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                📋 Копировать
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Список товаров */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            🛒 Все товары ({Object.keys(products).length})
          </h3>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (Object.keys(products).length > 0 && window.confirm('Очистить все товары? Это действие нельзя отменить.')) {
                  setProducts({});
                  saveProductsToStorage({});
                  alert('✅ Все товары удалены');
                }
              }}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
            >
              🗑️ Очистить все
            </button>
          </div>
        </div>

        {Object.keys(products).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg mb-2">Товаров пока нет</p>
            <p className="text-sm">Добавьте первый товар через форму выше</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Изображение</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Название</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Категория</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Цена</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Наличие</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Статус</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(products).map(product => (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      {product.images && product.images.length > 0 ? (
                        <div className="relative">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                          {product.images.length > 1 && (
                            <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              +{product.images.length - 1}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <span className="text-gray-400">📷</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-800">{product.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {product.brand} • {product.condition === 'new' ? 'Новый' : 
                         product.condition === 'used' ? 'Б/У' : 'Восстановленный'}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {categories.find(c => c.id === product.category)?.title || product.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-gray-800">
                        {product.price.toLocaleString()} ₽
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-xs text-gray-500 line-through">
                          {product.originalPrice.toLocaleString()} ₽
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.stock > 10 ? 'bg-green-100 text-green-800' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? `${product.stock} шт.` : 'Нет в наличии'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {product.featured && (
                          <span className="px-2 py-1 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 rounded text-xs font-medium">
                            🔥 ХИТ
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(product.updatedAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium flex items-center gap-1"
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium flex items-center gap-1"
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Статистика */}
        {Object.keys(products).length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{Object.keys(products).length}</div>
                <div className="text-sm text-gray-600">Всего товаров</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(products).filter(p => p.stock > 0).length}
                </div>
                <div className="text-sm text-gray-600">В наличии</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(products).filter(p => p.featured).length}
                </div>
                <div className="text-sm text-gray-600">Хиты продаж</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(products).filter(p => p.condition === 'used').length}
                </div>
                <div className="text-sm text-gray-600">Б/У товары</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductEditor;