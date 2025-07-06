import axios from 'axios';
import { getStoredToken, removeStoredToken } from './auth';

// Configuración base de Axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('🔧 API: Configuración inicial:', {
  baseURL: API_BASE_URL,
  nodeEnv: process.env.NODE_ENV,
  nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL
});

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para cookies de refresh token
});

// Interceptor para agregar token a las requests
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'no token'
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log('❌ API Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      hasData: !!response.data,
      dataStatus: response.data?.status,
      dataMessage: response.data?.message
    });
    return response;
  },
  (error) => {
    console.log('💥 API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      responseData: error.response?.data
    });

    // Si el token es inválido o expiró
    if (error.response?.status === 401) {
      console.log('🔒 API: Token inválido, removiendo y redirigiendo');
      removeStoredToken();
      // Redirigir al login solo si no estamos ya en páginas públicas
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }

    // Mejorar el mensaje de error
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    } else if (!error.response) {
      error.message = 'Error de conexión. Verifica tu conexión a internet.';
    }

    return Promise.reject(error);
  }
);

// Funciones de API para autenticación
export const authAPI = {
  // Login
  login: async (credentials) => {
    console.log('🔑 authAPI.login: Iniciando request');
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('✅ authAPI.login: Response exitosa:', {
        status: response.status,
        hasData: !!response.data,
        dataStatus: response.data?.status
      });
      return response;
    } catch (error) {
      console.log('❌ authAPI.login: Error:', error.message);
      throw error;
    }
  },

  // Registro de organización
  registerOrganization: async (data) => {
    console.log('🏢 authAPI.registerOrganization: Iniciando request');
    try {
      const response = await api.post('/auth/register-organization', data);
      console.log('✅ authAPI.registerOrganization: Response exitosa');
      return response;
    } catch (error) {
      console.log('❌ authAPI.registerOrganization: Error:', error.message);
      throw error;
    }
  },

  // Logout
  logout: () => {
    console.log('🚪 authAPI.logout: Iniciando request');
    return api.post('/auth/logout');
  },

  // Obtener perfil
  getProfile: () => {
    console.log('👤 authAPI.getProfile: Iniciando request');
    return api.get('/auth/me');
  },

  // Verificar token
  verifyToken: async () => {
    console.log('🔍 authAPI.verifyToken: Iniciando request');
    try {
      const response = await api.post('/auth/verify-token');
      console.log('✅ authAPI.verifyToken: Token válido');
      return response;
    } catch (error) {
      console.log('❌ authAPI.verifyToken: Token inválido:', error.message);
      throw error;
    }
  },

  // Cambiar contraseña
  changePassword: (data) => {
    console.log('🔐 authAPI.changePassword: Iniciando request');
    return api.post('/auth/change-password', data);
  },

  // Recuperar contraseña
  forgotPassword: (data) => {
    console.log('📧 authAPI.forgotPassword: Iniciando request');
    return api.post('/auth/forgot-password', data);
  },

  // Resetear contraseña
  resetPassword: (data) => {
    console.log('🔄 authAPI.resetPassword: Iniciando request');
    return api.post('/auth/reset-password', data);
  },

  // Actualizar perfil
  updateProfile: (data) => {
    console.log('✏️ authAPI.updateProfile: Iniciando request');
    return api.put('/users/profile', data);
  },
};

// Funciones de API para usuarios
export const usersAPI = {
  // Obtener usuarios
  getUsers: (params = {}) => {
    console.log('👥 usersAPI.getUsers: Iniciando request con params:', params);
    return api.get('/users', { params });
  },

  // Obtener usuario por ID
  getUserById: (id) => {
    console.log(`👤 usersAPI.getUserById: Obteniendo usuario ${id}`);
    return api.get(`/users/${id}`);
  },

  // Crear usuario
  createUser: (data) => {
    console.log('➕ usersAPI.createUser: Creando usuario');
    return api.post('/users', data);
  },

  // Actualizar usuario
  updateUser: (id, data) => {
    console.log(`✏️ usersAPI.updateUser: Actualizando usuario ${id}`);
    return api.put(`/users/${id}`, data);
  },

  // Eliminar usuario
  deleteUser: (id) => {
    console.log(`🗑️ usersAPI.deleteUser: Eliminando usuario ${id}`);
    return api.delete(`/users/${id}`);
  },

  // Activar/desactivar usuario
  toggleUserStatus: (id) => {
    console.log(`🔄 usersAPI.toggleUserStatus: Cambiando status usuario ${id}`);
    return api.patch(`/users/${id}/toggle-status`);
  },

  // Obtener estadísticas de usuarios
  getUserStats: () => {
    console.log('📊 usersAPI.getUserStats: Obteniendo estadísticas');
    return api.get('/users/stats');
  },
};

// Función de health check
export const healthAPI = {
  check: () => {
    console.log('🏥 healthAPI.check: Verificando salud del servidor');
    return api.get('/health');
  },
};

// Función genérica para hacer requests
export const makeRequest = async (method, url, data = null, config = {}) => {
  try {
    console.log(`🔧 makeRequest: ${method.toUpperCase()} ${url}`);
    const response = await api({
      method,
      url,
      data,
      ...config,
    });
    return response;
  } catch (error) {
    console.log(`❌ makeRequest Error: ${method.toUpperCase()} ${url}:`, error.message);
    throw error;
  }
};

export default api;