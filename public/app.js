// =============================================
// app.js — Shared utilities & API connection
// =============================================

const API_URL = 'https://malaabi-api-production.up.railway.app/api';

// ---------- TOKEN ----------
function getToken() {
  return localStorage.getItem('token');
}

// ---------- API HELPER ----------
async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${endpoint}`, options);
  return await res.json();
}

// ---------- FIELDS ----------
async function getFields() {
  const data = await apiRequest('/fields');
  return data.data || [];
}

// ---------- BOOKINGS ----------
async function getMyBookings() {
  const data = await apiRequest('/bookings/my');
  return data.data || [];
}

async function createBooking(field_id, date, time_slot, duration) {
  return await apiRequest('/bookings', 'POST', { field_id, date, time_slot, duration });
}

async function cancelBooking(id) {
  return await apiRequest(`/bookings/cancel/${id}`, 'PUT');
}

// ---------- TOAST ----------
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast toast-${type}`;
  toast.classList.remove('hidden');}