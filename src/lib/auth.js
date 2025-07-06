import Cookies from 'js-cookie';

// Nombres de las cookies/localStorage
const TOKEN_KEY = 'sigrisk_token';
const USER_KEY = 'sigrisk_user';

/**
 * Obtener token almacenado
 */
export const getStoredToken = () => {
  if (typeof window === 'undefined') {
    console.log('🔍 Auth: getStoredToken llamado en servidor, retornando null');
    return null;
  }
  
  // Intentar obtener de localStorage primero
  let token = localStorage.getItem(TOKEN_KEY);
  
  // Si no está en localStorage, intentar cookies
  if (!token) {
    token = Cookies.get(TOKEN_KEY);
  }
  
  console.log('📖 Auth: Token obtenido:', {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'no encontrado',
    source: token ? (localStorage.getItem(TOKEN_KEY) ? 'localStorage' : 'cookies') : 'ninguno'
  });
  
  return token;
};

/**
 * Almacenar token
 */
export const setStoredToken = (token) => {
  if (typeof window === 'undefined') {
    console.log('⚠️ Auth: setStoredToken llamado en servidor, ignorando');
    return;
  }
  
  console.log('💾 Auth: Guardando token:', {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'token vacío'
  });
  
  // Guardar en localStorage
  localStorage.setItem(TOKEN_KEY, token);
  
  // También guardar en cookies (para mayor seguridad)
  Cookies.set(TOKEN_KEY, token, {
    expires: 7, // 7 días
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  
  // Verificar que se guardó correctamente
  const savedLS = localStorage.getItem(TOKEN_KEY);
  const savedCookie = Cookies.get(TOKEN_KEY);
  console.log('✅ Auth: Token guardado correctamente:', {
    localStorage: savedLS === token,
    cookies: savedCookie === token
  });
};

/**
 * Eliminar token almacenado
 */
export const removeStoredToken = () => {
  if (typeof window === 'undefined') {
    console.log('⚠️ Auth: removeStoredToken llamado en servidor, ignorando');
    return;
  }
  
  console.log('🗑️ Auth: Removiendo tokens y datos de usuario');
  
  // Eliminar de localStorage
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  
  // Eliminar de cookies
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
  
  // Verificar que se removieron
  const remainingLS = localStorage.getItem(TOKEN_KEY);
  const remainingCookie = Cookies.get(TOKEN_KEY);
  console.log('✅ Auth: Datos removidos correctamente:', {
    localStorage: !remainingLS,
    cookies: !remainingCookie
  });
};

/**
 * Obtener usuario almacenado
 */
export const getStoredUser = () => {
  if (typeof window === 'undefined') {
    console.log('🔍 Auth: getStoredUser llamado en servidor, retornando null');
    return null;
  }
  
  try {
    const userString = localStorage.getItem(USER_KEY);
    if (!userString) {
      console.log('📖 Auth: No hay usuario en localStorage');
      return null;
    }
    
    const user = JSON.parse(userString);
    console.log('📖 Auth: Usuario obtenido de localStorage:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role
    });
    
    return user;
  } catch (error) {
    console.error('💥 Auth: Error parsing stored user:', error);
    // Limpiar datos corruptos
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

/**
 * Almacenar información del usuario
 */
export const setStoredUser = (user) => {
  if (typeof window === 'undefined') {
    console.log('⚠️ Auth: setStoredUser llamado en servidor, ignorando');
    return;
  }
  
  try {
    console.log('💾 Auth: Guardando usuario:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role
    });
    
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log('✅ Auth: Usuario guardado en localStorage');
  } catch (error) {
    console.error('💥 Auth: Error storing user:', error);
  }
};

/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = () => {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!token && !!user && !isTokenExpired(token);
};

/**
 * Verificar si el token ha expirado
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decodificar el JWT (solo el payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    const isExpired = payload.exp < currentTime;
    console.log('⏰ Auth: Verificación de expiración:', {
      currentTime,
      tokenExp: payload.exp,
      isExpired,
      minutesRemaining: isExpired ? 0 : Math.round((payload.exp - currentTime) / 60)
    });
    
    return isExpired;
  } catch (error) {
    console.error('💥 Auth: Error checking token expiration:', error);
    return true;
  }
};

/**
 * Obtener información del token
 */
export const getTokenInfo = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch (error) {
    console.error('💥 Auth: Error parsing token:', error);
    return null;
  }
};

/**
 * Verificar permisos del usuario
 */
export const hasPermission = (user, requiredRole) => {
  if (!user || !user.role) return false;
  
  const roles = ['viewer', 'analyst', 'admin', 'super_admin'];
  const userRoleIndex = roles.indexOf(user.role);
  const requiredRoleIndex = roles.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
};

/**
 * Verificar si el usuario puede acceder a un recurso
 */
export const canAccessResource = (user, resourceOwnerId) => {
  if (!user) return false;
  
  // Super admin puede acceder a todo
  if (user.role === 'super_admin') return true;
  
  // Admin puede acceder a recursos de su organización
  if (user.role === 'admin') return true;
  
  // Otros usuarios solo pueden acceder a sus propios recursos
  return user.id === resourceOwnerId;
};

/**
 * Formatear el nombre completo del usuario
 */
export const getFullName = (user) => {
  if (!user || !user.profile) return 'Usuario';
  
  const { firstName, lastName } = user.profile;
  return `${firstName} ${lastName}`.trim() || user.email;
};

/**
 * Obtener las iniciales del usuario
 */
export const getUserInitials = (user) => {
  if (!user || !user.profile) return 'U';
  
  const { firstName, lastName } = user.profile;
  const firstInitial = firstName?.charAt(0).toUpperCase() || '';
  const lastInitial = lastName?.charAt(0).toUpperCase() || '';
  
  return `${firstInitial}${lastInitial}` || user.email?.charAt(0).toUpperCase() || 'U';
};

/**
 * Obtener el color del badge según el rol
 */
export const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'super_admin':
      return 'bg-purple-100 text-purple-800';
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'analyst':
      return 'bg-blue-100 text-blue-800';
    case 'viewer':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Obtener el texto del rol en español
 */
export const getRoleText = (role) => {
  switch (role) {
    case 'super_admin':
      return 'Super Administrador';
    case 'admin':
      return 'Administrador';
    case 'analyst':
      return 'Analista';
    case 'viewer':
      return 'Visualizador';
    default:
      return 'Sin rol';
  }
};

/**
 * Validar formato de email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar fortaleza de contraseña
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Debe contener al menos un carácter especial (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generar URL de avatar por defecto
 */
export const getDefaultAvatarUrl = (user) => {
  const initials = getUserInitials(user);
  return `https://ui-avatars.com/api/?name=${initials}&background=3b82f6&color=fff&size=40`;
};