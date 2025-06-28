import axios from 'axios';

const api = axios.create({
  baseURL: 'http://18.228.199.115:3000/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
