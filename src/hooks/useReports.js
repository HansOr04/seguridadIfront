'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi } from './useApi';
import toast from 'react-hot-toast';

/**
 * Hook para gestión de reportes
 * Integra con la API de backend para generación y gestión de reportes
 */
export const useReports = () => {
  const { request, loading } = useApi();
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [generationProgress, setGenerationProgress] = useState({});
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0
  });
  const [cache, setCache] = useState(new Map());

  // Obtener todos los reportes con filtros
  const fetchReports = useCallback(async (params = {}) => {
    try {
      const cacheKey = JSON.stringify(params);
      
      // Verificar cache
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 2 * 60 * 1000) { // 2 minutos
          setReports(cached.data);
          setPagination(cached.pagination);
          return cached.data;
        }
      }

      const response = await request(
        () => api.get('/reports', { params }),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const { reports: reportsData, pagination: paginationData } = response.data.data;
        
        setReports(reportsData || []);
        setPagination(paginationData || {});
        
        // Actualizar cache
        setCache(prev => new Map(prev).set(cacheKey, {
          data: reportsData || [],
          pagination: paginationData || {},
          timestamp: Date.now()
        }));
        
        return reportsData || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Error al cargar reportes');
      return [];
    }
  }, [request, cache]);

  // Obtener reporte específico
  const getReport = useCallback(async (reportId) => {
    try {
      const response = await request(
        () => api.get(`/reports/${reportId}`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const report = response.data.data.report;
        setCurrentReport(report);
        return report;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Error al cargar reporte');
      return null;
    }
  }, [request]);

  // Crear nueva configuración de reporte
  const createReport = useCallback(async (reportData) => {
    try {
      const response = await request(
        () => api.post('/reports', reportData),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const newReport = response.data.data.report;
        
        // Actualizar lista local
        setReports(prev => [newReport, ...prev]);
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Configuración de reporte creada exitosamente');
        return newReport;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Error al crear reporte');
      return null;
    }
  }, [request]);

  // Actualizar configuración de reporte
  const updateReport = useCallback(async (reportId, reportData) => {
    try {
      const response = await request(
        () => api.put(`/reports/${reportId}`, reportData),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const updatedReport = response.data.data.report;
        
        // Actualizar lista local
        setReports(prev => prev.map(report => 
          report._id === reportId ? updatedReport : report
        ));
        
        // Actualizar reporte actual si es el mismo
        if (currentReport?._id === reportId) {
          setCurrentReport(updatedReport);
        }
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Reporte actualizado exitosamente');
        return updatedReport;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Error al actualizar reporte');
      return null;
    }
  }, [request, currentReport]);

  // Eliminar reporte
  const deleteReport = useCallback(async (reportId) => {
    try {
      const response = await request(
        () => api.delete(`/reports/${reportId}`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        // Actualizar lista local
        setReports(prev => prev.filter(report => report._id !== reportId));
        
        // Limpiar reporte actual si es el mismo
        if (currentReport?._id === reportId) {
          setCurrentReport(null);
        }
        
        // Limpiar cache
        setCache(new Map());
        
        toast.success('Reporte eliminado exitosamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error al eliminar reporte');
      return false;
    }
  }, [request, currentReport]);

  // Generar reporte bajo demanda
  const generateReport = useCallback(async (reportId, params = {}) => {
    try {
      setGenerationProgress(prev => ({ ...prev, [reportId]: { status: 'generating', progress: 0 } }));
      
      const response = await request(
        () => api.post(`/reports/${reportId}/generate`, params),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        const generatedReport = response.data.data;
        
        setGenerationProgress(prev => ({ 
          ...prev, 
          [reportId]: { status: 'completed', progress: 100, result: generatedReport } 
        }));
        
        toast.success('Reporte generado exitosamente');
        return generatedReport;
      }
      
      return null;
    } catch (error) {
      console.error('Error generating report:', error);
      setGenerationProgress(prev => ({ 
        ...prev, 
        [reportId]: { status: 'error', progress: 0, error: error.message } 
      }));
      toast.error('Error al generar reporte');
      return null;
    }
  }, [request]);

  // Descargar reporte generado
  const downloadReport = useCallback(async (reportId, generatedReportId = null) => {
    try {
      const url = generatedReportId 
        ? `/reports/${reportId}/download/${generatedReportId}`
        : `/reports/${reportId}/download`;
        
      const response = await request(
        () => api.get(url, { responseType: 'blob' }),
        { showError: true }
      );

      if (response?.data) {
        // Obtener nombre del archivo desde headers
        const contentDisposition = response.headers['content-disposition'];
        let filename = `reporte_${new Date().toISOString().split('T')[0]}.pdf`;
        
        if (contentDisposition) {
          const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (matches && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }
        
        // Crear y descargar archivo
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        toast.success('Reporte descargado exitosamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Error al descargar reporte');
      return false;
    }
  }, [request]);

  // Obtener estadísticas de reportes
  const getReportsStats = useCallback(async () => {
    try {
      const response = await request(
        () => api.get('/reports/statistics'),
        { useCache: true, cacheKey: 'reports-stats' }
      );

      if (response?.data?.status === 'success') {
        return response.data.data || {};
      }
      
      return {};
    } catch (error) {
      console.error('Error fetching reports stats:', error);
      return {};
    }
  }, [request]);

  // Generar reporte ejecutivo
  const generateExecutiveReport = useCallback(async (params = {}) => {
    try {
      const defaultParams = {
        type: 'executive_summary',
        format: 'pdf',
        includeAssets: true,
        includeRisks: true,
        includeControls: true,
        includeTreatments: true,
        timeframe: '30d',
        ...params
      };

      return await generateReport('executive', defaultParams);
    } catch (error) {
      console.error('Error generating executive report:', error);
      return null;
    }
  }, [generateReport]);

  // Generar reporte MAGERIT completo
  const generateMageritReport = useCallback(async (params = {}) => {
    try {
      const defaultParams = {
        type: 'magerit_complete',
        format: 'pdf',
        includeMethodology: true,
        includeTaxonomy: true,
        includeCalculations: true,
        includeMatrices: true,
        includeRecommendations: true,
        ...params
      };

      return await generateReport('magerit', defaultParams);
    } catch (error) {
      console.error('Error generating MAGERIT report:', error);
      return null;
    }
  }, [generateReport]);

  // Generar reporte de cumplimiento
  const generateComplianceReport = useCallback(async (standard = 'iso27001', params = {}) => {
    try {
      const defaultParams = {
        type: 'compliance',
        standard,
        format: 'pdf',
        includeGaps: true,
        includeRecommendations: true,
        includeTimeline: true,
        ...params
      };

      return await generateReport('compliance', defaultParams);
    } catch (error) {
      console.error('Error generating compliance report:', error);
      return null;
    }
  }, [generateReport]);

  // Generar reporte de activos
  const generateAssetsReport = useCallback(async (params = {}) => {
    try {
      const defaultParams = {
        type: 'assets_inventory',
        format: 'excel',
        includeValuation: true,
        includeDependencies: true,
        includeOwners: true,
        groupBy: 'type',
        ...params
      };

      return await generateReport('assets', defaultParams);
    } catch (error) {
      console.error('Error generating assets report:', error);
      return null;
    }
  }, [generateReport]);

  // Generar reporte de riesgos
  const generateRisksReport = useCallback(async (params = {}) => {
    try {
      const defaultParams = {
        type: 'risk_assessment',
        format: 'pdf',
        includeCalculations: true,
        includeMatrix: true,
        includeTreatments: true,
        includeMetrics: true,
        riskLevelFilter: ['high', 'critical'],
        ...params
      };

      return await generateReport('risks', defaultParams);
    } catch (error) {
      console.error('Error generating risks report:', error);
      return null;
    }
  }, [generateReport]);

  // Programar reporte automático
  const scheduleReport = useCallback(async (reportId, scheduleParams) => {
    try {
      const response = await request(
        () => api.post(`/reports/${reportId}/schedule`, scheduleParams),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        toast.success('Reporte programado exitosamente');
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error scheduling report:', error);
      toast.error('Error al programar reporte');
      return null;
    }
  }, [request]);

  // Cancelar programación de reporte
  const unscheduleReport = useCallback(async (reportId) => {
    try {
      const response = await request(
        () => api.delete(`/reports/${reportId}/schedule`),
        { showError: true }
      );

      if (response?.data?.status === 'success') {
        toast.success('Programación cancelada exitosamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unscheduling report:', error);
      toast.error('Error al cancelar programación');
      return false;
    }
  }, [request]);

  // Exportar reporte en diferentes formatos
  const exportReport = useCallback(async (reportData, format = 'pdf') => {
    try {
      const response = await request(
        () => api.post('/reports/export', { reportData, format }, { responseType: 'blob' }),
        { showError: true }
      );

      if (response?.data) {
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Reporte exportado exitosamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Error al exportar reporte');
      return false;
    }
  }, [request]);

  // Filtrar reportes localmente
  const filteredReports = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return reports;
    }

    return reports.filter(report => {
      // Filtro por tipo
      if (filters.type && report.type !== filters.type) {
        return false;
      }

      // Filtro por formato
      if (filters.format && report.format !== filters.format) {
        return false;
      }

      // Filtro por frecuencia
      if (filters.frequency && report.frequency !== filters.frequency) {
        return false;
      }

      // Filtro por estado
      if (filters.status && report.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [reports, filters]);

  // Reportes agrupados por tipo
  const reportsByType = useMemo(() => {
    return filteredReports.reduce((acc, report) => {
      const type = report.type || 'Otros';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(report);
      return acc;
    }, {});
  }, [filteredReports]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = filteredReports.length;
    const byType = reportsByType;
    const scheduled = filteredReports.filter(r => r.frequency !== 'once').length;
    const generated = filteredReports.filter(r => r.lastGenerated).length;
    const automated = filteredReports.filter(r => r.isAutomated).length;
    
    return {
      total,
      byType,
      scheduled,
      generated,
      automated,
      automationRate: total > 0 ? (automated / total) * 100 : 0
    };
  }, [filteredReports, reportsByType]);

  // Cargar reportes al montar el componente
  useEffect(() => {
    fetchReports();
  }, []);

  return {
    // Estado
    reports: filteredReports,
    reportsByType,
    currentReport,
    loading,
    pagination,
    filters,
    stats,
    generationProgress,

    // Acciones CRUD
    fetchReports,
    getReport,
    createReport,
    updateReport,
    deleteReport,

    // Generación y descarga
    generateReport,
    downloadReport,
    exportReport,

    // Reportes específicos
    generateExecutiveReport,
    generateMageritReport,
    generateComplianceReport,
    generateAssetsReport,
    generateRisksReport,

    // Programación
    scheduleReport,
    unscheduleReport,

    // Estadísticas
    getReportsStats,

    // Configuración
    setFilters,
    setCurrentReport,

    // Utilidades
    clearCache: () => setCache(new Map()),
    clearProgress: (reportId) => {
      setGenerationProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[reportId];
        return newProgress;
      });
    }
  };
};