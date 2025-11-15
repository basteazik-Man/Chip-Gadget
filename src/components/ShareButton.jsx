// === ShareButton.jsx ===
import React, { useState, useEffect } from "react";
import { FaShareAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function ShareButton() {
  const [visible, setVisible] = useState(true);

  // мгновенно скрывается при малейшем скролле
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setVisible(y < 30); // исчезает почти сразу
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: document.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Ссылка скопирована!");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={handleShare}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="
            fixed flex items-center gap-2
            top-[70px] right-4
            md:top-[80px] md:right-6
            bg-gradient-to-r from-blue-500 to-sky-500
            text-white px-4 py-2 rounded-full
            shadow-lg shadow-sky-400/40 hover:shadow-sky-500/60
            hover:scale-105 active:scale-95
            transition-all duration-200 ease-in-out
            z-40
          "
        >
          <span className="text-sm md:text-base font-medium tracking-wide">
            Поделись
          </span>
          <FaShareAlt className="w-5 h-5 drop-shadow-md" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
