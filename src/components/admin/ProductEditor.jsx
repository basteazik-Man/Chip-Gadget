import React, { useState, useEffect, useRef } from 'react';
import { getProductsFromStorage, saveProductsToStorage, getCategories, getBrandsForProducts } from '../../utils/productUtils';

const ProductEditor = () => {
  const [products, setProducts] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImagePreviews = [];
    const newImages = [];

    files.forEach((file, index) => {
      if (file.size > 5 * 1024 * 1024) { // 5MB лимит
        alert(`Файл ${file.name} слишком большой (макс. 5MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newImagePreviews.push(reader.result);
        newImages.push(reader.result);
        
        if (newImagePreviews.length === files.length) {
          setImagePreviews(prev => [...prev, ...newImagePreviews]);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
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
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price) {
      alert('Заполните обязательные поля: название и цена');
      return;
    }

    // Генерируем ID если новый товар
    const productId = editingId || `product-${Date.now()}`;
    
    const productToSave = {
      ...formData,
      id: productId,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      stock: Number(formData.stock),
      updatedAt: new Date().toISOString(),
      createdAt: editingId ? formData.createdAt : new Date().toISOString()
    };

    const updatedProducts = {
      ...products,
      [productId]: productToSave
    };

    setProducts(updatedProducts);
    saveProductsToStorage(updatedProducts);
    
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
    
    alert(editingId ? 'Товар обновлен!' : 'Товар добавлен!');
  };

  const handleCancel = () => {
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
                className="w-full p-3 border border-gray-300 rounded-lg"
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
                className="w-full p-3 border border-gray-300 rounded-lg"
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
                className="w-full p-3 border border-gray-300 rounded-lg"
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
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="new">Новый</option>
                <option value="used">Б/У</option>
                <option value="refurbished">Восстановленный</option>
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
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="89900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Старая цена (₽) - для скидки
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
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
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600"
              />
              <label htmlFor="featured" className="ml-2 text-gray-700">
                Отметить как "ХИТ" продаж
              </label>
            </div>
          </div>

          {/* Загрузка изображений */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Изображения товара
            </label>
            <div className="mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📷 Загрузить изображения
              </button>
              <p className="text-sm text-gray-500 mt-1">
                Можно загрузить несколько изображений (макс. 5MB каждое)
              </p>
            </div>

            {/* Превью изображений */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt={`Preview ${index}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание товара
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Подробное описание товара..."
            />
          </div>

          {/* Характеристики */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3">Характеристики (опционально)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="color"
                value={formData.specs.color}
                onChange={handleSpecChange}
                placeholder="Цвет"
                className="p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="memory"
                value={formData.specs.memory}
                onChange={handleSpecChange}
                placeholder="Оперативная память"
                className="p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="storage"
                value={formData.specs.storage}
                onChange={handleSpecChange}
                placeholder="Встроенная память"
                className="p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="processor"
                value={formData.specs.processor}
                onChange={handleSpecChange}
                placeholder="Процессор"
                className="p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Кнопки формы */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              {editingId ? '💾 Сохранить изменения' : '➕ Добавить товар'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Список товаров */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          🛒 Все товары ({Object.keys(products).length})
        </h3>

        {Object.keys(products).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📦</div>
            <p>Товаров пока нет</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left">Изображение</th>
                  <th className="p-3 text-left">Название</th>
                  <th className="p-3 text-left">Категория</th>
                  <th className="p-3 text-left">Цена</th>
                  <th className="p-3 text-left">Наличие</th>
                  <th className="p-3 text-left">Действия</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(products).map(product => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          📷
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {categories.find(c => c.id === product.category)?.title || product.category}
                      </span>
                    </td>
                    <td className="p-3 font-bold">{product.price.toLocaleString()} ₽</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-sm ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock} шт.
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
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
      </div>
    </div>
  );
};

export default ProductEditor;