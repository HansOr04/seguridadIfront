import { useState, useEffect, useCallback, useContext } from 'react';
import { useApi } from './useApi';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export const useRisks = () => {
  const [risks, setRisks] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    riskLevel: null,
    category: null,
    status: null,
    assetType: null,
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0
  });

  const { apiCall } = useApi();
  const { user } = useContext(AuthContext);

  /**
   * Obtener dashboard de riesgos
   */
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall('/risks/dashboard', 'GET');
      setDashboardData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching risks dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  /**
   * Obtener lista de riesgos con filtros
   */
  const fetchRisks = useCallback(async (queryFilters = {}, paginationOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: paginationOptions.page || pagination.page,
        limit: paginationOptions.limit || pagination.limit,
        ...filters,
        ...queryFilters
      });

      // Limpiar parámetros vacíos
      for (const [key, value] of params.entries()) {
        if (!value || value === 'null' || value === 'undefined') {
          params.delete(key);
        }
      }

      const response = await apiCall(`/risks?${params.toString()}`, 'GET');
      
      setRisks(response.data.risks);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching risks:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall, filters, pagination.page, pagination.limit]);

  /**
   * Obtener riesgo específico por ID
   */
  const fetchRiskById = useCallback(async (riskId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(`/risks/${riskId}`, 'GET');
      return response.data.risk;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  /**
   * Calcular nuevo riesgo
   */
  const calculateRisk = useCallback(async (riskData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall('/risks/calculate', 'POST', riskData);
      
      toast.success('Riesgo calculado exitosamente');
      
      // Refrescar lista de riesgos
      await fetchRisks();
      
      return response.data.risk;
    } catch (err) {
      setError(err.message);
      toast.error(`Error calculando riesgo: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, fetchRisks]);

  /**
   * Actualizar riesgo existente
   */
  const updateRisk = useCallback(async (riskId, updateData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(`/risks/${riskId}`, 'PUT', updateData);
      
      toast.success('Riesgo actualizado exitosamente');
      
      // Actualizar lista local
      setRisks(prev => prev.map(risk => 
        risk.id === riskId ? { ...risk, ...response.data.risk } : risk
      ));
      
      return response.data.risk;
    } catch (err) {
      setError(err.message);
      toast.error(`Error actualizando riesgo: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  /**
   * Recalcular riesgo específico
   */
  const recalculateRisk = useCallback(async (riskId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(`/risks/${riskId}/recalculate`, 'POST');
      
      toast.success('Riesgo recalculado exitosamente');
      
      // Actualizar lista local
      setRisks(prev => prev.map(risk => 
        risk.id === riskId ? { ...risk, ...response.data.risk } : risk
      ));
      
      return response.data.risk;
    } catch (err) {
      setError(err.message);
      toast.error(`Error recalculando riesgo: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  /**
   * Eliminar riesgo
   */
  const deleteRisk = useCallback(async (riskId) => {
    setLoading(true);
    setError(null);

    try {
      await apiCall(`/risks/${riskId}`, 'DELETE');
      
      toast.success('Riesgo eliminado exitosamente');
      
      // Remover de lista local
      setRisks(prev => prev.filter(risk => risk.id !== riskId));
      
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(`Error eliminando riesgo: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  /**
   * Obtener matriz de riesgo
   */
  const fetchRiskMatrix = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall('/risks/matrix', 'GET');
      setMatrixData(response.data.matrix);
      return response.data.matrix;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching risk matrix:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  /**
   * Calcular Value at Risk (VaR)
   */
  const calculateVaR = useCallback(async (confidenceLevel = 0.95, timeHorizon = 365) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        confidenceLevel: confidenceLevel.toString(),
        timeHorizon: timeHorizon.toString()
      });

      const response = await apiCall(`/risks/value-at-risk?${params.toString()}`, 'GET');
      return response.data.valueAtRisk;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  /**
   * Realizar análisis de escenarios
   */
  const analyzeScenarios = useCallback(async (scenarios) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall('/risks/scenarios', 'POST', { scenarios });
      
      toast.success('Análisis de escenarios completado');
      
      return response.data.scenarios;
    } catch (err) {
      setError(err.message);
      toast.error(`Error en análisis de escenarios: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  /**
   * Ejecutar simulación Monte Carlo
   */
  const runMonteCarloSimulation = useCallback(async (riskId, iterations = 10000) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(`/risks/${riskId}/monte-carlo`, 'POST', { iterations });
      
      toast.success('Simulación Monte Carlo completada');
      
      return response.data.results;
    } catch (err) {
      setError(err.message);
      toast.error(`Error en simulación Monte Carlo: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  /**
   * Exportar riesgos
   */
  const exportRisks = useCallback(async (format = 'csv', exportFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        format,
        ...filters,
        ...exportFilters
      });

      // Esta sería una llamada especial para descarga
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/risks/export?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error exportando riesgos');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `riesgos_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Riesgos exportados exitosamente');
    } catch (err) {
      setError(err.message);
      toast.error(`Error exportando: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Aplicar filtros de búsqueda
   */
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset a primera página
  }, []);

  /**
   * Limpiar filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({
      riskLevel: null,
      category: null,
      status: null,
      assetType: null,
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
   * Cambiar límite por página
   */
  const changeLimit = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  /**
   * Refrescar datos
   */
  const refreshDashboard = useCallback(async () => {
    await fetchDashboard();
  }, [fetchDashboard]);

  const refreshRisks = useCallback(async () => {
    await fetchRisks();
  }, [fetchRisks]);

  const refreshMatrix = useCallback(async () => {
    await fetchRiskMatrix();
  }, [fetchRiskMatrix]);

  /**
   * Buscar riesgos con debounce
   */
  const searchRisks = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  }, []);

  /**
   * Obtener riesgos por nivel
   */
  const getRisksByLevel = useCallback((level) => {
    return risks.filter(risk => risk.classification.riskLevel === level);
  }, [risks]);

  /**
   * Obtener estadísticas rápidas
   */
  const getQuickStats = useCallback(() => {
    const total = risks.length;
    const critical = risks.filter(r => r.classification.riskLevel === 'critical').length;
    const high = risks.filter(r => r.classification.riskLevel === 'high').length;
    const pending = risks.filter(r => r.treatment.status === 'identified' || r.treatment.status === 'analyzed').length;
    
    return { total, critical, high, pending };
  }, [risks]);

  // Efectos
  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user, fetchDashboard]);

  useEffect(() => {
    if (user && Object.values(filters).some(Boolean)) {
      fetchRisks();
    }
  }, [user, filters, pagination.page, pagination.limit, fetchRisks]);

  return {
    // Estado
    risks,
    dashboardData,
    matrixData,
    loading,
    error,
    filters,
    pagination,

    // Acciones CRUD
    fetchRisks,
    fetchRiskById,
    calculateRisk,
    updateRisk,
    recalculateRisk,
    deleteRisk,

    // Análisis y cálculos
    fetchRiskMatrix,
    calculateVaR,
    analyzeScenarios,
    runMonteCarloSimulation,

    // Utilidades
    exportRisks,
    applyFilters,
    clearFilters,
    changePage,
    changeLimit,
    searchRisks,
    
    // Refrescar
    refreshDashboard,
    refreshRisks,
    refreshMatrix,

    // Helpers
    getRisksByLevel,
    getQuickStats,

    // Acciones directas
    setFilters,
    setError
  };
};