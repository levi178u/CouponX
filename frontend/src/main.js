import { initAuth, setLoggedIn } from './auth.js';
import { initWallet, refreshWallet } from './wallet.js';
import { initCoupons, renderCoupons } from './coupons.js';

function init() {
  initAuth();
  initWallet();
  initCoupons();
  renderCoupons();

  if (document.getElementById('jwt').textContent === 'Logged in') {
    setLoggedIn();
    refreshWallet();
  }
}

window.addEventListener('load', init);




