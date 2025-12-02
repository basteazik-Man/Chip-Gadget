import React, { useState, useEffect } from 'react';
import { MdDownload, MdClose } from 'react-icons/md';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Проверяем, установлено ли уже как PWA
    const checkDisplayMode = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true;
      setIsStandalone(isStandalone);
    };

    // Проверяем iOS
    const checkIOS = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      setIsIOS(isIOS);
    };

    // Обработчик события beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    checkDisplayMode();
    checkIOS();

    // Показываем промпт для iOS
    if (isIOS && !isStandalone) {
      setIsVisible(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      console.log('PWA установлено');
      setIsVisible(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Пользователь ${outcome} установку`);
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Сохраняем в localStorage, чтобы не показывать снова
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!isVisible || isStandalone || localStorage.getItem('pwaPromptDismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 animate-fade-in">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <MdDownload className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Установить приложение</h3>
              <p className="text-sm text-gray-600">
                Установите Чип&Гаджет для быстрого доступа
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Закрыть"
          >
            <MdClose size={20} />
          </button>
        </div>

        {isIOS ? (
          <div className="text-sm text-gray-600 mb-3">
            <p>Нажмите <span className="font-semibold">"Поделиться"</span> и выберите <span className="font-semibold">"На экран "Домой""</span></p>
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
          >
            Установить приложение
          </button>
        )}

        <div className="mt-3 flex items-center text-xs text-gray-500">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Быстрый доступ • Оффлайн режим • Меньше загрузки данных
        </div>
      </div>
    </div>
  );
}