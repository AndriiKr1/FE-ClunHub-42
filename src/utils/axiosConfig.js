import axios from 'axios';

// Request interceptor - add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
   
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  response => response,
  error => {
    // Only redirect to login if we have a token and get 401
    // Don't redirect when we're already on login/registration/forgot-password pages
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      const currentPath = window.location.pathname;
      if (!['/login', '/register', '/forgot-password', '/'].includes(currentPath)) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;