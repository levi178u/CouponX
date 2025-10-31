import { devLogin, googleLoginUrl } from './api.js';
import { setToken } from './api.js';

export function initAuth() {
  document.getElementById('dev-login').addEventListener('click', async () => {
    const email = (document.getElementById('email').value || '').trim();
    if (!email) return alert('Enter email');
    const res = await devLogin(email);
    if (res.token) {
      setToken(res.token);
      setLoggedIn();
    } else {
      alert('Login failed');
    }
  });

  document.getElementById('google-login').addEventListener('click', () => {
    window.location.href = googleLoginUrl();
  });

  const hash = window.location.hash;
  if (hash.startsWith('#token=')) {
    const token = hash.slice(7);
    history.replaceState({}, '', window.location.pathname);
    setToken(token);
    setLoggedIn();
  }
}

export function setLoggedIn() {
  document.getElementById('jwt').textContent = 'Logged in';
}




