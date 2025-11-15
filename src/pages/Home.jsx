// Home.jsx (обновленная версия с улучшенными кнопками категорий)
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../hooks/useSearch";
import { BRANDS } from "../data/brands";

const FALLBACK_BRANDS = [
  { id: "apple", title: "Apple", logo: "/logos/apple.svg" },
  { id: "samsung", title: "Samsung", logo: "/logos/samsung.svg" },
  { id: "xiaomi", title: "Xiaomi", logo: "/logos/xiaomi.svg" },
  { id: "honor", title: "Honor", logo: "/logos/honor.svg" },
];

export default function Home() {
	if (process.env.NODE_ENV === 'development' && window.location.search.includes('test-error=1')) {
    throw new Error("Тестовая ошибка для проверки ErrorBoundary");
  }
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const searchHook = useSearch || (() => ({ searchResults: [] }));
  const { searchResults: results = [] } = searchHook(query);

  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (brand, model) => {
    setQuery("");
    setShowSuggestions(false);
    navigate(`/brand/${brand}/model/${encodeURIComponent(model)}`);
  };

  const handleSearchAll = () => {
    setShowSuggestions(false);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const handleInputFocus = () => {
    if (query.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  const hasQuery = query.trim().length > 0;
  const hasResults = results.length > 0;

  const brandsToShow = BRANDS && BRANDS.length > 0 ? BRANDS : FALLBACK_BRANDS;

  const categories = [
    { 
      id: "laptops", 
      title: "Ноутбуки", 
      icon: "💻", 
      gradient: "from-purple-500 to-blue-600",
      hoverGradient: "from-purple-600 to-blue-700"
    },
    { 
      id: "tv", 
      title: "Телевизоры", 
      icon: "📺", 
      gradient: "from-green-500 to-teal-600",
      hoverGradient: "from-green-600 to-teal-700"
    },
  ];

  const handleCategoryClick = (categoryId) => {
    navigate(`/services?category=${categoryId}`);
  };

  return (
    <div className="flex flex-col items-center text-center px-4 sm:px-6 relative z-10 pt-16">
      {/* === Поиск === */}
      <motion.div
        ref={searchRef}
        className="w-full max-w-4xl mb-8 relative"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex">
          <input
            type="text"
            placeholder="🔍 Поиск модели или бренда..."
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={(e) => e.key === "Enter" && handleSearchAll()}
            className="w-full p-4 rounded-l-2xl border border-gray-300 shadow-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-gray-800 text-lg"
          />
          <button
            onClick={handleSearchAll}
            disabled={!query.trim()}
            className={`px-6 py-4 font-semibold rounded-r-2xl ${
              query.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Поиск
          </button>
        </div>

        <AnimatePresence>
          {showSuggestions && hasQuery && (
            <motion.ul
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-80 overflow-auto"
            >
              {hasResults ? (
                <>
                  {results.slice(0, 10).map((item, index) => (
                    <motion.li
                      key={index}
                      onClick={() => handleSelect(item.brandKey, item.model)}
                      className="px-4 py-3 text-left text-gray-800 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold">{item.model}</span>
                          <span className="text-gray-500 text-sm ml-2">({item.brand})</span>
                        </div>
                        <span className="text-xs text-gray-400">→</span>
                      </div>
                    </motion.li>
                  ))}

                  {results.length > 10 && (
                    <li
                      onClick={handleSearchAll}
                      className="px-4 py-3 text-center font-semibold text-blue-600 hover:bg-blue-50 cursor-pointer border-t border-gray-200"
                    >
                      Показать все {results.length} результатов →
                    </li>
                  )}
                </>
              ) : (
                <li className="px-4 py-3 text-center text-gray-600">
                  Не найдено результатов для "{query}"
                </li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.div>

      {/* === Приветствие === */}
      <motion.section
        className="w-full max-w-5xl mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          Добро пожаловать в <span className="text-white/90">Чип&Гаджет</span>
        </h1>
        <p className="text-white/90 mt-2 text-lg">Ремонт смартфонов, планшетов и ноутбуков всех брендов</p>
      </motion.section>

      {/* === Кнопки брендов === */}
      {brandsToShow && brandsToShow.length > 0 ? (
        <motion.section
          className="w-full max-w-5xl bg-white/80 p-6 md:p-8 rounded-3xl shadow-md backdrop-blur-sm mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mb-6 md:mb-8 text-gray-800">Выберите бренд</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {brandsToShow.map((brand) => (
              <motion.button
                key={brand.id}
                onClick={() => navigate(`/brand/${brand.id}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center p-4 md:p-6 rounded-2xl bg-white shadow-xl hover:shadow-2xl cursor-pointer transition-all duration-300 border border-gray-100"
              >
                <img
                  src={brand.logo}
                  alt={brand.title}
                  className="w-14 h-14 md:w-20 md:h-20 mb-3 object-contain"
                />
                <p className="font-medium text-gray-700 text-sm md:text-base">{brand.title}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>
      ) : (
        <div className="w-full max-w-5xl bg-yellow-50 p-6 rounded-3xl border border-yellow-200">
          <h2 className="text-xl font-semibold text-yellow-800">Бренды не загружены</h2>
          <p className="text-yellow-700 mt-2">Проверьте файл с данными брендов</p>
        </div>
      )}

      {/* === КАТЕГОРИИ (TV / LAPTOPS) === */}
      <motion.section
        className="w-full max-w-5xl bg-white/80 p-6 md:p-8 rounded-3xl shadow-md backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-semibold mb-6 md:mb-8 text-gray-800">Ремонт техники</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl bg-gradient-to-r ${cat.gradient} shadow-xl hover:shadow-2xl text-white min-h-[140px] transition-all duration-300 hover:bg-gradient-to-r ${cat.hoverGradient}`}
            >
              <span className="text-3xl md:text-4xl mb-3">
                {cat.icon}
              </span>
              <span className="text-xl font-bold">{cat.title}</span>
              <span className="text-white/80 text-sm mt-2">Посмотреть услуги и цены</span>
            </motion.button>
          ))}
        </div>
      </motion.section>
    </div>
  );
}