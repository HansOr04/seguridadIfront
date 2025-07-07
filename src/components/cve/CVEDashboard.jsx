'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  Database, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Wifi,
  WifiOff,
  RefreshCw,
  ExternalLink,
  Filter,
  Search
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
import { useCVE } from '../../hooks/useCVE';
import { formatDate, formatRelativeTime } from '../../lib/formatters';

const SEVERITY_COLORS = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#84cc16',
  none: '#6b7280'
};

const CVEDashboard = () => {
  const { 
    dashboardData, 
    loading, 
    error, 
    refreshDashboard,
    syncStatus,
    triggerSync 
  } = useCVE();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh cada 10 minutos
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshDashboard();
      }, 10 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
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
              <h3 className="text-lg font-medium text-red-800">Error cargando dashboard CVE</h3>
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

  const { summary, statistics, criticalRecent, withExploits, trending, alerts, nvdStatus } = dashboardData || {};

  // Datos para gráfico de severidad
  const severityData = statistics?.severityStats ? Object.entries(statistics.severityStats).map(([severity, data]) => ({
    name: severity.toUpperCase(),
    value: data.count || 0,
    color: SEVERITY_COLORS[severity] || '#6b7280'
  })) : [];

  // Datos para gráfico de tendencias
  const trendData = [
    { name: 'Hace 7 días', nuevos: 12, críticos: 3 },
    { name: 'Hace 6 días', nuevos: 8, críticos: 2 },
    { name: 'Hace 5 días', nuevos: 15, críticos: 4 },
    { name: 'Hace 4 días', nuevos: 6, críticos: 1 },
    { name: 'Hace 3 días', nuevos: 20, críticos: 7 },
    { name: 'Hace 2 días', nuevos: 11, críticos: 2 },
    { name: 'Ayer', nuevos: 9, críticos: 3 },
    { name: 'Hoy', nuevos: 5, críticos: 1 }
  ];

  const handleSyncCVEs = async () => {
    try {
      await triggerSync();
    } catch (error) {
      console.error('Error sincronizando CVEs:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="h-7 w-7 mr-3 text-blue-600" />
                Dashboard CVE/NVD
              </h1>
              <p className="text-gray-600 mt-1">
                Monitoreo de vulnerabilidades y correlación con activos organizacionales
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Estado NVD */}
              <div className="flex items-center">
                <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  nvdStatus?.status === 'online' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {nvdStatus?.status === 'online' ? (
                    <Wifi className="h-4 w-4 mr-1" />
                  ) : (
                    <WifiOff className="h-4 w-4 mr-1" />
                  )}
                  NVD API {nvdStatus?.status === 'online' ? 'Online' : 'Offline'}
                </div>
              </div>

              {/* Sincronización */}
              <button
                onClick={handleSyncCVEs}
                disabled={syncStatus?.syncing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus?.syncing ? 'animate-spin' : ''}`} />
                {syncStatus?.syncing ? 'Sincronizando...' : 'Sincronizar CVE'}
              </button>

              {/* Auto-refresh */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={autoRefresh ? 'Auto-refresh activado' : 'Auto-refresh desactivado'}
              >
                <Clock className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Alertas críticas */}
        {alerts && alerts.length > 0 && (
          <div className="mb-6">
            <AlertsPanel alerts={alerts} />
          </div>
        )}

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total CVEs"
            value={summary?.totalCVEs || 0}
            icon={Database}
            color="blue"
            subtitle="En la organización"
          />
          
          <MetricCard
            title="CVEs Críticos"
            value={summary?.criticalCount || 0}
            icon={AlertTriangle}
            color="red"
            subtitle="Requieren atención inmediata"
          />
          
          <MetricCard
            title="Con Exploits"
            value={summary?.trendingCount || 0}
            icon={Zap}
            color="orange"
            subtitle="Exploits conocidos disponibles"
          />
          
          <MetricCard
            title="Sin Remediar"
            value={summary?.unremediated || 0}
            icon={XCircle}
            color="yellow"
            subtitle="Pendientes de remediación"
          />
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribución por severidad */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Distribución por Severidad</h3>
              <div className="text-sm text-gray-500">CVSS v3.1</div>
            </div>
            
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'CVEs']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </div>

          {/* Tendencia de descubrimientos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tendencia de Descubrimientos</h3>
              <div className="text-sm text-gray-500">Últimos 7 días</div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="nuevos" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                  name="Nuevos CVEs"
                />
                <Area 
                  type="monotone" 
                  dataKey="críticos" 
                  stackId="1" 
                  stroke="#dc2626" 
                  fill="#dc2626" 
                  fillOpacity={0.8}
                  name="CVEs Críticos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CVEs Críticos Recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">CVEs Críticos Recientes</h3>
              <span className="text-sm text-gray-500">Últimos 30 días</span>
            </div>

            {criticalRecent && criticalRecent.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {criticalRecent.map((cve, index) => (
                  <CVECard
                    key={cve.cveId}
                    cve={cve}
                    showBadge={true}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No hay CVEs críticos recientes</p>
              </div>
            )}
          </div>

          {/* CVEs con Exploits */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">CVEs con Exploits Conocidos</h3>
              <span className="text-sm text-red-500 font-medium">Alta Prioridad</span>
            </div>

            {withExploits && withExploits.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {withExploits.map((cve, index) => (
                  <CVECard
                    key={cve.cveId}
                    cve={cve}
                    showExploitBadge={true}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No hay CVEs con exploits conocidos</p>
              </div>
            )}
          </div>
        </div>

        {/* CVEs Trending */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">CVEs Trending</h3>
            <div className="flex items-center text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              Alta actividad en redes sociales
            </div>
          </div>

          {trending && trending.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.map((cve, index) => (
                <CVECard
                  key={cve.cveId}
                  cve={cve}
                  showTrendingBadge={true}
                  compact={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No hay CVEs trending actualmente</p>
            </div>
          )}
        </div>

        {/* Estado de Sincronización */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Sincronización</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {syncStatus?.lastSync ? formatRelativeTime(syncStatus.lastSync) : 'Nunca'}
              </div>
              <div className="text-sm text-gray-600">Última Sincronización</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {syncStatus?.imported || 0}
              </div>
              <div className="text-sm text-gray-600">CVEs Importados</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {syncStatus?.updated || 0}
              </div>
              <div className="text-sm text-gray-600">CVEs Actualizados</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {syncStatus?.errors || 0}
              </div>
              <div className="text-sm text-gray-600">Errores</div>
            </div>
          </div>

          {syncStatus?.syncing && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <RefreshCw className="h-5 w-5 text-blue-600 animate-spin mr-3" />
                <div>
                  <div className="text-sm font-medium text-blue-900">Sincronización en progreso</div>
                  <div className="text-sm text-blue-700">
                    Procesando CVEs desde NVD... {syncStatus.progress || '0'}% completado
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente AlertsPanel
const AlertsPanel = ({ alerts }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
        <h3 className="text-lg font-medium text-red-900">Alertas Críticas</h3>
      </div>
      
      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-center justify-between bg-white rounded p-3">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-3 ${
                alert.severity === 'critical' ? 'bg-red-500' :
                alert.severity === 'high' ? 'bg-orange-500' :
                'bg-yellow-500'
              }`}></div>
              <div>
                <div className="text-sm font-medium text-gray-900">{alert.message}</div>
                <div className="text-xs text-gray-500">
                  {alert.count} elementos afectados
                </div>
              </div>
            </div>
            <button className="text-red-600 hover:text-red-800 text-sm font-medium">
              Ver detalles
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente MetricCard
const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500'
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
    </div>
  );
};

