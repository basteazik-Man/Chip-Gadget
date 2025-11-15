// === HeaderMain.jsx ===
import React from "react";
import { Link } from "react-router-dom";
import { FaTelegramPlane, FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { CONTACT } from "../data/contact";

export default function HeaderMain() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* === Логотип === */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <img
            src="/logo.jpg"
            alt="Chip&Gadget logo"
            className="h-10 w-auto rounded-md shadow-sm"
          />
          <span>Чип&Гаджет</span>
        </Link>

        {/* === Контакты === */}
        <div className="flex items-center gap-6 text-gray-700 font-medium">
          {/* Телефон текстом — только на ПК */}
          <a
            href={CONTACT.call}
            className="hidden md:flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            {CONTACT.phone}
          </a>

          {/* Иконки */}
          <div className="flex items-center gap-3">
            {/* 📞 Позвонить (только мобильные) */}
            <a
              href={CONTACT.call}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-all shadow-md active:scale-95 md:hidden"
            >
              <FaPhoneAlt className="w-5 h-5" />
            </a>

            {/* 💬 Telegram */}
            <a
              href={CONTACT.tg}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full transition-all shadow-md active:scale-95"
            >
              <FaTelegramPlane className="w-5 h-5" />
            </a>

            {/* 💚 WhatsApp */}
            <a
              href={CONTACT.wa}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-all shadow-md active:scale-95"
            >
              <FaWhatsapp className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
