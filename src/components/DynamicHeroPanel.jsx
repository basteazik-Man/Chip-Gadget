import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBolt,
  FaShieldAlt,
  FaClock,
  FaHandHoldingHeart,
} from "react-icons/fa";

// ===== Слайды для ПК (оригинальные) =====
const slidesDesktop = [
  {
    id: 1,
    title: "Добро пожаловать в Чип&Гаджет",
    subtitle:
      "Профессиональный ремонт смартфонов, планшетов и ноутбуков всех брендов",
    icon: <FaHandHoldingHeart className="text-5xl mb-4" />,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    title: "Срочный ремонт от 30 минут",
    subtitle:
      "Ценим ваше время. Большинство поломок устраняем в день обращения",
    icon: <FaClock className="text-5xl mb-4" />,
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    id: 3,
    title: "Бесплатная диагностика",
    subtitle:
      "Точно определим неисправность и назовем цену до начала ремонта",
    icon: <FaBolt className="text-5xl mb-4" />,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: 4,
    title: "Гарантия на все работы",
    subtitle:
      "Мы уверены в качестве запчастей и предоставляем честную гарантию",
    icon: <FaShieldAlt className="text-5xl mb-4" />,
    gradient: "from-orange-500 to-red-500",
  },
];

// ===== Слайды для мобильной версии (ваши картинки) =====
const slidesMobile = [
  {
    id: 1,
    img: "/Аксессуары.png",
    caption: "АКСЕССУАРЫ",
  },
  {
    id: 2,
    img: "/remax.png",
    caption: "Original!",
  },
  {
    id: 3,
    img: "/Гидрогелевая пленка.png",
    caption: "-50% на гидрогелевую пленку!",
  },
];

// ===== Хук определения мобильного устройства =====
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
};

export default function DynamicHeroPanel() {
  const isMobile = useIsMobile();
  const slides = isMobile ? slidesMobile : slidesDesktop;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((prev) => (prev + 1) % slides.length),
      5000
    );
    return () => clearInterval(timer);
  }, [slides.length]);

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
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
          >

            {/* === ПК ВЕРСИЯ === */}
            {!isMobile && (
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-r ${slides[index].gradient} p-6`}
              >
                {slides[index].icon}
                <h2 className="text-2xl md:text-4xl font-extrabold mb-2">
                  {slides[index].title}
                </h2>
                <p className="text-white/90 text-base md:text-lg max-w-2xl">
                  {slides[index].subtitle}
                </p>
              </div>
            )}

            {/* === МОБИЛЬНАЯ ВЕРСИЯ === */}
            {isMobile && (
              <div className="flex flex-col items-center justify-center w-full h-full bg-white">
                <img
                  src={slides[index].img}
                  alt={slides[index].caption}
                  className="w-40 h-40 object-contain mb-4"
                />
                <p className="text-lg font-bold text-gray-800">
                  {slides[index].caption}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Индикаторы (точки) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              i === index
                ? "bg-gray-800 scale-125"
                : "bg-gray-400/50 hover:bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
