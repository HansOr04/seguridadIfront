import { useState, useEffect, useCallback, useContext } from 'react';
import { useApi } from './useApi';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useCVE = () => {
  const [cves, setCVEs] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState({
    syncing: false,
    lastSync: null,
    imported: 0,
    updated: 0,
    errors: 0,
    progress: 0
  });
  const [filters, setFilters] = useState({
    severity: null,
    scoreMin: null,
    scoreMax: null,
    dateFrom: null,
    dateTo: null,
    hasExploit: null,
    remediationStatus: null,
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0
  });

  // Usar el hook useApi correctamente
  const apiHook = useApi();
  const { cve: cveAPI, loading: globalLoading, error: globalError, makeRequest } = apiHook;
  const { user } = useContext(AuthContext);

  /**
   * Obtener dashboard de CVE
   */
  const fetchDashboard = useCallback(async () => {
    try {
      const result = await cveAPI.getDashboard();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching CVE dashboard:', err);
    }
  }, [cveAPI]);

  /**
   * Obtener lista de CVEs con filtros
   */
  const fetchCVEs = useCallback(async (queryFilters = {}, paginationOptions = {}) => {
    try {
      const params = {
        page: paginationOptions.page || pagination.page,
        limit: paginationOptions.limit || pagination.limit,
        ...filters,
        ...queryFilters
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === 'null' || params[key] === 'undefined') {
          delete params[key];
        }
      });

      const result = await cveAPI.getAll(params);
      
      if (result.success) {
        setCVEs(result.data.cves || []);
        setPagination(result.data.pagination || pagination);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching CVEs:', err);
    }
  }, [cveAPI, filters, pagination]);

  /**
   * Obtener CVE específico por ID
   */
  const fetchCVEById = useCallback(async (cveId) => {
    try {
      const response = await makeRequest('GET', `/cve/${cveId}`);
      return response?.data?.cve;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [makeRequest]);

  /**
   * Sincronizar CVEs desde NVD
   */
  const triggerSync = useCallback(async (options = {}) => {
    setSyncStatus(prev => ({ ...prev, syncing: true, progress: 0 }));
    setError(null);

    try {
      const result = await cveAPI.sync(options);
      
      if (result.success) {
        toast.success('Sincronización de CVEs iniciada');
        
        // Simular progreso (en una implementación real, esto vendría del WebSocket o polling)
        const progressInterval = setInterval(() => {
          setSyncStatus(prev => {
            if (prev.progress >= 100) {
              clearInterval(progressInterval);
              return { 
                ...prev, 
                syncing: false, 
                progress: 100,
                lastSync: new Date().toISOString()
              };
            }
            return { ...prev, progress: prev.progress + 10 };
          });
        }, 1000);
      }

      return result;
    } catch (err) {
      setError(err.message);
      toast.error(`Error sincronizando CVEs: ${err.message}`);
      setSyncStatus(prev => ({ ...prev, syncing: false }));
      throw err;
    }
  }, [cveAPI]);

  /**
   * Correlacionar CVEs con activos
   */
  const correlateCVEs = useCallback(async (cveIds, forceRecorrelation = false) => {
    try {
      const result = await cveAPI.correlate({ 
        cveIds, 
        forceRecorrelation 
      });
      
      if (result.success) {
        toast.success(`${result.data.correlated} CVEs correlacionados exitosamente`);
        
        // Refrescar lista de CVEs
        await fetchCVEs();
        
        return result.data;
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Error correlacionando CVEs: ${err.message}`);
      throw err;
    }
  }, [cveAPI, fetchCVEs]);

  /**
   * Actualizar estado de remediación de CVE
   */
  const updateRemediationStatus = useCallback(async (cveId, updateData) => {
    try {
      const response = await makeRequest('PUT', `/cve/${cveId}/remediation`, updateData);
      
      if (response?.data) {
        toast.success('Estado de remediación actualizado');
        
        // Actualizar lista local
        setCVEs(prev => prev.map(cve => 
          cve.cveId === cveId 
            ? { ...cve, organizationalImpact: response.data.organizationalImpact }
            : cve
        ));
        
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Error actualizando estado: ${err.message}`);
      throw err;
    }
  }, [makeRequest]);

  /**
   * Buscar CVEs por productos
   */
  const searchByProducts = useCallback(async (vendor, product, version) => {
    try {
      const params = new URLSearchParams();
      if (vendor) params.append('vendor', vendor);
      if (product) params.append('product', product);
      if (version) params.append('version', version);

      const response = await makeRequest('GET', `/cve/search-products?${params.toString()}`);
      return response?.data?.cves || [];
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [makeRequest]);

  /**
   * Obtener alertas de CVE
   */
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await makeRequest('GET', '/cve/alerts');
      return response?.data?.alerts || [];
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [makeRequest]);

  /**
   * Obtener estadísticas de CVE
   */
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await makeRequest('GET', '/cve/statistics');
      return response?.data?.statistics || {};
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [makeRequest]);

  /**
   * Verificar estado de la API NVD
   */
  const checkNVDStatus = useCallback(async () => {
    try {
      const response = await makeRequest('GET', '/cve/nvd-status');
      return response?.data?.nvdApi || { status: 'unknown' };
    } catch (err) {
      console.warn('Error checking NVD status:', err);
      return { status: 'offline', error: err.message };
    }
  }, [makeRequest]);

  /**
   * Exportar CVEs
   */
  const exportCVEs = useCallback(async (format = 'csv', exportFilters = {}) => {
    try {
      const params = new URLSearchParams({
        format,
        ...filters,
        ...exportFilters
      });

      // Limpiar parámetros vacíos
      for (const [key, value] of params.entries()) {
        if (!value || value === 'null' || value === 'undefined') {
          params.delete(key);
        }
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cve/export?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error exportando CVEs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cves_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('CVEs exportados exitosamente');
    } catch (err) {
      setError(err.message);
      toast.error(`Error exportando: ${err.message}`);
    }
  }, [filters]);

  /**
   * Aplicar filtros de búsqueda
   */
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Limpiar filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({
      severity: null,
      scoreMin: null,
      scoreMax: null,
      dateFrom: null,
      dateTo: null,
      hasExploit: null,
      remediationStatus: null,
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Cambiar página
   */
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  /**
   * Buscar CVEs con debounce
   */
  const searchCVEs = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  }, []);

  /**
   * Filtrar por severidad
   */
  const filterBySeverity = useCallback((severity) => {
    setFilters(prev => ({ ...prev, severity }));
  }, []);

  /**
   * Filtrar por rango de fecha
   */
  const filterByDateRange = useCallback((dateFrom, dateTo) => {
    setFilters(prev => ({ ...prev, dateFrom, dateTo }));
  }, []);

  /**
   * Filtrar por rango de puntuación CVSS
   */
  const filterByScoreRange = useCallback((scoreMin, scoreMax) => {
    setFilters(prev => ({ ...prev, scoreMin, scoreMax }));
  }, []);

  /**
   * Obtener CVEs críticos
   */
  const getCriticalCVEs = useCallback(() => {
    return cves.filter(cve => cve.cvss?.severity === 'critical');
  }, [cves]);

  /**
   * Obtener CVEs con exploits
   */
  const getCVEsWithExploits = useCallback(() => {
    return cves.filter(cve => cve.exploitInfo?.hasKnownExploit);
  }, [cves]);

  /**
   * Obtener CVEs sin remediar
   */
  const getUnremediatedCVEs = useCallback(() => {
    return cves.filter(cve => 
      cve.organizationalImpact && 
      ['pending', 'in_progress'].includes(cve.organizationalImpact.remediationStatus)
    );
  }, [cves]);

  /**
   * Obtener estadísticas rápidas
   */
  const getQuickStats = useCallback(() => {
    const total = cves.length;
    const critical = getCriticalCVEs().length;
    const withExploits = getCVEsWithExploits().length;
    const unremediated = getUnremediatedCVEs().length;
    
    return { total, critical, withExploits, unremediated };
  }, [cves, getCriticalCVEs, getCVEsWithExploits, getUnremediatedCVEs]);

  /**
   * Obtener CVEs por activo
   */
  const getCVEsByAsset = useCallback((assetId) => {
    return cves.filter(cve => 
      cve.organizationalImpact?.affectedAssets?.some(asset => asset.asset === assetId)
    );
  }, [cves]);

  /**
   * Verificar si hay nuevos CVEs críticos
   */
  const checkForNewCriticalCVEs = useCallback(() => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return cves.filter(cve => 
      cve.cvss?.severity === 'critical' && 
      new Date(cve.publishedDate) > oneDayAgo
    );
  }, [cves]);

  /**
   * Refrescar datos
   */
  const refreshDashboard = useCallback(async () => {
    await fetchDashboard();
  }, [fetchDashboard]);

  const refreshCVEs = useCallback(async () => {
    await fetchCVEs();
  }, [fetchCVEs]);

  /**
   * Configurar sincronización automática
   */
  const setupAutoSync = useCallback((enabled = true, interval = 24) => {
    if (typeof window !== 'undefined') {
      const key = 'cve_auto_sync';
      
      if (enabled) {
        localStorage.setItem(key, JSON.stringify({
          enabled: true,
          interval: interval * 60 * 60 * 1000, // Convertir horas a ms
          lastSync: Date.now()
        }));
        
        toast.success(`Sincronización automática configurada cada ${interval} horas`);
      } else {
        localStorage.removeItem(key);
        toast.info('Sincronización automática deshabilitada');
      }
    }
  }, []);

  /**
   * Obtener configuración de auto-sync
   */
  const getAutoSyncConfig = useCallback(() => {
    if (typeof window !== 'undefined') {
      const config = localStorage.getItem('cve_auto_sync');
      return config ? JSON.parse(config) : null;
    }
    return null;
  }, []);

  // Efectos
  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user, fetchDashboard]);

  useEffect(() => {
    if (user && Object.values(filters).some(Boolean)) {
      fetchCVEs();
    }
  }, [user, filters, pagination.page, pagination.limit, fetchCVEs]);

  // Verificar auto-sync al cargar
  useEffect(() => {
    const autoSyncConfig = getAutoSyncConfig();
    if (autoSyncConfig?.enabled) {
      const timeSinceLastSync = Date.now() - autoSyncConfig.lastSync;
      if (timeSinceLastSync >= autoSyncConfig.interval) {
        triggerSync({ forceSync: false });
      }
    }
  }, [getAutoSyncConfig, triggerSync]);

  // Polling para estado de sincronización
  useEffect(() => {
    let pollInterval;
    
    if (syncStatus.syncing) {
      pollInterval = setInterval(async () => {
        try {
          // En una implementación real, esto consultaría el estado actual
          const response = await makeRequest('GET', '/cve/sync-status');
          if (response?.data) {
            setSyncStatus(response.data);
          }
        } catch (err) {
          console.error('Error polling sync status:', err);
        }
      }, 2000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [syncStatus.syncing, makeRequest]);

  // Sincronizar loading y error global con local
  useEffect(() => {
    setLoading(globalLoading);
  }, [globalLoading]);

  useEffect(() => {
    if (globalError) {
      setError(globalError.message);
    }
  }, [globalError]);

  return {
    // Estado
    cves,
    dashboardData,
    loading: loading || globalLoading,
    error: error || globalError?.message,
    filters,
    pagination,
    syncStatus,

    // Acciones CRUD
    fetchCVEs,
    fetchCVEById,
    updateRemediationStatus,

    // Sincronización y correlación
    triggerSync,
    correlateCVEs,
    checkNVDStatus,

    // Búsqueda y filtros
    searchByProducts,
    applyFilters,
    clearFilters,
    searchCVEs,
    filterBySeverity,
    filterByDateRange,
    filterByScoreRange,

    // Utilidades
    exportCVEs,
    fetchAlerts,
    fetchStatistics,
    changePage,

    // Refrescar
    refreshDashboard,
    refreshCVEs,

    // Helpers
    getCriticalCVEs,
    getCVEsWithExploits,
    getUnremediatedCVEs,
    getQuickStats,
    getCVEsByAsset,
    checkForNewCriticalCVEs,

    // Auto-sync
    setupAutoSync,
    getAutoSyncConfig,

    // Acciones directas
    setFilters,
    setError,
    setSyncStatus
  };
};