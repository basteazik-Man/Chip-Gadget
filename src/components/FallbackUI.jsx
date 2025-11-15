// src/components/FallbackUI.jsx
import React from 'react';

const FallbackUI = ({ error = null }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        {/* Логотип */}
        <div className="mb-6">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold text-gray-800">Чип&Гаджет</h1>
        </div>

        {/* Основное сообщение */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Ведутся технические работы
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Приносим извинения за временные неудобства. 
            Мы работаем над улучшением сервиса и скоро всё заработает.
          </p>
        </div>

        {/* Контактная информация */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            По всем срочным вопросам:
          </p>
          <a 
            href="tel:+79530870071" 
            className="text-lg font-semibold text-blue-600 hover:text-blue-700 block"
          >
            📞 +7 (953) 087-00-71
          </a>
        </div>

        {/* Кнопка перезагрузки */}
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
        >
          Обновить страницу
        </button>

        {/* Детали ошибки для разработки */}
        {error && process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">
              Детали ошибки (только для разработки)
            </summary>
            <pre className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded overflow-auto">
              {error.toString()}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default FallbackUI;