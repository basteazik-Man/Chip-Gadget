// === src/data/index.js ===
// Основные данные для сайта Chip & Gadget

export const CONTACTS = {
  phone: "+7 953 087-00-71",
  wa: "https://wa.me/79530870071",
  tg: "https://t.me/yourusername",
  email: "info@chipgadget.example",
  address: "а. Старобжегокай, ул. Шовгенова 13",
  call: "tel:+79530870071"
};

export const BRANDS = [
  { key: "apple", title: "Apple", logo: "/logos/apple.svg" },
  { key: "samsung", title: "Samsung", logo: "/logos/samsung.svg" },
  { key: "xiaomi", title: "Xiaomi", logo: "/logos/xiaomi.svg" },
  { key: "honor", title: "Honor", logo: "/logos/honor.svg" },
  { key: "infinix", title: "Infinix", logo: "/logos/infinix.svg" },
  { key: "tecno", title: "Tecno", logo: "/logos/tecno.svg" },
  { key: "realme", title: "Realme", logo: "/logos/realme.svg" },
  { key: "huawei", title: "Huawei", logo: "/logos/huawei.svg" }
];

export const SERVICES = [
  "Замена экрана",
  "Замена аккумулятора",
  "Ремонт зарядного разъёма",
  "Ремонт кнопок",
  "Прошивка / восстановление системы",
  "Замена камеры",
  "Чистка после попадания влаги",
  "Ремонт микрофона / динамика",
  "Установка защитного стекла",
  "Диагностика устройства"
];

