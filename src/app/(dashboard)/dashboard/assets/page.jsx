'use client';

import { useState, useEffect } from 'react';
import { useAssets } from '@/hooks/useAssets';
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
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  FileText,
  Copy,
  RefreshCw,
  BarChart3,
  Shield,
  Users,
  Calendar
} from 'lucide-react';

// Componente para filtros avanzados
const FiltersPanel = ({ filters, onFiltersChange, isOpen, onClose }) => {
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

  const criticalityLevels = [
    { code: 'CRITICAL', name: 'Crítico', color: 'text-red-600' },
    { code: 'HIGH', name: 'Alto', color: 'text-orange-600' },
    { code: 'MEDIUM', name: 'Medio', color: 'text-yellow-600' },
    { code: 'LOW', name: 'Bajo', color: 'text-green-600' },
    { code: 'VERY_LOW', name: 'Muy Bajo', color: 'text-blue-600' }
  ];

  const statusOptions = [
    { code: 'ACTIVE', name: 'Activo', color: 'text-green-600' },
    { code: 'INACTIVE', name: 'Inactivo', color: 'text-gray-600' },
    { code: 'MAINTENANCE', name: 'Mantenimiento', color: 'text-yellow-600' },
    { code: 'RETIRED', name: 'Retirado', color: 'text-red-600' },
    { code: 'PLANNED', name: 'Planificado', color: 'text-blue-600' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filtros Avanzados</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Filtro por tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Activo
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos los tipos</option>
                {assetTypes.map(type => (
                  <option key={type.code} value={type.code}>
                    {type.code} - {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por criticidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Criticidad
              </label>
              <select
                value={filters.criticality || ''}
                onChange={(e) => onFiltersChange({ ...filters, criticality: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todas las criticidades</option>
                {criticalityLevels.map(level => (
                  <option key={level.code} value={level.code}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos los estados</option>
                {statusOptions.map(status => (
                  <option key={status.code} value={status.code}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rango de valor económico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Económico (USD)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={filters.minValue || ''}
                  onChange={(e) => onFiltersChange({ ...filters, minValue: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  placeholder="Máximo"
                  value={filters.maxValue || ''}
                  onChange={(e) => onFiltersChange({ ...filters, maxValue: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Solo activos sin valorar */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.unvalued || false}
                  onChange={(e) => onFiltersChange({ ...filters, unvalued: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Solo activos sin valorar
                </span>
              </label>
            </div>

            {/* Solo activos con dependencias */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.withDependencies || false}
                  onChange={(e) => onFiltersChange({ ...filters, withDependencies: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Solo activos con dependencias
                </span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => onFiltersChange({})}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para confirmar eliminación
const DeleteConfirmationModal = ({ isOpen, asset, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onCancel}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Eliminar Activo
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que deseas eliminar el activo{' '}
                  <span className="font-medium">"{asset?.name}"</span>?
                  Esta acción no se puede deshacer y también eliminará todas las valoraciones,
                  riesgos y dependencias asociadas.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin -ml-1 mr-3 h-4 w-4" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para la tabla de activos
const AssetsTable = ({ assets, loading, onSort, sortBy, sortOrder, onAction }) => {
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

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
      RETIRED: 'bg-red-100 text-red-800',
      PLANNED: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      ACTIVE: CheckCircle,
      INACTIVE: X,
      MAINTENANCE: Clock,
      RETIRED: Trash2,
      PLANNED: Package
    };
    return icons[status] || Package;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-500 hover:text-gray-700"
    >
      <span>{children}</span>
      <ArrowUpDown className="h-4 w-4" />
    </button>
  );

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 border-t border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="name">Activo</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="type">Tipo</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="criticality.score">Criticidad</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="economicValue">Valor Económico</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Propietario
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {assets.map((asset) => {
            const StatusIcon = getStatusIcon(asset.status);
            return (
              <tr key={asset._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                      <div className="text-sm text-gray-500">{asset.code}</div>
                    </div>
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
                  {asset.economicValue ? formatCurrency(asset.economicValue) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {asset.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{asset.owner?.name}</div>
                    <div className="text-gray-500">{asset.owner?.department}</div>
                  </div>
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
                    <button
                      onClick={() => onAction('delete', asset)}
                      className="text-red-600 hover:text-red-700"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onAction('more', asset)}
                      className="text-gray-600 hover:text-gray-700"
                      title="Más opciones"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Componente de paginación
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startItem}</span> a{' '}
            <span className="font-medium">{endItem}</span> de{' '}
            <span className="font-medium">{totalItems}</span> resultados
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Páginas */}
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === currentPage;
              
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      isCurrentPage
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return (
                  <span
                    key={page}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// Componente de estadísticas rápidas
const AssetsStats = ({ stats = {} }) => {
  const statCards = [
    {
      title: 'Total de Activos',
      value: stats.total || 0,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Activos Críticos',
      value: stats.critical || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Sin Valorar',
      value: stats.unvalued || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Valor Total',
      value: stats.totalValue ? new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact'
      }).format(stats.totalValue) : '$0',
      icon: BarChart3,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className={`text-lg font-medium ${stat.textColor}`}>
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Componente principal
export default function AssetsPage() {
  const {
    assets,
    pagination,
    loading,
    error,
    fetchAssets,
    deleteAsset,
    stats
  } = useAssets();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadAssets();
  }, [searchTerm, filters, sortBy, sortOrder, pagination.currentPage]);

  const loadAssets = () => {
    const params = {
      page: pagination.currentPage || 1,
      limit: 25,
      search: searchTerm,
      sortBy,
      sortOrder,
      ...filters
    };
    fetchAssets(params);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    if (pagination.currentPage !== 1) {
      // This would be handled by the pagination hook
    }
  };

  const handleAction = (action, asset) => {
    switch (action) {
      case 'delete':
        setAssetToDelete(asset);
        setDeleteModalOpen(true);
        break;
      case 'duplicate':
        // Handle duplicate action
        console.log('More options for asset:', asset);
        break;
      default:
        break;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;
    
    setDeleteLoading(true);
    try {
      await deleteAsset(assetToDelete._id);
      setDeleteModalOpen(false);
      setAssetToDelete(null);
      // Reload assets after deletion
      loadAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setAssetToDelete(null);
  };

  const handlePageChange = (page) => {
    // This would be handled by the pagination functionality
    // For now, just log it
    console.log('Changing to page:', page);
  };

  const handleExport = () => {
    // Handle export functionality
    console.log('Exporting assets...');
  };

  const handleBulkImport = () => {
    // Handle bulk import
    console.log('Opening bulk import...');
  };

  const handleRefresh = () => {
    loadAssets();
  };

  // Clear search with delay (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAssets();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al cargar los activos
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleRefresh}
                    className="bg-red-100 px-2 py-1 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Activos</h1>
              <p className="mt-1 text-sm text-gray-500">
                Administra el inventario de activos de información según metodología MAGERIT
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </button>
              <button
                onClick={handleBulkImport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <Link
                href="/dashboard/assets/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Activo
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <AssetsStats stats={stats} />

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="flex-1 min-w-0">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar activos por nombre, código o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Filters Button */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {Object.keys(filters).length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {Object.keys(filters).length}
                    </span>
                  )}
                </button>

                {/* Items per page selector */}
                <select
                  value={pagination.limit || 25}
                  onChange={(e) => {
                    // Handle items per page change
                    console.log('Items per page:', e.target.value);
                  }}
                  className="border-gray-300 rounded-md shadow-sm text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </select>
              </div>
            </div>

            {/* Active filters display */}
            {Object.keys(filters).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {key}: {value}
                      <button
                        onClick={() => {
                          const newFilters = { ...filters };
                          delete newFilters[key];
                          handleFiltersChange(newFilters);
                        }}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-primary-400 hover:bg-primary-200 hover:text-primary-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
                <button
                  onClick={() => handleFiltersChange({})}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  Limpiar todo
                  <X className="ml-1 h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Assets Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {assets && assets.length > 0 ? (
            <>
              <AssetsTable
                assets={assets}
                loading={loading}
                onSort={handleSort}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onAction={handleAction}
              />
              
              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : loading ? (
            <div className="text-center py-12">
              <RefreshCw className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Cargando activos...</h3>
              <p className="mt-1 text-sm text-gray-500">Por favor espera mientras cargamos los datos.</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay activos</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || Object.keys(filters).length > 0
                  ? 'No se encontraron activos que coincidan con los filtros aplicados.'
                  : 'Comienza creando tu primer activo de información.'}
              </p>
              <div className="mt-6">
                {searchTerm || Object.keys(filters).length > 0 ? (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      handleFiltersChange({});
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </button>
                ) : (
                  <Link
                    href="/dashboard/assets/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primer activo
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Additional Actions */}
        {assets && assets.length > 0 && (
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Adicionales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/dashboard/assets/valuation"
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Valoración Masiva</h4>
                  <p className="text-sm text-gray-500">Valorar múltiples activos según MAGERIT</p>
                </div>
              </Link>

              <Link
                href="/dashboard/assets/dependencies"
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Gestión Dependencias</h4>
                  <p className="text-sm text-gray-500">Configurar relaciones entre activos</p>
                </div>
              </Link>

              <Link
                href="/dashboard/reports/assets"
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Reportes</h4>
                  <p className="text-sm text-gray-500">Generar reportes de inventario</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <FiltersPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        asset={assetToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />
    </div>
  );
}