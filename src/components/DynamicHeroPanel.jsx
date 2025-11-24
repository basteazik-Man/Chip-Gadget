import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBolt, FaShieldAlt, FaClock, FaHandHoldingHeart } from "react-icons/fa";

// Данные для слайдов (можете менять текст здесь)
const slides = [
  {
    id: 1,
    title: "Добро пожаловать в Чип&Гаджет",
    subtitle: "Профессиональный ремонт смартфонов, планшетов и ноутбуков всех брендов",
    icon: <FaHandHoldingHeart className="text-5xl mb-4" />,
    gradient: "from-blue-500 to-blue-600", // Синий (как у вас был)
  },
  {
    id: 2,
    title: "Срочный ремонт от 30 минут",
    subtitle: "Ценим ваше время. Большинство поломок устраняем в день обращения",
    icon: <FaClock className="text-5xl mb-4" />,
    gradient: "from-purple-500 to-indigo-600", // Фиолетовый
  },
  {
    id: 3,
    title: "Бесплатная диагностика",
    subtitle: "Точно определим неисправность и назовем цену до начала ремонта",
    icon: <FaBolt className="text-5xl mb-4" />,
    gradient: "from-emerald-500 to-teal-600", // Зеленый
  },
  {
    id: 4,
    title: "Гарантия на все работы",
    subtitle: "Мы уверены в качестве запчастей и предоставляем честную гарантию",
    icon: <FaShieldAlt className="text-5xl mb-4" />,
    gradient: "from-orange-500 to-red-500", // Оранжевый
  },
];

export default function DynamicHeroPanel() {
  const [index, setIndex] = useState(0);

  // Автоматическое переключение каждые 5 секунд
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-5xl mb-6 relative">
      <div className="relative w-full overflow-hidden rounded-2xl shadow-lg min-h-[220px] md:min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[index].id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-r ${slides[index].gradient} text-white`}
          >
            {slides[index].icon}
            <h2 className="text-2xl md:text-4xl font-extrabold mb-2">
              {slides[index].title}
            </h2>
            <p className="text-white/90 text-base md:text-lg max-w-2xl">
              {slides[index].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Индикаторы (точки) снизу */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              i === index ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}