export const MODELS = {
  apple: ["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14"],
  samsung: [
    "S20", "S20 Plus", "S20 Ultra", "S20 FE", "S21", "S21 Plus", "S21 Ultra", "S21 FE",
    "S22", "S22 Plus", "S22 Ultra", "S23", "S23 Plus", "S23 Ultra", "S23 FE",
    "S24", "S24 Plus", "S24 Ultra", "A10", "A12", "A20", "A30", "A32", "A33", "A34",
    "A50", "A51", "A52", "A52s", "A53", "A54", "A73", "M12", "M21", "M22", "M31",
    "M32", "M33", "M52", "M53", "M54", "Note 10", "Note 10 Plus", "Note 20", "Note 20 Ultra",
    "Z Flip 3", "Z Fold 3", "Z Flip 4", "Z Fold 4", "Z Flip 5", "Z Fold 5",
    "Tab S6", "Tab S7", "Tab S8", "Tab S9"
  ],
  xiaomi: [
    "Note 9", "Note 9s", "Note 9 Pro", "Note 9 Pro Max", "Note 10", "Note 10s", "Note 10 Pro",
    "Note 11", "Note 11s", "Note 11 Pro", "Note 11 Pro Plus", "Note 12", "Note 12 Pro",
    "Note 12 Pro Plus", "Note 13", "Note 13 Pro", "Note 13 Pro Plus", "Redmi 9", "Redmi 9a",
    "Redmi 9c", "Redmi 9t", "Redmi 10", "Redmi 10c", "Redmi 12", "Redmi 12c", "Redmi 13",
    "Redmi 13c", "Mi 11", "Mi 12", "Mi 13", "K50", "K60", "K70"
  ],
  honor: [
    "Honor 8s", "Honor 8x", "Honor 9s", "Honor 10", "Honor 10i", "Honor 20", "Honor 20 Lite",
    "Honor 30i", "Honor 30s", "Honor 50", "Honor 50 Lite", "Honor 60", "Honor 70", "Honor 80",
    "Honor 90", "Honor 90 Lite", "X7b", "X8", "X8c", "X9", "X9a", "X9b", "X9c", "Magic 4 Pro",
    "Magic 5 Pro", "Magic 6 Pro", "Magic 7 Pro"
  ],
  infinix: [
    "Note 7", "Note 7 Lite", "Note 8", "Note 10", "Note 10 Pro", "Note 12", "Note 12 Pro",
    "Note 30", "Note 30i", "Note 40 Pro", "Note 40 Pro 4G", "Note 50", "Note 50 Pro",
    "Note 50 Pro Plus", "Hot 10", "Hot 10i", "Hot 10lite", "Hot 10s", "Hot 10t", "Hot 11",
    "Hot 12", "Hot 12pro", "Hot 12play", "Hot 12i", "Hot 20", "Hot 20i", "Hot 20s", "Hot 30",
    "Hot 30 Play", "Hot 40i", "Hot 40pro", "Hot 50", "Hot 50i", "Hot 50pro", "Hot 60i",
    "Hot 60 Pro Plus", "Smart 6 HD", "Smart 6 Plus", "Smart 7 Plus", "Smart 9", "Zero X Pro",
    "Zero 30 4G", "Zero 30 5G", "Zero 40 4G", "Zero 40 5G", "GT 10 Pro", "GT 20 Pro", "GT 30 Pro", "GT 30"
  ],
  tecno: [
    "Camon 16", "Camon 17", "Camon 17p", "Camon 17 Pro", "Camon 18", "Camon 18p", "Camon 18 Premier",
    "Camon 19", "Camon 20", "Camon 20 Pro", "Camon 20 Premier", "Camon 30", "Camon 30 5G", "Camon 30s",
    "Camon 30 Pro", "Camon 30 Premier", "Camon 40", "Camon 40 Premier", "Spark 7", "Spark 8", "Spark 8p",
    "Spark 8c", "Spark 9", "Spark 9 Pro", "Spark 10", "Spark 10 Pro", "Spark 20", "Spark 20c",
    "Spark 20 Pro Plus", "Spark Go 2022", "Spark Go 2024", "Spark 30", "Spark 30 5G", "Spark 30 Pro",
    "Spark 40", "Spark 40 Pro", "Spark 40 Pro Plus", "Pova Neo", "Pova Neo 2", "Pova Neo 3", "Pova 4",
    "Pova 4 Pro", "Pova 5", "Pova 5 Pro", "Pova 6", "Pova 6 Neo", "Pova 6 Pro", "Phantom X2",
    "Phantom X2 Pro", "Phantom V Fold", "Phantom V Fold2", "Phantom V Flip2"
  ],
  realme: [
    "Realme 6", "Realme 6s", "Realme 7", "Realme 7i", "Realme 7 Pro", "Realme 8", "Realme 8i",
    "Realme 8 Pro", "Realme 9", "Realme 9i", "Realme 9 Pro Plus", "Realme 10", "Realme 10 Pro",
    "Realme 10 Pro Plus", "Realme 11", "Realme 11 Pro", "Realme 11 Pro Plus", "Realme 12", "Realme 12 Plus",
    "Realme 13", "Realme 13 5G", "Realme 13 Pro Plus", "Realme 14", "Realme 14t", "Realme 14 Pro Plus",
    "Realme 15", "Realme 15 5G", "Realme 15 Pro", "Realme 15t", "GT", "GT Master", "GT 2", "GT 2 Pro",
    "GT Neo2", "GT Neo 2t", "GT 3", "GT Neo 3", "GT Neo 3t", "GT 5", "GT Neo 5", "GT Neo 5 240W",
    "GT Neo 5 SE", "GT 5 Pro", "GT 6", "GT Neo 6", "GT 6t", "GT 7", "GT 7t", "GT 7 Pro", "C2", "C3",
    "C11", "C15", "C20", "C21", "C21y", "C25", "C25s", "C25y", "C30", "C30s", "C31", "C33", "C35",
    "C51", "C53", "C55", "C61", "C63", "C71", "C75", "Narzo 30", "Narzo 30 4G", "Narzo 30 5G",
    "Narzo 30A", "Narzo 50", "Narzo 50A", "Narzo 50i", "Narzo 50i Prime", "X", "X2", "X2 Pro",
    "X3 Superzoom", "X50 5G", "X50 Pro 5G", "XT"
  ],
  huawei: [
    "P30", "P30 Lite", "P30 Lite New", "P40", "P40 Lite", "P40 Lite E", "P40 Pro", "P40 Pro Plus",
    "P50", "P50 Pro", "P60", "P60 Pro", "P Smart 2021", "Mate 30", "Mate 30 Pro", "Mate 40", "Mate 40 Pro",
    "Mate 50", "Mate 50 Pro", "Mate 60", "Mate 60 Pro", "Mate X3", "Pura 70", "Pura 70 Pro", "Pura 70 Pro Plus",
    "Pura 70 Ultra", "Pura 80", "Pura 80 Pro", "Pura 80 Pro Plus", "Pura 80 Ultra", "Nova 8", "Nova 8i",
    "Nova 9", "Nova 10", "Nova 10 Pro", "Nova 11", "Nova 11i", "Nova 12s", "Nova 13", "Nova 14", "Nova 14 Pro",
    "Nova Y61", "Nova Y63", "Nova Y70", "Nova Y72", "Nova Y90", "Nova Y91"
  ]
};