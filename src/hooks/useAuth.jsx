'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns {Object} Objeto con el estado y funciones de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}

// También exportar como default para mayor compatibilidad
export default useAuth;