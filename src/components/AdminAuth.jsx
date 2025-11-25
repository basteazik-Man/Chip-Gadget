import React, { useState, useEffect } from 'react';

// 🔐 ХЕШИ ПАРОЛЕЙ (замените на свой хеш)
const PASSWORD_HASHES = {
  '7bb3079c880df4d2e8edfefad5e2a966fd43f18080e163db1265021628dfc12b': true,
};

const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const validateSession = () => {
  try {
    const sessionData = localStorage.getItem('admin_session') || sessionStorage.getItem('admin_session');
    if (!sessionData) return false;

    const session = JSON.parse(sessionData);
    
    if (Date.now() > session.expires) {
      localStorage.removeItem('admin_session');
      sessionStorage.removeItem('admin_session');
      localStorage.removeItem('admin_authenticated');
      return false;
    }
    
    if (session.userAgent !== navigator.userAgent) {
      localStorage.removeItem('admin_session');
      sessionStorage.removeItem('admin_session');
      localStorage.removeItem('admin_authenticated');
      return false;
    }
    
    return true;
  } catch {
    localStorage.removeItem('admin_session');
    sessionStorage.removeItem('admin_session');
    localStorage.removeItem('admin_authenticated');
    return false;
  }
};

export default function AdminAuth({ onAuthenticate }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // ВСЕ ХУКИ ДОЛЖНЫ ВЫЗЫВАТЬСЯ БЕЗУСЛОВНО НА КАЖДОМ РЕНДЕРЕ
  useEffect(() => {
    // Проверяем сессию только если не заблокированы
    if (!isBlocked && validateSession()) {
      onAuthenticate(true);
    }
    
    // Восстанавливаем состояние блокировки
    const storedAttempts = localStorage.getItem('admin_auth_attempts');
    const lastAttemptTime = localStorage.getItem('admin_last_attempt_time');
    
    if (storedAttempts) {
      setAttempts(parseInt(storedAttempts));
    }

    if (lastAttemptTime && Date.now() - parseInt(lastAttemptTime) < 30 * 60 * 1000) {
      const remainingTime = Math.ceil((30 * 60 * 1000 - (Date.now() - parseInt(lastAttemptTime))) / 1000 / 60);
      if (remainingTime > 0) {
        setIsBlocked(true);
        setBlockTime(remainingTime);
        
        const timer = setInterval(() => {
          setBlockTime(prev => {
            if (prev <= 1) {
              setIsBlocked(false);
              clearInterval(timer);
              localStorage.removeItem('admin_last_attempt_time');
              return 0;
            }
            return prev - 1;
          });
        }, 60000);
        
        return () => clearInterval(timer);
      }
    }
  }, [onAuthenticate, isBlocked]); // Добавляем зависимости

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isBlocked) {
      setError(`Система заблокирована. Попробуйте через ${blockTime} минут`);
      setLoading(false);
      return;
    }

    if (password.length < 3) {
      setError('Пароль слишком короткий');
      setLoading(false);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem('admin_auth_attempts', newAttempts.toString());

    if (newAttempts >= 5) {
      setIsBlocked(true);
      setBlockTime(30);
      localStorage.setItem('admin_last_attempt_time', Date.now().toString());
      
      setError('Слишком много неудачных попыток. Система заблокирована на 30 минут.');
      setLoading(false);
      
      setTimeout(() => {
        setIsBlocked(false);
        setAttempts(0);
        localStorage.removeItem('admin_auth_attempts');
        localStorage.removeItem('admin_last_attempt_time');
      }, 30 * 60 * 1000);
      
      return;
    }

    try {
      const hashedInput = await hashPassword(password);
      const isValid = PASSWORD_HASHES[hashedInput] === true;

      if (isValid) {
        const sessionToken = await hashPassword(Date.now().toString() + password);
        const sessionData = {
          token: sessionToken,
          expires: rememberMe ? Date.now() + 30 * 24 * 60 * 60 * 1000 : Date.now() + 2 * 60 * 60 * 1000,
          userAgent: navigator.userAgent,
          rememberMe: rememberMe
        };
        
        // Сохраняем в правильное хранилище
        if (rememberMe) {
          localStorage.setItem('admin_session', JSON.stringify(sessionData));
        } else {
          sessionStorage.setItem('admin_session', JSON.stringify(sessionData));
        }
        
        localStorage.removeItem('admin_auth_attempts');
        localStorage.removeItem('admin_last_attempt_time');
        
        onAuthenticate(true);
      } else {
        setError(`Неверный пароль. Осталось попыток: ${5 - newAttempts}`);
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError('Ошибка системы аутентификации');
      console.error('Auth error:', err);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Доступ к админ-панели
          </h1>
          <p className="text-gray-600 text-sm">
            🔐 Защищенная система аутентификации
          </p>
          {attempts > 0 && (
            <p className="text-orange-600 text-xs mt-2">
              Попыток входа: {attempts}/5
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль администратора
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите секретный пароль..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isBlocked || loading}
              autoFocus
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
              Запомнить меня
            </label>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            {rememberMe ? (
              <>🔒 Сессия сохранится на 30 дней</>
            ) : (
              <>⏳ Сессия сбросится через 2 часа</>
            )}
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-center font-medium ${
              error.includes('заблокирована') 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-orange-100 text-orange-700 border border-orange-200'
            }`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isBlocked || !password || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>⏳ Проверка...</>
            ) : isBlocked ? (
              <>🔒 Заблокировано</>
            ) : (
              <>🚀 Войти в админку</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
          <div>Чип&Гаджет • Защищенная панель управления</div>
          <div className="text-gray-400">
            {rememberMe ? 'Долгая сессия (30 дней)' : 'Короткая сессия (2 часа)'} • Макс. попыток: 5
          </div>
        </div>
      </div>
    </div>
  );
}