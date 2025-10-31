import { createTrade, confirmTrade } from './api.js';
import { refreshWallet } from './wallet.js';
import { renderCoupons } from './coupons.js';

export async function buyFlow(couponId) {
  const trade = await createTrade(couponId);
  if (trade.status !== 201) {
    return alert(trade.data?.error || 'Trade failed');
  }
  const conf = await confirmTrade(trade.data.id);
  if (conf.status === 200) {
    alert('Purchased!');
    await refreshWallet();
    await renderCoupons();
  } else {
    alert('Confirm failed');
  }
}




