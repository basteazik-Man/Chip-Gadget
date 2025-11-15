// === ModelList.jsx ===
// Отображает список моделей выбранного бренда (с сериями Samsung)

import React, { useState } from "react";
import { MODELS } from "../data/models";
import { Link, useParams } from "react-router-dom";

export default function ModelList() {
  const { brand } = useParams();
  const brandData = MODELS[brand];
  const [series, setSeries] = useState(
    brandData && typeof brandData === "object" && !Array.isArray(brandData)
      ? Object.keys(brandData)[0]
      : null
  );

  if (!brandData)
    return <div style={{ padding: 20 }}>Бренд не найден</div>;

  // Samsung (серии)
  if (typeof brandData === "object" && !Array.isArray(brandData)) {
    const seriesKeys = Object.keys(brandData);
    return (
      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {seriesKeys.map((s) => (
            <button
              key={s}
              onClick={() => setSeries(s)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: series === s ? "#2563eb" : "#fff",
                color: series === s ? "#fff" : "#111",
                cursor: "pointer",
              }}
            >
              Серия {s}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16,
          }}
        >
          {(brandData[series] || []).map((m) => (
            <Link
              key={m.id}
              to={`/brand/${brand}/model/${encodeURIComponent(m.id)}`}
              style={{
                textDecoration: "none",
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
                padding: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "0.2s",
              }}
            >
              <img
                src={m.image}
                alt={m.name}
                style={{
                  height: 64,
                  width: "auto",
                  objectFit: "contain",
                  marginBottom: 8,
                }}
              />
              <div style={{ fontWeight: 600, color: "#1f2937" }}>
                {m.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Остальные бренды
  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
        }}
      >
        {brandData.map((m) => (
          <Link
            key={m.id}
            to={`/brand/${brand}/model/${encodeURIComponent(m.id)}`}
            style={{
              textDecoration: "none",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={m.image}
              alt={m.name}
              style={{
                height: 64,
                width: "auto",
                objectFit: "contain",
                marginBottom: 8,
              }}
            />
            <div style={{ fontWeight: 600, color: "#1f2937" }}>
              {m.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
