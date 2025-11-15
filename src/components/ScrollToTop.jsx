// src/components/ScrollToTop.jsx
// Компонент, сбрасывающий прокрутку страницы вверх при смене маршрута

import { useEffect } from "react";
import { useLocation } from "react-router-dom"; // хук для получения информации о текущем пути

export default function ScrollToTop() {
  const { pathname } = useLocation(); // получаем текущий путь

  useEffect(() => {
    // при изменении маршрута — скролл страницы вверх
    window.scrollTo({
      top: 0, // прокручиваем страницу к началу
      behavior: "smooth", // плавная анимация прокрутки
    });
  }, [pathname]); // при изменении пути выполняется снова

  return null; // компонент ничего не рендерит, только вызывает эффект
}
