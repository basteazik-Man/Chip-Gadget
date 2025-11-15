// === FooterMain.jsx ===
// Глянцевый футер с неоновыми акцентами и плавной анимацией

import React from "react";
import { motion } from "framer-motion";
import { FaTelegramPlane, FaWhatsapp, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { CONTACT } from "../data/contact";

export default function FooterMain() {
  return (
    <footer className="relative bg-gradient-to-r from-white via-slate-100 to-white text-gray-700 border-t border-gray-200 shadow-inner mt-16">
      <motion.div
        className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* === Левая часть (бренд и слоган) === */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-700 mb-1">Чип&Гаджет</h2>
          <p className="text-gray-500 text-sm">Ремонт. Качество. Надёжность.</p>
        </div>

        {/* === Центральная часть (контакты) === */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-2 text-gray-700">
            <FaMapMarkerAlt className="text-blue-500" />
            <span>{CONTACT.address}</span>
          </div>

          <a
            href={CONTACT.call}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-500 transition-all"
          >
            <FaPhoneAlt className="text-green-500" />
            {CONTACT.phone}
          </a>

          <div className="flex gap-4 mt-2">
            {/* WhatsApp */}
            <a
              href={CONTACT.wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-400 text-white px-4 py-2 rounded-full shadow-md hover:shadow-green-400/50 hover:scale-105 transition-all duration-300"
            >
              <FaWhatsapp />
              WhatsApp
            </a>

            {/* Telegram */}
            <a
              href={CONTACT.tg}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-sky-400/50 hover:scale-105 transition-all duration-300"
            >
              <FaTelegramPlane />
              Telegram
            </a>
          </div>
        </div>

        {/* === Правая часть (копирайт) === */}
        <div className="text-center md:text-right text-sm text-gray-500">
          © {new Date().getFullYear()} Чип&Гаджет. Все права защищены.
        </div>
      </motion.div>
    </footer>
  );
}
