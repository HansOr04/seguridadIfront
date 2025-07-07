import { useState, useEffect, useCallback, useContext } from 'react';
import { useApi } from './useApi';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export const useRiskMatrix = () => {
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    assetType: 'all',
    status: 'all'
  });

  const { apiCall } = useApi();
  const { user } = useContext(AuthContext);

  /**
   * Obtener matriz de riesgo activa
   */
  const fetchMatrix = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall('/risks/matrix', 'GET');
      setMatrixData(response.data.matrix);
      return response.data.matrix;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching risk matrix:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  /**
   * Actualizar filtros y refrescar matriz
   */
  const updateFilters = useCallback(async (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Aplicar filtros en el backend o filtrar localmente
    if (matrixData) {
      // Aquí aplicarías los filtros a la matriz existente
      // En una implementación real, podrías enviar los filtros al backend
      await fetchMatrix();
    }
  }, [matrixData, fetchMatrix]);

  /**
   * Refrescar matriz
   */
  const refreshMatrix = useCallback(async () => {
    await fetchMatrix();
  }, [fetchMatrix]);

  /**
   * Obtener celda específica de la matriz
   */
  const getMatrixCell = useCallback((probabilityLevel, impactLevel) => {
    if (!matrixData?.visualization?.matrix) return null;
    
    const { matrix } = matrixData.visualization;
    
    // Buscar la celda en la matriz
    for (const row of matrix) {
      for (const cell of row) {
        if (cell.x === probabilityLevel && cell.y === impactLevel) {
          return cell;
        }
      }
    }
    
    return null;
  }, [matrixData]);

  /**
   * Obtener riesgos en una celda específica
   */
  const getRisksInCell = useCallback((probabilityLevel, impactLevel) => {
    const cell = getMatrixCell(probabilityLevel, impactLevel);
    return cell?.risks || [];
  }, [getMatrixCell]);

  /**
   * Obtener estadísticas de la matriz
   */
  const getMatrixStats = useCallback(() => {
    if (!matrixData?.visualization?.matrix) {
      return {
        totalRisks: 0,
        risksByLevel: {},
        risksByCell: {},
        averageRiskScore: 0
      };
    }

    const { matrix } = matrixData.visualization;
    let totalRisks = 0;
    const risksByLevel = {};
    const risksByCell = {};
    let totalScore = 0;

    matrix.forEach(row => {
      row.forEach(cell => {
        const cellKey = `${cell.x}-${cell.y}`;
        const cellRiskCount = cell.riskCount || 0;
        
        totalRisks += cellRiskCount;
        risksByCell[cellKey] = cellRiskCount;
        totalScore += (cell.riskScore || 0) * cellRiskCount;

        // Contar por nivel de riesgo
        if (cellRiskCount > 0) {
          const level = cell.riskLevel;
          risksByLevel[level] = (risksByLevel[level] || 0) + cellRiskCount;
        }
      });
    });

    return {
      totalRisks,
      risksByLevel,
      risksByCell,
      averageRiskScore: totalRisks > 0 ? totalScore / totalRisks : 0
    };
  }, [matrixData]);

  /**
   * Obtener configuración de tolerancia
   */
  const getToleranceConfig = useCallback(() => {
    return matrixData?.tolerance || {
      acceptable: { levels: ['very_low', 'low'] },
      tolerable: { levels: ['medium'] },
      unacceptable: { levels: ['high', 'critical'] }
    };
  }, [matrixData]);

  /**
   * Verificar si un nivel de riesgo es aceptable
   */
  const isRiskAcceptable = useCallback((riskLevel) => {
    const tolerance = getToleranceConfig();
    return tolerance.acceptable.levels.includes(riskLevel);
  }, [getToleranceConfig]);

  /**
   * Verificar si un nivel de riesgo es tolerable
   */
  const isRiskTolerable = useCallback((riskLevel) => {
    const tolerance = getToleranceConfig();
    return tolerance.tolerable.levels.includes(riskLevel);
  }, [getToleranceConfig]);

  /**
   * Verificar si un nivel de riesgo es inaceptable
   */
  const isRiskUnacceptable = useCallback((riskLevel) => {
    const tolerance = getToleranceConfig();
    return tolerance.unacceptable.levels.includes(riskLevel);
  }, [getToleranceConfig]);

  /**
   * Obtener recomendación de acción para un nivel de riesgo
   */
  const getActionRecommendation = useCallback((riskLevel, riskScore) => {
    if (isRiskUnacceptable(riskLevel)) {
      return {
        action: 'mitigate',
        priority: 'immediate',
        description: 'Requiere mitigación inmediata',
        timeframe: '24-48 horas'
      };
    }
    
    if (isRiskTolerable(riskLevel)) {
      return {
        action: 'monitor',
        priority: 'high',
        description: 'Requiere monitoreo continuo y plan de mitigación',
        timeframe: '1-2 semanas'
      };
    }
    
    return {
      action: 'accept',
      priority: 'low',
      description: 'Mantener monitoreo rutinario',
      timeframe: '1 mes'
    };
  }, [isRiskUnacceptable, isRiskTolerable]);

  /**
   * Exportar matriz como imagen
   */
  const exportMatrixImage = useCallback(async (format = 'png') => {
    try {
      // Esta función requeriría html2canvas o una librería similar
      const matrixElement = document.querySelector('[data-matrix-container]');
      
      if (!matrixElement) {
        throw new Error('Elemento de matriz no encontrado');
      }

      // Importar html2canvas dinámicamente
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(matrixElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Mayor resolución
        useCORS: true
      });

      // Convertir a blob y descargar
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `matriz-riesgo-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Matriz exportada exitosamente');
      }, `image/${format}`);

    } catch (err) {
      setError(err.message);
      toast.error(`Error exportando matriz: ${err.message}`);
    }
  }, []);

  /**
   * Calcular posición en matriz para un riesgo
   */
  const calculateMatrixPosition = useCallback((probability, impact) => {
    if (!matrixData?.dimensions) return null;

    const { probability: probDim, impact: impactDim } = matrixData.dimensions;
    
    // Convertir probabilidad e impacto (0-1) a niveles de matriz (1-5)
    const probabilityLevel = Math.min(Math.ceil(probability * probDim.levels), probDim.levels);
    const impactLevel = Math.min(Math.ceil(impact * impactDim.levels), impactDim.levels);
    
    const cell = getMatrixCell(probabilityLevel, impactLevel);
    
    return {
      probabilityLevel,
      impactLevel,
      riskScore: probabilityLevel * impactLevel,
      riskLevel: cell?.riskLevel || 'medium',
      matrixPosition: `${probabilityLevel}${impactLevel}`,
      color: cell?.color || '#f59e0b'
    };
  }, [matrixData, getMatrixCell]);

  /**
   * Obtener celdas de alto riesgo
   */
  const getHighRiskCells = useCallback(() => {
    if (!matrixData?.visualization?.matrix) return [];
    
    const { matrix } = matrixData.visualization;
    const highRiskCells = [];
    
    matrix.forEach(row => {
      row.forEach(cell => {
        if (['high', 'critical'].includes(cell.riskLevel) && cell.riskCount > 0) {
          highRiskCells.push(cell);
        }
      });
    });
    
    return highRiskCells.sort((a, b) => b.riskScore - a.riskScore);
  }, [matrixData]);

  /**
   * Obtener distribución de riesgos por cuadrante
   */
  const getQuadrantDistribution = useCallback(() => {
    if (!matrixData?.visualization?.matrix) return {};
    
    const { matrix } = matrixData.visualization;
    const distribution = {
      lowProbLowImpact: 0,    // Cuadrante inferior izquierdo
      lowProbHighImpact: 0,   // Cuadrante superior izquierdo  
      highProbLowImpact: 0,   // Cuadrante inferior derecho
      highProbHighImpact: 0   // Cuadrante superior derecho
    };
    
    const midPoint = Math.ceil(matrixData.dimensions.probability.levels / 2);
    
    matrix.forEach(row => {
      row.forEach(cell => {
        const riskCount = cell.riskCount || 0;
        
        if (cell.x <= midPoint && cell.y <= midPoint) {
          distribution.lowProbLowImpact += riskCount;
        } else if (cell.x <= midPoint && cell.y > midPoint) {
          distribution.lowProbHighImpact += riskCount;
        } else if (cell.x > midPoint && cell.y <= midPoint) {
          distribution.highProbLowImpact += riskCount;
        } else {
          distribution.highProbHighImpact += riskCount;
        }
      });
    });
    
    return distribution;
  }, [matrixData]);

  /**
   * Obtener tendencia de riesgos en la matriz
   */
  const getRiskTrend = useCallback(() => {
    const stats = getMatrixStats();
    const tolerance = getToleranceConfig();
    
    const acceptableCount = tolerance.acceptable.levels.reduce(
      (sum, level) => sum + (stats.risksByLevel[level] || 0), 0
    );
    const tolerableCount = tolerance.tolerable.levels.reduce(
      (sum, level) => sum + (stats.risksByLevel[level] || 0), 0
    );
    const unacceptableCount = tolerance.unacceptable.levels.reduce(
      (sum, level) => sum + (stats.risksByLevel[level] || 0), 0
    );
    
    const total = stats.totalRisks;
    
    return {
      acceptablePercentage: total > 0 ? (acceptableCount / total) * 100 : 0,
      tolerablePercentage: total > 0 ? (tolerableCount / total) * 100 : 0,
      unacceptablePercentage: total > 0 ? (unacceptableCount / total) * 100 : 0,
      overallTrend: unacceptableCount > tolerableCount + acceptableCount ? 'deteriorating' : 'stable'
    };
  }, [getMatrixStats, getToleranceConfig]);

  // Efectos
  useEffect(() => {
    if (user) {
      fetchMatrix();
    }
  }, [user, fetchMatrix]);

  return {
    // Estado
    matrixData,
    loading,
    error,
    filters,

    // Acciones principales
    fetchMatrix,
    refreshMatrix,
    updateFilters,
    setFilters,

    // Análisis de matriz
    getMatrixCell,
    getRisksInCell,
    getMatrixStats,
    getHighRiskCells,
    getQuadrantDistribution,
    getRiskTrend,

    // Configuración de tolerancia
    getToleranceConfig,
    isRiskAcceptable,
    isRiskTolerable,
    isRiskUnacceptable,
    getActionRecommendation,

    // Utilidades
    calculateMatrixPosition,
    exportMatrixImage,

    // Control de errores
    setError
  };
};