// Componente CVECard
const CVECard = ({ cve, showBadge, showExploitBadge, showTrendingBadge, compact }) => {
  const severityColor = SEVERITY_COLORS[cve.severity] || '#6b7280';

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <a
            href={`/dashboard/cve/${cve.cveId}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {cve.cveId}
          </a>
          
          {showBadge && (
            <span 
              className="px-2 py-1 text-xs font-medium text-white rounded"
              style={{ backgroundColor: severityColor }}
            >
              {cve.severity.toUpperCase()}
            </span>
          )}
          
          {showExploitBadge && (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
              EXPLOIT
            </span>
          )}
          
          {showTrendingBadge && (
            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
              TRENDING
            </span>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-sm font-bold" style={{ color: severityColor }}>
            {cve.cvssScore}
          </div>
          <div className="text-xs text-gray-500">CVSS</div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {cve.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{formatRelativeTime(cve.publishedDate)}</span>
        
        <div className="flex items-center space-x-2">
          {cve.affectedAssets > 0 && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {cve.affectedAssets} activos
            </span>
          )}
          
          <span className={`px-2 py-1 rounded ${
            cve.remediationStatus === 'completed' ? 'bg-green-100 text-green-800' :
            cve.remediationStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {cve.remediationStatus}
          </span>
        </div>
      </div>
      
      {!compact && cve.socialMediaMentions > 0 && (
        <div className="mt-2 text-xs text-orange-600">
          {cve.socialMediaMentions} menciones en redes sociales
        </div>
      )}
    </div>
  );
};

export default CVEDashboard;