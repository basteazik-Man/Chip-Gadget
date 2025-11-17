import React from 'react';
import { useDelivery } from '../data/deliveryData';

const DeliveryPage = () => {
  const deliveryData = useDelivery();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Красивое изображение на всю ширину */}
          <div className="h-64 bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">🚚 {deliveryData.title}</h1>
              <p className="text-xl">{deliveryData.description}</p>
            </div>
          </div>
          
          <div className="p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Бесплатная доставка в следующие населенные пункты:
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">
                    🏙️ Городская зона
                  </h3>
                  <ul className="space-y-2 text-green-700">
                    {deliveryData.cityLocations.map((location, index) => (
                      <li key={index}>• {location}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">
                    🏡 Пригородная зона
                  </h3>
                  <ul className="space-y-2 text-blue-700">
                    {deliveryData.suburbLocations.map((location, index) => (
                      <li key={index}>• {location}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  💡 Что входит в услугу:
                </h3>
                <ul className="text-yellow-700 space-y-2">
                  {deliveryData.services.map((service, index) => (
                    <li key={index}>• {service}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-100 p-6 rounded-lg">
                <p className="text-gray-700 text-lg">
                  {deliveryData.note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;