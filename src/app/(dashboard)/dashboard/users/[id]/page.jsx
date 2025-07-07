// src/app/(dashboard)/dashboard/users/[id]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronRight, Home, Users, User, ArrowLeft, Edit3, Trash2, 
  Mail, Phone, Building2, Calendar, Clock, Shield, ShieldCheck,
  Eye, UserCheck, UserX, Settings, Activity, AlertTriangle,
  CheckCircle, XCircle, Key, Smartphone
} from 'lucide-react';
import { usersAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

const UserDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  // Estado
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching user details for ID:', id);
      const response = await usersAPI.getUserById(id);
      
      if (response.data.status === 'success') {
        setUser(response.data.data.user);
        console.log('✅ User loaded:', response.data.data.user);
      }
    } catch (err) {
      console.error('❌ Error fetching user:', err);
      const errorMessage = err.response?.data?.message || 'Error al cargar usuario';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Alternar estado del usuario
  const toggleUserStatus = async () => {
    if (!user) return;
    
    try {
      setActionLoading('toggle');
      
      const response = await usersAPI.toggleUserStatus(user.id);
      
      if (response.data.status === 'success') {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        setUser(prev => ({ ...prev, status: newStatus }));
        toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'} exitosamente`);
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
    if (!user) return;
    
    try {
      setActionLoading('delete');
      
      const response = await usersAPI.deleteUser(user.id);
      
      if (response.data.status === 'success') {
        toast.success('Usuario eliminado exitosamente');
        router.push('/dashboard/users');
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar usuario';
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
      setShowDeleteModal(false);
    }
  };

  // Utilidades
  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin': return <Shield className="w-5 h-5 text-purple-600" />;
      case 'admin': return <ShieldCheck className="w-5 h-5 text-red-600" />;
      case 'analyst': return <Shield className="w-5 h-5 text-blue-600" />;
      case 'viewer': return <Eye className="w-5 h-5 text-gray-600" />;
      default: return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Administrador';
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Tabs disponibles
  const tabs = [
    { id: 'overview', label: 'Resumen', icon: User },
    { id: 'activity', label: 'Actividad', icon: Activity },
    { id: 'permissions', label: 'Permisos', icon: Settings },
    { id: 'security', label: 'Seguridad', icon: Key }
  ];

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
          <div className="bg-white rounded-lg border p-8">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar usuario</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={fetchUser}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
            <Link
              href="/dashboard/users"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver a Usuarios
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
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
              <Link 
                href="/dashboard/users" 
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <Users className="w-4 h-4" />
                Usuarios
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">
                {user.profile?.firstName} {user.profile?.lastName}
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con información del usuario */}
        <div className="bg-white rounded-lg border mb-6">
          <div className="p-6">
            {/* Botón volver */}
            <Link
              href="/dashboard/users"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Usuarios
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Información principal */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
                  {user.profile?.avatar ? (
                    <img 
                      src={user.profile.avatar} 
                      alt={`${user.profile.firstName} ${user.profile.lastName}`}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user.profile?.firstName, user.profile?.lastName)
                  )}
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.profile?.firstName} {user.profile?.lastName}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    {user.profile?.phone && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {user.profile.phone}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {getRoleLabel(user.role)}
                    </span>
                    
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {user.status === 'active' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/dashboard/users/${user.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </Link>
                
                <button
                  onClick={toggleUserStatus}
                  disabled={actionLoading === 'toggle'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    user.status === 'active'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  } disabled:opacity-50`}
                >
                  {actionLoading === 'toggle' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : user.status === 'active' ? (
                    <UserX className="w-4 h-4" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                  {user.status === 'active' ? 'Desactivar' : 'Activar'}
                </button>
                
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">Último Acceso</div>
                <div className="font-semibold text-gray-900">{formatDate(user.lastLogin)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Miembro Desde</div>
                <div className="font-semibold text-gray-900">{formatDate(user.createdAt)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Intentos Fallidos</div>
                <div className="font-semibold text-gray-900">{user.loginAttempts || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">2FA</div>
                <div className={`font-semibold ${user.twoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {user.twoFactorEnabled ? 'Habilitado' : 'Deshabilitado'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Resumen */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información Personal */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Nombre Completo</div>
                        <div className="font-medium text-gray-900">
                          {user.profile?.firstName} {user.profile?.lastName}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-medium text-gray-900">{user.email}</div>
                      </div>
                    </div>
                    
                    {user.profile?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Teléfono</div>
                          <div className="font-medium text-gray-900">{user.profile.phone}</div>
                        </div>
                      </div>
                    )}
                    
                    {user.profile?.department && (
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Departamento</div>
                          <div className="font-medium text-gray-900">{user.profile.department}</div>
                        </div>
                      </div>
                    )}
                    
                    {user.profile?.position && (
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Cargo</div>
                          <div className="font-medium text-gray-900">{user.profile.position}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información del Sistema */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Información del Sistema</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Fecha de Registro</div>
                        <div className="font-medium text-gray-900">{formatDate(user.createdAt)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Último Acceso</div>
                        <div className="font-medium text-gray-900">{formatDate(user.lastLogin)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getRoleIcon(user.role)}
                      <div>
                        <div className="text-sm text-gray-600">Rol del Sistema</div>
                        <div className="font-medium text-gray-900">{getRoleLabel(user.role)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {user.status === 'active' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <div className="text-sm text-gray-600">Estado</div>
                        <div className={`font-medium ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                          {user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Autenticación de 2 Factores</div>
                        <div className={`font-medium ${user.twoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
                          {user.twoFactorEnabled ? 'Habilitado' : 'Deshabilitado'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Actividad */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
                
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Historial de Actividad</h4>
                  <p className="text-gray-600 mb-4">
                    Esta funcionalidad se implementará en una próxima versión para mostrar:
                  </p>
                  <ul className="text-left text-gray-600 space-y-1 max-w-md mx-auto">
                    <li>• Inicios de sesión</li>
                    <li>• Acciones realizadas</li>
                    <li>• Cambios en el perfil</li>
                    <li>• Acceso a recursos</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab: Permisos */}
            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Permisos y Accesos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Permisos por rol */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      Permisos para {getRoleLabel(user.role)}
                    </h4>
                    
                    <div className="space-y-3">
                      {user.role === 'admin' && (
                        <>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Gestión completa de usuarios</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Administración de la organización</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Acceso completo a activos</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Gestión de riesgos y controles</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Generación de reportes</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Configuración del sistema</span>
                          </div>
                        </>
                      )}
                      
                      {user.role === 'analyst' && (
                        <>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Gestión de activos</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Análisis de riesgos</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Gestión de vulnerabilidades</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Creación de reportes</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Visualización de usuarios</span>
                          </div>
                        </>
                      )}
                      
                      {user.role === 'viewer' && (
                        <>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Visualización de dashboard</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Consulta de activos</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Visualización de riesgos</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Acceso a reportes</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Restricciones */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Restricciones</h4>
                    
                    <div className="space-y-3">
                      {user.role !== 'admin' && (
                        <>
                          <div className="flex items-center gap-2 text-gray-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm">No puede gestionar usuarios</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm">No puede modificar configuración</span>
                          </div>
                        </>
                      )}
                      
                      {user.role === 'viewer' && (
                        <>
                          <div className="flex items-center gap-2 text-gray-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm">No puede crear activos</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm">No puede modificar riesgos</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm">Solo lectura en reportes</span>
                          </div>
                        </>
                      )}
                      
                      {user.status === 'inactive' && (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">Usuario desactivado - Sin acceso</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Seguridad */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Configuración de Seguridad</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Estado de seguridad */}
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Estado de Seguridad</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Contraseña</span>
                        </div>
                        <span className="text-sm text-green-600 font-medium">Configurada</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Autenticación 2FA</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          user.twoFactorEnabled ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {user.twoFactorEnabled ? 'Habilitado' : 'Deshabilitado'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Intentos Fallidos</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          (user.loginAttempts || 0) > 3 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {user.loginAttempts || 0} / 5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de seguridad */}
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Acciones de Seguridad</h4>
                    
                    <div className="space-y-3">
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        Restablecer contraseña
                      </button>
                      
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        {user.twoFactorEnabled ? 'Deshabilitar' : 'Habilitar'} 2FA
                      </button>
                      
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        Resetear intentos fallidos
                      </button>
                      
                      <button className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                        Revocar todas las sesiones
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
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
                  {getInitials(user.profile?.firstName, user.profile?.lastName)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {user.profile?.firstName} {user.profile?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar este usuario? Se perderán todos sus datos y accesos al sistema.
            </p>
            
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading === 'delete'}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === 'delete' && (
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

export default UserDetailPage;