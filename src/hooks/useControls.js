'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi } from './useApi';
import toast from 'react-hot-toast';

/**
 * Hook para gestión de controles de seguridad
 * Integra con la API de backend para CRUD de controles
 */
export const useControls = () => {
  const { request, loading } = useApi();
  const [controls, setControls] = useState([]);
  const [currentControl, setCurrentControl] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0
  });
  const [cache, setCache] = useState(new Map());

  // Obtener todos los controles con filtros
  const fetchControls = useCallback(async (params = {}) => {
    try {
      const cacheKey = JSON.stringify(params);
      
      // Verificar cache
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutos
          setControls(cached.data);
          setPagination(cached.pagination);
          return cached.data;
        }
      }

      const response = await request(
        () => api.get('/controls', { params }),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const { controls: controlsData, pagination: paginationData } = response.data.data;
        
        setControls(controlsData || []);
        setPagination(paginationData || {});
        
        // Actualizar cache
        setCache(prev => new Map(prev).set(cacheKey, {
          data: controlsData || [],
          pagination: paginationData || {},
          timestamp: Date.now()
        }));
        
        return controlsData || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching controls:', error);
      toast.error('Error al cargar controles');
      return [];
    }
  }, [request, cache]);

  // Obtener control específico
  const getControl = useCallback(async (controlId) => {
    try {
      const response = await request(
        () => api.get(`/controls/${controlId}`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const control = response.data.data.control;
        setCurrentControl(control);
        return control;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching control:', error);
      toast.error('Error al cargar control');
      return null;
    }
  }, [request]);

  // Crear nuevo control
  const createControl = useCallback(async (controlData) => {
    try {
      const response = await request(
        () => api.post('/controls', controlData),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const newControl = response.data.data.control;
        
        // Actualizar lista local
        setControls(prev => [newControl, ...prev]);
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Control creado exitosamente');
        return newControl;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating control:', error);
      toast.error('Error al crear control');
      return null;
    }
  }, [request]);

  // Actualizar control
  const updateControl = useCallback(async (controlId, controlData) => {
    try {
      const response = await request(
        () => api.put(`/controls/${controlId}`, controlData),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const updatedControl = response.data.data.control;
        
        // Actualizar lista local
        setControls(prev => prev.map(control => 
          control._id === controlId ? updatedControl : control
        ));
        
        // Actualizar control actual si es el mismo
        if (currentControl?._id === controlId) {
          setCurrentControl(updatedControl);
        }
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Control actualizado exitosamente');
        return updatedControl;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating control:', error);
      toast.error('Error al actualizar control');
      return null;
    }
  }, [request, currentControl]);

  // Eliminar control
  const deleteControl = useCallback(async (controlId) => {
    try {
      const response = await request(
        () => api.delete(`/controls/${controlId}`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        // Actualizar lista local
        setControls(prev => prev.filter(control => control._id !== controlId));
        
        // Limpiar control actual si es el mismo
        if (currentControl?._id === controlId) {
          setCurrentControl(null);
        }
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Control eliminado exitosamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting control:', error);
      toast.error('Error al eliminar control');
      return false;
    }
  }, [request, currentControl]);

  // Obtener catálogo ISO 27002
  const getISO27002Catalog = useCallback(async () => {
    try {
      const response = await request(
        () => api.get('/controls/iso27002-catalog'),
        { useCache: true, cacheKey: 'iso27002-catalog' }
      );

      if (response?.data?.status === 'success') {
        return response.data.data.catalog || {};
      }
      
      return {};
    } catch (error) {
      console.error('Error fetching ISO 27002 catalog:', error);
      return {};
    }
  }, [request]);

  // Obtener estadísticas de controles
  const getControlsStats = useCallback(async () => {
    try {
      const response = await request(
        () => api.get('/controls/statistics'),
        { useCache: true, cacheKey: 'controls-stats' }
      );

      if (response?.data?.status === 'success') {
        return response.data.data || {};
      }
      
      return {};
    } catch (error) {
      console.error('Error fetching controls stats:', error);
      return {};
    }
  }, [request]);

  // Agregar resultado de prueba
  const addTestResult = useCallback(async (controlId, testData) => {
    try {
      const response = await request(
        () => api.post(`/controls/${controlId}/test-results`, testData),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const updatedControl = response.data.data.control;
        
        // Actualizar lista local
        setControls(prev => prev.map(control => 
          control._id === controlId ? updatedControl : control
        ));
        
        // Actualizar control actual si es el mismo
        if (currentControl?._id === controlId) {
          setCurrentControl(updatedControl);
        }
        
        toast.success('Resultado de prueba agregado exitosamente');
        return updatedControl;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding test result:', error);
      toast.error('Error al agregar resultado de prueba');
      return null;
    }
  }, [request, currentControl]);

  // Evaluar efectividad del control
  const evaluateEffectiveness = useCallback(async (controlId, evaluationData) => {
    try {
      const response = await request(
        () => api.post(`/controls/${controlId}/evaluate`, evaluationData),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const updatedControl = response.data.data.control;
        
        // Actualizar lista local
        setControls(prev => prev.map(control => 
          control._id === controlId ? updatedControl : control
        ));
        
        toast.success('Efectividad evaluada exitosamente');
        return updatedControl;
      }
      
      return null;
    } catch (error) {
      console.error('Error evaluating effectiveness:', error);
      toast.error('Error al evaluar efectividad');
      return null;
    }
  }, [request]);

  // Búsqueda de controles
  const searchControls = useCallback(async (query, filters = {}) => {
    try {
      const params = { search: query, ...filters };
      return await fetchControls(params);
    } catch (error) {
      console.error('Error searching controls:', error);
      return [];
    }
  }, [fetchControls]);

  // Obtener controles por categoría
  const getControlsByCategory = useCallback(async (category) => {
    try {
      const params = { category };
      return await fetchControls(params);
    } catch (error) {
      console.error('Error fetching controls by category:', error);
      return [];
    }
  }, [fetchControls]);

  // Obtener controles por tipo
  const getControlsByType = useCallback(async (type) => {
    try {
      const params = { type };
      return await fetchControls(params);
    } catch (error) {
      console.error('Error fetching controls by type:', error);
      return [];
    }
  }, [fetchControls]);

  // Importar controles desde archivo
  const importControls = useCallback(async (file, options = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });

      const response = await request(
        () => api.post('/controls/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        // Limpiar cache y recargar
        setCache(new Map());
        await fetchControls();
        
        toast.success('Controles importados exitosamente');
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error importing controls:', error);
      toast.error('Error al importar controles');
      return null;
    }
  }, [request, fetchControls]);

  // Exportar controles
  const exportControls = useCallback(async (format = 'xlsx', filters = {}) => {
    try {
      const params = { format, ...filters };
      
      const response = await request(
        () => api.get('/controls/export', { 
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
        link.download = `controles_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Controles exportados exitosamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error exporting controls:', error);
      toast.error('Error al exportar controles');
      return false;
    }
  }, [request]);

  // Filtrar controles localmente
  const filteredControls = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return controls;
    }

    return controls.filter(control => {
      // Filtro por categoría
      if (filters.category && control.category !== filters.category) {
        return false;
      }

      // Filtro por tipo
      if (filters.type && control.type !== filters.type) {
        return false;
      }

      // Filtro por nivel de madurez
      if (filters.maturityLevel && control.maturityLevel !== filters.maturityLevel) {
        return false;
      }

      // Filtro por efectividad mínima
      if (filters.minEffectiveness && control.effectiveness < filters.minEffectiveness) {
        return false;
      }

      // Filtro por estado de implementación
      if (filters.status && control.implementationStatus !== filters.status) {
        return false;
      }

      // Filtro por costo máximo
      if (filters.maxCost && control.implementationCost > filters.maxCost) {
        return false;
      }

      return true;
    });
  }, [controls, filters]);

  // Controles agrupados por categoría
  const controlsByCategory = useMemo(() => {
    return filteredControls.reduce((acc, control) => {
      const category = control.category || 'Otros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(control);
      return acc;
    }, {});
  }, [filteredControls]);

  // Controles agrupados por tipo
  const controlsByType = useMemo(() => {
    return filteredControls.reduce((acc, control) => {
      const type = control.type || 'Otros';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(control);
      return acc;
    }, {});
  }, [filteredControls]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = filteredControls.length;
    const byCategory = controlsByCategory;
    const byType = controlsByType;
    const implemented = filteredControls.filter(c => c.implementationStatus === 'implemented').length;
    const avgEffectiveness = total > 0 
      ? filteredControls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / total 
      : 0;
    const totalCost = filteredControls.reduce((sum, c) => sum + (c.implementationCost || 0), 0);
    
    return {
      total,
      byCategory,
      byType,
      implemented,
      implementationRate: total > 0 ? (implemented / total) * 100 : 0,
      avgEffectiveness,
      totalCost
    };
  }, [filteredControls, controlsByCategory, controlsByType]);

  // Cargar controles al montar el componente
  useEffect(() => {
    fetchControls();
  }, []);

  return {
    // Estado
    controls: filteredControls,
    controlsByCategory,
    controlsByType,
    currentControl,
    loading,
    pagination,
    filters,
    stats,

    // Acciones CRUD
    fetchControls,
    getControl,
    createControl,
    updateControl,
    deleteControl,

    // Acciones especializadas
    getISO27002Catalog,
    getControlsStats,
    addTestResult,
    evaluateEffectiveness,
    searchControls,
    getControlsByCategory,
    getControlsByType,

    // Importación/Exportación
    importControls,
    exportControls,

    // Configuración
    setFilters,
    setCurrentControl,

    // Utilidades
    clearCache: () => setCache(new Map())
  };
};