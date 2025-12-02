// Утилиты для работы с товарами
export const normalizeProductKey = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, '')
    .replace(/\s+/g, '-')
    .trim();
};

export const getProductsFromStorage = () => {
  try {
    const saved = localStorage.getItem("chipgadget_products");
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error("Ошибка загрузки товаров:", e);
    return {};
  }
};

export const saveProductsToStorage = (products) => {
  try {
    localStorage.setItem("chipgadget_products", JSON.stringify(products));
    return true;
  } catch (e) {
    console.error("Ошибка сохранения товаров:", e);
    return false;
  }
};

export const getCategories = () => {
  return [
    { id: "smartphones", title: "Смартфоны", emoji: "📱" },
    { id: "laptops", title: "Ноутбуки", emoji: "💻" },
    { id: "tablets", title: "Планшеты", emoji: "📱" },
    { id: "accessories", title: "Аксессуары", emoji: "🎧" },
    { id: "used", title: "Б/У техника", emoji: "🔧" },
    { id: "other", title: "Другое", emoji: "📦" },
  ];
};

export const getBrandsForProducts = () => {
  return [
    { id: "apple", name: "Apple" },
    { id: "samsung", name: "Samsung" },
    { id: "xiaomi", name: "Xiaomi" },
    { id: "huawei", name: "Huawei" },
    { id: "honor", name: "Honor" },
    { id: "oneplus", name: "OnePlus" },
    { id: "google", name: "Google" },
    { id: "asus", name: "ASUS" },
    { id: "lenovo", name: "Lenovo" },
    { id: "acer", name: "Acer" },
    { id: "dell", name: "Dell" },
    { id: "hp", name: "HP" },
    { id: "sony", name: "Sony" },
    { id: "lg", name: "LG" },
    { id: "other", name: "Другой" },
  ];
};