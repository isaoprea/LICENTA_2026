import axios from 'axios';

// Adăugăm un "interceptor" care pune token-ul în Header automat
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});