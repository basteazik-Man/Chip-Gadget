// main.jsx - с улучшенной обработкой ошибок
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { initPrices } from "./data/prices/index.js";

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

// ✅ Обработка ошибок рендеринга
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
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1>Something went wrong</h1>
        <p>We're working to fix the issue. Please try refreshing the page.</p>
        <button onclick="window.location.reload()">Reload Page</button>
      </div>
    `;
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