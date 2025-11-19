// === ModelEditor.jsx ===
// Исправлена логика ввода цены: ноль убирается при фокусе, пустое поле допускается во время ввода,
// при blur пустая строка приводится к 0 и пересчитывается finalPrice.
// Сохранён прежний набор функций: добавить/удалить/вкл-выкл/скидка.

import React from "react";
import { calculateFinalPrice, safeParseFloat } from '../../utils/priceUtils';

export default function ModelEditor({ modelKey, services, onChange }) {
  // Обновляем поле сервиса по индексу
  const handleFieldChange = (index, field, value) => {
    const updated = services.map((srv, i) =>
      i === index ? { ...srv, [field]: value } : srv
    );

    // пересчёт finalPrice для всех записей (используя числовые значения или 0)
    updated.forEach((srv) => {
      const discount = safeParseFloat(srv.discount);
      const price = safeParseFloat(srv.price);
      srv.finalPrice = calculateFinalPrice(price, discount);
    });

    onChange(updated);
  };

  const toggleActive = (index) => {
    const updated = services.map((srv, i) =>
      i === index ? { ...srv, active: !srv.active } : srv
    );
    onChange(updated);
  };

  const deleteService = (index) => {
    if (!confirm("Удалить эту услугу?")) return;
    const updated = services.filter((_, i) => i !== index);
    onChange(updated);
  };

  const addService = () => {
    const name = prompt("Название новой услуги:");
    if (!name) return;
    const updated = [
      ...services,
      { name, price: 0, discount: 0, finalPrice: 0, active: true },
    ];
    onChange(updated);
  };

  const getRowColor = (srv) => {
    if (!srv.active) return "bg-gray-100 text-gray-400";
    if (safeParseFloat(srv.discount) > 0) return "bg-green-50 text-green-800";
    return "bg-white text-gray-800";
  };

  // helpers for input events
  const handlePriceFocus = (index) => {
    const srv = services[index];
    // если в поле ровно 0, временно ставим пустую строку, чтобы пользователь мог печатать
    if (srv.price === 0 || srv.price === "0") {
      handleFieldChange(index, "price", "");
    }
  };

  const handlePriceBlur = (index) => {
    const srv = services[index];
    const value = safeParseFloat(srv.price);
    handleFieldChange(index, "price", value);
  };

  const handleDiscountBlur = (index) => {
    const srv = services[index];
    let value = safeParseFloat(srv.discount);
    // Ограничение скидки 0-100%
    value = Math.max(0, Math.min(100, value));
    handleFieldChange(index, "discount", value);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-inner p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          {modelKey.replace(/-/g, " ").toUpperCase()}
        </h3>
        <button
          onClick={addService}
          className="px-3 py-1 rounded bg-green-200 hover:bg-green-300 text-sm"
        >
          ➕ Добавить услугу
        </button>
      </div>

      <div className="grid grid-cols-6 gap-2 text-sm font-semibold text-gray-600 mb-2">
        <div>Услуга</div>
        <div>Цена</div>
        <div>Скидка %</div>
        <div>Итог</div>
        <div>Активна</div>
        <div>Удалить</div>
      </div>

      {services.map((srv, i) => (
        <div
          key={i}
          className={`grid grid-cols-6 gap-2 items-center border-b border-gray-200 py-2 rounded-md ${getRowColor(
            srv
          )}`}
        >
          {/* название услуги */}
          <div className="truncate">{srv.name}</div>

          {/* цена: показываем пустую строку если значение 0, чтобы при вводе 0 удалялось */}
          <input
            type="number"
            value={srv.price === 0 || srv.price === "0" ? "" : String(srv.price)}
            onFocus={() => handlePriceFocus(i)}
            onBlur={() => handlePriceBlur(i)}
            onChange={(e) => {
              // принимаем сырое значение (позволяем пустую строку в процессе ввода)
              const raw = e.target.value;
              // если пустая строка — передаём "" чтобы не принуждать к 0
              handleFieldChange(i, "price", raw === "" ? "" : raw);
            }}
            className="border border-gray-300 rounded-lg p-1 text-center"
          />

          {/* скидка: аналогично обрабатываем пустую строку при blur */}
          <input
            type="number"
            value={srv.discount === undefined || srv.discount === null ? "" : String(srv.discount)}
            onChange={(e) => {
              const raw = e.target.value;
              handleFieldChange(i, "discount", raw === "" ? "" : raw);
            }}
            onBlur={() => handleDiscountBlur(i)}
            className="border border-gray-300 rounded-lg p-1 text-center"
          />

          {/* итоговая цена */}
          <div className="text-center font-medium">
            {srv.finalPrice !== undefined ? srv.finalPrice : "-"}
          </div>

          {/* активность */}
          <button
            onClick={() => toggleActive(i)}
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              srv.active ? "bg-cyan-600 text-white" : "bg-gray-300 text-gray-700"
            }`}
          >
            {srv.active ? "Да" : "Нет"}
          </button>

          <button
            onClick={() => deleteService(i)}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ✖
          </button>
        </div>
      ))}
    </div>
  );
}