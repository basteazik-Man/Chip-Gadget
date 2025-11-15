// === index.js (финальный v4) ===
import * as appleModule from "./apple.js";
import * as samsungModule from "./samsung.js";
import * as xiaomiModule from "./xiaomi.js";
import * as honorModule from "./honor.js";
import * as huaweiModule from "./huawei.js";
import * as realmeModule from "./realme.js";
import * as infinixModule from "./infinix.js";
import * as tecnoModule from "./tecno.js";

function getPrices(mod) {
  return mod.prices || mod.default || {};
}

export const PRICES = {
  apple: getPrices(appleModule),
  samsung: getPrices(samsungModule),
  xiaomi: getPrices(xiaomiModule),
  honor: getPrices(honorModule),
  huawei: getPrices(huaweiModule),
  realme: getPrices(realmeModule),
  infinix: getPrices(infinixModule),
  tecno: getPrices(tecnoModule)
};

export async function initPrices() {
  return PRICES;
}
