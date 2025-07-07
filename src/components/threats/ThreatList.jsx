'use client';

import { useState, useEffect } from 'react';
import { useThreats } from '@/hooks/useThreats';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload,
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  X,
  FileText,
  RefreshCw,
  Grid,
  List,
  Calendar,
  Tag,
  Target,
  Zap
} from 'lucide-react';

// Componente de filtros avanzados
const ThreatFilters = ({ filters, onFiltersChange, isOpen, onClose }) => {
  const threatCategories = [
    { code: 'A', name: 'Ataques Deliberados', color: 'text-red-600' },
    { code: 'B', name: 'Errores y Fallos', color: 'text-orange-600' },
    { code: 'C', name: 'Desastres Naturales', color: 'text-blue-600' },
    { code: 'D', name: 'Fallos de Entorno', color: 'text-purple-600' },
    { code: 'E', name: 'Errores de Usuarios', color: 'text-yellow-600' }
  ];

  const probabilityLevels = [
    { value: 0.1, label: 'Muy Baja (0-0.2)', color: 'text-green-600' },
    { value: 0.3, label: 'Baja (0.2-0.4)', color: 'text-blue-600' },
    { value: 0.5, label: 'Media (0.4-0.6)', color: 'text-yellow-600' },
    { value: 0.7, label: 'Alta (0.6-0.8)', color: 'text-orange-600' },
    { value: 0.9, label: 'Muy Alta (0.8-1.0)', color: 'text-red-600' }
  ];

  const assetTypes = [
    { code: 'I', name: 'Información' },
    { code: 'S', name: 'Servicios' },
    { code: 'SW', name: 'Software' },
    { code: 'HW', name: 'Hardware' },
    { code: 'COM', name: 'Comunicaciones' },
    { code: 'SI', name: 'Soportes Info' },
    { code: 'AUX', name: 'Auxiliar' },
    { code: 'L', name: 'Instalaciones' },
    { code: 'P', name: 'Personal' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Filtros Avanzados</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Categorías MAGERIT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría MAGERIT
              </label>
              <div className="space-y-2">
                {threatCategories.map(category => (
                  <label key={category.code} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.categories?.includes(category.code) || false}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...(filters.categories || []), category.code]
                          : (filters.categories || []).filter(c => c !== category.code);
                        onFiltersChange({ ...filters, categories: newCategories });
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className={`ml-2 text-sm ${category.color}`}>
                      {category.code}. {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Nivel de Probabilidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Probabilidad
              </label>
              <div className="space-y-2">
                {probabilityLevels.map(level => (
                  <label key={level.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.probabilityLevels?.includes(level.value) || false}
                      onChange={(e) => {
                        const newLevels = e.target.checked
                          ? [...(filters.probabilityLevels || []), level.value]
                          : (filters.probabilityLevels || []).filter(l => l !== level.value);
                        onFiltersChange({ ...filters, probabilityLevels: newLevels });
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className={`ml-2 text-sm ${level.color}`}>
                      {level.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tipos de Activos Afectados */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Afecta a Activos
              </label>
              <div className="space-y-2">
                {assetTypes.map(type => (
                  <label key={type.code} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.assetTypes?.includes(type.code) || false}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...(filters.assetTypes || []), type.code]
                          : (filters.assetTypes || []).filter(t => t !== type.code);
                        onFiltersChange({ ...filters, assetTypes: newTypes });
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {type.code}. {type.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
                <option value="UNDER_REVIEW">En Revisión</option>
                <option value="DEPRECATED">Obsoleto</option>
              </select>
            </div>

            {/* Fuente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuente
              </label>
              <select
                value={filters.source || ''}
                onChange={(e) => onFiltersChange({ ...filters, source: e.target.value || undefined })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Todas las fuentes</option>
                <option value="MAGERIT">MAGERIT v3.0</option>
                <option value="CUSTOM">Personalizada</option>
                <option value="IMPORTED">Importada</option>
                <option value="CVE_DERIVED">Derivada de CVE</option>
              </select>
            </div>

            {/* Integración CVE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Integración CVE
              </label>
              <select
                value={filters.cveIntegration || ''}
                onChange={(e) => onFiltersChange({ ...filters, cveIntegration: e.target.value || undefined })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Todas</option>
                <option value="enabled">Con CVE Habilitado</option>
                <option value="disabled">Sin CVE</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => onFiltersChange({})}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de tarjeta de amenaza
const ThreatCard = ({ threat, onEdit, onDelete, onView }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'A': 'bg-red-100 text-red-800',
      'B': 'bg-orange-100 text-orange-800',
      'C': 'bg-blue-100 text-blue-800',
      'D': 'bg-purple-100 text-purple-800',
      'E': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 0.8) return 'text-red-600';
    if (probability >= 0.6) return 'text-orange-600';
    if (probability >= 0.4) return 'text-yellow-600';
    if (probability >= 0.2) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {threat.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {threat.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(threat.category)}`}>
            {threat.category}
          </span>
          <div className="relative">
            <button className="p-1 rounded-full hover:bg-gray-100">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Probabilidad</p>
          <p className={`text-sm font-medium ${getProbabilityColor(threat.baseProbability)}`}>
            {(threat.baseProbability * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Activos Afectados</p>
          <p className="text-sm text-gray-900">
            {threat.susceptibleAssetTypes?.length || 0} tipos
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dimensiones Afectadas</p>
        <div className="flex flex-wrap gap-1">
          {threat.affectedDimensions?.confidentiality && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
              Confidencialidad
            </span>
          )}
          {threat.affectedDimensions?.integrity && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
              Integridad
            </span>
          )}
          {threat.affectedDimensions?.availability && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">
              Disponibilidad
            </span>
          )}
          {threat.affectedDimensions?.authenticity && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
              Autenticidad
            </span>
          )}
          {threat.affectedDimensions?.traceability && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-800">
              Trazabilidad
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(threat.createdAt).toLocaleDateString('es-ES')}
          </span>
          {threat.isStandard && (
            <span className="flex items-center text-blue-600">
              <Shield className="w-3 h-3 mr-1" />
              MAGERIT
            </span>
          )}
          {threat.cveIntegration?.enabled && (
            <span className="flex items-center text-green-600">
              <Zap className="w-3 h-3 mr-1" />
              CVE
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(threat)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(threat)}
            className="p-1 text-gray-400 hover:text-yellow-600"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(threat)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principal ThreatList
export default function ThreatList() {
  const {
    threats,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    searchThreats,
    exportThreats,
    refreshThreats,
    changePage,
    changeLimit
  } = useThreats();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedThreats, setSelectedThreats] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [threatToDelete, setThreatToDelete] = useState(null);

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchThreats(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchThreats]);

  // Handlers
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleExport = async (format) => {
    try {
      await exportThreats(format, filters);
    } catch (error) {
      console.error('Error exporting threats:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedThreats.length === 0) return;
    
    try {
      // Implementar eliminación bulk
      console.log('Deleting threats:', selectedThreats);
      setSelectedThreats([]);
    } catch (error) {
      console.error('Error deleting threats:', error);
    }
  };

  const handleThreatView = (threat) => {
    window.open(`/dashboard/threats/${threat._id}`, '_blank');
  };

  const handleThreatEdit = (threat) => {
    window.location.href = `/dashboard/threats/${threat._id}/edit`;
  };

  const handleThreatDelete = (threat) => {
    setThreatToDelete(threat);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!threatToDelete) return;
    
    try {
      // Implementar eliminación
      console.log('Deleting threat:', threatToDelete._id);
      setShowDeleteModal(false);
      setThreatToDelete(null);
      refreshThreats();
    } catch (error) {
      console.error('Error deleting threat:', error);
    }
  };

  const toggleThreatSelection = (threatId) => {
    setSelectedThreats(prev => 
      prev.includes(threatId) 
        ? prev.filter(id => id !== threatId)
        : [...prev, threatId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedThreats.length === threats?.length) {
      setSelectedThreats([]);
    } else {
      setSelectedThreats(threats?.map(t => t._id) || []);
    }
  };

  const getCategoryName = (category) => {
    const categories = {
      'A': 'Ataques Deliberados',
      'B': 'Errores y Fallos', 
      'C': 'Desastres Naturales',
      'D': 'Fallos de Entorno',
      'E': 'Errores de Usuarios'
    };
    return categories[category] || category;
  };

  const getProbabilityLabel = (probability) => {
    if (probability >= 0.8) return 'Muy Alta';
    if (probability >= 0.6) return 'Alta';
    if (probability >= 0.4) return 'Media';
    if (probability >= 0.2) return 'Baja';
    return 'Muy Baja';
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 0.8) return 'text-red-600 bg-red-100';
    if (probability >= 0.6) return 'text-orange-600 bg-orange-100';
    if (probability >= 0.4) return 'text-yellow-600 bg-yellow-100';
    if (probability >= 0.2) return 'text-blue-600 bg-blue-100';
    return 'text-green-600 bg-green-100';
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error al cargar amenazas</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={refreshThreats}
              className="mt-2 text-sm text-red-600 hover:text-red-500"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Amenazas</h1>
          <p className="mt-1 text-sm text-gray-600">
            Catálogo MAGERIT v3.0 y amenazas personalizadas
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            href="/dashboard/threats/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Amenaza
          </Link>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Amenazas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pagination?.total || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    MAGERIT Estándar
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {threats?.filter(t => t.isStandard).length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Alta Probabilidad
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {threats?.filter(t => t.baseProbability >= 0.6).length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Con CVE
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {threats?.filter(t => t.cveIntegration?.enabled).length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Búsqueda */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Buscar amenazas..."
                />
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center space-x-3">
              {/* Selector de vista */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1 rounded ${viewMode === 'table' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1 rounded ${viewMode === 'cards' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              {/* Filtros */}
              <button
                onClick={() => setShowFilters(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {Object.keys(filters).length > 0 && (
                  <span className="ml-1 bg-primary-100 text-primary-800 text-xs rounded-full px-2 py-0.5">
                    {Object.keys(filters).length}
                  </span>
                )}
              </button>

              {/* Exportar */}
              <div className="relative">
                <select
                  onChange={(e) => e.target.value && handleExport(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  defaultValue=""
                >
                  <option value="" disabled>Exportar</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
                <Download className="w-4 h-4 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>

              {/* Refrescar */}
              <button
                onClick={refreshThreats}
                disabled={loading}
                className="p-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Acciones bulk */}
          {selectedThreats.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 rounded-lg p-3">
              <span className="text-sm text-blue-700">
                {selectedThreats.length} amenaza(s) seleccionada(s)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </button>
                <button
                  onClick={() => setSelectedThreats([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de amenazas */}
      {loading ? (
        <div className="bg-white shadow rounded-lg p-12">
          <div className="flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mb-4" />
            <p className="text-gray-600">Cargando amenazas...</p>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* Vista de tarjetas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {threats?.map((threat) => (
            <ThreatCard
              key={threat._id}
              threat={threat}
              onView={handleThreatView}
              onEdit={handleThreatEdit}
              onDelete={handleThreatDelete}
            />
          ))}
        </div>
      ) : (
        /* Vista de tabla */
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedThreats.length === threats?.length && threats?.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button className="flex items-center space-x-1 hover:text-gray-700">
                    <span>Amenaza</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probabilidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activos Afectados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {threats?.map((threat) => (
                <tr key={threat._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedThreats.includes(threat._id)}
                      onChange={() => toggleThreatSelection(threat._id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {threat.name}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {threat.description}
                        </p>
                        <div className="mt-1 flex items-center space-x-2">
                          {threat.isStandard && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                              <Shield className="w-3 h-3 mr-1" />
                              MAGERIT
                            </span>
                          )}
                          {threat.cveIntegration?.enabled && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                              <Zap className="w-3 h-3 mr-1" />
                              CVE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {threat.category}. {getCategoryName(threat.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProbabilityColor(threat.baseProbability)}`}>
                      {(threat.baseProbability * 100).toFixed(1)}% ({getProbabilityLabel(threat.baseProbability)})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {threat.susceptibleAssetTypes?.length || 0} tipos
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      threat.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      threat.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                      threat.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {threat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleThreatView(threat)}
                        className="text-gray-400 hover:text-blue-600"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleThreatEdit(threat)}
                        className="text-gray-400 hover:text-yellow-600"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleThreatDelete(threat)}
                        className="text-gray-400 hover:text-red-600"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          {threats && threats.length > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium">
                        {((pagination.page - 1) * pagination.limit) + 1}
                      </span>{' '}
                      a{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      de{' '}
                      <span className="font-medium">{pagination.total}</span>{' '}
                      resultados
                    </p>
                    <select
                      value={pagination.limit}
                      onChange={(e) => changeLimit(parseInt(e.target.value))}
                      className="border border-gray-300 rounded-md text-sm"
                    >
                      <option value={10}>10 por página</option>
                      <option value={25}>25 por página</option>
                      <option value={50}>50 por página</option>
                      <option value={100}>100 por página</option>
                    </select>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => changePage(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {/* Números de página */}
                      {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                        const pageNum = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
                        if (pageNum <= pagination.pages) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => changePage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNum === pagination.page
                                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => changePage(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estado vacío */}
      {!loading && threats?.length === 0 && (
        <div className="bg-white shadow rounded-lg p-12">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay amenazas</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || Object.keys(filters).length > 0
                ? 'No se encontraron amenazas con los filtros aplicados.'
                : 'Comienza creando una nueva amenaza.'}
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/threats/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Amenaza
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && threatToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                Eliminar Amenaza
              </h3>
              
              <p className="text-sm text-gray-600 text-center mb-6">
                ¿Estás seguro de que quieres eliminar la amenaza "{threatToDelete.name}"? 
                Esta acción no se puede deshacer.
              </p>
              
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de filtros */}
      <ThreatFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </div>
  );
}