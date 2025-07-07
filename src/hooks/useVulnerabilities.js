'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi } from './useApi';
import toast from 'react-hot-toast';

/**
 * Hook para gestión de vulnerabilidades
 * Integra con la API de backend para CRUD de vulnerabilidades
 */
export const useVulnerabilities = () => {
  const { request, loading } = useApi();
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [currentVulnerability, setCurrentVulnerability] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0
  });
  const [cache, setCache] = useState(new Map());

  // Obtener todas las vulnerabilidades con filtros
  const fetchVulnerabilities = useCallback(async (params = {}) => {
    try {
      const cacheKey = JSON.stringify(params);
      
      // Verificar cache
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutos
          setVulnerabilities(cached.data);
          setPagination(cached.pagination);
          return cached.data;
        }
      }

      const response = await request(
        () => api.get('/vulnerabilities', { params }),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const { vulnerabilities: vulnData, pagination: paginationData } = response.data.data;
        
        setVulnerabilities(vulnData || []);
        setPagination(paginationData || {});
        
        // Actualizar cache
        setCache(prev => new Map(prev).set(cacheKey, {
          data: vulnData || [],
          pagination: paginationData || {},
          timestamp: Date.now()
        }));
        
        return vulnData || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error);
      toast.error('Error al cargar vulnerabilidades');
      return [];
    }
  }, [request, cache]);

  // Obtener vulnerabilidades de un activo específico
  const getVulnerabilitiesByAsset = useCallback(async (assetId) => {
    try {
      const response = await request(
        () => api.get(`/vulnerabilities/by-asset/${assetId}`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        return response.data.data.vulnerabilities || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching vulnerabilities by asset:', error);
      return [];
    }
  }, [request]);

  // Obtener vulnerabilidad específica
  const getVulnerability = useCallback(async (vulnerabilityId) => {
    try {
      const response = await request(
        () => api.get(`/vulnerabilities/${vulnerabilityId}`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const vulnerability = response.data.data.vulnerability;
        setCurrentVulnerability(vulnerability);
        return vulnerability;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching vulnerability:', error);
      toast.error('Error al cargar vulnerabilidad');
      return null;
    }
  }, [request]);

  // Crear nueva vulnerabilidad
  const createVulnerability = useCallback(async (vulnerabilityData) => {
    try {
      const response = await request(
        () => api.post('/vulnerabilities', vulnerabilityData),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const newVulnerability = response.data.data.vulnerability;
        
        // Actualizar lista local
        setVulnerabilities(prev => [newVulnerability, ...prev]);
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Vulnerabilidad creada exitosamente');
        return newVulnerability;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating vulnerability:', error);
      toast.error('Error al crear vulnerabilidad');
      return null;
    }
  }, [request]);

  // Actualizar vulnerabilidad
  const updateVulnerability = useCallback(async (vulnerabilityId, vulnerabilityData) => {
    try {
      const response = await request(
        () => api.put(`/vulnerabilities/${vulnerabilityId}`, vulnerabilityData),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const updatedVulnerability = response.data.data.vulnerability;
        
        // Actualizar lista local
        setVulnerabilities(prev => prev.map(vuln => 
          vuln._id === vulnerabilityId ? updatedVulnerability : vuln
        ));
        
        // Actualizar vulnerabilidad actual si es la misma
        if (currentVulnerability?._id === vulnerabilityId) {
          setCurrentVulnerability(updatedVulnerability);
        }
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Vulnerabilidad actualizada exitosamente');
        return updatedVulnerability;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating vulnerability:', error);
      toast.error('Error al actualizar vulnerabilidad');
      return null;
    }
  }, [request, currentVulnerability]);

  // Eliminar vulnerabilidad
  const deleteVulnerability = useCallback(async (vulnerabilityId) => {
    try {
      const response = await request(
        () => api.delete(`/vulnerabilities/${vulnerabilityId}`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        // Actualizar lista local
        setVulnerabilities(prev => prev.filter(vuln => vuln._id !== vulnerabilityId));
        
        // Limpiar vulnerabilidad actual si es la misma
        if (currentVulnerability?._id === vulnerabilityId) {
          setCurrentVulnerability(null);
        }
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Vulnerabilidad eliminada exitosamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting vulnerability:', error);
      toast.error('Error al eliminar vulnerabilidad');
      return false;
    }
  }, [request, currentVulnerability]);

  // Obtener vulnerabilidades correlacionadas con CVE
  const getVulnerabilitiesByCVE = useCallback(async (cveId) => {
    try {
      const response = await request(
        () => api.get(`/vulnerabilities/by-cve/${cveId}`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        return response.data.data.vulnerabilities || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching vulnerabilities by CVE:', error);
      return [];
    }
  }, [request]);

  // Correlacionar vulnerabilidad con CVE
  const correlateCVE = useCallback(async (vulnerabilityId, cveId) => {
    try {
      const response = await request(
        () => api.post(`/vulnerabilities/${vulnerabilityId}/correlate-cve`, { cveId }),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        // Actualizar lista local
        setVulnerabilities(prev => prev.map(vuln => 
          vuln._id === vulnerabilityId 
            ? { ...vuln, cveDetails: response.data.data.cveDetails }
            : vuln
        ));
        
        toast.success('CVE correlacionado exitosamente');
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error correlating CVE:', error);
      toast.error('Error al correlacionar CVE');
      return null;
    }
  }, [request]);

  // Evaluar vulnerabilidad (calcular score)
  const evaluateVulnerability = useCallback(async (vulnerabilityId, evaluationData) => {
    try {
      const response = await request(
        () => api.post(`/vulnerabilities/${vulnerabilityId}/evaluate`, evaluationData),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const updatedVulnerability = response.data.data.vulnerability;
        
        // Actualizar lista local
        setVulnerabilities(prev => prev.map(vuln => 
          vuln._id === vulnerabilityId ? updatedVulnerability : vuln
        ));
        
        toast.success('Vulnerabilidad evaluada exitosamente');
        return updatedVulnerability;
      }
      
      return null;
    } catch (error) {
      console.error('Error evaluating vulnerability:', error);
      toast.error('Error al evaluar vulnerabilidad');
      return null;
    }
  }, [request]);

  // Obtener estadísticas de vulnerabilidades
  const getVulnerabilitiesStats = useCallback(async () => {
    try {
      const response = await request(
        () => api.get('/vulnerabilities/statistics'),
        { useCache: true, cacheKey: 'vulnerabilities-stats' }
      );

      if (response?.data?.status === 'success') {
        return response.data.data || {};
      }
      
      return {};
    } catch (error) {
      console.error('Error fetching vulnerabilities stats:', error);
      return {};
    }
  }, [request]);

  // Búsqueda de vulnerabilidades
  const searchVulnerabilities = useCallback(async (query, filters = {}) => {
    try {
      const params = { search: query, ...filters };
      return await fetchVulnerabilities(params);
    } catch (error) {
      console.error('Error searching vulnerabilities:', error);
      return [];
    }
  }, [fetchVulnerabilities]);

  // Obtener vulnerabilidades por severidad
  const getVulnerabilitiesBySeverity = useCallback(async (severity) => {
    try {
      const params = { severity };
      return await fetchVulnerabilities(params);
    } catch (error) {
      console.error('Error fetching vulnerabilities by severity:', error);
      return [];
    }
  }, [fetchVulnerabilities]);

  // Importar vulnerabilidades desde archivo
  const importVulnerabilities = useCallback(async (file, options = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });

      const response = await request(
        () => api.post('/vulnerabilities/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        // Limpiar cache y recargar
        setCache(new Map());
        await fetchVulnerabilities();
        
        toast.success('Vulnerabilidades importadas exitosamente');
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error importing vulnerabilities:', error);
      toast.error('Error al importar vulnerabilidades');
      return null;
    }
  }, [request, fetchVulnerabilities]);

  // Exportar vulnerabilidades
  const exportVulnerabilities = useCallback(async (format = 'xlsx', filters = {}) => {
    try {
      const params = { format, ...filters };
      
      const response = await request(
        () => api.get('/vulnerabilities/export', { 
          params,
          responseType: 'blob'
        }),
        { showError: true }
      );

      if (response?.data) {
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vulnerabilidades_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Vulnerabilidades exportadas exitosamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error exporting vulnerabilities:', error);
      toast.error('Error al exportar vulnerabilidades');
      return false;
    }
  }, [request]);

  // Filtrar vulnerabilidades localmente
  const filteredVulnerabilities = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return vulnerabilities;
    }

    return vulnerabilities.filter(vulnerability => {
      // Filtro por severidad
      if (filters.severity && vulnerability.severityLevel !== filters.severity) {
        return false;
      }

      // Filtro por tipo
      if (filters.type && vulnerability.type !== filters.type) {
        return false;
      }

      // Filtro por categoría
      if (filters.category && vulnerability.category !== filters.category) {
        return false;
      }

      // Filtro por nivel de vulnerabilidad
      if (filters.levelMin && vulnerability.vulnerabilityLevel < filters.levelMin) {
        return false;
      }

      if (filters.levelMax && vulnerability.vulnerabilityLevel > filters.levelMax) {
        return false;
      }

      // Filtro por CVE asociado
      if (filters.hasCVE !== undefined) {
        const hasCVE = !!vulnerability.cveDetails?.cveId;
        if (filters.hasCVE !== hasCVE) {
          return false;
        }
      }

      // Filtro por estado de remediación
      if (filters.remediationStatus && vulnerability.remediationStatus !== filters.remediationStatus) {
        return false;
      }

      return true;
    });
  }, [vulnerabilities, filters]);

  // Vulnerabilidades agrupadas por severidad
  const vulnerabilitiesBySeverity = useMemo(() => {
    return filteredVulnerabilities.reduce((acc, vulnerability) => {
      const severity = vulnerability.severityLevel || 'unknown';
      if (!acc[severity]) {
        acc[severity] = [];
      }
      acc[severity].push(vulnerability);
      return acc;
    }, {});
  }, [filteredVulnerabilities]);

  // Vulnerabilidades agrupadas por tipo
  const vulnerabilitiesByType = useMemo(() => {
    return filteredVulnerabilities.reduce((acc, vulnerability) => {
      const type = vulnerability.type || 'Otros';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(vulnerability);
      return acc;
    }, {});
  }, [filteredVulnerabilities]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = filteredVulnerabilities.length;
    const bySeverity = vulnerabilitiesBySeverity;
    const withCVE = filteredVulnerabilities.filter(v => v.cveDetails?.cveId).length;
    const remediated = filteredVulnerabilities.filter(v => v.remediationStatus === 'completed').length;
    
    return {
      total,
      bySeverity,
      withCVE,
      remediated,
      remediationRate: total > 0 ? (remediated / total) * 100 : 0
    };
  }, [filteredVulnerabilities, vulnerabilitiesBySeverity]);

  // Cargar vulnerabilidades al montar el componente
  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  return {
    // Estado
    vulnerabilities: filteredVulnerabilities,
    vulnerabilitiesBySeverity,
    vulnerabilitiesByType,
    currentVulnerability,
    loading,
    pagination,
    filters,
    stats,

    // Acciones CRUD
    fetchVulnerabilities,
    getVulnerability,
    createVulnerability,
    updateVulnerability,
    deleteVulnerability,

    // Acciones especializadas
    getVulnerabilitiesByAsset,
    getVulnerabilitiesByCVE,
    getVulnerabilitiesBySeverity,
    correlateCVE,
    evaluateVulnerability,
    getVulnerabilitiesStats,
    searchVulnerabilities,

    // Importación/Exportación
    importVulnerabilities,
    exportVulnerabilities,

    // Configuración
    setFilters,
    setCurrentVulnerability,

    // Utilidades
    clearCache: () => setCache(new Map())
  };
};