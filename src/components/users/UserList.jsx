// src/components/users/UserList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Filter, Download, Plus, MoreVertical, 
  Shield, ShieldCheck, ShieldAlert, Mail, Calendar,
  Edit3, Trash2, UserCheck, UserX, Eye, AlertTriangle,
  CheckCircle, XCircle, Clock, Phone, Building2
} from 'lucide-react';
import { usersAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

const UserList = () => {
  // Estado principal
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // UI States
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Cargar usuarios desde la API
  const fetchUsers = async (page = 1, limit = 25) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      };

      console.log('🔍 Fetching users with params:', params);
      const response = await usersAPI.getUsers(params);

      if (response.data.status === 'success') {
        const { users: userData, pagination } = response.data.data;
        setUsers(userData);
        setCurrentPage(pagination.page);
        setTotalPages(pagination.pages);
        setTotalUsers(pagination.total);
        
        console.log('✅ Users loaded successfully:', {
          count: userData.length,
          total: pagination.total,
          page: pagination.page
        });
      }
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      const errorMessage = err.response?.data?.message || 'Error al cargar usuarios';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas de usuarios
  const fetchStats = async () => {
    try {
      const response = await usersAPI.getUserStats();
      if (response.data.status === 'success') {
        setStats(response.data.data);
        console.log('📊 User stats loaded:', response.data.data);
      }
    } catch (err) {
      console.error('❌ Error fetching user stats:', err);
    }
  };

  // Cargar datos inicial
  useEffect(() => {
    fetchUsers(currentPage, itemsPerPage);
    fetchStats();
  }, [currentPage, itemsPerPage, roleFilter, statusFilter, searchTerm]);

  // Debounce para búsqueda
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        fetchUsers(1, itemsPerPage);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Alternar estado de usuario
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(userId);
      
      const response = await usersAPI.toggleUserStatus(userId);
      
      if (response.data.status === 'success') {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'} exitosamente`);
        
        // Actualizar lista local
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, status: newStatus }
              : user
          )
        );
        
        // Actualizar estadísticas
        fetchStats();
      }
    } catch (error) {
      console.error('❌ Error toggling user status:', error);
      const errorMessage = error.response?.data?.message || 'Error al cambiar estado del usuario';
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setActionLoading(userToDelete.id);
      
      const response = await usersAPI.deleteUser(userToDelete.id);
      
      if (response.data.status === 'success') {
        toast.success('Usuario eliminado exitosamente');
        
        // Actualizar lista
        await fetchUsers(currentPage, itemsPerPage);
        await fetchStats();
        
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar usuario';
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  // Selección múltiple
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  // Exportar usuarios
  const handleExport = (format) => {
    // TODO: Implementar exportación
    toast.success(`Exportando usuarios en formato ${format.toUpperCase()}`);
  };

  // Utilidades
  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin': return <ShieldAlert className="w-4 h-4 text-purple-600" />;
      case 'admin': return <ShieldCheck className="w-4 h-4 text-red-600" />;
      case 'analyst': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'viewer': return <Eye className="w-4 h-4 text-gray-600" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Administrador';
      case 'analyst': return 'Analista';
      case 'viewer': return 'Visualizador';
      default: return 'Sin rol';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'analyst': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'active' 
      ? <CheckCircle className="w-4 h-4 text-green-600" />
      : <XCircle className="w-4 h-4 text-red-600" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Filtros disponibles
  const roleOptions = [
    { value: 'all', label: 'Todos los roles' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Administrador' },
    { value: 'analyst', label: 'Analista' },
    { value: 'viewer', label: 'Visualizador' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' }
  ];

  const itemsPerPageOptions = [10, 25, 50, 100];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg border">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <div className="h-10 bg-gray-200 rounded w-80"></div>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
            <Users className="w-7 h-7 text-blue-600" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Administra usuarios, roles y permisos de la organización
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
            onClick={() => window.location.href = '/dashboard/users/create'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeUsers || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-red-600">{stats.adminUsers || 0}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Analistas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.analystUsers || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visualizadores</p>
                <p className="text-2xl font-bold text-gray-600">{stats.viewerUsers || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-gray-600" />
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
                placeholder="Buscar por nombre, email o departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {roleOptions.map(option => (
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
                Filtros
              </button>
            </div>
          </div>

          {/* Filtros adicionales */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Último acceso
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Todos</option>
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="never">Nunca</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Todos</option>
                  <option value="ti">Tecnología</option>
                  <option value="admin">Administración</option>
                  <option value="riesgos">Riesgos</option>
                  <option value="auditoria">Auditoría</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  2FA Habilitado
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Todos</option>
                  <option value="enabled">Habilitado</option>
                  <option value="disabled">Deshabilitado</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Acciones de selección múltiple */}
        {selectedUsers.length > 0 && (
          <div className="px-6 py-3 bg-blue-50 border-b flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedUsers.length} usuario(s) seleccionado(s)
            </span>
            <div className="flex items-center gap-2">
              <button className="text-sm text-blue-700 hover:text-blue-800 px-3 py-1 rounded">
                Activar
              </button>
              <button className="text-sm text-blue-700 hover:text-blue-800 px-3 py-1 rounded">
                Desactivar
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
                <h3 className="text-sm font-medium text-red-800">Error al cargar usuarios</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button 
                onClick={() => fetchUsers(currentPage, itemsPerPage)}
                className="ml-auto text-sm text-red-700 hover:text-red-800 font-medium"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Tabla de usuarios */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                        {user.profile?.avatar ? (
                          <img 
                            src={user.profile.avatar} 
                            alt={`${user.profile.firstName} ${user.profile.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          getInitials(user.profile?.firstName, user.profile?.lastName)
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.profile?.firstName} {user.profile?.lastName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        {user.profile?.phone && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.profile.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.status)}
                      <span className={`text-sm font-medium ${
                        user.status === 'active' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(user.lastLogin)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {user.profile?.department || 'Sin departamento'}
                    </div>
                    {user.profile?.position && (
                      <div className="text-xs text-gray-500">
                        {user.profile.position}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => window.location.href = `/dashboard/users/${user.id}`}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => window.location.href = `/dashboard/users/${user.id}/edit`}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar usuario"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => toggleUserStatus(user.id, user.status)}
                        disabled={actionLoading === user.id}
                        className={`transition-colors ${
                          user.status === 'active' 
                            ? 'text-gray-400 hover:text-red-600' 
                            : 'text-gray-400 hover:text-green-600'
                        } ${actionLoading === user.id ? 'opacity-50' : ''}`}
                        title={user.status === 'active' ? 'Desactivar usuario' : 'Activar usuario'}
                      >
                        {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteModal(true);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar usuario"
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
        {!loading && users.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                ? 'No se encontraron usuarios' 
                : 'No hay usuarios registrados'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros para encontrar usuarios.'
                : 'Comienza creando el primer usuario de tu organización.'
              }
            </p>
            {(!searchTerm && roleFilter === 'all' && statusFilter === 'all') && (
              <button
                onClick={() => window.location.href = '/dashboard/users/create'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Crear Primer Usuario
              </button>
            )}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalUsers)} de {totalUsers}
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
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Usuario</h3>
                <p className="text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                  {getInitials(userToDelete.profile?.firstName, userToDelete.profile?.lastName)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {userToDelete.profile?.firstName} {userToDelete.profile?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{userToDelete.email}</div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar este usuario? Se perderán todos sus datos y accesos al sistema.
            </p>
            
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading === userToDelete.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === userToDelete.id && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Eliminar Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;