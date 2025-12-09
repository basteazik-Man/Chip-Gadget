import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// === Наши 3 картинки для слайдера ===
const slides = [
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

export default function DynamicHeroPanel() {
  const [index, setIndex] = useState(0);

  // автоматическая смена каждые 5 секунд
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-5xl mb-6 relative">
      <div className="relative w-full overflow-hidden rounded-2xl shadow-lg min-h-[200px] bg-white flex items-center justify-center">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[index].id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
          >
            <img
              src={slides[index].img}
              alt={slides[index].caption}
              className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-xl mb-4"
            />

            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {slides[index].caption}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Индикаторы точек */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              i === index ? "bg-gray-800 scale-125" : "bg-gray-400/50 hover:bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
