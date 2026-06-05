import axios from 'axios';

// Base URL:
//   - In Docker/production: VITE_API_URL is set to "/api" at build time (nginx proxies it)
//   - In local dev:         Vite's proxy handles /api → localhost:5000 automatically
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ──────────────────────────────────
// Automatically attach the JWT token from localStorage to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ─────────────────────────────────
// If the server returns 401 (token expired/invalid), auto-logout the user
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      // Use location.replace so the back button doesn't return to a protected page
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default API;
