import React from 'react';

const ModelGrid = ({ models }) => {
  if (!models || models.length === 0) {
    return <div className="no-results">Модели не найдены</div>;
  }

  return (
    <div className="model-grid">
      {models.map((model, index) => (
        <div key={index} className="model-card">
          <h3>{model.brand}</h3>
          <p>{model.model}</p>
          <div className="model-details">
            <span>Бренд: {model.brandKey}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModelGrid;