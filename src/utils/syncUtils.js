// === src/utils/syncUtils.js ===
// Утилиты для синхронизации данных с Cloudflare Worker

const WORKER_URL = 'https://chipgadget-sync.basteazik.workers.dev';

// Сохранить данные в Worker
export const saveToCloud = async (data) => {
  try {
    console.log('Saving to cloud:', Object.keys(data));
    
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Save successful:', result);
    return result;
  } catch (error) {
    console.error('Ошибка синхронизации с облаком:', error);
    throw error;
  }
};

// Загрузить данные из Worker
export const loadFromCloud = async () => {
  try {
    console.log('Loading from cloud...');
    
    const response = await fetch(WORKER_URL);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Load successful, data keys:', Object.keys(data));
    return data;
  } catch (error) {
    console.error('Ошибка загрузки из облака:', error);
    throw error;
  }
};

// Синхронизировать локальные данные с облаком
export const syncData = async () => {
  try {
    console.log('Starting sync...');
    
    // Загружаем данные из облака
    const cloudData = await loadFromCloud();
    console.log('Cloud data:', cloudData);
    
    // Загружаем локальные данные
    const localPrices = localStorage.getItem('chipgadget_prices');
    const localCategoryServices = localStorage.getItem('chipgadget_category_services');
    const localDelivery = localStorage.getItem('chipgadget_delivery');

    const localData = {
      prices: localPrices ? JSON.parse(localPrices) : {},
      categoryServices: localCategoryServices ? JSON.parse(localCategoryServices) : {},
      delivery: localDelivery ? JSON.parse(localDelivery) : {},
      lastSync: new Date().toISOString(),
    };

    console.log('Local data keys:', {
      prices: Object.keys(localData.prices).length,
      categoryServices: Object.keys(localData.categoryServices).length,
      delivery: Object.keys(localData.delivery).length
    });

    // Если в облаке нет данных, сохраняем локальные
    if (!cloudData.prices || Object.keys(cloudData.prices).length === 0) {
      console.log('No cloud data, uploading local data');
      await saveToCloud(localData);
      return { action: 'upload', data: localData };
    }

    // Сравниваем временные метки
    const cloudTime = cloudData.lastSync ? new Date(cloudData.lastSync) : new Date(0);
    const localTime = localData.lastSync ? new Date(localData.lastSync) : new Date(0);

    console.log('Time comparison - Local:', localTime, 'Cloud:', cloudTime);

    if (localTime > cloudTime) {
      // Локальные данные новее - заливаем в облако
      console.log('Local data is newer, uploading to cloud');
      await saveToCloud(localData);
      return { action: 'upload', data: localData };
    } else {
      // Облачные данные новее - загружаем в локальное хранилище
      console.log('Cloud data is newer, downloading to local');
      localStorage.setItem('chipgadget_prices', JSON.stringify(cloudData.prices));
      localStorage.setItem('chipgadget_category_services', JSON.stringify(cloudData.categoryServices));
      localStorage.setItem('chipgadget_delivery', JSON.stringify(cloudData.delivery));
      return { action: 'download', data: cloudData };
    }
  } catch (error) {
    console.error('Ошибка синхронизации:', error);
    throw error;
  }
};