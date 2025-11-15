// services.js
export const SERVICES_BY_CATEGORY = {
  laptops: [
    { name: "Замена экрана (ноутбук)", price: "от 3500₽" },
    { name: "Замена клавиатуры", price: "от 1200₽" },
    { name: "Замена батареи", price: "от 1500₽" },
    { name: "Диагностика", price: "Бесплатно" }
  ],
  tv: [
    { name: "Ремонт подсветки", price: "от 4000₽" },
    { name: "Замена матрицы", price: "от 6000₽" },
    { name: "Ремонт блока питания", price: "от 3000₽" },
    { name: "Диагностика", price: "Бесплатно" }
  ],
  default: [
    { name: "Диагностика", price: "Бесплатно" }
  ]
};

export const SERVICES = Object.values(SERVICES_BY_CATEGORY).flat();