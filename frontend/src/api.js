import { API_BASE } from './config.js';

let authToken = '';

export function setToken(token) {
  authToken = token || '';
}

function headers(json = true) {
  const h = {};
  if (json) h['Content-Type'] = 'application/json';
  if (authToken) h['Authorization'] = `Bearer ${authToken}`;
  return h;
}

export async function devLogin(email) {
  const res = await fetch(`${API_BASE}/auth/dev-login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email })
  });
  return res.json();
}

export function googleLoginUrl() {
  return `${API_BASE}/auth/google`;
}

export async function getWallet() {
  const res = await fetch(`${API_BASE}/wallet/me`, { headers: headers(false) });
  return res.json();
}

export async function topup(amount_cents) {
  const res = await fetch(`${API_BASE}/wallet/topup`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ amount_cents })
  });
  return res.json();
}

export async function listCoupons(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/coupons${qs ? `?${qs}` : ''}`);
  return res.json();
}

export async function createCoupon(payload) {
  const res = await fetch(`${API_BASE}/coupons`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload)
  });
  return { status: res.status, data: await res.json() };
}

export async function createTrade(coupon_id) {
  const res = await fetch(`${API_BASE}/trades`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ coupon_id })
  });
  return { status: res.status, data: await res.json() };
}

export async function confirmTrade(id) {
  const res = await fetch(`${API_BASE}/trades/${id}/confirm`, {
    method: 'POST',
    headers: headers(false)
  });
  return { status: res.status, data: await res.json() };
}




