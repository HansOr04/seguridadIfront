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
        // Buscar token en data.token (formato simple)
        else if (serverData.data.token) {
          console.log('✅ AuthContext: Token encontrado en token directo');
          accessToken = serverData.data.token;
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
        } else if (serverData.data.token) {
          accessToken = serverData.data.token;
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

        return { success: true, user };
      } else {
        throw new Error('No se recibió token de acceso válido');
      }
    } catch (error) {
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
      
      // Intentar logout en el servidor
      try {
        await authAPI.logout();
      } catch (error) {
        console.log('⚠️ AuthContext: Error en logout del servidor, continuando con logout local');
      }
      
      // Limpiar almacenamiento local
      removeStoredToken();
      
      // Actualizar estado
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      console.log('✅ AuthContext: Logout completado');
    } catch (error) {
      console.error('💥 AuthContext: Error en logout:', error);
      // Forzar logout local aunque haya error
      removeStoredToken();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      console.log('👤 AuthContext: Actualizando perfil');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await authAPI.updateProfile(profileData);
      
      if (response.data?.status === 'success' && response.data?.data?.user) {
        const updatedUser = response.data.data.user;
        
        // Actualizar usuario en localStorage
        setStoredUser(updatedUser);
        
        // Actualizar estado
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: updatedUser,
        });
        
        console.log('✅ AuthContext: Perfil actualizado exitosamente');
        return { success: true, user: updatedUser };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('💥 AuthContext: Error actualizando perfil:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al actualizar perfil';
      
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (passwordData) => {
    try {
      console.log('🔐 AuthContext: Cambiando contraseña');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await authAPI.changePassword(passwordData);
      
      if (response.data?.status === 'success') {
        console.log('✅ AuthContext: Contraseña cambiada exitosamente');
        return { success: true };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('💥 AuthContext: Error cambiando contraseña:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al cambiar contraseña';
      
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Función para refrescar token
  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken();
      
      if (response.data?.status === 'success' && response.data?.data?.token) {
        const newToken = response.data.data.token;
        setStoredToken(newToken);
        return { success: true, token: newToken };
      }
      
      return { success: false, error: 'No se pudo refrescar el token' };
    } catch (error) {
      console.error('💥 AuthContext: Error refrescando token:', error);
      return { success: false, error: error.message };
    }
  };

  // Verificar si el usuario tiene permisos específicos
  const hasPermission = (permission) => {
    if (!state.user) return false;
    
    const userRole = state.user.role;
    
    // Super admin tiene todos los permisos
    if (userRole === 'super_admin') return true;
    
    // Mapeo de permisos por rol
    const rolePermissions = {
      admin: ['create', 'read', 'update', 'delete', 'manage_users', 'manage_organization'],
      analyst: ['create', 'read', 'update', 'analyze_risks', 'generate_reports'],
      viewer: ['read', 'view_reports']
    };
    
    return rolePermissions[userRole]?.includes(permission) || false;
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Valor del contexto
  const contextValue = {
    // Estado
    ...state,
    
    // Acciones de autenticación
    login,
    logout,
    registerOrganization,
    
    // Gestión de perfil
    updateProfile,
    changePassword,
    
    // Utilidades
    clearError,
    refreshToken,
    hasPermission,
    hasRole,
    
    // Verificación de estado
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
};