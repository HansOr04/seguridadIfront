// src/components/controls/ControlsList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Search, Filter, Download, Plus, MoreVertical, 
  CheckCircle, XCircle, AlertTriangle, Edit3, Trash2, 
  Target, Activity, BarChart3, Eye, Clock, DollarSign,
  TrendingUp, TrendingDown, Minus, Settings
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

// API específica para controles
const controlsAPI = {
  getControls: (params = {}) => {
    console.log('🛡️ controlsAPI.getControls: Iniciando request con params:', params);
    return api.get('/controls', { params });
  },

  getControlById: (id) => {
    console.log(`🛡️ controlsAPI.getControlById: Obteniendo control ${id}`);
    return api.get(`/controls/${id}`);
  },

  createControl: (data) => {
    console.log('➕ controlsAPI.createControl: Creando control');
    return api.post('/controls', data);
  },

  updateControl: (id, data) => {
    console.log(`✏️ controlsAPI.updateControl: Actualizando control ${id}`);
    return api.put(`/controls/${id}`, data);
  },

  deleteControl: (id) => {
    console.log(`🗑️ controlsAPI.deleteControl: Eliminando control ${id}`);
    return api.delete(`/controls/${id}`);
  },

  getISO27002Catalog: () => {
    console.log('📋 controlsAPI.getISO27002Catalog: Obteniendo catálogo ISO 27002');
    return api.get('/controls/iso27002-catalog');
  },

  getStatistics: () => {
    console.log('📊 controlsAPI.getStatistics: Obteniendo estadísticas');
    return api.get('/controls/statistics');
  },

  addTestResult: (id, testData) => {
    console.log(`🧪 controlsAPI.addTestResult: Agregando resultado de prueba para ${id}`);
    return api.post(`/controls/${id}/test-results`, testData);
  }
};

