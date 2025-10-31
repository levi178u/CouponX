import { listCoupons, createCoupon } from './api.js';
import { buyFlow } from './trades.js';

export function initCoupons() {
  document.getElementById('list').addEventListener('click', async () => {
    const platform = document.getElementById('platform').value;
    const code = document.getElementById('code').value;
    const price = parseInt(document.getElementById('price').value || '0', 10);
    const desc = document.getElementById('desc').value;
    const res = await createCoupon({ platform, code, price_cents: price, description: desc });
    if (res.status === 201) await renderCoupons();
    else alert('Failed to list coupon');
  });
}

export async function renderCoupons() {
  const data = await listCoupons();
  const root = document.getElementById('coupons');
  root.innerHTML = '';
  (data.items || []).forEach((c) => {
    const div = document.createElement('div');
    div.className = 'card';
    const btn = document.createElement('button');
    btn.textContent = 'Buy';
    btn.addEventListener('click', () => buyFlow(c.id));
    div.innerHTML = `<b>${c.platform}</b> - ${c.description || ''}<br/>Code: ${c.code}<br/>Price: ${c.price_cents}¢ <br/>`;
    div.appendChild(btn);
    root.appendChild(div);
  });
}




