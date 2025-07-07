'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi } from './useApi';
import toast from 'react-hot-toast';

/**
 * Hook para gestión de amenazas MAGERIT
 * Integra con la API de backend para CRUD de amenazas
 */
export const useThreats = () => {
  const { request, loading } = useApi();
  const [threats, setThreats] = useState([]);
  const [currentThreat, setCurrentThreat] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0
  });
  const [cache, setCache] = useState(new Map());

  // Obtener todas las amenazas con filtros
  const fetchThreats = useCallback(async (params = {}) => {
    try {
      const cacheKey = JSON.stringify(params);
      
      // Verificar cache
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutos
          setThreats(cached.data);
          setPagination(cached.pagination);
          return cached.data;
        }
      }

      const response = await request(
        () => api.get('/threats', { params }),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const { threats: threatsData, pagination: paginationData } = response.data.data;
        
        setThreats(threatsData || []);
        setPagination(paginationData || {});
        
        // Actualizar cache
        setCache(prev => new Map(prev).set(cacheKey, {
          data: threatsData || [],
          pagination: paginationData || {},
          timestamp: Date.now()
        }));
        
        return threatsData || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching threats:', error);
      toast.error('Error al cargar amenazas');
      return [];
    }
  }, [request, cache]);

  // Obtener amenazas aplicables a un activo específico
  const getThreatsByAsset = useCallback(async (assetId, assetType = null) => {
    try {
      const params = { assetId };
      if (assetType) params.assetType = assetType;

      const response = await request(
        () => api.get('/threats/by-asset', { params }),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        return response.data.data.threats || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching threats by asset:', error);
      return [];
    }
  }, [request]);

  // Obtener amenaza específica
  const getThreat = useCallback(async (threatId) => {
    try {
      const response = await request(
        () => api.get(`/threats/${threatId}`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const threat = response.data.data.threat;
        setCurrentThreat(threat);
        return threat;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching threat:', error);
      toast.error('Error al cargar amenaza');
      return null;
    }
  }, [request]);

  // Crear nueva amenaza
  const createThreat = useCallback(async (threatData) => {
    try {
      const response = await request(
        () => api.post('/threats', threatData),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const newThreat = response.data.data.threat;
        
        // Actualizar lista local
        setThreats(prev => [newThreat, ...prev]);
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Amenaza creada exitosamente');
        return newThreat;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating threat:', error);
      toast.error('Error al crear amenaza');
      return null;
    }
  }, [request]);

  // Actualizar amenaza
  const updateThreat = useCallback(async (threatId, threatData) => {
    try {
      const response = await request(
        () => api.put(`/threats/${threatId}`, threatData),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const updatedThreat = response.data.data.threat;
        
        // Actualizar lista local
        setThreats(prev => prev.map(threat => 
          threat._id === threatId ? updatedThreat : threat
        ));
        
        // Actualizar amenaza actual si es la misma
        if (currentThreat?._id === threatId) {
          setCurrentThreat(updatedThreat);
        }
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Amenaza actualizada exitosamente');
        return updatedThreat;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating threat:', error);
      toast.error('Error al actualizar amenaza');
      return null;
    }
  }, [request, currentThreat]);

  // Eliminar amenaza
  const deleteThreat = useCallback(async (threatId) => {
    try {
      const response = await request(
        () => api.delete(`/threats/${threatId}`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        // Actualizar lista local
        setThreats(prev => prev.filter(threat => threat._id !== threatId));
        
        // Limpiar amenaza actual si es la misma
        if (currentThreat?._id === threatId) {
          setCurrentThreat(null);
        }
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Amenaza eliminada exitosamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting threat:', error);
      toast.error('Error al eliminar amenaza');
      return false;
    }
  }, [request, currentThreat]);

  // Obtener catálogo MAGERIT de amenazas
  const getMageritCatalog = useCallback(async () => {
    try {
      const response = await request(
        () => api.get('/threats/magerit/catalog'),
        { useCache: true, cacheKey: 'threats-magerit-catalog' }
      );

      if (response?.data?.status === 'success') {
        return response.data.data.catalog || {};
      }
      
      return {};
    } catch (error) {
      console.error('Error fetching MAGERIT catalog:', error);
      return {};
    }
  }, [request]);

  // Obtener estadísticas de amenazas
  const getThreatsStats = useCallback(async () => {
    try {
      const response = await request(
        () => api.get('/threats/statistics'),
        { useCache: true, cacheKey: 'threats-stats' }
      );

      if (response?.data?.status === 'success') {
        return response.data.data || {};
      }
      
      return {};
    } catch (error) {
      console.error('Error fetching threats stats:', error);
      return {};
    }
  }, [request]);

  // Búsqueda de amenazas
  const searchThreats = useCallback(async (query, filters = {}) => {
    try {
      const params = { search: query, ...filters };
      return await fetchThreats(params);
    } catch (error) {
      console.error('Error searching threats:', error);
      return [];
    }
  }, [fetchThreats]);

  // Importar amenazas desde archivo
  const importThreats = useCallback(async (file, options = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });

      const response = await request(
        () => api.post('/threats/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        // Limpiar cache y recargar
        setCache(new Map());
        await fetchThreats();
        
        toast.success('Amenazas importadas exitosamente');
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error importing threats:', error);
      toast.error('Error al importar amenazas');
      return null;
    }
  }, [request, fetchThreats]);

  // Exportar amenazas
  const exportThreats = useCallback(async (format = 'xlsx', filters = {}) => {
    try {
      const params = { format, ...filters };
      
      const response = await request(
        () => api.get('/threats/export', { 
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
        link.download = `amenazas_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Amenazas exportadas exitosamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error exporting threats:', error);
      toast.error('Error al exportar amenazas');
      return false;
    }
  }, [request]);

  // Filtrar amenazas localmente
  const filteredThreats = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return threats;
    }

    return threats.filter(threat => {
      // Filtro por categoría
      if (filters.category && threat.category !== filters.category) {
        return false;
      }

      // Filtro por tipo de activo
      if (filters.assetType && !threat.applicableAssetTypes?.includes(filters.assetType)) {
        return false;
      }

      // Filtro por código MAGERIT
      if (filters.mageritCode && !threat.mageritCode?.toLowerCase().includes(filters.mageritCode.toLowerCase())) {
        return false;
      }

      // Filtro por probabilidad
      if (filters.probabilityMin && threat.baseProbability < filters.probabilityMin) {
        return false;
      }

      if (filters.probabilityMax && threat.baseProbability > filters.probabilityMax) {
        return false;
      }

      return true;
    });
  }, [threats, filters]);

  // Amenazas agrupadas por categoría
  const threatsByCategory = useMemo(() => {
    return filteredThreats.reduce((acc, threat) => {
      const category = threat.category || 'Otros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(threat);
      return acc;
    }, {});
  }, [filteredThreats]);

  // Cargar amenazas al montar el componente
  useEffect(() => {
    fetchThreats();
  }, []);

  return {
    // Estado
    threats: filteredThreats,
    threatsByCategory,
    currentThreat,
    loading,
    pagination,
    filters,

    // Acciones CRUD
    fetchThreats,
    getThreat,
    createThreat,
    updateThreat,
    deleteThreat,

    // Acciones especializadas
    getThreatsByAsset,
    getMageritCatalog,
    getThreatsStats,
    searchThreats,

    // Importación/Exportación
    importThreats,
    exportThreats,

    // Configuración
    setFilters,
    setCurrentThreat,

    // Utilidades
    clearCache: () => setCache(new Map())
  };
};