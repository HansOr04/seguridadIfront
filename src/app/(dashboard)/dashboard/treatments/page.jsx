// src/app/(dashboard)/dashboard/treatments/page.jsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Home, Target, Search, Filter, Download, Plus, 
  MoreVertical, CheckCircle, XCircle, Clock, AlertTriangle, 
  Edit3, Trash2, Eye, TrendingUp, TrendingDown, DollarSign,
  BarChart3, Shield, Activity
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

// API específica para tratamientos
const treatmentsAPI = {
  getTreatments: (params = {}) => {
    console.log('🎯 treatmentsAPI.getTreatments: Iniciando request con params:', params);
    return api.get('/treatments', { params });
  },

  getTreatmentById: (id) => {
    console.log(`🎯 treatmentsAPI.getTreatmentById: Obteniendo tratamiento ${id}`);
    return api.get(`/treatments/${id}`);
  },

  createTreatment: (data) => {
    console.log('➕ treatmentsAPI.createTreatment: Creando tratamiento');
    return api.post('/treatments', data);
  },

  updateTreatment: (id, data) => {
    console.log(`✏️ treatmentsAPI.updateTreatment: Actualizando tratamiento ${id}`);
    return api.put(`/treatments/${id}`, data);
  },

  deleteTreatment: (id) => {
    console.log(`🗑️ treatmentsAPI.deleteTreatment: Eliminando tratamiento ${id}`);
    return api.delete(`/treatments/${id}`);
  },

  approveTreatment: (id) => {
    console.log(`✅ treatmentsAPI.approveTreatment: Aprobando tratamiento ${id}`);
    return api.post(`/treatments/${id}/approve`);
  },

  getCostBenefitAnalysis: (id) => {
    console.log(`💰 treatmentsAPI.getCostBenefitAnalysis: Análisis costo-beneficio ${id}`);
    return api.get(`/treatments/${id}/cost-benefit`);
  },

  getStatistics: () => {
    console.log('📊 treatmentsAPI.getStatistics: Obteniendo estadísticas');
    return api.get('/treatments/statistics');
  }
};

