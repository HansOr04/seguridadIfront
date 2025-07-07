'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Shield, 
  Activity,
  BarChart3,
  Eye,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { useRisks } from '../../hooks/useRisks';
import { formatCurrency, formatPercentage } from '../../lib/formatters';

const RISK_COLORS = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#84cc16',
  very_low: '#10b981'
};

const RiskDashboard = () => {
  const { 
    dashboardData, 
    loading, 
    error, 
    refreshDashboard,
    calculateVaR 
  } = useRisks();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [varData, setVarData] = useState(null);

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshDashboard();
      }, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshDashboard]);

  // Cargar VaR al montar componente
  useEffect(() => {
    const loadVaR = async () => {
      try {
        const var95 = await calculateVaR(0.95, 365);
        setVarData(var95);
      } catch (error) {
        console.error('Error calculando VaR:', error);
      }
    };
    
    loadVaR();
  }, [calculateVaR]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error cargando dashboard</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button
                onClick={refreshDashboard}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { summary, metrics, valueAtRisk, criticalRisks } = dashboardData || {};

  // Datos para gráfico de distribución
  const distributionData = metrics?.riskByLevel ? Object.entries(metrics.riskByLevel).map(([level, count]) => ({
    name: level.replace('_', ' ').toUpperCase(),
    value: count,
    color: RISK_COLORS[level] || '#6b7280'
  })) : [];

  // Datos para gráfico de tendencias
  const trendData = metrics?.riskTrend ? [
    {
      name: 'Anterior',
      riesgo: metrics.riskTrend.previousAverage * 100
    },
    {
      name: 'Actual',
      riesgo: metrics.riskTrend.currentAverage * 100
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard de Riesgos</h1>
              <p className="text-gray-600 mt-1">Análisis cuantitativo de riesgos organizacionales</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Control de auto-refresh */}
              <div className="flex items-center">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-lg transition-colors ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={autoRefresh ? 'Auto-refresh activado' : 'Auto-refresh desactivado'}
                >
                  <Activity className="h-4 w-4" />
                </button>
              </div>

              {/* Botón refresh manual */}
              <button
                onClick={refreshDashboard}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </button>

              {/* Selector de timeframe */}
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="1y">Último año</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total de Riesgos"
            value={summary?.totalRisks || 0}
            icon={Shield}
            color="blue"
            trend={metrics?.riskTrend}
          />
          
          <MetricCard
            title="Riesgos Críticos"
            value={summary?.criticalCount || 0}
            icon={AlertTriangle}
            color="red"
            subtitle="Requieren atención inmediata"
          />
          
          <MetricCard
            title="Riesgo Promedio"
            value={formatPercentage(summary?.averageRisk || 0)}
            icon={BarChart3}
            color="orange"
            trend={metrics?.riskTrend}
          />
          
          <MetricCard
            title="VaR (95%)"
            value={varData ? formatCurrency(varData.var95) : 'Calculando...'}
            icon={DollarSign}
            color="green"
            subtitle="Value at Risk anual"
          />
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribución por nivel de riesgo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Distribución por Nivel</h3>
              <div className="text-sm text-gray-500">Total: {summary?.totalRisks || 0}</div>
            </div>
            
            {distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [value, 'Riesgos']}
                    labelFormatter={(label) => `Nivel: ${label}`}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Datos insuficientes para mostrar tendencia
              </div>
            )}
          </div>
        </div>

        {/* Value at Risk detallado */}
        {varData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Value at Risk (VaR) Organizacional</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(varData.var95)}</div>
                <div className="text-sm text-gray-600">VaR 95% (Anual)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{formatCurrency(varData.var99)}</div>
                <div className="text-sm text-gray-600">VaR 99% (Anual)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(varData.expectedShortfall)}</div>
                <div className="text-sm text-gray-600">Expected Shortfall</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Interpretación:</strong> Existe un 5% de probabilidad de que las pérdidas anuales 
                por riesgos cibernéticos excedan {formatCurrency(varData.var95)}.
              </p>
            </div>
          </div>
        )}

        {/* Top 10 Riesgos Críticos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Riesgos Críticos Prioritarios</h3>
            <button className="flex items-center text-primary-600 hover:text-primary-700 transition-colors">
              <Eye className="h-4 w-4 mr-1" />
              Ver todos
            </button>
          </div>

          {criticalRisks && criticalRisks.length > 0 ? (
            <div className="space-y-4">
              {criticalRisks.slice(0, 10).map((risk, index) => (
                <div key={risk.riskId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-red-600">#{index + 1}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{risk.name}</h4>
                        <RiskLevelBadge level={risk.riskLevel} />
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">Activo: {risk.assetName}</span>
                        <span className="text-sm text-gray-500">Código: {risk.threatCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPercentage(risk.adjustedRisk)}
                      </div>
                      <div className="text-xs text-gray-500">Riesgo</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(risk.economicImpact)}
                      </div>
                      <div className="text-xs text-gray-500">Impacto</div>
                    </div>

                    <div className="text-right">
                      <TreatmentStatusBadge status={risk.treatmentStatus} />
                    </div>

                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No hay riesgos críticos</h4>
              <p className="text-gray-600">
                Excelente trabajo manteniendo los riesgos bajo control.
              </p>
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Calcular Nuevo Riesgo"
            description="Evaluar un nuevo riesgo usando la metodología MAGERIT"
            icon={Calculator}
            color="blue"
            href="/dashboard/risks/calculator"
          />
          
          <QuickActionCard
            title="Ver Matriz de Riesgo"
            description="Visualizar la matriz de riesgo 5x5 organizacional"
            icon={BarChart3}
            color="green"
            href="/dashboard/risks/matrix"
          />
          
          <QuickActionCard
            title="Análisis Cuantitativo"
            description="Ejecutar análisis Monte Carlo y VaR avanzado"
            icon={TrendingUp}
            color="purple"
            href="/dashboard/risks/quantitative"
          />
        </div>
      </div>
    </div>
  );
};

// Componente MetricCard
const MetricCard = ({ title, value, icon: Icon, color, trend, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center">
          <div className={`flex items-center text-sm ${
            trend.direction === 'increasing' ? 'text-red-600' : 'text-green-600'
          }`}>
            {trend.direction === 'increasing' ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {formatPercentage(trend.percentage)}
          </div>
          <span className="text-gray-500 text-sm ml-2">vs período anterior</span>
        </div>
      )}
    </div>
  );
};

// Componente RiskLevelBadge
const RiskLevelBadge = ({ level }) => {
  const levelConfig = {
    critical: { label: 'Crítico', color: 'bg-red-100 text-red-800' },
    high: { label: 'Alto', color: 'bg-orange-100 text-orange-800' },
    medium: { label: 'Medio', color: 'bg-yellow-100 text-yellow-800' },
    low: { label: 'Bajo', color: 'bg-green-100 text-green-800' },
    very_low: { label: 'Muy Bajo', color: 'bg-green-100 text-green-800' }
  };

  const config = levelConfig[level] || { label: level, color: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

// Componente TreatmentStatusBadge
const TreatmentStatusBadge = ({ status }) => {
  const statusConfig = {
    identified: { label: 'Identificado', color: 'bg-gray-100 text-gray-800' },
    analyzed: { label: 'Analizado', color: 'bg-blue-100 text-blue-800' },
    treatment_planned: { label: 'Tratamiento Planificado', color: 'bg-yellow-100 text-yellow-800' },
    treatment_in_progress: { label: 'En Tratamiento', color: 'bg-orange-100 text-orange-800' },
    monitored: { label: 'Monitoreado', color: 'bg-green-100 text-green-800' },
    closed: { label: 'Cerrado', color: 'bg-green-100 text-green-800' }
  };

  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

// Componente QuickActionCard
const QuickActionCard = ({ title, description, icon: Icon, color, href }) => {
  const colorClasses = {
    blue: 'hover:bg-blue-50 border-blue-200',
    green: 'hover:bg-green-50 border-green-200',
    purple: 'hover:bg-purple-50 border-purple-200'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600'
  };

  return (
    <a
      href={href}
      className={`block p-6 bg-white rounded-lg border-2 border-dashed border-gray-200 ${colorClasses[color]} transition-all duration-200 hover:border-opacity-50`}
    >
      <div className="flex items-center">
        <Icon className={`h-8 w-8 ${iconColorClasses[color]}`} />
        <div className="ml-4">
          <h4 className="text-lg font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </a>
  );
};

export default RiskDashboard;