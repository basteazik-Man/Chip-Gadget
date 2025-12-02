// Store.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Store() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  // Категории товаров (такие же как в ProductEditor)
  const categories = [
    { id: "all", title: "Все товары", emoji: "🛒" },
    { id: "smartphones", title: "Смартфоны", emoji: "📱" },
    { id: "laptops", title: "Ноутбуки", emoji: "💻" },
    { id: "tablets", title: "Планшеты", emoji: "📱" },
    { id: "accessories", title: "Аксессуары", emoji: "🎧" },
    { id: "other", title: "Другое", emoji: "📦" },
  ];

  // Загружаем товары из localStorage при загрузке компонента
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    try {
      const saved = localStorage.getItem("chipgadget_products");
      if (saved) {
        const parsed = JSON.parse(saved);
        setProducts(parsed);
      } else {
        setProducts({});
      }
    } catch (error) {
      console.error("Ошибка загрузки товаров:", error);
      setProducts({});
    } finally {
      setLoading(false);
    }
  };

  // Преобразуем объект товаров в массив для отображения
  const productsArray = Object.values(products);

  // Фильтрация товаров
  const filteredProducts = productsArray.filter(product => {
    // Фильтр по категории
    let categoryMatch = true;
    if (activeCategory !== "all") {
      if (activeCategory === "used") {
        categoryMatch = product.condition === "used";
      } else {
        categoryMatch = product.category === activeCategory;
      }
    }

    // Фильтр по поисковому запросу
    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      searchMatch = 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.specs && 
          Object.values(product.specs).some(value => 
            value.toString().toLowerCase().includes(query)
          )
        );
    }

    return categoryMatch && searchMatch;
  });

  // Сортировка: сначала "хиты" (featured), потом новые, потом остальные
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    // По дате создания (новые сверху)
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });

  // Получаем название категории по ID
  const getCategoryTitle = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.title : categoryId;
  };

  // Получаем название бренда по ID
  const getBrandTitle = (brandId) => {
    const brands = [
      { id: "apple", name: "Apple" },
      { id: "samsung", name: "Samsung" },
      { id: "xiaomi", name: "Xiaomi" },
      { id: "huawei", name: "Huawei" },
      { id: "honor", name: "Honor" },
      { id: "oneplus", name: "OnePlus" },
      { id: "google", name: "Google" },
      { id: "asus", name: "ASUS" },
      { id: "lenovo", name: "Lenovo" },
      { id: "acer", name: "Acer" },
      { id: "dell", name: "Dell" },
      { id: "hp", name: "HP" },
      { id: "sony", name: "Sony" },
      { id: "lg", name: "LG" },
      { id: "other", name: "Другой" },
    ];
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : brandId;
  };

  // Функция для добавления в корзину (заглушка)
  const addToCart = (product) => {
    alert(`Товар "${product.name}" добавлен в корзину`);
    // Здесь будет логика добавления в корзину
  };

  // Функция для контакта
  const contactAboutProduct = (product) => {
    alert(`Интересует товар: ${product.name}\n\nПозвоните для консультации: +7 953 087-00-71\n\nИли напишите в WhatsApp: https://wa.me/79530870071`);
  };

  // Обработчик очистки фильтров
  const clearFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-6">⏳</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Загрузка товаров...</h3>
            <p className="text-gray-600">Пожалуйста, подождите</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Кнопка назад */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Назад
        </button>

        {/* Заголовок и статистика */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🛒 Магазин техники
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            В магазине представлены товары магазина партнера
          </p>
          
          {/* Статистика */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <span className="font-bold text-blue-600">{productsArray.length}</span> товаров
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <span className="font-bold text-green-600">
                {productsArray.filter(p => p.stock > 0).length}
              </span> в наличии
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <span className="font-bold text-purple-600">
                {productsArray.filter(p => p.featured).length}
              </span> хитов
            </div>
          </div>
          
          <p className="text-red-600 font-bold mt-6 max-w-2xl mx-auto">
            ⚠️ На б/у либо восстановленную технику гарантия не распространяется
          </p>
        </div>

        {/* Поиск и фильтры */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Поле поиска */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск товаров по названию или описанию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-4 pl-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Кнопка очистки фильтров */}
            {(activeCategory !== "all" || searchQuery) && (
              <button
                onClick={clearFilters}
                className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-colors"
              >
                ❌ Очистить фильтры
              </button>
            )}
          </div>

          {/* Категории */}
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  activeCategory === category.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow"
                }`}
              >
                <span className="text-lg">{category.emoji}</span>
                <span>{category.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Результаты поиска */}
        {searchQuery && (
          <div className="mb-6 text-center">
            <p className="text-gray-700">
              Найдено товаров: <span className="font-bold">{filteredProducts.length}</span>
            </p>
          </div>
        )}

        {/* Сетка товаров */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">
              {searchQuery || activeCategory !== "all" ? "🔍" : "📦"}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {searchQuery
                ? "По вашему запросу ничего не найдено"
                : activeCategory !== "all"
                ? "В этой категории пока нет товаров"
                : "Товары скоро появятся!"}
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              {searchQuery
                ? "Попробуйте изменить поисковый запрос или очистить фильтры"
                : "Администратор добавляет товары через панель управления. Загляните сюда позже!"}
            </p>
            
            {productsArray.length === 0 ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 max-w-2xl mx-auto">
                <h4 className="text-lg font-semibold text-blue-800 mb-3">Как добавить товары?</h4>
                <ol className="text-blue-700 space-y-2 text-left max-w-md mx-auto list-decimal pl-5">
                  <li>Войдите в админ-панель (через меню или /admin)</li>
                  <li>Перейдите на вкладку "🛒 Товары магазина"</li>
                  <li>Нажмите "➕ Добавить новый товар" и заполните форму</li>
                  <li>Сохраните товар - он сразу появится здесь</li>
                </ol>
                <div className="mt-4">
                  <button
                    onClick={() => navigate("/admin")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700"
                  >
                    Перейти в админ-панель
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700"
              >
                Показать все товары
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
                >
                  {/* Бэджи */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                    {product.featured && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        🔥 ХИТ
                      </span>
                    )}
                    {product.condition === "used" && (
                      <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Б/У
                      </span>
                    )}
                    {product.condition === "refurbished" && (
                      <span className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Восстановленный
                      </span>
                    )}
                  </div>

                  {/* Изображение товара */}
                  <div className="h-48 bg-gray-100 flex items-center justify-center p-4 relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.target.src = "/images/default-product.jpg";
                          e.target.className = "h-full object-contain opacity-50";
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-6xl">📷</div>
                    )}
                    
                    {/* Индикатор наличия */}
                    <div className="absolute bottom-2 right-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock > 0 ? `${product.stock} шт.` : 'Нет в наличии'}
                      </span>
                    </div>
                  </div>

                  {/* Информация о товаре */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-2 flex flex-wrap gap-1">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {getBrandTitle(product.brand)}
                      </span>
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {getCategoryTitle(product.category)}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {product.description || "Нет описания"}
                    </p>

                    {/* Характеристики (если есть) */}
                    {product.specs && Object.values(product.specs).some(v => v) && (
                      <div className="mb-4 text-xs text-gray-500">
                        {Object.entries(product.specs)
                          .filter(([key, value]) => value)
                          .slice(0, 2)
                          .map(([key, value]) => (
                            <div key={key} className="flex items-center gap-1">
                              <span className="font-medium">{key}:</span>
                              <span>{value}</span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Цена */}
                    <div className="mb-4">
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-800">
                              {product.price.toLocaleString()}₽
                            </span>
                            <span className="text-lg text-gray-400 line-through">
                              {product.originalPrice.toLocaleString()}₽
                            </span>
                            <span className="text-sm font-bold text-green-600">
                              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-2xl font-bold text-gray-800">
                          {product.price.toLocaleString()}₽
                        </div>
                      )}
                    </div>

                    {/* Кнопки действий */}
                    <div className="space-y-2 mt-auto">
                      <button
                        onClick={() => contactAboutProduct(product)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        📞 Узнать подробнее
                      </button>
                      
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className={`w-full py-2.5 rounded-lg font-medium transition-all ${
                          product.stock > 0
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {product.stock > 0 ? "🛒 В корзину" : "😔 Нет в наличии"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Пагинация (если товаров много) */}
            {sortedProducts.length > 16 && (
              <div className="mt-10 flex justify-center">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gray-200 rounded-lg">←</button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
                  <button className="px-4 py-2 bg-gray-200 rounded-lg">2</button>
                  <button className="px-4 py-2 bg-gray-200 rounded-lg">3</button>
                  <button className="px-4 py-2 bg-gray-200 rounded-lg">→</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Уведомление о партнерском магазине */}
        <div className="mt-12 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">ℹ️ Важная информация</h3>
          <p className="text-yellow-700 mb-3">
            <strong>Внимание!</strong> Данный раздел содержит товары магазина-партнера. 
            Все вопросы по наличию, характеристикам и доставке товаров уточняйте у продавца.
          </p>
          <p className="text-yellow-700">
            <strong>Гарантия:</strong> На новую технику предоставляется гарантия продавца. 
            <strong> На б/у или восстановленную технику гарантия не распространяется.</strong>
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <button
              onClick={() => alert("Позвонить: +7 953 087-00-71")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📞 Позвонить
            </button>
            <button
              onClick={() => window.open("https://wa.me/79530870071", "_blank")}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              💬 WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}