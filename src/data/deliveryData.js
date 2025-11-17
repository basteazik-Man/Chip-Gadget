import { useState, useEffect } from 'react';

const defaultDeliveryData = {
  title: "ДОСТАВКА",
  description: "Бесплатный забор и доставка техники",
  cityLocations: [
    "Центральный район",
    "Северный район", 
    "Южный район",
    "Западный район",
    "Восточный район"
  ],
  suburbLocations: [
    "Поселок Северный",
    "Деревня Заречная",
    "Поселок Солнечный", 
    "Микрорайон Южный"
  ],
  services: [
    "Бесплатный забор техники на ремонт",
    "Профессиональная диагностика и ремонт", 
    "Бесплатная доставка обратно",
    "Гарантия на все виды работ"
  ],
  note: "Для других населенных пунктов стоимость доставки необходимо уточнять по телефону или при оформлении заказа."
};

export const useDelivery = () => {
  const [deliveryData, setDeliveryData] = useState(defaultDeliveryData);

  useEffect(() => {
    const saved = localStorage.getItem("chipgadget_delivery");
    if (saved) {
      try {
        setDeliveryData(JSON.parse(saved));
      } catch (e) {
        console.error("Ошибка загрузки данных доставки:", e);
      }
    }
  }, []);

  return deliveryData;
};

export const saveDeliveryData = (data) => {
  try {
    localStorage.setItem("chipgadget_delivery", JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Ошибка сохранения данных доставки:", e);
    return false;
  }
};

export const getDeliveryData = () => {
  const saved = localStorage.getItem("chipgadget_delivery");
  return saved ? JSON.parse(saved) : defaultDeliveryData;
};