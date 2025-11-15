// [file name]: AdminAuth.jsx
import React, { useState } from 'react';

// 🔐 ПАРОЛЬ БЕРЕТСЯ ИЗ НАСТРОЕК VERCEL ИЛИ ИСПОЛЬЗУЕТСЯ ЗАПАСНОЙ
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "tenda920";

export default function AdminAuth({ onAuthenticate }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_authenticated', 'true');
      onAuthenticate(true);
    } else {
      setError('Неверный пароль');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Доступ к админке
          </h1>
          <p className="text-gray-600">
            Введите пароль для доступа к панели управления
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-600 text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Войти
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Чип&Гаджет • Панель управления
        </div>
      </div>
    </div>
  );
}