'use client';

import { useState, useEffect } from 'react';
import { useVulnerabilities } from '@/hooks/useVulnerabilities';
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
  Bug,
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
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

// ===================================
// CONSTANTES Y CONFIGURACIONES
// ===================================

const VULNERABILITY_TYPES = [
  { value: 'TECHNICAL', label: 'Técnica', description: 'Fallas en sistemas o software' },
  { value: 'ORGANIZATIONAL', label: 'Organizacional', description: 'Procesos o políticas deficientes' },
  { value: 'PHYSICAL', label: 'Física', description: 'Seguridad física comprometida' },
  { value: 'HUMAN', label: 'Humana', description: 'Factor humano como vector' }
];

const SEVERITY_LEVELS = [
  { value: 'CRITICAL', label: 'Crítica', color: 'text-red-600', bgColor: 'bg-red-100' },
  { value: 'HIGH', label: 'Alta', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { value: 'MEDIUM', label: 'Media', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 'LOW', label: 'Baja', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { value: 'INFO', label: 'Informativa', color: 'text-gray-600', bgColor: 'bg-gray-100' }
];

const REMEDIATION_STATUSES = [
  { value: 'PENDING', label: 'Pendiente', color: 'text-yellow-600' },
  { value: 'IN_PROGRESS', label: 'En Progreso', color: 'text-blue-600' },
  { value: 'COMPLETED', label: 'Completada', color: 'text-green-600' },
  { value: 'VERIFIED', label: 'Verificada', color: 'text-purple-600' },
  { value: 'NOT_APPLICABLE', label: 'No Aplicable', color: 'text-gray-600' }
];

// ===================================
// FUNCIONES UTILITARIAS
// ===================================

const getSeverityColor = (severity) => {
  const colors = {
    'CRITICAL': 'text-red-600 bg-red-100',
    'HIGH': 'text-orange-600 bg-orange-100',
    'MEDIUM': 'text-yellow-600 bg-yellow-100',
    'LOW': 'text-blue-600 bg-blue-100',
    'INFO': 'text-gray-600 bg-gray-100'
  };
  return colors[severity] || 'text-gray-600 bg-gray-100';
};

const getSeverityColorCard = (severity) => {
  const colors = {
    'CRITICAL': 'bg-red-100 text-red-800 border-red-200',
    'HIGH': 'bg-orange-100 text-orange-800 border-orange-200',
    'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'LOW': 'bg-blue-100 text-blue-800 border-blue-200',
    'INFO': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getRemediationStatusColor = (status) => {
  const colors = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'IN_PROGRESS': 'bg-blue-100 text-blue-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'VERIFIED': 'bg-purple-100 text-purple-800',
    'NOT_APPLICABLE': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getRemediationStatusColorCard = (status) => {
  const colors = {
    'PENDING': 'text-yellow-600',
    'IN_PROGRESS': 'text-blue-600',
    'COMPLETED': 'text-green-600',
    'VERIFIED': 'text-purple-600',
    'NOT_APPLICABLE': 'text-gray-600'
  };
  return colors[status] || 'text-gray-600';
};

const getCVSSColor = (score) => {
  if (score >= 9.0) return 'text-red-600 font-bold';
  if (score >= 7.0) return 'text-orange-600 font-semibold';
  if (score >= 4.0) return 'text-yellow-600';
  return 'text-green-600';
};

// ===================================
// COMPONENTE: FILTROS AVANZADOS
// ===================================

const VulnerabilityFilters = ({ filters, onFiltersChange, isOpen, onClose }) => {
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
            {/* Tipo de Vulnerabilidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Vulnerabilidad
              </label>
              <div className="space-y-2">
                {VULNERABILITY_TYPES.map(type => (
                  <label key={type.value} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={filters.types?.includes(type.value) || false}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...(filters.types || []), type.value]
                          : (filters.types || []).filter(t => t !== type.value);
                        onFiltersChange({ ...filters, types: newTypes });
                      }}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-2">
                      <span className="text-sm font-medium text-gray-900">{type.label}</span>
                      <p className="text-xs text-gray-600">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Nivel de Severidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Severidad
              </label>
              <div className="space-y-2">
                {SEVERITY_LEVELS.map(level => (
                  <label key={level.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.severityLevels?.includes(level.value) || false}
                      onChange={(e) => {
                        const newLevels = e.target.checked
                          ? [...(filters.severityLevels || []), level.value]
                          : (filters.severityLevels || []).filter(l => l !== level.value);
                        onFiltersChange({ ...filters, severityLevels: newLevels });
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

            {/* Estado de Remediación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Remediación
              </label>
              <div className="space-y-2">
                {REMEDIATION_STATUSES.map(status => (
                  <label key={status.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.remediationStatuses?.includes(status.value) || false}
                      onChange={(e) => {
                        const newStatuses = e.target.checked
                          ? [...(filters.remediationStatuses || []), status.value]
                          : (filters.remediationStatuses || []).filter(s => s !== status.value);
                        onFiltersChange({ ...filters, remediationStatuses: newStatuses });
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className={`ml-2 text-sm ${status.color}`}>
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rango CVSS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rango de Score CVSS
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600">Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={filters.cvssMin || ''}
                    onChange={(e) => onFiltersChange({ ...filters, cvssMin: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Máximo</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={filters.cvssMax || ''}
                    onChange={(e) => onFiltersChange({ ...filters, cvssMax: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="10.0"
                  />
                </div>
              </div>
            </div>

            {/* Con CVE Asociado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVE Asociado
              </label>
              <select
                value={filters.hasCVE || ''}
                onChange={(e) => onFiltersChange({ ...filters, hasCVE: e.target.value || undefined })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Todas</option>
                <option value="yes">Con CVE asociado</option>
                <option value="no">Sin CVE asociado</option>
              </select>
            </div>

            {/* Fecha de Descubrimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Descubrimiento
              </label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600">Desde</label>
                  <input
                    type="date"
                    value={filters.discoveryDateFrom || ''}
                    onChange={(e) => onFiltersChange({ ...filters, discoveryDateFrom: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Hasta</label>
                  <input
                    type="date"
                    value={filters.discoveryDateTo || ''}
                    onChange={(e) => onFiltersChange({ ...filters, discoveryDateTo: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
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

// ===================================
// COMPONENTE: TARJETA DE VULNERABILIDAD
// ===================================

const VulnerabilityCard = ({ vulnerability, onEdit, onDelete, onView }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bug className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {vulnerability.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {vulnerability.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColorCard(vulnerability.severityLevel)}`}>
            {vulnerability.severityLevel}
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
          <p className="text-xs text-gray-500 uppercase tracking-wide">Tipo</p>
          <p className="text-sm font-medium text-gray-900">
            {vulnerability.type || 'No especificado'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Nivel de Vulnerabilidad</p>
          <p className="text-sm font-medium text-gray-900">
            {vulnerability.vulnerabilityLevel ? `${(vulnerability.vulnerabilityLevel * 100).toFixed(1)}%` : 'N/A'}
          </p>
        </div>
      </div>

      {/* CVE y CVSS Score */}
      <div className="mb-4">
        {vulnerability.cveDetails?.cveId ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">CVE Asociado</p>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {vulnerability.cveDetails.cveId}
                </span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            {vulnerability.cveDetails.cvssV3Score && (
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">CVSS Score</p>
                <p className={`text-sm font-medium ${getCVSSColor(vulnerability.cveDetails.cvssV3Score)}`}>
                  {vulnerability.cveDetails.cvssV3Score.toFixed(1)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Activo Afectado</p>
            <p className="text-sm text-gray-900">
              {vulnerability.asset?.name || 'Sin asignar'}
            </p>
          </div>
        )}
      </div>

      {/* Estado de remediación */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Estado de Remediación</p>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${getRemediationStatusColorCard(vulnerability.remediation?.status)}`}>
            {vulnerability.remediation?.status || 'PENDING'}
          </span>
          {vulnerability.remediation?.priority && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
              {vulnerability.remediation.priority}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(vulnerability.createdAt).toLocaleDateString('es-ES')}
          </span>
          {vulnerability.cveDetails?.cveId && (
            <span className="flex items-center text-green-600">
              <Zap className="w-3 h-3 mr-1" />
              CVE
            </span>
          )}
          {vulnerability.technicalAssessment?.verificationStatus === 'VERIFIED' && (
            <span className="flex items-center text-blue-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verificada
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(vulnerability)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(vulnerability)}
            className="p-1 text-gray-400 hover:text-yellow-600"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(vulnerability)}
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

// ===================================
// COMPONENTE: ESTADÍSTICAS RÁPIDAS
// ===================================

const VulnerabilityStats = ({ vulnerabilities, pagination }) => {
  const criticalAndHigh = vulnerabilities?.filter(v => ['CRITICAL', 'HIGH'].includes(v.severityLevel)).length || 0;
  const pending = vulnerabilities?.filter(v => v.remediation?.status === 'PENDING').length || 0;
  const withCVE = vulnerabilities?.filter(v => v.cveDetails?.cveId).length || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Bug className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Vulnerabilidades
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
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Críticas y Altas
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {criticalAndHigh}
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
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pendientes
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {pending}
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
                  {withCVE}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================================
// COMPONENTE: BREADCRUMB
// ===================================

const Breadcrumb = () => (
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
          <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
            Vulnerabilidades
          </span>
        </div>
      </li>
    </ol>
  </nav>
);

// ===================================
// COMPONENTE: HEADER
// ===================================

const Header = () => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Gestión de Vulnerabilidades</h1>
      <p className="mt-1 text-sm text-gray-600">
        Gestiona vulnerabilidades técnicas y organizacionales con correlación CVE automática
      </p>
    </div>
    <div className="mt-4 sm:mt-0 flex space-x-3">
      <Link
        href="/dashboard/vulnerabilities/create"
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nueva Vulnerabilidad
      </Link>
    </div>
  </div>
);

// ===================================
// COMPONENTE: CONTROLES DE BÚSQUEDA
// ===================================

const SearchAndControls = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onShowFilters,
  filters,
  onExport,
  onRefresh,
  loading,
  selectedVulnerabilities,
  onBulkDelete,
  onClearSelection
}) => (
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
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Buscar vulnerabilidades..."
            />
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center space-x-3">
          {/* Selector de vista */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1 rounded ${viewMode === 'table' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('cards')}
              className={`p-1 rounded ${viewMode === 'cards' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {/* Filtros */}
          <button
            onClick={onShowFilters}
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
              onChange={(e) => e.target.value && onExport(e.target.value)}
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
            onClick={onRefresh}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Acciones bulk */}
      {selectedVulnerabilities.length > 0 && (
        <div className="mt-4 flex items-center justify-between bg-blue-50 rounded-lg p-3">
          <span className="text-sm text-blue-700">
            {selectedVulnerabilities.length} vulnerabilidad(es) seleccionada(s)
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onBulkDelete}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Eliminar
            </button>
            <button
              onClick={onClearSelection}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

// ===================================
// COMPONENTE: VISTA DE TABLA
// ===================================

const VulnerabilityTable = ({
  vulnerabilities,
  selectedVulnerabilities,
  onToggleSelection,
  onToggleSelectAll,
  onView,
  onEdit,
  onDelete
}) => (
  <div className="bg-white shadow rounded-lg overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left">
            <input
              type="checkbox"
              checked={selectedVulnerabilities.length === vulnerabilities?.length && vulnerabilities?.length > 0}
              onChange={onToggleSelectAll}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <button className="flex items-center space-x-1 hover:text-gray-700">
              <span>Vulnerabilidad</span>
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Severidad
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            CVE / CVSS
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Activo
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Remediación
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {vulnerabilities?.map((vulnerability) => (
          <tr key={vulnerability._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                checked={selectedVulnerabilities.includes(vulnerability._id)}
                onChange={() => onToggleSelection(vulnerability._id)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </td>
            <td className="px-6 py-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Bug className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {vulnerability.name}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {vulnerability.description}
                  </p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                      {vulnerability.type || 'No especificado'}
                    </span>
                    {vulnerability.technicalAssessment?.verificationStatus === 'VERIFIED' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verificada
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(vulnerability.severityLevel)}`}>
                {vulnerability.severityLevel}
              </span>
              {vulnerability.vulnerabilityLevel && (
                <div className="text-xs text-gray-600 mt-1">
                  Nivel: {(vulnerability.vulnerabilityLevel * 100).toFixed(1)}%
                </div>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {vulnerability.cveDetails?.cveId ? (
                <div>
                  <div className="font-medium">{vulnerability.cveDetails.cveId}</div>
                  {vulnerability.cveDetails.cvssV3Score && (
                    <div className="text-xs text-gray-600">
                      CVSS: {vulnerability.cveDetails.cvssV3Score.toFixed(1)}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-gray-400">Sin CVE</span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {vulnerability.asset?.name || 'Sin asignar'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRemediationStatusColor(vulnerability.remediation?.status || 'PENDING')}`}>
                {vulnerability.remediation?.status || 'PENDING'}
              </span>
              {vulnerability.remediation?.priority && (
                <div className="text-xs text-gray-600 mt-1">
                  {vulnerability.remediation.priority}
                </div>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => onView(vulnerability)}
                  className="text-gray-400 hover:text-blue-600"
                  title="Ver detalle"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(vulnerability)}
                  className="text-gray-400 hover:text-yellow-600"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(vulnerability)}
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
  </div>
);

// ===================================
// COMPONENTE: PAGINACIÓN
// ===================================

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.total === 0) return null;

  return (
    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando{' '}
              <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span>
              {' '}a{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>
              {' '}de{' '}
              <span className="font-medium">{pagination.total}</span>
              {' '}resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {/* Números de página */}
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === pagination.page;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      isActive
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => onPageChange(pagination.page + 1)}
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
  );
};

// ===================================
// COMPONENTE: MODAL DE CONFIRMACIÓN
// ===================================

const DeleteConfirmationModal = ({ isOpen, vulnerability, onConfirm, onCancel }) => {
  if (!isOpen || !vulnerability) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onCancel}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Eliminar Vulnerabilidad
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    ¿Estás seguro de que deseas eliminar la vulnerabilidad "{vulnerability.name}"? 
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onConfirm}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Eliminar
            </button>
            <button
              onClick={onCancel}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================================
// COMPONENTE: ERROR STATE
// ===================================

const ErrorState = ({ error, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-md p-4">
    <div className="flex">
      <AlertCircle className="h-5 w-5 text-red-400" />
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">Error al cargar vulnerabilidades</h3>
        <p className="mt-1 text-sm text-red-700">{error}</p>
        <button
          onClick={onRetry}
          className="mt-2 text-sm text-red-600 hover:text-red-500"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  </div>
);

// ===================================
// COMPONENTE: LOADING STATE
// ===================================

const LoadingState = () => (
  <div className="bg-white shadow rounded-lg p-12">
    <div className="flex flex-col items-center justify-center">
      <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mb-4" />
      <p className="text-gray-600">Cargando vulnerabilidades...</p>
    </div>
  </div>
);

// ===================================
// COMPONENTE PRINCIPAL
// ===================================

export default function VulnerabilitiesPage() {
  // Estados principales
  const {
    vulnerabilities,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    searchVulnerabilities,
    exportVulnerabilities,
    refreshVulnerabilities,
    changePage,
    changeLimit
  } = useVulnerabilities();

  // Estados locales
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVulnerabilities, setSelectedVulnerabilities] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vulnerabilityToDelete, setVulnerabilityToDelete] = useState(null);

  // Effect para búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchVulnerabilities(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchVulnerabilities]);

  // Handlers
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleExport = async (format) => {
    try {
      await exportVulnerabilities(format, filters);
    } catch (error) {
      console.error('Error exporting vulnerabilities:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVulnerabilities.length === 0) return;
    
    try {
      console.log('Deleting vulnerabilities:', selectedVulnerabilities);
      setSelectedVulnerabilities([]);
    } catch (error) {
      console.error('Error deleting vulnerabilities:', error);
    }
  };

  const handleVulnerabilityView = (vulnerability) => {
    window.open(`/dashboard/vulnerabilities/${vulnerability._id}`, '_blank');
  };

  const handleVulnerabilityEdit = (vulnerability) => {
    window.location.href = `/dashboard/vulnerabilities/${vulnerability._id}/edit`;
  };

  const handleVulnerabilityDelete = (vulnerability) => {
    setVulnerabilityToDelete(vulnerability);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!vulnerabilityToDelete) return;
    
    try {
      console.log('Deleting vulnerability:', vulnerabilityToDelete._id);
      setShowDeleteModal(false);
      setVulnerabilityToDelete(null);
      refreshVulnerabilities();
    } catch (error) {
      console.error('Error deleting vulnerability:', error);
    }
  };

  const toggleVulnerabilitySelection = (vulnerabilityId) => {
    setSelectedVulnerabilities(prev => 
      prev.includes(vulnerabilityId) 
        ? prev.filter(id => id !== vulnerabilityId)
        : [...prev, vulnerabilityId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVulnerabilities.length === vulnerabilities?.length) {
      setSelectedVulnerabilities([]);
    } else {
      setSelectedVulnerabilities(vulnerabilities?.map(v => v._id) || []);
    }
  };

  // Render principal
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb />

        <div className="space-y-6">
          {/* Header */}
          <Header />

          {/* Estadísticas rápidas */}
          <VulnerabilityStats 
            vulnerabilities={vulnerabilities}
            pagination={pagination}
          />

          {/* Controles de búsqueda y filtros */}
          <SearchAndControls
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onShowFilters={() => setShowFilters(true)}
            filters={filters}
            onExport={handleExport}
            onRefresh={refreshVulnerabilities}
            loading={loading}
            selectedVulnerabilities={selectedVulnerabilities}
            onBulkDelete={handleBulkDelete}
            onClearSelection={() => setSelectedVulnerabilities([])}
          />

          {/* Contenido principal */}
          {error ? (
            <ErrorState error={error} onRetry={refreshVulnerabilities} />
          ) : loading ? (
            <LoadingState />
          ) : viewMode === 'cards' ? (
            /* Vista de tarjetas */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vulnerabilities?.map((vulnerability) => (
                <VulnerabilityCard
                  key={vulnerability._id}
                  vulnerability={vulnerability}
                  onView={handleVulnerabilityView}
                  onEdit={handleVulnerabilityEdit}
                  onDelete={handleVulnerabilityDelete}
                />
              ))}
            </div>
          ) : (
            /* Vista de tabla */
            <VulnerabilityTable
              vulnerabilities={vulnerabilities}
              selectedVulnerabilities={selectedVulnerabilities}
              onToggleSelection={toggleVulnerabilitySelection}
              onToggleSelectAll={toggleSelectAll}
              onView={handleVulnerabilityView}
              onEdit={handleVulnerabilityEdit}
              onDelete={handleVulnerabilityDelete}
            />
          )}

          {/* Paginación */}
          {vulnerabilities && vulnerabilities.length > 0 && (
            <Pagination 
              pagination={pagination}
              onPageChange={changePage}
            />
          )}
        </div>
      </div>

      {/* Modales */}
      <VulnerabilityFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        vulnerability={vulnerabilityToDelete}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setVulnerabilityToDelete(null);
        }}
      />
    </div>
  );
}