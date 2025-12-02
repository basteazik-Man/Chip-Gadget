import React, { useState, useEffect } from 'react';
import { MdWifiOff, MdWifi } from 'react-icons/md';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-pulse">
        <MdWifiOff className="mr-2" />
        <span>Оффлайн режим</span>
      </div>
    </div>
  );
}