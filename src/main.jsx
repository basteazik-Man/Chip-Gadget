// main.jsx - с улучшенной обработкой ошибок
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { initPrices } from "./data/prices/index.js";
import FallbackUI from "./components/FallbackUI";

// ✅ Инициализация цен с комплексной обработкой ошибок
initPrices()
  .then(() => {
    console.log("Prices initialized successfully");
  })
  .catch((error) => {
    console.error("Failed to initialize prices:", error);
    
    // Дополнительная обработка для разных типов ошибок
    if (error.name === 'NetworkError') {
      console.warn("Network issue detected. Please check your connection.");
    } else if (error.name === 'SyntaxError') {
      console.error("Invalid price data format.");
    } else {
      console.error("Unknown error during price initialization:", error.message);
    }
  })
  .finally(() => {
    console.log("Price initialization process completed");
  });

// ✅ Обработка ошибок рендеринга с использованием FallbackUI
try {
  const root = createRoot(document.getElementById("root"));
  
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} catch (renderError) {
  console.error("Failed to render application:", renderError);
  
  // Резервный UI в случае ошибки рендеринга
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const fallbackRoot = createRoot(rootElement);
    fallbackRoot.render(<FallbackUI error={renderError} />);
  }
}

// ✅ Глобальная обработка неперехваченных ошибок
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// ✅ Резервная обработка для критических ошибок
window.addEventListener('error', (event) => {
  // Если ошибка критическая и React не загрузился
  if (!document.getElementById('root').hasChildNodes()) {
    setTimeout(() => {
      if (!document.getElementById('root').hasChildNodes()) {
        document.getElementById('root').innerHTML = `
          <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px;">
            <div style="text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🔧</div>
              <h1 style="font-size: 24px; margin-bottom: 16px; color: #1f2937;">Чип&Гаджет</h1>
              <h2 style="font-size: 20px; margin-bottom: 12px; color: #374151;">Ведутся технические работы</h2>
              <p style="color: #6b7280; margin-bottom: 16px;">Приносим извинения за временные неудобства.</p>
              <button onclick="window.location.reload()" style="background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                Обновить страницу
              </button>
            </div>
          </div>
        `;
      }
    }, 1000);
  }
});