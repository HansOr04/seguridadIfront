// src/hooks/useApi.js

import { useState, useCallback, useRef, useEffect } from 'react';
import api, { authAPI, usersAPI, healthAPI, makeRequest } from '@/lib/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para gestión centralizada de llamadas API
 * Proporciona manejo de estado, cache, retry automático y notificaciones
 */
export const useApi = () => {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  
  // Cache simple para requests
  const cache = useRef(new Map());
  const abortControllers = useRef(new Map());

  // Limpiar controllers al desmontar
  useEffect(() => {
    return () => {
      abortControllers.current.forEach(controller => controller.abort());
      abortControllers.current.clear();
    };
  }, []);

  // Función genérica para hacer requests con manejo de estado
  const request = useCallback(async (
    requestFn, 
    options = {}
  ) => {
    const {
      onSuccess,
      onError,
      showLoading = true,
      showSuccessToast = false,
      showErrorToast = true,
      successMessage = 'Operación exitosa',
      errorMessage = null,
      useCache = false,
      cacheKey = null,
      retryAttempts = 0,
      timeout = 30000
    } = options;

    // Generar clave única para la request
    const requestKey = cacheKey || `request_${Date.now()}_${Math.random()}`;

    try {
      if (showLoading) {
        setGlobalLoading(true);
      }
      setGlobalError(null);

      // Verificar cache si está habilitado
      if (useCache && cacheKey && cache.current.has(cacheKey)) {
        console.log(`📦 useApi: Usando cache para ${cacheKey}`);
        const cachedData = cache.current.get(cacheKey);
        if (onSuccess) onSuccess(cachedData);
        return { success: true, data: cachedData };
      }

      // Crear AbortController para la request
      const controller = new AbortController();
      abortControllers.current.set(requestKey, controller);

      console.log(`🚀 useApi: Ejecutando request ${requestKey}`);

      // Ejecutar la request con retry automático
      let lastError;
      for (let attempt = 0; attempt <= retryAttempts; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`🔄 useApi: Reintento ${attempt}/${retryAttempts} para ${requestKey}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Backoff exponencial
          }

          const response = await requestFn({ 
            signal: controller.signal,
            timeout: timeout - (attempt * 5000) // Reducir timeout en cada intento
          });

          console.log(`✅ useApi: Request exitosa ${requestKey}:`, {
            status: response?.status,
            hasData: !!response?.data
          });

          const result = response?.data || response;

          // Guardar en cache si está habilitado
          if (useCache && cacheKey && result) {
            cache.current.set(cacheKey, result);
            // Limpiar cache después de 5 minutos
            setTimeout(() => {
              cache.current.delete(cacheKey);
            }, 5 * 60 * 1000);
          }

          // Mostrar notificación de éxito
          if (showSuccessToast) {
            toast.success(successMessage);
          }

          // Ejecutar callback de éxito
          if (onSuccess) {
            onSuccess(result);
          }

          return { success: true, data: result };

        } catch (error) {
          lastError = error;
          if (error.name === 'AbortError') {
            console.log(`⚠️ useApi: Request cancelada ${requestKey}`);
            throw error;
          }
          if (attempt === retryAttempts) {
            throw error;
          }
        }
      }

    } catch (error) {
      console.error(`💥 useApi: Error en request ${requestKey}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      const finalError = {
        message: error.message || 'Error desconocido',
        status: error.response?.status,
        data: error.response?.data,
        originalError: error
      };

      setGlobalError(finalError);

      // Mostrar notificación de error
      if (showErrorToast && error.name !== 'AbortError') {
        const message = errorMessage || 
                        error.response?.data?.message || 
                        error.message ||
                        'Ha ocurrido un error inesperado';
        toast.error(message);
      }

      // Ejecutar callback de error
      if (onError) {
        onError(finalError);
      }

      return { success: false, error: finalError };

    } finally {
      if (showLoading) {
        setGlobalLoading(false);
      }
      abortControllers.current.delete(requestKey);
    }
  }, []);

  // Cancelar request específica
  const cancelRequest = useCallback((requestKey) => {
    const controller = abortControllers.current.get(requestKey);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(requestKey);
      console.log(`🚫 useApi: Request cancelada ${requestKey}`);
    }
  }, []);

  // Cancelar todas las requests activas
  const cancelAllRequests = useCallback(() => {
    abortControllers.current.forEach((controller, key) => {
      controller.abort();
      console.log(`🚫 useApi: Request cancelada ${key}`);
    });
    abortControllers.current.clear();
    setGlobalLoading(false);
  }, []);

  // Limpiar cache
  const clearCache = useCallback((cacheKey = null) => {
    if (cacheKey) {
      cache.current.delete(cacheKey);
      console.log(`🧹 useApi: Cache limpiado para ${cacheKey}`);
    } else {
      cache.current.clear();
      console.log('🧹 useApi: Todo el cache limpiado');
    }
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => {
    setGlobalError(null);
  }, []);

  // ===== MÉTODOS ESPECÍFICOS PARA DIFERENTES ENTIDADES =====

  // Activos
  const assets = {
    getAll: useCallback((params = {}) => {
      return request(
        ({ signal }) => makeRequest('GET', '/assets', null, { 
          params, 
          signal 
        }),
        {
          cacheKey: `assets_${JSON.stringify(params)}`,
          useCache: true,
          successMessage: 'Activos cargados exitosamente'
        }
      );
    }, [request]),

    getById: useCallback((id) => {
      return request(
        ({ signal }) => makeRequest('GET', `/assets/${id}`, null, { signal }),
        {
          cacheKey: `asset_${id}`,
          useCache: true,
          errorMessage: 'Error al obtener activo'
        }
      );
    }, [request]),

    create: useCallback((data) => {
      return request(
        ({ signal }) => makeRequest('POST', '/assets', data, { signal }),
        {
          showSuccessToast: true,
          successMessage: 'Activo creado exitosamente',
          onSuccess: () => clearCache() // Limpiar cache de listas
        }
      );
    }, [request, clearCache]),

    update: useCallback((id, data) => {
      return request(
        ({ signal }) => makeRequest('PUT', `/assets/${id}`, data, { signal }),
        {
          showSuccessToast: true,
          successMessage: 'Activo actualizado exitosamente',
          onSuccess: () => {
            clearCache(`asset_${id}`);
            clearCache(); // Limpiar listas
          }
        }
      );
    }, [request, clearCache]),

    delete: useCallback((id) => {
      return request(
        ({ signal }) => makeRequest('DELETE', `/assets/${id}`, null, { signal }),
        {
          showSuccessToast: true,
          successMessage: 'Activo eliminado exitosamente',
          onSuccess: () => clearCache() // Limpiar todo el cache
        }
      );
    }, [request, clearCache]),

    valuate: useCallback((id, valuation) => {
      return request(
        ({ signal }) => makeRequest('POST', `/assets/${id}/valuate`, valuation, { signal }),
        {
          showSuccessToast: true,
          successMessage: 'Valoración guardada exitosamente',
          onSuccess: () => clearCache(`asset_${id}`)
        }
      );
    }, [request, clearCache])
  };

  // Amenazas
  const threats = {
    getAll: useCallback((params = {}) => {
      return request(
        ({ signal }) => makeRequest('GET', '/threats', null, { 
          params, 
          signal 
        }),
        {
          cacheKey: `threats_${JSON.stringify(params)}`,
          useCache: true
        }
      );
    }, [request]),

    getByAsset: useCallback((assetId) => {
      return request(
        ({ signal }) => makeRequest('GET', `/threats/by-asset/${assetId}`, null, { signal }),
        {
          cacheKey: `threats_asset_${assetId}`,
          useCache: true
        }
      );
    }, [request]),

    create: useCallback((data) => {
      return request(
        ({ signal }) => makeRequest('POST', '/threats', data, { signal }),
        {
          showSuccessToast: true,
          successMessage: 'Amenaza creada exitosamente',
          onSuccess: () => clearCache()
        }
      );
    }, [request, clearCache])
  };

  // Vulnerabilidades
  const vulnerabilities = {
    getAll: useCallback((params = {}) => {
      return request(
        ({ signal }) => makeRequest('GET', '/vulnerabilities', null, { 
          params, 
          signal 
        }),
        {
          cacheKey: `vulnerabilities_${JSON.stringify(params)}`,
          useCache: true
        }
      );
    }, [request]),

    getByAsset: useCallback((assetId) => {
      return request(
        ({ signal }) => makeRequest('GET', `/vulnerabilities/by-asset/${assetId}`, null, { signal }),
        {
          cacheKey: `vulnerabilities_asset_${assetId}`,
          useCache: true
        }
      );
    }, [request]),

    create: useCallback((data) => {
      return request(
        ({ signal }) => makeRequest('POST', '/vulnerabilities', data, { signal }),
        {
          showSuccessToast: true,
          successMessage: 'Vulnerabilidad creada exitosamente',
          onSuccess: () => clearCache()
        }
      );
    }, [request, clearCache])
  };

  // Riesgos
  const risks = {
    getAll: useCallback((params = {}) => {
      return request(
        ({ signal }) => makeRequest('GET', '/risks', null, { 
          params, 
          signal 
        }),
        {
          cacheKey: `risks_${JSON.stringify(params)}`,
          useCache: true
        }
      );
    }, [request]),

    calculate: useCallback((data) => {
      return request(
        ({ signal }) => makeRequest('POST', '/risks/calculate', data, { signal }),
        {
          showSuccessToast: true,
          successMessage: 'Riesgo calculado exitosamente',
          retryAttempts: 1
        }
      );
    }, [request]),

    save: useCallback((data) => {
      return request(
        ({ signal }) => makeRequest('POST', '/risks', data, { signal }),
        {
          showSuccessToast: true,
          successMessage: 'Riesgo guardado exitosamente',
          onSuccess: () => clearCache()
        }
      );
    }, [request, clearCache]),

    getDashboard: useCallback(() => {
      return request(
        ({ signal }) => makeRequest('GET', '/risks/dashboard', null, { signal }),
        {
          cacheKey: 'risks_dashboard',
          useCache: true
        }
      );
    }, [request]),

    getMatrix: useCallback(() => {
      return request(
        ({ signal }) => makeRequest('GET', '/risks/matrix', null, { signal }),
        {
          cacheKey: 'risks_matrix',
          useCache: true
        }
      );
    }, [request]),

    scenarios: useCallback((data) => {
      return request(
        ({ signal }) => makeRequest('POST', '/risks/scenarios', data, { signal }),
        {
          showSuccessToast: true,
          successMessage: 'Análisis de escenarios completado'
        }
      );
    }, [request]),

    monteCarlo: useCallback((id, params) => {
      return request(
        ({ signal }) => makeRequest('POST', `/risks/${id}/monte-carlo`, params, { signal }),
        {
          showSuccessToast: true,
          successMessage: 'Simulación Monte Carlo completada',
          timeout: 60000 // 1 minuto para simulaciones largas
        }
      );
    }, [request]),

    valueAtRisk: useCallback((params = {}) => {
      return request(
        ({ signal }) => makeRequest('GET', '/risks/value-at-risk', null, { 
          params, 
          signal 
        }),
        {
          cacheKey: `var_${JSON.stringify(params)}`,
          useCache: true
        }
      );
    }, [request])
  };

  // CVE
  const cve = {
    getAll: useCallback((params = {}) => {
      return request(
        ({ signal }) => makeRequest('GET', '/cve', null, { 
          params, 
          signal 
        }),
        {
          cacheKey: `cve_${JSON.stringify(params)}`,
          useCache: true
        }
      );
    }, [request]),

    getDashboard: useCallback(() => {
      return request(
        ({ signal }) => makeRequest('GET', '/cve/dashboard', null, { signal }),
        {
          cacheKey: 'cve_dashboard',
          useCache: true
        }
      );
    }, [request]),

    sync: useCallback((params = {}) => {
      return request(
        ({ signal }) => makeRequest('POST', '/cve/sync', params, { signal }),
        {
          showSuccessToast: true,
          successMessage: 'Sincronización CVE iniciada',
          timeout: 120000, // 2 minutos para sync
          onSuccess: () => clearCache() // Limpiar cache después del sync
        }
      );
    }, [request, clearCache]),

    correlate: useCallback((data) => {
      return request(
        ({ signal }) => makeRequest('POST', '/cve/correlate', data, { signal }),
        {
          showSuccessToast: true,
          successMessage: 'Correlación CVE completada'
        }
      );
    }, [request])
  };

  // Health check
  const health = {
    check: useCallback(() => {
      return request(
        ({ signal }) => healthAPI.check({ signal }),
        {
          showErrorToast: false,
          errorMessage: 'Servidor no disponible'
        }
      );
    }, [request])
  };

  return {
    // Estado global
    loading: globalLoading,
    error: globalError,
    isAuthenticated,
    user,

    // Funciones principales
    request,
    cancelRequest,
    cancelAllRequests,
    clearCache,
    clearError,

    // APIs específicas
    assets,
    threats,
    vulnerabilities,
    risks,
    cve,
    health,

    // APIs base (para uso directo)
    authAPI,
    usersAPI,
    makeRequest,
    api
  };
};

export default useApi;