const TreatmentsPage = () => {
  // Estado principal
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTreatments, setTotalTreatments] = useState(0);
  
  // UI States
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Cargar tratamientos desde la API
  const fetchTreatments = async (page = 1, limit = 25) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      };

      console.log('🔍 Fetching treatments with params:', params);
      const response = await treatmentsAPI.getTreatments(params);

      if (response.data.status === 'success') {
        const { treatments: treatmentsData, pagination } = response.data.data;
        setTreatments(treatmentsData);
        setCurrentPage(pagination?.page || page);
        setTotalPages(pagination?.pages || Math.ceil(treatmentsData.length / limit));
        setTotalTreatments(pagination?.total || treatmentsData.length);
        
        console.log('✅ Treatments loaded successfully:', {
          count: treatmentsData.length,
          total: pagination?.total || treatmentsData.length,
          page: pagination?.page || page
        });
      }
    } catch (err) {
      console.error('❌ Error fetching treatments:', err);
      const errorMessage = err.response?.data?.message || 'Error al cargar tratamientos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas de tratamientos
  const fetchStats = async () => {
    try {
      const response = await treatmentsAPI.getStatistics();
      if (response.data.status === 'success') {
        setStats(response.data.data);
        console.log('📊 Treatments stats loaded:', response.data.data);
      }
    } catch (err) {
      console.error('❌ Error fetching treatments stats:', err);
    }
  };

  // Cargar datos inicial
  useEffect(() => {
    fetchTreatments(currentPage, itemsPerPage);
    fetchStats();
  }, [currentPage, itemsPerPage, typeFilter, priorityFilter, statusFilter, searchTerm]);

  // Debounce para búsqueda
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        fetchTreatments(1, itemsPerPage);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Aprobar tratamiento
  const handleApproveTreatment = async (treatmentId) => {
    try {
      setActionLoading(treatmentId);
      
      const response = await treatmentsAPI.approveTreatment(treatmentId);
      
      if (response.data.status === 'success') {
        toast.success('Tratamiento aprobado exitosamente');
        
        // Actualizar lista local
        setTreatments(prev => 
          prev.map(treatment => 
            treatment.id === treatmentId 
              ? { ...treatment, status: 'approved', approvedAt: new Date().toISOString() }
              : treatment
          )
        );
        
        // Actualizar estadísticas
        fetchStats();
      }
    } catch (error) {
      console.error('❌ Error approving treatment:', error);
      const errorMessage = error.response?.data?.message || 'Error al aprobar tratamiento';
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  // Eliminar tratamiento
  const handleDeleteTreatment = async () => {
    if (!treatmentToDelete) return;
    
    try {
      setActionLoading(treatmentToDelete.id);
      
      const response = await treatmentsAPI.deleteTreatment(treatmentToDelete.id);
      
      if (response.data.status === 'success') {
        toast.success('Tratamiento eliminado exitosamente');
        
        // Actualizar lista
        await fetchTreatments(currentPage, itemsPerPage);
        await fetchStats();
        
        setShowDeleteModal(false);
        setTreatmentToDelete(null);
      }
    } catch (error) {
      console.error('❌ Error deleting treatment:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar tratamiento';
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  // Utilidades
  const getTypeIcon = (type) => {
    switch (type) {
      case 'accept': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'mitigate': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'avoid': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'transfer': return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default: return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'accept': return 'Aceptar';
      case 'mitigate': return 'Mitigar';
      case 'avoid': return 'Evitar';
      case 'transfer': return 'Transferir';
      default: return 'No definido';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin prioridad';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <Edit3 className="w-4 h-4 text-gray-600" />;
      case 'pending_approval': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'implementing': return <Activity className="w-4 h-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'pending_approval': return 'Pendiente de Aprobación';
      case 'approved': return 'Aprobado';
      case 'implementing': return 'En Implementación';
      case 'completed': return 'Completado';
      case 'rejected': return 'Rechazado';
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

  const calculateROI = (benefit, cost) => {
    if (!cost || cost === 0) return 0;
    return ((benefit - cost) / cost * 100).toFixed(1);
  };

  // Filtros disponibles
  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'accept', label: 'Aceptar' },
    { value: 'mitigate', label: 'Mitigar' },
    { value: 'avoid', label: 'Evitar' },
    { value: 'transfer', label: 'Transferir' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'Todas las prioridades' },
    { value: 'critical', label: 'Crítica' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Media' },
    { value: 'low', label: 'Baja' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'draft', label: 'Borrador' },
    { value: 'pending_approval', label: 'Pendiente de Aprobación' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'implementing', label: 'En Implementación' },
    { value: 'completed', label: 'Completado' },
    { value: 'rejected', label: 'Rechazado' }
  ];

  const itemsPerPageOptions = [10, 25, 50, 100];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center">
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <nav className="flex items-center space-x-2 text-sm">
              <Link 
                href="/dashboard" 
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium flex items-center gap-1">
                <Target className="w-4 h-4" />
                Tratamientos
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-7 h-7 text-blue-600" />
                Gestión de Tratamientos
              </h1>
              <p className="text-gray-600 mt-1">
                Estrategias de tratamiento de riesgos y planes de implementación
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => toast.success('Exportando tratamientos')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              
              <button 
                onClick={() => window.location.href = '/dashboard/treatments/create'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo Tratamiento
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tratamientos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTreatments || totalTreatments}</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aprobados</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approvedTreatments || 0}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ROI Promedio</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.averageROI || 0}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inversión Total</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalInvestment)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-600" />
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
                    placeholder="Buscar por nombre, descripción o riesgo asociado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filtros */}
                <div className="flex items-center gap-3">
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
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorityOptions.map(option => (
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
            </div>

            {/* Error State */}
            {error && (
              <div className="p-6 border-b">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error al cargar tratamientos</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                  <button 
                    onClick={() => fetchTreatments(currentPage, itemsPerPage)}
                    className="ml-auto text-sm text-red-700 hover:text-red-800 font-medium"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {/* Tabla de tratamientos */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tratamiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Costo/Beneficio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ROI
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {treatments.map((treatment) => (
                    <tr key={treatment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            calculateROI(treatment.expectedBenefit, treatment.implementationCost) > 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {calculateROI(treatment.expectedBenefit, treatment.implementationCost)}%
                          </span>
                          {calculateROI(treatment.expectedBenefit, treatment.implementationCost) > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => window.location.href = `/dashboard/treatments/${treatment.id}`}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {treatment.status === 'pending_approval' && (
                            <button
                              onClick={() => handleApproveTreatment(treatment.id)}
                              disabled={actionLoading === treatment.id}
                              className="text-gray-400 hover:text-green-600 transition-colors"
                              title="Aprobar tratamiento"
                            >
                              {actionLoading === treatment.id ? (
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          
                          <button
                            onClick={() => window.location.href = `/dashboard/treatments/${treatment.id}/edit`}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Editar tratamiento"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setTreatmentToDelete(treatment);
                              setShowDeleteModal(true);
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar tratamiento"
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
            {!loading && treatments.length === 0 && (
              <div className="p-12 text-center">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || typeFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all' 
                    ? 'No se encontraron tratamientos' 
                    : 'No hay tratamientos registrados'
                  }
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || typeFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
                    ? 'Intenta ajustar los filtros para encontrar tratamientos.'
                    : 'Comienza creando el primer tratamiento de riesgo.'
                  }
                </p>
                {(!searchTerm && typeFilter === 'all' && priorityFilter === 'all' && statusFilter === 'all') && (
                  <button
                    onClick={() => window.location.href = '/dashboard/treatments/create'}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Primer Tratamiento
                  </button>
                )}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalTreatments)} de {totalTreatments}
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
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && treatmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Tratamiento</h3>
                <p className="text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  {getTypeIcon(treatmentToDelete.type)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {treatmentToDelete.name}
                  </div>
                  <div className="text-sm text-gray-500">{treatmentToDelete.description}</div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar este tratamiento? Se perderán todos los datos asociados y el historial de implementación.
            </p>
            
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTreatmentToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTreatment}
                disabled={actionLoading === treatmentToDelete.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === treatmentToDelete.id && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Eliminar Tratamiento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentsPage;