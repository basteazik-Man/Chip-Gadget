// === BrandsGrid.jsx ===
// ИСПРАВЛЕННАЯ ВЕРСИЯ
import React from "react";
import { Link } from "react-router-dom";
import { BRANDS } from "../data/brands";

export default function BrandsGrid() {
  return (
    <div
      style={{
        background: "transparent",
        paddingTop: 120,  // 🧩 отступ равный высоте шапки
        paddingBottom: 30,
        position: "relative",
        zIndex: 1,
        pointerEvents: "auto",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginTop: 18,
          color: "#1f2937",
        }}
      >
        Выберите бренд для ремонта
      </h1>

      <div
        style={{
          maxWidth: 1100,
          margin: "18px auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 18,
          padding: "0 16px",
          position: "relative",
          zIndex: 2,
          pointerEvents: "auto",
        }}
      >
        {BRANDS.map((b) => (
          <Link
            key={b.id}
            to={`/brand/${b.id}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: 16,
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 6px 16px rgba(24,24,24,0.05)",
              textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 10px 22px rgba(24,24,24,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(24,24,24,0.05)";
            }}
          >
            {b.logo ? (
              <img
                src={b.logo}
                alt={b.title}
                style={{
                  height: 48,
                  objectFit: "contain",
                  marginBottom: 8,
                }}
              />
            ) : (
              <div style={{ height: 48, marginBottom: 8 }}>{b.title}</div>
            )}
            <div style={{ color: "#111", fontWeight: 600 }}>{b.title}</div>
          </Link>
        ))}
      </div>
      
      {/* УДАЛЕНО: Лишний тест клика который ломал синтаксис */}
    </div>
  );
}