const ControlsList = () => {
  // Estado principal
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [maturityFilter, setMaturityFilter] = useState('all');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalControls, setTotalControls] = useState(0);
  
  // UI States
  const [viewMode, setViewMode] = useState('table');
  const [selectedControls, setSelectedControls] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [controlToDelete, setControlToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Cargar controles desde la API
  const fetchControls = async (page = 1, limit = 25) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(maturityFilter !== 'all' && { maturityLevel: maturityFilter }),
        ...(searchTerm && { search: searchTerm })
      };

      console.log('🔍 Fetching controls with params:', params);
      const response = await controlsAPI.getControls(params);

      if (response.data.status === 'success') {
        const { controls: controlsData, pagination } = response.data.data;
        setControls(controlsData);
        setCurrentPage(pagination?.page || page);
        setTotalPages(pagination?.pages || Math.ceil(controlsData.length / limit));
        setTotalControls(pagination?.total || controlsData.length);
        
        console.log('✅ Controls loaded successfully:', {
          count: controlsData.length,
          total: pagination?.total || controlsData.length,
          page: pagination?.page || page
        });
      }
    } catch (err) {
      console.error('❌ Error fetching controls:', err);
      const errorMessage = err.response?.data?.message || 'Error al cargar controles';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas de controles
  const fetchStats = async () => {
    try {
      const response = await controlsAPI.getStatistics();
      if (response.data.status === 'success') {
        setStats(response.data.data);
        console.log('📊 Controls stats loaded:', response.data.data);
      }
    } catch (err) {
      console.error('❌ Error fetching controls stats:', err);
    }
  };

  // Cargar datos inicial
  useEffect(() => {
    fetchControls(currentPage, itemsPerPage);
    fetchStats();
  }, [currentPage, itemsPerPage, categoryFilter, typeFilter, statusFilter, maturityFilter, searchTerm]);

  // Debounce para búsqueda
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        fetchControls(1, itemsPerPage);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Eliminar control
  const handleDeleteControl = async () => {
    if (!controlToDelete) return;
    
    try {
      setActionLoading(controlToDelete.id);
      
      const response = await controlsAPI.deleteControl(controlToDelete.id);
      
      if (response.data.status === 'success') {
        toast.success('Control eliminado exitosamente');
        
        // Actualizar lista
        await fetchControls(currentPage, itemsPerPage);
        await fetchStats();
        
        setShowDeleteModal(false);
        setControlToDelete(null);
      }
    } catch (error) {
      console.error('❌ Error deleting control:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar control';
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  // Selección múltiple
  const handleSelectControl = (controlId) => {
    setSelectedControls(prev => 
      prev.includes(controlId)
        ? prev.filter(id => id !== controlId)
        : [...prev, controlId]
    );
  };

  const handleSelectAll = () => {
    if (selectedControls.length === controls.length) {
      setSelectedControls([]);
    } else {
      setSelectedControls(controls.map(control => control.id));
    }
  };

  // Exportar controles
  const handleExport = (format) => {
    toast.success(`Exportando controles en formato ${format.toUpperCase()}`);
  };

  // Utilidades
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'access_control': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'cryptography': return <Shield className="w-4 h-4 text-purple-600" />;
      case 'physical_security': return <Shield className="w-4 h-4 text-green-600" />;
      case 'network_security': return <Shield className="w-4 h-4 text-red-600" />;
      case 'incident_response': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'business_continuity': return <Activity className="w-4 h-4 text-indigo-600" />;
      case 'compliance': return <CheckCircle className="w-4 h-4 text-teal-600" />;
      default: return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'access_control': return 'Control de Acceso';
      case 'cryptography': return 'Criptografía';
      case 'physical_security': return 'Seguridad Física';
      case 'network_security': return 'Seguridad de Red';
      case 'incident_response': return 'Respuesta a Incidentes';
      case 'business_continuity': return 'Continuidad del Negocio';
      case 'compliance': return 'Cumplimiento';
      case 'data_protection': return 'Protección de Datos';
      case 'risk_management': return 'Gestión de Riesgos';
      default: return 'Otros';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'preventive': return <Shield className="w-4 h-4 text-green-600" />;
      case 'detective': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'corrective': return <Settings className="w-4 h-4 text-orange-600" />;
      case 'compensating': return <Target className="w-4 h-4 text-purple-600" />;
      default: return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'preventive': return 'Preventivo';
      case 'detective': return 'Detectivo';
      case 'corrective': return 'Correctivo';
      case 'compensating': return 'Compensatorio';
      default: return 'No definido';
    }
  };

  const getMaturityBadgeClass = (level) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 5: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMaturityLabel = (level) => {
    switch (level) {
      case 1: return 'Inicial';
      case 2: return 'Básico';
      case 3: return 'Definido';
      case 4: return 'Gestionado';
      case 5: return 'Optimizado';
      default: return 'Sin evaluar';
    }
  };

  const getEffectivenessColor = (effectiveness) => {
    if (effectiveness >= 90) return 'text-green-600';
    if (effectiveness >= 70) return 'text-blue-600';
    if (effectiveness >= 50) return 'text-yellow-600';
    if (effectiveness >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'implemented': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'implementing': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'planned': return <Target className="w-4 h-4 text-orange-600" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'implemented': return 'Implementado';
      case 'implementing': return 'En implementación';
      case 'planned': return 'Planificado';
      case 'inactive': return 'Inactivo';
      default: return 'Sin estado';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filtros disponibles
  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'access_control', label: 'Control de Acceso' },
    { value: 'cryptography', label: 'Criptografía' },
    { value: 'physical_security', label: 'Seguridad Física' },
    { value: 'network_security', label: 'Seguridad de Red' },
    { value: 'incident_response', label: 'Respuesta a Incidentes' },
    { value: 'business_continuity', label: 'Continuidad del Negocio' },
    { value: 'compliance', label: 'Cumplimiento' },
    { value: 'data_protection', label: 'Protección de Datos' },
    { value: 'risk_management', label: 'Gestión de Riesgos' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'preventive', label: 'Preventivo' },
    { value: 'detective', label: 'Detectivo' },
    { value: 'corrective', label: 'Correctivo' },
    { value: 'compensating', label: 'Compensatorio' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'implemented', label: 'Implementado' },
    { value: 'implementing', label: 'En implementación' },
    { value: 'planned', label: 'Planificado' },
    { value: 'inactive', label: 'Inactivo' }
  ];

  const maturityOptions = [
    { value: 'all', label: 'Todos los niveles' },
    { value: '1', label: 'Nivel 1 - Inicial' },
    { value: '2', label: 'Nivel 2 - Básico' },
    { value: '3', label: 'Nivel 3 - Definido' },
    { value: '4', label: 'Nivel 4 - Gestionado' },
    { value: '5', label: 'Nivel 5 - Optimizado' }
  ];

  const itemsPerPageOptions = [10, 25, 50, 100];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg border">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <div className="h-10 bg-gray-200 rounded w-80 animate-pulse"></div>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600" />
            Gestión de Controles
          </h1>
          <p className="text-gray-600 mt-1">
            Controles de seguridad basados en ISO 27002 y marcos internacionales
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          
          <button 
            onClick={() => window.location.href = '/dashboard/controls/create'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Control
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Controles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalControls || totalControls}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Implementados</p>
                <p className="text-2xl font-bold text-green-600">{stats.implementedControls || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efectividad Promedio</p>
                <p className="text-2xl font-bold text-blue-600">{stats.averageEffectiveness || 0}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Requieren Revisión</p>
                <p className="text-2xl font-bold text-orange-600">{stats.controlsNeedingReview || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Controles y Filtros */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, descripción o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Más Filtros
              </button>
            </div>
          </div>

          {/* Filtros adicionales */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel de Madurez
                </label>
                <select 
                  value={maturityFilter}
                  onChange={(e) => setMaturityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {maturityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Efectividad Mínima
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Todas</option>
                  <option value="90">90% o más</option>
                  <option value="70">70% o más</option>
                  <option value="50">50% o más</option>
                  <option value="30">30% o más</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Revisión
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Todas</option>
                  <option value="overdue">Vencidas</option>
                  <option value="this_month">Este mes</option>
                  <option value="next_month">Próximo mes</option>
                  <option value="this_quarter">Este trimestre</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Acciones de selección múltiple */}
        {selectedControls.length > 0 && (
          <div className="px-6 py-3 bg-blue-50 border-b flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedControls.length} control(es) seleccionado(s)
            </span>
            <div className="flex items-center gap-2">
              <button className="text-sm text-blue-700 hover:text-blue-800 px-3 py-1 rounded">
                Evaluar
              </button>
              <button className="text-sm text-blue-700 hover:text-blue-800 px-3 py-1 rounded">
                Exportar
              </button>
              <button className="text-sm text-red-700 hover:text-red-800 px-3 py-1 rounded">
                Eliminar
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 border-b">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error al cargar controles</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button 
                onClick={() => fetchControls(currentPage, itemsPerPage)}
                className="ml-auto text-sm text-red-700 hover:text-red-800 font-medium"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Tabla de controles */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedControls.length === controls.length && controls.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Control
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Madurez
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efectividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {controls.map((control) => (
                <tr key={control.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedControls.includes(control.id)}
                      onChange={() => handleSelectControl(control.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getCategoryIcon(control.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 truncate">
                          {control.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {control.description}
                        </div>
                        {control.code && (
                          <div className="text-xs text-blue-600 font-mono">
                            {control.code}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(control.category)}
                      <span className="text-sm text-gray-900">
                        {getCategoryLabel(control.category)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(control.type)}
                      <span className="text-sm text-gray-900">
                        {getTypeLabel(control.type)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(control.status)}
                      <span className="text-sm text-gray-900">
                        {getStatusLabel(control.status)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMaturityBadgeClass(control.maturityLevel)}`}>
                      Nivel {control.maturityLevel || 0} - {getMaturityLabel(control.maturityLevel)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${control.effectiveness || 0}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getEffectivenessColor(control.effectiveness)}`}>
                        {control.effectiveness || 0}%
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(control.implementationCost)}
                    </div>
                    {control.annualCost && (
                      <div className="text-xs text-gray-500">
                        {formatCurrency(control.annualCost)}/año
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => window.location.href = `/dashboard/controls/${control.id}`}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => window.location.href = `/dashboard/controls/${control.id}/edit`}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar control"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setControlToDelete(control);
                          setShowDeleteModal(true);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar control"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Estado vacío */}
        {!loading && controls.length === 0 && (
          <div className="p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all' 
                ? 'No se encontraron controles' 
                : 'No hay controles registrados'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros para encontrar controles.'
                : 'Comienza creando el primer control de seguridad.'
              }
            </p>
            {(!searchTerm && categoryFilter === 'all' && typeFilter === 'all' && statusFilter === 'all') && (
              <button
                onClick={() => window.location.href = '/dashboard/controls/create'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Crear Primer Control
              </button>
            )}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalControls)} de {totalControls}
              </span>
              
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>
                    {option} por página
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && controlToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Control</h3>
                <p className="text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  {getCategoryIcon(controlToDelete.category)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {controlToDelete.name}
                  </div>
                  <div className="text-sm text-gray-500">{controlToDelete.description}</div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar este control? Se perderán todos los datos asociados y evaluaciones.
            </p>
            
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setControlToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteControl}
                disabled={actionLoading === controlToDelete.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === controlToDelete.id && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Eliminar Control
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlsList;