'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { 
  getStoredToken, 
  setStoredToken, 
  removeStoredToken, 
  setStoredUser, 
  getStoredUser,
  isTokenExpired 
} from '@/lib/auth';

// Estados del contexto
const initialState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

// Tipos de acciones
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer para manejar el estado
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
}

// Crear contexto
export const AuthContext = createContext(null);

// Provider del contexto
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Verificar el estado de autenticación
  const checkAuthStatus = async () => {
    try {
      console.log('🔍 AuthContext: Verificando estado de autenticación');
      const token = getStoredToken();
      
      if (!token) {
        console.log('❌ AuthContext: No hay token almacenado');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      // Verificar si el token ha expirado
      if (isTokenExpired(token)) {
        console.log('⏰ AuthContext: Token expirado, removiendo');
        removeStoredToken();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        return;
      }

      console.log('🔍 AuthContext: Token válido, verificando con servidor');
      
      // Intentar obtener el usuario desde localStorage primero
      const storedUser = getStoredUser();
      if (storedUser) {
        console.log('✅ AuthContext: Usuario encontrado en localStorage');
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: storedUser },
        });
        
        // Verificar en background si el token sigue siendo válido
        try {
          const response = await authAPI.verifyToken();
          if (response.data?.data?.user) {
            // Actualizar usuario si hay cambios
            const serverUser = response.data.data.user;
            if (JSON.stringify(storedUser) !== JSON.stringify(serverUser)) {
              console.log('🔄 AuthContext: Actualizando usuario desde servidor');
              setStoredUser(serverUser);
              dispatch({
                type: AUTH_ACTIONS.UPDATE_USER,
                payload: serverUser,
              });
            }
          }
        } catch (error) {
          console.log('⚠️ AuthContext: Error verificando token en background, pero mantiene sesión local');
        }
        return;
      }
      
      // Si no hay usuario en localStorage, verificar con el servidor
      try {
        const response = await authAPI.verifyToken();
        
        if (response.data?.data?.user) {
          console.log('✅ AuthContext: Usuario verificado desde servidor');
          const user = response.data.data.user;
          setStoredUser(user);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user },
          });
        } else {
          console.log('❌ AuthContext: Respuesta de verificación inválida');
          removeStoredToken();
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } catch (error) {
        console.log('❌ AuthContext: Error verificando con servidor');
        removeStoredToken();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } catch (error) {
      console.error('💥 AuthContext: Error verificando autenticación:', error.message);
      removeStoredToken();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Función de login
  const login = async (credentials) => {
    try {
      console.log('🚀 AuthContext: Iniciando login con:', { email: credentials.email });
      
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      console.log('📡 AuthContext: Llamando a authAPI.login...');
      const response = await authAPI.login(credentials);
      
      console.log('📥 AuthContext: Respuesta de Axios recibida:', {
        hasResponse: !!response,
        status: response?.status,
        statusText: response?.statusText,
        hasData: !!response?.data,
        responseKeys: response ? Object.keys(response) : []
      });

      // IMPORTANTE: Axios pone la respuesta del servidor en response.data
      const serverData = response.data;
      
      console.log('🔍 AuthContext: Datos del servidor:', {
        hasServerData: !!serverData,
        serverStatus: serverData?.status,
        serverMessage: serverData?.message,
        hasDataField: !!serverData?.data,
        serverDataKeys: serverData ? Object.keys(serverData) : [],
        dataFieldKeys: serverData?.data ? Object.keys(serverData.data) : []
      });

      console.log('🔍 AuthContext: Verificando tokens:', {
        hasTokensInServerData: !!serverData?.data?.tokens,
        hasAccessTokenDirect: !!serverData?.data?.access_token,
        hasAccessTokenInTokens: !!serverData?.data?.tokens?.access_token,
        accessTokenType: typeof (serverData?.data?.access_token || serverData?.data?.tokens?.access_token),
        accessTokenLength: (serverData?.data?.access_token || serverData?.data?.tokens?.access_token)?.length || 0
      });

      // Verificar la estructura correcta: Buscar el token en ambas ubicaciones posibles
      let accessToken = null;
      let user = null;

      if (serverData?.status === 'success' && serverData?.data) {
        // Buscar token en data.access_token (formato del backend corregido)
        if (serverData.data.access_token) {
          console.log('✅ AuthContext: Token encontrado en access_token directo');
          accessToken = serverData.data.access_token;
          user = serverData.data.user;
        }
        // Buscar token en data.tokens.access_token (formato alternativo)
        else if (serverData.data.tokens?.access_token) {
          console.log('✅ AuthContext: Token encontrado en tokens.access_token');
          accessToken = serverData.data.tokens.access_token;
          user = serverData.data.user;
        }
      }

      if (accessToken && user) {
        console.log('✅ AuthContext: Token y usuario encontrados, guardando...');
        setStoredToken(accessToken);
        setStoredUser(user);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user },
        });

        console.log('🎉 AuthContext: Login exitoso completado');
        return { success: true, user };
      } else {
        console.log('❌ AuthContext: Estructura de respuesta incorrecta');
        console.log('📋 AuthContext: Estructura completa:', {
          serverData: JSON.stringify(serverData, null, 2)
        });
        throw new Error('No se recibió token de acceso válido');
      }
    } catch (error) {
      console.log('💥 AuthContext: Error en login:', {
        message: error.message,
        name: error.name,
        hasResponse: !!error.response,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
        isAxiosError: error.isAxiosError || false
      });

      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al iniciar sesión';
      
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Función de registro de organización
  const registerOrganization = async (organizationData, userData) => {
    try {
      console.log('🏢 AuthContext: Iniciando registro de organización');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.registerOrganization({
        organization: organizationData,
        user: userData,
      });

      const serverData = response.data;

      // Usar la misma lógica de búsqueda de token que en login
      let accessToken = null;
      let user = null;

      if (serverData?.status === 'success' && serverData?.data) {
        if (serverData.data.access_token) {
          accessToken = serverData.data.access_token;
          user = serverData.data.user;
        } else if (serverData.data.tokens?.access_token) {
          accessToken = serverData.data.tokens.access_token;
          user = serverData.data.user;
        }
      }

      if (accessToken && user) {
        console.log('✅ AuthContext: Registro exitoso, guardando token');
        setStoredToken(accessToken);
        setStoredUser(user);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user },
        });

        return { 
          success: true, 
          user,
          organization: serverData.data.organization 
        };
      } else {
        throw new Error('No se recibió token de acceso');
      }
    } catch (error) {
      console.log('💥 AuthContext: Error en registro:', error.message);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al registrar organización';
      
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      console.log('🚪 AuthContext: Iniciando logout');
      await authAPI.logout();
    } catch (error) {
      console.error('💥 AuthContext: Error al hacer logout:', error.message);
    } finally {
      console.log('🧹 AuthContext: Limpiando datos locales');
      removeStoredToken();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Actualizar perfil de usuario
  const updateProfile = async (profileData) => {
    try {
      console.log('✏️ AuthContext: Actualizando perfil');
      const response = await authAPI.updateProfile(profileData);
      
      const updatedUser = response.data.data.user;
      setStoredUser(updatedUser);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: updatedUser,
      });

      return { success: true, user: updatedUser };
    } catch (error) {
      console.log('💥 AuthContext: Error actualizando perfil:', error.message);
      const errorMessage = error.response?.data?.message || 
                          'Error al actualizar perfil';
      
      return { success: false, error: errorMessage };
    }
  };

  // Cambiar contraseña
  const changePassword = async (passwordData) => {
    try {
      console.log('🔐 AuthContext: Cambiando contraseña');
      const response = await authAPI.changePassword(passwordData);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.log('💥 AuthContext: Error cambiando contraseña:', error.message);
      const errorMessage = error.response?.data?.message || 
                          'Error al cambiar contraseña';
      
      return { success: false, error: errorMessage };
    }
  };

  // Recuperar contraseña
  const forgotPassword = async (email) => {
    try {
      console.log('📧 AuthContext: Enviando email de recuperación');
      const response = await authAPI.forgotPassword({ email });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.log('💥 AuthContext: Error en recuperación:', error.message);
      const errorMessage = error.response?.data?.message || 
                          'Error al enviar email de recuperación';
      
      return { success: false, error: errorMessage };
    }
  };

  // Resetear contraseña
  const resetPassword = async (token, newPassword) => {
    try {
      console.log('🔄 AuthContext: Reseteando contraseña');
      const response = await authAPI.resetPassword({ token, newPassword });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.log('💥 AuthContext: Error reseteando contraseña:', error.message);
      const errorMessage = error.response?.data?.message || 
                          'Error al resetear contraseña';
      
      return { success: false, error: errorMessage };
    }
  };

  // Limpiar errores
  const clearError = () => {
    console.log('🧹 AuthContext: Limpiando errores');
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Valor del contexto
  const value = {
    // Estado
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    
    // Funciones
    login,
    logout,
    registerOrganization,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}