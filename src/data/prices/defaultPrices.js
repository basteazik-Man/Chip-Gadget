// src/data/prices/defaultPrices.js
export const defaultPrices = {
  brand: "default",
  currency: "₽",
  discount: { type: "none", value: 0 },
  defaults: [
    { 
      id: "screen", 
      title: "Замена экрана", 
      basePrice: 0, 
      active: true 
    },
    { 
      id: "battery", 
      title: "Замена батареи", 
      basePrice: 0, 
      active: true 
    },
    { 
      id: "diagnostics", 
      title: "Диагностика", 
      basePrice: 0, 
      active: true 
    },
  ],
  models: {}
};