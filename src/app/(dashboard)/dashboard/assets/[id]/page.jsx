'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssets } from '@/hooks/useAssets';
import { useRisks } from '@/hooks/useRisks';
import { useCVE } from '@/hooks/useCVE';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Download,
  Share2,
  MoreVertical,
  Package,
  Shield,
  AlertTriangle,
  Activity,
  BarChart3,
  Users,
  Calendar,
  MapPin,
  Tag,
  ExternalLink,
  FileText,
  Bug,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  DollarSign,
  Gauge,
  Network,
  Database
} from 'lucide-react';

// Componente de valoración visual
const ValuationRadar = ({ valuation }) => {
  const dimensions = [
    { key: 'confidentiality', label: 'Confidencialidad', value: valuation?.confidentiality || 0, color: 'text-blue-600' },
    { key: 'integrity', label: 'Integridad', value: valuation?.integrity || 0, color: 'text-green-600' },
    { key: 'availability', label: 'Disponibilidad', value: valuation?.availability || 0, color: 'text-yellow-600' },
    { key: 'authenticity', label: 'Autenticidad', value: valuation?.authenticity || 0, color: 'text-purple-600' },
    { key: 'traceability', label: 'Trazabilidad', value: valuation?.traceability || 0, color: 'text-indigo-600' }
  ];

  const getValueColor = (value) => {
    if (value >= 8) return 'bg-red-500';
    if (value >= 6) return 'bg-orange-500';
    if (value >= 4) return 'bg-yellow-500';
    if (value >= 2) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Valoración MAGERIT</h3>
      <div className="space-y-4">
        {dimensions.map((dimension) => (
          <div key={dimension.key} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${dimension.color}`}>
                {dimension.label}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getValueColor(dimension.value)}`}
                  style={{ width: `${(dimension.value / 10) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-gray-900 w-8 text-right">
                {dimension.value}/10
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Criticidad calculada */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Criticidad Total</span>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-red-600">
              {Math.max(...dimensions.map(d => d.value)).toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">(Máxima dimensión)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de métricas de riesgo
const RiskMetrics = ({ assetId, risks }) => {
  const riskCounts = {
    total: risks?.length || 0,
    critical: risks?.filter(r => r.level === 'CRITICAL').length || 0,
    high: risks?.filter(r => r.level === 'HIGH').length || 0,
    medium: risks?.filter(r => r.level === 'MEDIUM').length || 0,
    low: risks?.filter(r => r.level === 'LOW').length || 0
  };

  const averageRisk = risks?.length > 0 
    ? risks.reduce((sum, risk) => sum + (risk.adjustedRisk || 0), 0) / risks.length 
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Métricas de Riesgo</h3>
        <Link 
          href={`/dashboard/risks?assetId=${assetId}`}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Ver todos →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{riskCounts.total}</div>
          <div className="text-xs text-gray-500">Total Riesgos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{averageRisk.toFixed(2)}</div>
          <div className="text-xs text-gray-500">Riesgo Promedio</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Críticos</span>
          </div>
          <span className="text-sm font-medium">{riskCounts.critical}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Altos</span>
          </div>
          <span className="text-sm font-medium">{riskCounts.high}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Medios</span>
          </div>
          <span className="text-sm font-medium">{riskCounts.medium}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Bajos</span>
          </div>
          <span className="text-sm font-medium">{riskCounts.low}</span>
        </div>
      </div>
    </div>
  );
};

// Componente de vulnerabilidades CVE
const CVEVulnerabilities = ({ assetId }) => {
  const { cves, loading } = useCVE();
  const [assetCVEs, setAssetCVEs] = useState([]);

  useEffect(() => {
    if (cves && assetId) {
      // Filtrar CVEs relacionados con este activo
      const relatedCVEs = cves.filter(cve => 
        cve.organizationalImpact?.some(impact => 
          impact.affectedAssets?.includes(assetId)
        )
      );
      setAssetCVEs(relatedCVEs.slice(0, 5)); // Mostrar solo los 5 más recientes
    }
  }, [cves, assetId]);

  const getSeverityColor = (severity) => {
    const colors = {
      'CRITICAL': 'text-red-600 bg-red-100',
      'HIGH': 'text-orange-600 bg-orange-100',
      'MEDIUM': 'text-yellow-600 bg-yellow-100',
      'LOW': 'text-blue-600 bg-blue-100'
    };
    return colors[severity] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vulnerabilidades CVE</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Vulnerabilidades CVE</h3>
        <Link 
          href={`/dashboard/cve?assetId=${assetId}`}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Ver todas →
        </Link>
      </div>

      {assetCVEs.length > 0 ? (
        <div className="space-y-3">
          {assetCVEs.map((cve) => (
            <div key={cve.cveId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bug className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{cve.cveId}</div>
                  <div className="text-xs text-gray-600 line-clamp-1">
                    {cve.description?.substring(0, 60)}...
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(cve.cvssV3?.baseSeverity)}`}>
                  {cve.cvssV3?.baseScore?.toFixed(1)}
                </span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Bug className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">No hay CVEs asociados a este activo</p>
        </div>
      )}
    </div>
  );
};

// Componente principal
export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id;
  
  const { getAssetById, deleteAsset, loading: assetLoading } = useAssets();
  const { getRisksByAsset } = useRisks();
  
  const [asset, setAsset] = useState(null);
  const [risks, setRisks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssetData = async () => {
      if (!assetId) return;
      
      try {
        setLoading(true);
        
        // Cargar datos del activo
        const assetData = await getAssetById(assetId);
        setAsset(assetData);
        
        // Cargar riesgos asociados
        const riskData = await getRisksByAsset(assetId);
        setRisks(riskData || []);
        
      } catch (error) {
        console.error('Error loading asset data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssetData();
  }, [assetId, getAssetById, getRisksByAsset]);

  const handleDelete = async () => {
    if (!asset) return;
    
    try {
      await deleteAsset(asset._id);
      router.push('/dashboard/assets');
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Error al eliminar el activo: ' + error.message);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      'I': Database,
      'S': Activity,
      'SW': Package,
      'HW': Gauge,
      'COM': Network,
      'SI': FileText,
      'AUX': Tag,
      'L': MapPin,
      'P': Users
    };
    const IconComponent = icons[type] || Package;
    return <IconComponent className="w-6 h-6" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      'I': 'bg-blue-100 text-blue-600',
      'S': 'bg-green-100 text-green-600',
      'SW': 'bg-purple-100 text-purple-600',
      'HW': 'bg-orange-100 text-orange-600',
      'COM': 'bg-indigo-100 text-indigo-600',
      'SI': 'bg-gray-100 text-gray-600',
      'AUX': 'bg-pink-100 text-pink-600',
      'L': 'bg-yellow-100 text-yellow-600',
      'P': 'bg-red-100 text-red-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const getTypeName = (type) => {
    const names = {
      'I': 'Información',
      'S': 'Servicios',
      'SW': 'Software',
      'HW': 'Hardware',
      'COM': 'Comunicaciones',
      'SI': 'Soportes de Información',
      'AUX': 'Equipamiento Auxiliar',
      'L': 'Instalaciones',
      'P': 'Personal'
    };
    return names[type] || 'Desconocido';
  };

  const getCriticalityLevel = (valuation) => {
    if (!valuation) return { level: 'UNKNOWN', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    
    const maxValue = Math.max(
      valuation.confidentiality || 0,
      valuation.integrity || 0,
      valuation.availability || 0,
      valuation.authenticity || 0,
      valuation.traceability || 0
    );
    
    if (maxValue >= 9) return { level: 'CRÍTICO', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (maxValue >= 7) return { level: 'ALTO', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (maxValue >= 5) return { level: 'MEDIO', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (maxValue >= 3) return { level: 'BAJO', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    return { level: 'MUY BAJO', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  if (loading || assetLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Activo no encontrado</h1>
          <p className="text-gray-600 mb-4">El activo solicitado no existe o no tienes permisos para verlo.</p>
          <Link
            href="/dashboard/assets"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Activos
          </Link>
        </div>
      </div>
    );
  }

  const criticality = getCriticalityLevel(asset.valuation);
  const tabs = [
    { id: 'overview', name: 'Resumen', icon: Info },
    { id: 'valuation', name: 'Valoración', icon: BarChart3 },
    { id: 'risks', name: 'Riesgos', icon: AlertTriangle },
    { id: 'vulnerabilities', name: 'Vulnerabilidades', icon: Bug },
    { id: 'dependencies', name: 'Dependencias', icon: Network },
    { id: 'history', name: 'Historial', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link
                  href="/dashboard/assets"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  Activos
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 truncate">
                  {asset.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${getTypeColor(asset.type)}`}>
                  {getTypeIcon(asset.type)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">
                      Código: <span className="font-medium">{asset.code}</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      Tipo: <span className="font-medium">{getTypeName(asset.type)}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${criticality.color} ${criticality.bgColor}`}>
                      {criticality.level}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="p-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                </button>
                <Link
                  href={`/dashboard/assets/${asset._id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Riesgos</p>
                    <p className="text-sm text-gray-600">{risks.length} identificados</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Valor Económico</p>
                    <p className="text-sm text-gray-600">
                      ${asset.economicValue?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Propietario</p>
                    <p className="text-sm text-gray-600">{asset.owner?.name || 'Sin asignar'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Última Actualización</p>
                    <p className="text-sm text-gray-600">
                      {new Date(asset.updatedAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Descripción */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Descripción</h3>
                  <p className="text-gray-700">
                    {asset.description || 'Sin descripción disponible.'}
                  </p>
                </div>

                {/* Información técnica */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información Técnica</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Subtipo</dt>
                      <dd className="text-sm text-gray-900">{asset.subtype || 'No especificado'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estado</dt>
                      <dd className="text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          asset.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          asset.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {asset.status}
                        </span>
                      </dd>
                    </div>
                    {asset.metadata?.vendor && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Fabricante</dt>
                        <dd className="text-sm text-gray-900">{asset.metadata.vendor}</dd>
                      </div>
                    )}
                    {asset.metadata?.model && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Modelo</dt>
                        <dd className="text-sm text-gray-900">{asset.metadata.model}</dd>
                      </div>
                    )}
                    {asset.metadata?.serialNumber && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Número de Serie</dt>
                        <dd className="text-sm text-gray-900">{asset.metadata.serialNumber}</dd>
                      </div>
                    )}
                    {asset.location && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
                        <dd className="text-sm text-gray-900">
                          {[asset.location.building, asset.location.floor, asset.location.room].filter(Boolean).join(', ')}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Etiquetas */}
                {asset.metadata?.tags && asset.metadata.tags.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Etiquetas</h3>
                    <div className="flex flex-wrap gap-2">
                      {asset.metadata.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'valuation' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Valoración Detallada MAGERIT</h3>
                  <Link
                    href={`/dashboard/assets/${asset._id}/valuation`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Editar valoración →
                  </Link>
                </div>

                {asset.valuation ? (
                  <div className="space-y-6">
                    {/* Gráfico de radar simulado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">Dimensiones de Seguridad</h4>
                        <div className="space-y-4">
                          {[
                            { key: 'confidentiality', label: 'Confidencialidad', value: asset.valuation.confidentiality, color: 'blue' },
                            { key: 'integrity', label: 'Integridad', value: asset.valuation.integrity, color: 'green' },
                            { key: 'availability', label: 'Disponibilidad', value: asset.valuation.availability, color: 'yellow' },
                            { key: 'authenticity', label: 'Autenticidad', value: asset.valuation.authenticity, color: 'purple' },
                            { key: 'traceability', label: 'Trazabilidad', value: asset.valuation.traceability, color: 'indigo' }
                          ].map((dimension) => (
                            <div key={dimension.key} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">{dimension.label}</span>
                              <div className="flex items-center space-x-3">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full bg-${dimension.color}-500`}
                                    style={{ width: `${(dimension.value / 10) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold text-gray-900 w-8">
                                  {dimension.value}/10
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">Cálculos Derivados</h4>
                        <dl className="space-y-3">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Criticidad Máxima:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {Math.max(
                                asset.valuation.confidentiality || 0,
                                asset.valuation.integrity || 0,
                                asset.valuation.availability || 0,
                                asset.valuation.authenticity || 0,
                                asset.valuation.traceability || 0
                              )}/10
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Promedio General:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {(
                                ((asset.valuation.confidentiality || 0) +
                                 (asset.valuation.integrity || 0) +
                                 (asset.valuation.availability || 0) +
                                 (asset.valuation.authenticity || 0) +
                                 (asset.valuation.traceability || 0)) / 5
                              ).toFixed(1)}/10
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Factor Sectorial:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {asset.sectoralFactor || 1.0}x
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Criticidad Ajustada:</dt>
                            <dd className="text-sm font-medium text-red-600">
                              {(Math.max(
                                asset.valuation.confidentiality || 0,
                                asset.valuation.integrity || 0,
                                asset.valuation.availability || 0,
                                asset.valuation.authenticity || 0,
                                asset.valuation.traceability || 0
                              ) * (asset.sectoralFactor || 1.0)).toFixed(1)}/10
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    {/* Justificación */}
                    {asset.valuation.justification && (
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-md font-medium text-gray-900 mb-2">Justificación</h4>
                        <p className="text-sm text-gray-700">{asset.valuation.justification}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Sin valoración</h4>
                    <p className="text-gray-600 mb-4">Este activo aún no ha sido valorado según MAGERIT.</p>
                    <Link
                      href={`/dashboard/assets/${asset._id}/valuation`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Valorar Activo
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'risks' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Riesgos Asociados</h3>
                  <Link
                    href={`/dashboard/risks/calculator?assetId=${asset._id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Calcular Riesgo
                  </Link>
                </div>

                {risks.length > 0 ? (
                  <div className="space-y-4">
                    {risks.map((risk) => (
                      <div key={risk._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{risk.name || 'Riesgo sin nombre'}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            risk.level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                            risk.level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                            risk.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {risk.level}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Amenaza:</span> {risk.threat?.name || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Vulnerabilidad:</span> {risk.vulnerability?.name || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Riesgo Ajustado:</span> {(risk.adjustedRisk * 100).toFixed(1)}%
                          </div>
                          <div>
                            <span className="font-medium">Impacto Económico:</span> ${risk.economicImpact?.toLocaleString() || 'N/A'}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center space-x-3">
                          <Link
                            href={`/dashboard/risks/${risk._id}`}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            Ver detalle →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Sin riesgos calculados</h4>
                    <p className="text-gray-600 mb-4">No se han calculado riesgos para este activo.</p>
                    <Link
                      href={`/dashboard/risks/calculator?assetId=${asset._id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Calcular Primer Riesgo
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vulnerabilities' && (
              <CVEVulnerabilities assetId={asset._id} />
            )}

            {activeTab === 'dependencies' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dependencias</h3>
                <div className="text-center py-12">
                  <Network className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Funcionalidad en desarrollo</h4>
                  <p className="text-gray-600">El mapa de dependencias estará disponible próximamente.</p>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Cambios</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 pb-4 border-b border-gray-200">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Edit className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Activo creado</p>
                      <p className="text-sm text-gray-600">
                        {new Date(asset.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  {asset.updatedAt !== asset.createdAt && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Última actualización</p>
                        <p className="text-sm text-gray-600">
                          {new Date(asset.updatedAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ValuationRadar valuation={asset.valuation} />
            <RiskMetrics assetId={asset._id} risks={risks} />
            <CVEVulnerabilities assetId={asset._id} />
          </div>
        </div>

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
              
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                  Eliminar Activo
                </h3>
                
                <p className="text-sm text-gray-600 text-center mb-6">
                  ¿Estás seguro de que quieres eliminar el activo "{asset.name}"? 
                  Esta acción eliminará también todos los riesgos y dependencias asociadas. Esta acción no se puede deshacer.
                </p>
                
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                  >
                    Eliminar Permanentemente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}