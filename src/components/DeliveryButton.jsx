// === DeliveryButton.jsx ===
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTruck } from "react-icons/fa";

export default function DeliveryButton() {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Показываем только на главной странице
  const isHomePage = location.pathname === '/';

  // мгновенно скрывается при малейшем скролле
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setVisible(y < 30); // исчезает почти сразу
    };
    
    if (isHomePage) {
      window.addEventListener("scroll", handleScroll);
    }
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Не показываем если не на главной
  if (!isHomePage) {
    return null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={() => navigate('/delivery')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="
            fixed flex items-center gap-2
            top-[70px] left-4
            md:top-[80px] md:left-6
            bg-gradient-to-r from-blue-500 to-sky-500
            text-white px-4 py-2 rounded-full
            shadow-lg shadow-sky-400/40 hover:shadow-sky-500/60
            hover:scale-105 active:scale-95
            transition-all duration-200 ease-in-out
            z-40
          "
        >
          <span className="text-sm md:text-base font-medium tracking-wide">
            Доставка {/* ИЗМЕНЕНО: ДОСТАВКА → Доставка */}
          </span>
          <FaTruck className="w-4 h-4 drop-shadow-md" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}