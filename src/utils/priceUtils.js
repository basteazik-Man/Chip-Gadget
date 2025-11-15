// === src/utils/priceUtils.js ===
// Утилиты для работы с ценами - общие функции для всего приложения

// Нормализация ключа для использования в URL и объектах
export const normalizeKey = (str = "") =>
  str
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "");

// Расчет итоговой цены с учетом скидки
export const calculateFinalPrice = (price, discount = 0) => {
  const numPrice = parseFloat(price) || 0;
  const numDiscount = parseFloat(discount) || 0;
  const final = numPrice - (numPrice * numDiscount) / 100;
  return final > 0 ? parseFloat(final.toFixed(2)) : 0;
};

// Валидация структуры данных цен
export const validatePriceData = (data) => {
  if (!data || typeof data !== 'object') return false;
  
  // Базовая валидация структуры
  return Object.values(data).every(brand => 
    brand && 
    typeof brand === 'object' && 
    brand.models && 
    typeof brand.models === 'object'
  );
};

// Преобразование старого формата услуги в новый
export const normalizeService = (service) => {
  if (service.name && service.price !== undefined) {
    // Это старый формат { name: "...", price: 0 }
    return {
      id: service.name.toLowerCase().replace(/\s+/g, '-'),
      title: service.name,
      basePrice: service.price,
      finalPrice: service.finalPrice || service.price,
      active: service.active !== false
    };
  }
  return service;
};

// Безопасный парсинг числа с дефолтным значением
export const safeParseFloat = (value, defaultValue = 0) => {
  if (value === "" || value === null || value === undefined) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Форматирование цены с валютой
export const formatPrice = (price, currency = "₽") => {
  return `${parseFloat(price).toLocaleString('ru-RU')} ${currency}`;
};

// Проверка, заполнены ли цены для модели
export const getModelStatus = (services) => {
  if (!services || !services.length) return { status: "empty", emptyCount: 0 };
  const filled = services.filter((s) => (s.price || s.basePrice) > 0).length;
  const emptyCount = services.length - filled;
  if (filled === 0) return { status: "empty", emptyCount };
  if (filled < services.length) return { status: "partial", emptyCount };
  return { status: "full", emptyCount: 0 };
};

// Проверка статуса бренда
export const getBrandStatus = (brand) => {
  const models = Object.values(brand.models || {});
  if (!models.length) return { status: "empty", emptyCount: 0 };
  let totalEmpty = 0;
  const statuses = models.map((m) => {
    const s = getModelStatus(m);
    totalEmpty += s.emptyCount;
    return s.status;
  });
  if (statuses.every((s) => s === "full"))
    return { status: "full", emptyCount: totalEmpty };
  if (statuses.every((s) => s === "empty"))
    return { status: "empty", emptyCount: totalEmpty };
  return { status: "partial", emptyCount: totalEmpty };
};