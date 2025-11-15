// [file name]: AdminLayout.jsx
// Сохранить в: src/components/AdminLayout.jsx

import React from 'react';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {children}
    </div>
  );
}