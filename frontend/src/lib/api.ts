import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
