'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi } from './useApi';
import toast from 'react-hot-toast';

/**
 * Hook para gestión de tratamientos de riesgo
 * Integra con la API de backend para CRUD de tratamientos
 */
export const useTreatments = () => {
  const { request, loading } = useApi();
  const [treatments, setTreatments] = useState([]);
  const [currentTreatment, setCurrentTreatment] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0
  });
  const [cache, setCache] = useState(new Map());

  // Obtener todos los tratamientos con filtros
  const fetchTreatments = useCallback(async (params = {}) => {
    try {
      const cacheKey = JSON.stringify(params);
      
      // Verificar cache
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutos
          setTreatments(cached.data);
          setPagination(cached.pagination);
          return cached.data;
        }
      }

      const response = await request(
        () => api.get('/treatments', { params }),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const { treatments: treatmentsData, pagination: paginationData } = response.data.data;
        
        setTreatments(treatmentsData || []);
        setPagination(paginationData || {});
        
        // Actualizar cache
        setCache(prev => new Map(prev).set(cacheKey, {
          data: treatmentsData || [],
          pagination: paginationData || {},
          timestamp: Date.now()
        }));
        
        return treatmentsData || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching treatments:', error);
      toast.error('Error al cargar tratamientos');
      return [];
    }
  }, [request, cache]);

  // Obtener tratamiento específico
  const getTreatment = useCallback(async (treatmentId) => {
    try {
      const response = await request(
        () => api.get(`/treatments/${treatmentId}`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const treatment = response.data.data.treatment;
        setCurrentTreatment(treatment);
        return treatment;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching treatment:', error);
      toast.error('Error al cargar tratamiento');
      return null;
    }
  }, [request]);

  // Crear nuevo tratamiento
  const createTreatment = useCallback(async (treatmentData) => {
    try {
      const response = await request(
        () => api.post('/treatments', treatmentData),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const newTreatment = response.data.data.treatment;
        
        // Actualizar lista local
        setTreatments(prev => [newTreatment, ...prev]);
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Tratamiento creado exitosamente');
        return newTreatment;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating treatment:', error);
      toast.error('Error al crear tratamiento');
      return null;
    }
  }, [request]);

  // Actualizar tratamiento
  const updateTreatment = useCallback(async (treatmentId, treatmentData) => {
    try {
      const response = await request(
        () => api.put(`/treatments/${treatmentId}`, treatmentData),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const updatedTreatment = response.data.data.treatment;
        
        // Actualizar lista local
        setTreatments(prev => prev.map(treatment => 
          treatment._id === treatmentId ? updatedTreatment : treatment
        ));
        
        // Actualizar tratamiento actual si es el mismo
        if (currentTreatment?._id === treatmentId) {
          setCurrentTreatment(updatedTreatment);
        }
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Tratamiento actualizado exitosamente');
        return updatedTreatment;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating treatment:', error);
      toast.error('Error al actualizar tratamiento');
      return null;
    }
  }, [request, currentTreatment]);

  // Eliminar tratamiento
  const deleteTreatment = useCallback(async (treatmentId) => {
    try {
      const response = await request(
        () => api.delete(`/treatments/${treatmentId}`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        // Actualizar lista local
        setTreatments(prev => prev.filter(treatment => treatment._id !== treatmentId));
        
        // Limpiar tratamiento actual si es el mismo
        if (currentTreatment?._id === treatmentId) {
          setCurrentTreatment(null);
        }
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Tratamiento eliminado exitosamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting treatment:', error);
      toast.error('Error al eliminar tratamiento');
      return false;
    }
  }, [request, currentTreatment]);

  // Aprobar tratamiento
  const approveTreatment = useCallback(async (treatmentId, approvalData = {}) => {
    try {
      const response = await request(
        () => api.post(`/treatments/${treatmentId}/approve`, approvalData),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const approvedTreatment = response.data.data.treatment;
        
        // Actualizar lista local
        setTreatments(prev => prev.map(treatment => 
          treatment._id === treatmentId ? approvedTreatment : treatment
        ));
        
        // Actualizar tratamiento actual si es el mismo
        if (currentTreatment?._id === treatmentId) {
          setCurrentTreatment(approvedTreatment);
        }
        
        toast.success('Tratamiento aprobado exitosamente');
        return approvedTreatment;
      }
      
      return null;
    } catch (error) {
      console.error('Error approving treatment:', error);
      toast.error('Error al aprobar tratamiento');
      return null;
    }
  }, [request, currentTreatment]);

  // Obtener análisis costo-beneficio
  const getCostBenefitAnalysis = useCallback(async (treatmentId) => {
    try {
      const response = await request(
        () => api.get(`/treatments/${treatmentId}/cost-benefit`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        return response.data.data.analysis || {};
      }
      
      return {};
    } catch (error) {
      console.error('Error fetching cost-benefit analysis:', error);
      toast.error('Error al obtener análisis costo-beneficio');
      return {};
    }
  }, [request]);

  // Obtener estadísticas de tratamientos
  const getTreatmentsStats = useCallback(async () => {
    try {
      const response = await request(
        () => api.get('/treatments/statistics'),
        { useCache: true, cacheKey: 'treatments-stats' }
      );

      if (response?.data?.status === 'success') {
        return response.data.data || {};
      }
      
      return {};
    } catch (error) {
      console.error('Error fetching treatments stats:', error);
      return {};
    }
  }, [request]);

  // Búsqueda de tratamientos
  const searchTreatments = useCallback(async (query, filters = {}) => {
    try {
      const params = { search: query, ...filters };
      return await fetchTreatments(params);
    } catch (error) {
      console.error('Error searching treatments:', error);
      return [];
    }
  }, [fetchTreatments]);

  // Obtener tratamientos por tipo
  const getTreatmentsByType = useCallback(async (type) => {
    try {
      const params = { type };
      return await fetchTreatments(params);
    } catch (error) {
      console.error('Error fetching treatments by type:', error);
      return [];
    }
  }, [fetchTreatments]);

  // Obtener tratamientos por prioridad
  const getTreatmentsByPriority = useCallback(async (priority) => {
    try {
      const params = { priority };
      return await fetchTreatments(params);
    } catch (error) {
      console.error('Error fetching treatments by priority:', error);
      return [];
    }
  }, [fetchTreatments]);

  // Obtener tratamientos por estado
  const getTreatmentsByStatus = useCallback(async (status) => {
    try {
      const params = { status };
      return await fetchTreatments(params);
    } catch (error) {
      console.error('Error fetching treatments by status:', error);
      return [];
    }
  }, [fetchTreatments]);

  // Actualizar estado de implementación
  const updateImplementationStatus = useCallback(async (treatmentId, status, notes = '') => {
    try {
      const response = await request(
        () => api.patch(`/treatments/${treatmentId}/status`, { status, notes }),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const updatedTreatment = response.data.data.treatment;
        
        // Actualizar lista local
        setTreatments(prev => prev.map(treatment => 
          treatment._id === treatmentId ? updatedTreatment : treatment
        ));
        
        toast.success('Estado actualizado exitosamente');
        return updatedTreatment;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating implementation status:', error);
      toast.error('Error al actualizar estado');
      return null;
    }
  }, [request]);

  // Calcular ROI del tratamiento
  const calculateROI = useCallback(async (treatmentId) => {
    try {
      const response = await request(
        () => api.get(`/treatments/${treatmentId}/roi`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        return response.data.data.roi || {};
      }
      
      return {};
    } catch (error) {
      console.error('Error calculating ROI:', error);
      return {};
    }
  }, [request]);

  // Importar tratamientos desde archivo
  const importTreatments = useCallback(async (file, options = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });

      const response = await request(
        () => api.post('/treatments/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        // Limpiar cache y recargar
        setCache(new Map());
        await fetchTreatments();
        
        toast.success('Tratamientos importados exitosamente');
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error importing treatments:', error);
      toast.error('Error al importar tratamientos');
      return null;
    }
  }, [request, fetchTreatments]);

  // Exportar tratamientos
  const exportTreatments = useCallback(async (format = 'xlsx', filters = {}) => {
    try {
      const params = { format, ...filters };
      
      const response = await request(
        () => api.get('/treatments/export', { 
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
        link.download = `tratamientos_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Tratamientos exportados exitosamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error exporting treatments:', error);
      toast.error('Error al exportar tratamientos');
      return false;
    }
  }, [request]);

  // Filtrar tratamientos localmente
  const filteredTreatments = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return treatments;
    }

    return treatments.filter(treatment => {
      // Filtro por tipo
      if (filters.type && treatment.type !== filters.type) {
        return false;
      }

      // Filtro por prioridad
      if (filters.priority && treatment.priority !== filters.priority) {
        return false;
      }

      // Filtro por estado
      if (filters.status && treatment.implementationStatus !== filters.status) {
        return false;
      }

      // Filtro por costo máximo
      if (filters.maxCost && treatment.implementationCost > filters.maxCost) {
        return false;
      }

      // Filtro por ROI mínimo
      if (filters.minROI && treatment.expectedROI < filters.minROI) {
        return false;
      }

      // Filtro por reducción de riesgo mínima
      if (filters.minRiskReduction && treatment.riskReduction < filters.minRiskReduction) {
        return false;
      }

      // Filtro por aprobación
      if (filters.approved !== undefined) {
        if (filters.approved !== treatment.approved) {
          return false;
        }
      }

      return true;
    });
  }, [treatments, filters]);

  // Tratamientos agrupados por tipo
  const treatmentsByType = useMemo(() => {
    return filteredTreatments.reduce((acc, treatment) => {
      const type = treatment.type || 'Otros';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(treatment);
      return acc;
    }, {});
  }, [filteredTreatments]);

  // Tratamientos agrupados por prioridad
  const treatmentsByPriority = useMemo(() => {
    return filteredTreatments.reduce((acc, treatment) => {
      const priority = treatment.priority || 'medium';
      if (!acc[priority]) {
        acc[priority] = [];
      }
      acc[priority].push(treatment);
      return acc;
    }, {});
  }, [filteredTreatments]);

  // Tratamientos agrupados por estado
  const treatmentsByStatus = useMemo(() => {
    return filteredTreatments.reduce((acc, treatment) => {
      const status = treatment.implementationStatus || 'planned';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(treatment);
      return acc;
    }, {});
  }, [filteredTreatments]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = filteredTreatments.length;
    const byType = treatmentsByType;
    const byPriority = treatmentsByPriority;
    const byStatus = treatmentsByStatus;
    
    const approved = filteredTreatments.filter(t => t.approved).length;
    const implemented = filteredTreatments.filter(t => t.implementationStatus === 'implemented').length;
    const totalCost = filteredTreatments.reduce((sum, t) => sum + (t.implementationCost || 0), 0);
    const totalBenefit = filteredTreatments.reduce((sum, t) => sum + (t.expectedBenefit || 0), 0);
    const avgROI = total > 0 
      ? filteredTreatments.reduce((sum, t) => sum + (t.expectedROI || 0), 0) / total 
      : 0;
    const avgRiskReduction = total > 0 
      ? filteredTreatments.reduce((sum, t) => sum + (t.riskReduction || 0), 0) / total 
      : 0;
    
    return {
      total,
      byType,
      byPriority,
      byStatus,
      approved,
      implemented,
      approvalRate: total > 0 ? (approved / total) * 100 : 0,
      implementationRate: total > 0 ? (implemented / total) * 100 : 0,
      totalCost,
      totalBenefit,
      netBenefit: totalBenefit - totalCost,
      avgROI,
      avgRiskReduction
    };
  }, [filteredTreatments, treatmentsByType, treatmentsByPriority, treatmentsByStatus]);

  // Cargar tratamientos al montar el componente
  useEffect(() => {
    fetchTreatments();
  }, []);

  return {
    // Estado
    treatments: filteredTreatments,
    treatmentsByType,
    treatmentsByPriority,
    treatmentsByStatus,
    currentTreatment,
    loading,
    pagination,
    filters,
    stats,

    // Acciones CRUD
    fetchTreatments,
    getTreatment,
    createTreatment,
    updateTreatment,
    deleteTreatment,

    // Acciones especializadas
    approveTreatment,
    getCostBenefitAnalysis,
    getTreatmentsStats,
    searchTreatments,
    getTreatmentsByType,
    getTreatmentsByPriority,
    getTreatmentsByStatus,
    updateImplementationStatus,
    calculateROI,

    // Importación/Exportación
    importTreatments,
    exportTreatments,

    // Configuración
    setFilters,
    setCurrentTreatment,

    // Utilidades
    clearCache: () => setCache(new Map())
  };
};