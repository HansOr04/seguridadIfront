import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export const useAssets = () => {
  const [assets, setAssets] = useState([]);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAssets: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 25
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Obtener lista de activos con filtros
  const fetchAssets = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await api.get(`/assets?${queryParams}`);
      
      if (response.data.status === 'success') {
        setAssets(response.data.data.assets || []);
        setPagination(response.data.data.pagination || {});
        
        // Si hay estadísticas, actualizarlas también
        if (response.data.data.stats) {
          setSummary(prev => ({
            ...prev,
            ...response.data.data.stats
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      setError(error.response?.data?.message || 'Error al cargar activos');
      toast.error('Error al cargar activos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener resumen organizacional de activos
  const fetchAssetsSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/assets/by-organization');
      
      if (response.data.status === 'success') {
        setSummary(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching assets summary:', error);
      setError(error.response?.data?.message || 'Error al cargar resumen de activos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener activo por ID
  const fetchAssetById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/assets/${id}`);
      
      if (response.data.status === 'success') {
        setCurrentAsset(response.data.data.asset);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching asset:', error);
      setError(error.response?.data?.message || 'Error al cargar activo');
      toast.error('Error al cargar activo');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo activo
  const createAsset = useCallback(async (assetData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/assets', assetData);
      
      if (response.data.status === 'success') {
        toast.success('Activo creado exitosamente');
        return response.data.data.asset;
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear activo';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Si hay errores de validación específicos, devolverlos
      if (error.response?.data?.errors) {
        throw {
          message: errorMessage,
          errors: error.response.data.errors
        };
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar activo
  const updateAsset = useCallback(async (id, assetData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put(`/assets/${id}`, assetData);
      
      if (response.data.status === 'success') {
        toast.success('Activo actualizado exitosamente');
        setCurrentAsset(response.data.data.asset);
        return response.data.data.asset;
      }
    } catch (error) {
      console.error('Error updating asset:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar activo';
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (error.response?.data?.errors) {
        throw {
          message: errorMessage,
          errors: error.response.data.errors
        };
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar activo
  const deleteAsset = useCallback(async (id, reason = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.delete(`/assets/${id}`, {
        data: { reason }
      });
      
      if (response.data.status === 'success') {
        toast.success('Activo eliminado exitosamente');
        
        // Actualizar lista local
        setAssets(prev => prev.filter(asset => asset._id !== id));
        
        return true;
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar activo';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Valorar activo según MAGERIT
  const valuateAsset = useCallback(async (id, valuationData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/assets/${id}/valuate`, valuationData);
      
      if (response.data.status === 'success') {
        toast.success('Activo valorado exitosamente');
        setCurrentAsset(response.data.data.asset);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error valuating asset:', error);
      const errorMessage = error.response?.data?.message || 'Error al valorar activo';
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (error.response?.data?.errors) {
        throw {
          message: errorMessage,
          errors: error.response.data.errors
        };
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Gestionar dependencias
  const updateDependencies = useCallback(async (id, dependencies) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/assets/${id}/dependencies`, {
        dependencies
      });
      
      if (response.data.status === 'success') {
        toast.success('Dependencias actualizadas exitosamente');
        setCurrentAsset(response.data.data.asset);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error updating dependencies:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar dependencias';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener análisis de dependencias
  const fetchDependencyAnalysis = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/assets/${id}/dependencies`);
      
      if (response.data.status === 'success') {
        return response.data.data.analysis;
      }
    } catch (error) {
      console.error('Error fetching dependency analysis:', error);
      setError(error.response?.data?.message || 'Error al cargar análisis de dependencias');
      toast.error('Error al cargar análisis de dependencias');
    } finally {
      setLoading(false);
    }
  }, []);

  // Duplicar activo
  const duplicateAsset = useCallback(async (id, newData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/assets/${id}/duplicate`, newData);
      
      if (response.data.status === 'success') {
        toast.success('Activo duplicado exitosamente');
        return response.data.data.duplicatedAsset;
      }
    } catch (error) {
      console.error('Error duplicating asset:', error);
      const errorMessage = error.response?.data?.message || 'Error al duplicar activo';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener análisis MAGERIT de un activo
  const fetchMageritAnalysis = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/assets/${id}/magerit-analysis`);
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching MAGERIT analysis:', error);
      setError(error.response?.data?.message || 'Error al cargar análisis MAGERIT');
      toast.error('Error al cargar análisis MAGERIT');
    } finally {
      setLoading(false);
    }
  }, []);

  // Importar activos desde Excel
  const importAssets = useCallback(async (file, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await api.post('/assets/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.status === 'success') {
        const results = response.data.data;
        toast.success(`Importación completada: ${results.successful} activos creados`);
        
        if (results.failed > 0) {
          toast.error(`${results.failed} activos fallaron. Revisa los errores.`);
        }
        
        return results;
      }
    } catch (error) {
      console.error('Error importing assets:', error);
      const errorMessage = error.response?.data?.message || 'Error al importar activos';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Exportar activos
  const exportAssets = useCallback(async (format = 'excel', filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        format,
        ...filters
      });

      const response = await api.get(`/assets/export?${queryParams}`, {
        responseType: format === 'json' ? 'json' : 'blob'
      });

      if (format === 'json') {
        if (response.data.status === 'success') {
          toast.success('Datos exportados exitosamente');
          return response.data.data;
        }
      } else {
        // Para CSV y Excel, crear descarga
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const extension = format === 'csv' ? 'csv' : 'xlsx';
        link.download = `activos-sigrisk.${extension}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Archivo descargado exitosamente');
        return true;
      }
    } catch (error) {
      console.error('Error exporting assets:', error);
      const errorMessage = error.response?.data?.message || 'Error al exportar activos';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Descargar plantilla de importación
  const downloadTemplate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/assets/template', {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla-importacion-activos.xlsx';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Plantilla descargada exitosamente');
      return true;
    } catch (error) {
      console.error('Error downloading template:', error);
      const errorMessage = error.response?.data?.message || 'Error al descargar plantilla';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar activos duplicados
  const findDuplicates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/assets/duplicates');
      
      if (response.data.status === 'success') {
        return response.data.data.duplicates;
      }
    } catch (error) {
      console.error('Error finding duplicates:', error);
      setError(error.response?.data?.message || 'Error al buscar duplicados');
      toast.error('Error al buscar duplicados');
    } finally {
      setLoading(false);
    }
  }, []);

  // Análisis de taxonomía
  const analyzeTaxonomy = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/assets/taxonomy-analysis');
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error analyzing taxonomy:', error);
      setError(error.response?.data?.message || 'Error al analizar taxonomía');
      toast.error('Error al analizar taxonomía');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener activos por tipo
  const fetchAssetsByType = useCallback(async (type, params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/assets/by-type/${type}?${queryParams}`);
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching assets by type:', error);
      setError(error.response?.data?.message || 'Error al cargar activos por tipo');
      toast.error('Error al cargar activos por tipo');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener taxonomía MAGERIT
  const fetchMageritTaxonomy = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/assets/magerit/taxonomy');
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching MAGERIT taxonomy:', error);
      setError(error.response?.data?.message || 'Error al cargar taxonomía MAGERIT');
      toast.error('Error al cargar taxonomía MAGERIT');
    } finally {
      setLoading(false);
    }
  }, []);

  // Utilidades para validación
  const validateAssetCode = useCallback(async (code, excludeId = null) => {
    try {
      // Simulación de validación (en producción sería una llamada al API)
      const response = await api.get(`/assets?search=${code}&limit=1`);
      
      if (response.data.status === 'success') {
        const existingAsset = response.data.data.assets.find(
          asset => asset.code.toUpperCase() === code.toUpperCase() && 
          (!excludeId || asset._id !== excludeId)
        );
        
        return !existingAsset; // Retorna true si es único
      }
      return true;
    } catch (error) {
      console.error('Error validating asset code:', error);
      return true; // En caso de error, asumir que es válido
    }
  }, []);

  // Limpiar estado
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetAssets = useCallback(() => {
    setAssets([]);
    setCurrentAsset(null);
    setSummary(null);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalAssets: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 25
    });
    setError(null);
  }, []);

  // Funciones de utilidad para el estado
  const getAssetById = useCallback((id) => {
    return assets.find(asset => asset._id === id);
  }, [assets]);

  const getAssetsByStatus = useCallback((status) => {
    return assets.filter(asset => asset.status === status);
  }, [assets]);

  const getAssetsByCriticality = useCallback((level) => {
    return assets.filter(asset => asset.criticality.level === level);
  }, [assets]);

  const getTotalEconomicValue = useCallback(() => {
    return assets.reduce((total, asset) => total + (asset.economicValue || 0), 0);
  }, [assets]);

  const getCriticalityDistribution = useCallback(() => {
    const distribution = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      VERY_LOW: 0
    };
    
    assets.forEach(asset => {
      distribution[asset.criticality.level]++;
    });
    
    return distribution;
  }, [assets]);

  const getTypeDistribution = useCallback(() => {
    const distribution = {};
    
    assets.forEach(asset => {
      distribution[asset.type] = (distribution[asset.type] || 0) + 1;
    });
    
    return distribution;
  }, [assets]);

  // Funciones para métricas en tiempo real
  const getAssetMetrics = useCallback(() => {
    const totalAssets = assets.length;
    const criticalAssets = assets.filter(a => a.criticality.level === 'CRITICAL').length;
    const valuedAssets = assets.filter(a => Object.values(a.valuation).some(v => v > 0)).length;
    const pendingAssets = totalAssets - valuedAssets;
    const totalEconomicValue = getTotalEconomicValue();
    
    return {
      totalAssets,
      criticalAssets,
      valuedAssets,
      pendingAssets,
      totalEconomicValue,
      compliancePercentage: totalAssets > 0 ? Math.round((valuedAssets / totalAssets) * 100) : 0,
      criticalityDistribution: getCriticalityDistribution(),
      typeDistribution: getTypeDistribution()
    };
  }, [assets, getTotalEconomicValue, getCriticalityDistribution, getTypeDistribution]);

  return {
    // Estado
    assets,
    currentAsset,
    summary,
    pagination,
    loading,
    error,

    // Funciones principales
    fetchAssets,
    fetchAssetsSummary,
    fetchAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    valuateAsset,
    updateDependencies,
    fetchDependencyAnalysis,
    duplicateAsset,
    fetchMageritAnalysis,

    // Importación/Exportación
    importAssets,
    exportAssets,
    downloadTemplate,

    // Análisis
    findDuplicates,
    analyzeTaxonomy,
    fetchAssetsByType,
    fetchMageritTaxonomy,

    // Utilidades
    validateAssetCode,
    clearError,
    resetAssets,
    getAssetById,
    getAssetsByStatus,
    getAssetsByCriticality,
    getTotalEconomicValue,
    getCriticalityDistribution,
    getTypeDistribution,
    getAssetMetrics
  };
};