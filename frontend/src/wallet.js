import { getWallet, topup } from './api.js';

export function initWallet() {
  document.getElementById('topup').addEventListener('click', async () => {
    const amount = parseInt(document.getElementById('amount').value || '0', 10);
    const data = await topup(amount);
    renderWallet(data);
  });
}

export async function refreshWallet() {
  const data = await getWallet();
  renderWallet(data);
}

function renderWallet(data) {
  const el = document.getElementById('wallet');
  el.textContent = `Balance: ${data.balance_cents || 0}¢, Hold: ${data.hold_cents || 0}¢`;
}




