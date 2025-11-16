import React from "react";
import { SERVICES_BY_CATEGORY } from "../data/services";
import { useLocation, useNavigate } from "react-router-dom";

export default function Services() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const category = params.get("category") || null;
  const items = category && SERVICES_BY_CATEGORY[category] ? SERVICES_BY_CATEGORY[category] : SERVICES_BY_CATEGORY.default;

  return (
    <section className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">{category ? (category === 'laptops' ? 'Ноутбуки' : category === 'tv' ? 'Телевизоры' : 'Услуги') : 'Услуги'}</h1>
        <button onClick={() => navigate(-1)} className="text-sm underline">Назад</button>
      </div>

      <ul className="grid sm:grid-cols-2 gap-4">
        {items.map((s, i) => (
          <li key={i} className="p-4 bg-white shadow rounded-xl hover:shadow-lg transition text-center">
            <div className="text-lg font-semibold">{s.name}</div>
            <div className="text-sm text-gray-600 mt-2">{s.price}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
