'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAssets } from '@/hooks/useAssets';
import Link from 'next/link';
import { 
  Database, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Activity,
  Package,
  DollarSign,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Download,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

// Componente para tarjetas de métricas
const MetricCard = ({ title, value, change, changeType, icon: Icon, description, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {change && (
          <div className={`flex items-center text-sm ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            )}
            {change}
          </div>
        )}
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      )}
    </div>
  );
};

// Componente para gráfico de distribución de criticidad
const CriticalityChart = ({ distribution }) => {
  const colors = {
    CRITICAL: 'bg-red-500',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-green-500',
    VERY_LOW: 'bg-blue-500'
  };

  const labels = {
    CRITICAL: 'Crítico',
    HIGH: 'Alto',
    MEDIUM: 'Medio',
    LOW: 'Bajo',
    VERY_LOW: 'Muy Bajo'
  };

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Criticidad</h3>
      
      {/* Gráfico de barras horizontal */}
      <div className="space-y-3">
        {Object.entries(distribution).map(([level, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={level} className="flex items-center">
              <div className="w-20 text-sm text-gray-600 font-medium">
                {labels[level]}
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 rounded-full h-4 relative">
                  <div 
                    className={`${colors[level]} h-4 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-right">
                <span className="text-sm font-medium text-gray-900">{count}</span>
                <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente para tabla de activos críticos
const CriticalAssetsTable = ({ assets, loading }) => {
  const getCriticalityColor = (level) => {
    const colors = {
      CRITICAL: 'bg-red-100 text-red-800',
      HIGH: 'bg-orange-100 text-orange-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800',
      VERY_LOW: 'bg-blue-100 text-blue-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activos Más Críticos</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Activos Más Críticos</h3>
          <Link 
            href="/dashboard/assets"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todos →
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criticidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Económico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets.map((asset) => (
              <tr key={asset._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                    <div className="text-sm text-gray-500">{asset.code}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {asset.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCriticalityColor(asset.criticality.level)}`}>
                      {asset.criticality.level}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {asset.criticality.score.toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(asset.economicValue || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/assets/${asset._id}`}
                      className="text-primary-600 hover:text-primary-700"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/dashboard/assets/edit/${asset._id}`}
                      className="text-gray-600 hover:text-gray-700"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { 
    assets, 
    summary, 
    loading, 
    error,
    fetchAssetsSummary 
  } = useAssets();

  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAssetsSummary();
  }, []);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al cargar el dashboard</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const welcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {welcomeMessage()}, {user?.profile?.firstName}
            </h1>
            <p className="text-gray-600">
              Resumen de activos y valoración MAGERIT de tu organización
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>
            
            <Link
              href="/dashboard/assets/create"
              className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Activo
            </Link>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total de Activos"
          value={summary?.totalAssets?.toLocaleString() || '0'}
          change="+12.5%"
          changeType="increase"
          icon={Package}
          description="Activos registrados en el sistema"
          color="blue"
        />
        
        <MetricCard
          title="Valor Económico Total"
          value={`${(summary?.totalEconomicValue || 0).toLocaleString()}`}
          change="+8.3%"
          changeType="increase"
          icon={DollarSign}
          description="Valor total de activos valorados"
          color="green"
        />
        
        <MetricCard
          title="Activos Críticos"
          value={summary?.criticalityDistribution?.CRITICAL || '0'}
          change="-2.1%"
          changeType="decrease"
          icon={AlertTriangle}
          description="Activos que requieren atención inmediata"
          color="red"
        />
        
        <MetricCard
          title="Cumplimiento MAGERIT"
          value={`${summary?.compliancePercentage || 0}%`}
          change="+15.2%"
          changeType="increase"
          icon={Shield}
          description="Activos correctamente valorados"
          color="purple"
        />
      </div>

      {/* Grid principal con gráficos y tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Distribución de criticidad */}
        <div className="lg:col-span-1">
          <CriticalityChart distribution={summary?.criticalityDistribution || {}} />
        </div>

        {/* Distribución por tipos MAGERIT */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Tipos MAGERIT</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(summary?.typeDistribution || {}).map(([type, count]) => {
                const typeInfo = {
                  'I': { name: 'Información', color: 'bg-blue-500', icon: Database },
                  'S': { name: 'Servicios', color: 'bg-green-500', icon: Activity },
                  'SW': { name: 'Software', color: 'bg-purple-500', icon: Package },
                  'HW': { name: 'Hardware', color: 'bg-red-500', icon: Database },
                  'COM': { name: 'Comunicaciones', color: 'bg-yellow-500', icon: Activity },
                  'SI': { name: 'Soportes Info', color: 'bg-indigo-500', icon: Database },
                  'AUX': { name: 'Auxiliar', color: 'bg-gray-500', icon: Package },
                  'L': { name: 'Instalaciones', color: 'bg-orange-500', icon: Database },
                  'P': { name: 'Personal', color: 'bg-pink-500', icon: Users }
                };
                
                const info = typeInfo[type] || { name: type, color: 'bg-gray-500', icon: Package };
                const Icon = info.icon;
                
                return (
                  <div key={type} className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <div className={`p-2 rounded-lg ${info.color} text-white mr-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{count}</p>
                      <p className="text-xs text-gray-500">{info.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de activos críticos */}
      <div className="mb-8">
        <CriticalAssetsTable 
          assets={summary?.topCriticalAssets || []} 
          loading={loading}
        />
      </div>

      {/* Sección de acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link 
          href="/dashboard/assets/create"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
              <Plus className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Crear Activo</h3>
              <p className="text-sm text-gray-500">Agregar nuevo activo MAGERIT</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/dashboard/assets/import"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
              <Download className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Importar Activos</h3>
              <p className="text-sm text-gray-500">Cargar desde Excel/CSV</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/dashboard/valuation"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Valoración</h3>
              <p className="text-sm text-gray-500">Aplicar metodología MAGERIT</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/dashboard/reports/executive"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Generar Reporte</h3>
              <p className="text-sm text-gray-500">Reporte ejecutivo</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Alertas y notificaciones recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Alertas Recientes</h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              3 nuevas
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Activo crítico sin valoración completa
                </p>
                <p className="text-sm text-red-600">
                  Servidor BD Principal (DB-001) requiere valoración MAGERIT
                </p>
                <p className="text-xs text-red-500 mt-1">Hace 2 horas</p>
              </div>
            </div>

            <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Dependencia circular detectada
                </p>
                <p className="text-sm text-yellow-600">
                  Revisar dependencias entre activos APP-001 y DB-002
                </p>
                <p className="text-xs text-yellow-500 mt-1">Hace 1 día</p>
              </div>
            </div>

            <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Database className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Importación completada
                </p>
                <p className="text-sm text-blue-600">
                  45 activos importados exitosamente desde Excel
                </p>
                <p className="text-xs text-blue-500 mt-1">Hace 3 días</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">María González</span> creó el activo 
                  <span className="font-medium"> "Servidor Web Backup"</span>
                </p>
                <p className="text-xs text-gray-500">Hace 1 hora</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Carlos Ruiz</span> actualizó la valoración de 
                  <span className="font-medium"> "Base de Datos Principal"</span>
                </p>
                <p className="text-xs text-gray-500">Hace 3 horas</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Download className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Ana López</span> exportó reporte MAGERIT
                </p>
                <p className="text-xs text-gray-500">Hace 6 horas</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-gray-900">
                  Sistema detectó <span className="font-medium">2 posibles duplicados</span>
                </p>
                <p className="text-xs text-gray-500">Hace 1 día</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link 
              href="/dashboard/activity"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Ver toda la actividad →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}