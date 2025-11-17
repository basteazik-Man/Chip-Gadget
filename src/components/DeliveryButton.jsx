// === DeliveryButton.jsx ===
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function DeliveryButton() {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  // мгновенно скрывается при малейшем скролле
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setVisible(y < 30); // исчезает почти сразу
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            bg-gradient-to-r from-cyan-500 to-blue-500
            text-white px-4 py-2 rounded-full
            shadow-lg shadow-blue-400/40 hover:shadow-blue-500/60
            hover:scale-105 active:scale-95
            transition-all duration-200 ease-in-out
            z-40
          "
        >
          <span className="text-sm md:text-base font-medium tracking-wide">
            ДОСТАВКА
          </span>
          <span className="text-base">🚚</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}