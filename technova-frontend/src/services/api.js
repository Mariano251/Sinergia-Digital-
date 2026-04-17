import axios from 'axios';

// Instancia de axios con la URL base del backend
const api = axios.create({
  baseURL: '/api',  // Usa el proxy de Vite en desarrollo
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de request: agrega el token JWT si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('technova_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: manejo global de errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado → limpiar sesión
      localStorage.removeItem('technova_token');
      localStorage.removeItem('technova_user');
    }
    return Promise.reject(error);
  }
);

export default api;
