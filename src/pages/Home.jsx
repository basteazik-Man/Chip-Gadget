// Home.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../hooks/useSearch";
import { BRANDS } from "../data/brands";

import DynamicHeroPanel from "../components/DynamicHeroPanel";

// Определяем мобильное устройство
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

const FALLBACK_BRANDS = [
  { id: "apple", title: "Apple", logo: "/logos/apple.svg" },
  { id: "samsung", title: "Samsung", logo: "/logos/samsung.svg" },
  { id: "xiaomi", title: "Xiaomi", logo: "/logos/xiaomi.svg" },
  { id: "honor", title: "Honor", logo: "/logos/honor.svg" },
  { id: "oneplus", title: "OnePlus", logo: "/logos/oneplus.svg" },
  { id: "blackview", title: "Blackview", logo: "/logos/blackview.svg" },
  { id: "doogee", title: "Doogee", logo: "/logos/doogee.svg" },
  { id: "oukitel", title: "Oukitel", logo: "/logos/oukitel.svg" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const handleSelect = (brand, modelId) => {
    setQuery("");
    setShowSuggestions(false);
    navigate(`/brand/${brand}/model/${encodeURIComponent(modelId)}`);
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

  const brandsToShow = BRANDS && BRANDS.length > 0 ? BRANDS : FALLBACK_BRANDS;

  const categories = [
    {
      id: "laptops",
      title: "Ноутбуки и ПК",
      desc: "Чистка, апгрейд, ремонт плат",
      icon: "💻",
      gradient: "from-indigo-500 to-purple-600",
      shadow: "shadow-indigo-500/30",
    },
    {
      id: "tv",
      title: "Телевизоры",
      desc: "Замена подсветки, матриц, БП",
      icon: "📺",
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/30",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0 : 0.1,
        duration: isMobile ? 0.3 : 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: isMobile ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: isMobile ? 0.2 : 0.4 },
    },
  };

  const brandHoverAnimation = isMobile
    ? {}
    : {
        whileHover: { scale: 1.05, y: -5 },
        whileTap: { scale: 0.95 },
      };

  const categoryAnimation = isMobile
    ? {}
    : {
        whileHover: { scale: 1.01 },
        whileTap: { scale: 0.98 },
      };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-50 text-gray-800">
      {!isMobile && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300/30 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-300/30 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20 flex flex-col items-center">
        
        {/* Заголовок и поиск */}
        <motion.div
          className="text-center max-w-3xl mb-10"
          initial={{ opacity: 0, y: isMobile ? 0 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.3 : 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 mb-6 tracking-tight">
            Ремонт{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              будущего
            </span>
          </h1>

          <div className="mb-8">
            <button
              onClick={() => navigate("/store")}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <span className="text-2xl">🛒</span>
              <span>Перейти в магазин</span>
            </button>
          </div>

          {/* Поиск */}
          <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
            <div className={`relative ${isMobile ? "" : "group"}`}>
              {!isMobile && (
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              )}
              <div className="relative flex bg-white rounded-2xl shadow-xl">
                <input
                  type="text"
                  placeholder="Найти модель (например: iPhone 13)..."
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() =>
                    query.trim().length > 0 && setShowSuggestions(true)
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSearchAll()}
                  className="w-full p-4 pl-6 rounded-l-2xl outline-none text-gray-700 text-lg placeholder-gray-400"
                />
                <button
                  onClick={handleSearchAll}
                  className="px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-r-2xl transition-colors flex items-center gap-2"
                >
                  🔍
                  <span className="hidden sm:inline">Найти</span>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showSuggestions && query.trim().length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: isMobile ? 0 : -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: isMobile ? 0 : -10 }}
                  transition={{ duration: isMobile ? 0.1 : 0.2 }}
                  className="absolute left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                >
                  {results.length > 0 ? (
                    <>
                      {results.slice(0, 8).map((item, idx) => (
                        <li
                          key={idx}
                          onClick={() =>
                            handleSelect(item.brandKey, item.modelId)
                          }
                          className="px-6 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors border-b border-gray-100 last:border-none"
                        >
                          <span className="font-medium text-gray-700">
                            {item.model}
                          </span>
                          <span className="text-xs font-bold text-blue-500 bg-blue-100 px-2 py-1 rounded-full">
                            {item.brand}
                          </span>
                        </li>
                      ))}
                    </>
                  ) : (
                    <li className="px-6 py-4 text-center text-gray-500">
                      Ничего не найдено 😔
                    </li>
                  )}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* === НАШИ ПРЕИМУЩЕСТВА (с картинками) === */}
        {!isMobile && (
          <motion.div
            className="hidden md:grid grid-cols-3 gap-6 w-full max-w-5xl mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {/* Экспресс ремонт */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center flex flex-col items-center"
            >
              <img
                src="/Гидрогелевая пленка.png"
                className="w-32 h-32 object-contain mb-4"
                alt="Гидрогелевая пленка"
              />
              <h3 className="font-bold text-lg">-50% на гидрогелевую пленку!</h3>
            </motion.div>

            {/* Гарантия */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center flex flex-col items-center"
            >
              <img
                src="/remax.png"
                className="w-32 h-32 object-contain mb-4"
                alt="Гарантия"
              />
              <h3 className="font-bold text-lg">Original!</h3>
            </motion.div>

            {/* Честные цены */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center flex flex-col items-center"
            >
              <img
                src="/Аксессуары.png"
                className="w-32 h-32 object-contain mb-4"
                alt="Аксессуары"
              />
              <h3 className="font-bold text-lg">АКСЕССУАРЫ</h3>
            </motion.div>
          </motion.div>
        )}

        {/* === HERO PANEL === */}
        <div className="w-full flex justify-center mb-12 md:mb-16">
          <DynamicHeroPanel />
        </div>

        {/* === БРЕНДЫ === */}
        <motion.section
          className="w-full max-w-6xl mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: isMobile ? 0.3 : 0.6 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Популярные бренды
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brandsToShow.slice(0, 12).map((brand) => (
              <motion.button
                key={brand.id}
                onClick={() => navigate(`/brand/${brand.id}`)}
                {...brandHoverAnimation}
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white shadow-md hover:shadow-xl hover:bg-blue-50 transition-all duration-300"
              >
                <img
                  src={brand.logo}
                  alt={brand.title}
                  className="w-12 h-12 object-contain mb-3"
                />
                <span className="font-semibold text-gray-700 text-sm">
                  {brand.title}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* === УСЛУГИ === */}
        <motion.section
          className="w-full max-w-6xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: isMobile ? 0.3 : 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center md:text-left">
            Другие услуги
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                onClick={() => navigate(`/services?category=${cat.id}`)}
                {...categoryAnimation}
                className={`relative overflow-hidden cursor-pointer rounded-3xl p-6 md:p-8 text-white shadow-2xl ${cat.shadow} bg-gradient-to-br ${cat.gradient} group`}
              >
                {!isMobile && (
                  <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">
                      {cat.title}
                    </h3>
                    <p className="text-white/80 font-medium text-sm md:text-base">
                      {cat.desc}
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold group-hover:bg-white group-hover:text-blue-600 transition-colors">
                      Рассчитать стоимость →
                    </div>
                  </div>

                  <span
                    className={`text-5xl md:text-6xl drop-shadow-lg ${
                      isMobile
                        ? ""
                        : "transform group-hover:rotate-12 transition-transform duration-300"
                    }`}
                  >
                    {cat.icon}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  );
}
