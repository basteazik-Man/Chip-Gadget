import React from 'react'

export default function ServiceCard({ title }) {
  return (
    <div style={{ background: '#fff', padding: 14, borderRadius: 10, boxShadow: '0 6px 18px rgba(20,20,20,0.04)' }}>
      <div style={{ fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 8, color: '#6b7280' }}>Цена: по запросу</div>
      <div style={{ marginTop: 12 }}>
        <a href="#" style={{ display: 'inline-block', padding: '8px 12px', background: '#2563eb', color: '#fff', borderRadius: 8, textDecoration: 'none' }}>Заказать</a>
      </div>
    </div>
  )
}
