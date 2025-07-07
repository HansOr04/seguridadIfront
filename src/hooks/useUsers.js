// src/hooks/useUsers.js
import { useState, useCallback } from 'react';
import { usersAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

export const useUsers = () => {
  // Estado principal
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado de paginación
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Obtener lista de usuarios con filtros
  const fetchUsers = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 useUsers: Fetching users with params:', params);
      const response = await usersAPI.getUsers(params);

      if (response.data.status === 'success') {
        const { users: userData, pagination: paginationData } = response.data.data;
        
        setUsers(userData);
        setPagination(paginationData);
        
        console.log('✅ useUsers: Users loaded successfully:', {
          count: userData.length,
          total: paginationData.total,
          page: paginationData.page
        });
        
        return {
          users: userData,
          pagination: paginationData
        };
      }
    } catch (err) {
      console.error('❌ useUsers: Error fetching users:', err);
      const errorMessage = err.response?.data?.message || 'Error al cargar usuarios';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener usuario específico por ID
  const fetchUserById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 useUsers: Fetching user by ID:', id);
      const response = await usersAPI.getUserById(id);

      if (response.data.status === 'success') {
        const userData = response.data.data.user;
        setCurrentUser(userData);
        
        console.log('✅ useUsers: User loaded successfully:', userData);
        return userData;
      }
    } catch (err) {
      console.error('❌ useUsers: Error fetching user:', err);
      const errorMessage = err.response?.data?.message || 'Error al cargar usuario';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo usuario
  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('➕ useUsers: Creating user');
      const response = await usersAPI.createUser(userData);

      if (response.data.status === 'success') {
        const newUser = response.data.data.user;
        
        // Actualizar lista local si existe
        setUsers(prevUsers => [newUser, ...prevUsers]);
        
        // Actualizar estadísticas
        if (stats) {
          setStats(prevStats => ({
            ...prevStats,
            totalUsers: (prevStats.totalUsers || 0) + 1,
            [`${newUser.role}Users`]: (prevStats[`${newUser.role}Users`] || 0) + 1,
            ...(newUser.status === 'active' && {
              activeUsers: (prevStats.activeUsers || 0) + 1
            })
          }));
        }
        
        toast.success('Usuario creado exitosamente');
        console.log('✅ useUsers: User created successfully:', newUser);
        
        return newUser;
      }
    } catch (err) {
      console.error('❌ useUsers: Error creating user:', err);
      const errorMessage = err.response?.data?.message || 'Error al crear usuario';
      setError(errorMessage);
      
      // Si hay errores de validación específicos, propagarlos
      if (err.response?.data?.errors) {
        const validationError = new Error(errorMessage);
        validationError.validationErrors = err.response.data.errors;
        throw validationError;
      }
      
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [stats]);

  // Actualizar usuario existente
  const updateUser = useCallback(async (id, userData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('✏️ useUsers: Updating user:', id);
      const response = await usersAPI.updateUser(id, userData);

      if (response.data.status === 'success') {
        const updatedUser = response.data.data.user;
        
        // Actualizar lista local
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === id ? updatedUser : user
          )
        );
        
        // Actualizar usuario actual si coincide
        if (currentUser?.id === id) {
          setCurrentUser(updatedUser);
        }
        
        toast.success('Usuario actualizado exitosamente');
        console.log('✅ useUsers: User updated successfully:', updatedUser);
        
        return updatedUser;
      }
    } catch (err) {
      console.error('❌ useUsers: Error updating user:', err);
      const errorMessage = err.response?.data?.message || 'Error al actualizar usuario';
      setError(errorMessage);
      
      if (err.response?.data?.errors) {
        const validationError = new Error(errorMessage);
        validationError.validationErrors = err.response.data.errors;
        throw validationError;
      }
      
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Eliminar usuario
  const deleteUser = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🗑️ useUsers: Deleting user:', id);
      const response = await usersAPI.deleteUser(id);

      if (response.data.status === 'success') {
        // Remover de lista local
        const deletedUser = users.find(user => user.id === id);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
        
        // Actualizar estadísticas
        if (stats && deletedUser) {
          setStats(prevStats => ({
            ...prevStats,
            totalUsers: Math.max((prevStats.totalUsers || 0) - 1, 0),
            [`${deletedUser.role}Users`]: Math.max((prevStats[`${deletedUser.role}Users`] || 0) - 1, 0),
            ...(deletedUser.status === 'active' && {
              activeUsers: Math.max((prevStats.activeUsers || 0) - 1, 0)
            })
          }));
        }
        
        // Limpiar usuario actual si es el mismo
        if (currentUser?.id === id) {
          setCurrentUser(null);
        }
        
        toast.success('Usuario eliminado exitosamente');
        console.log('✅ useUsers: User deleted successfully');
        
        return true;
      }
    } catch (err) {
      console.error('❌ useUsers: Error deleting user:', err);
      const errorMessage = err.response?.data?.message || 'Error al eliminar usuario';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [users, stats, currentUser]);

  // Alternar estado del usuario (activo/inactivo)
  const toggleUserStatus = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 useUsers: Toggling user status:', id);
      const response = await usersAPI.toggleUserStatus(id);

      if (response.data.status === 'success') {
        const updatedUser = response.data.data.user;
        
        // Actualizar lista local
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === id ? { ...user, status: updatedUser.status } : user
          )
        );
        
        // Actualizar usuario actual si coincide
        if (currentUser?.id === id) {
          setCurrentUser(prev => ({ ...prev, status: updatedUser.status }));
        }
        
        // Actualizar estadísticas
        const user = users.find(u => u.id === id);
        if (stats && user) {
          setStats(prevStats => ({
            ...prevStats,
            activeUsers: updatedUser.status === 'active' 
              ? (prevStats.activeUsers || 0) + 1
              : Math.max((prevStats.activeUsers || 0) - 1, 0)
          }));
        }
        
        const statusText = updatedUser.status === 'active' ? 'activado' : 'desactivado';
        toast.success(`Usuario ${statusText} exitosamente`);
        console.log('✅ useUsers: User status toggled successfully:', updatedUser);
        
        return updatedUser;
      }
    } catch (err) {
      console.error('❌ useUsers: Error toggling user status:', err);
      const errorMessage = err.response?.data?.message || 'Error al cambiar estado del usuario';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [users, currentUser, stats]);

  // Actualizar perfil del usuario autenticado
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('✏️ useUsers: Updating profile');
      const response = await usersAPI.updateProfile(profileData);

      if (response.data.status === 'success') {
        const updatedUser = response.data.data.user;
        
        // Si el usuario actualizado está en la lista, actualizarlo
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === updatedUser.id ? updatedUser : user
          )
        );
        
        // Actualizar usuario actual si coincide
        if (currentUser?.id === updatedUser.id) {
          setCurrentUser(updatedUser);
        }
        
        toast.success('Perfil actualizado exitosamente');
        console.log('✅ useUsers: Profile updated successfully:', updatedUser);
        
        return updatedUser;
      }
    } catch (err) {
      console.error('❌ useUsers: Error updating profile:', err);
      const errorMessage = err.response?.data?.message || 'Error al actualizar perfil';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Obtener estadísticas de usuarios
  const fetchUserStats = useCallback(async () => {
    try {
      console.log('📊 useUsers: Fetching user statistics');
      const response = await usersAPI.getUserStats();

      if (response.data.status === 'success') {
        const statsData = response.data.data;
        setStats(statsData);
        
        console.log('✅ useUsers: User stats loaded successfully:', statsData);
        return statsData;
      }
    } catch (err) {
      console.error('❌ useUsers: Error fetching user stats:', err);
      // No mostrar error toast para estadísticas ya que no es crítico
      return null;
    }
  }, []);

  // Buscar usuarios con filtros específicos
  const searchUsers = useCallback(async (searchParams) => {
    const params = {
      page: 1,
      limit: pagination.limit,
      ...searchParams
    };
    
    return await fetchUsers(params);
  }, [fetchUsers, pagination.limit]);

  // Cambiar página
  const changePage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      const params = { page: newPage, limit: pagination.limit };
      return fetchUsers(params);
    }
  }, [fetchUsers, pagination]);

  // Cambiar items por página
  const changeItemsPerPage = useCallback((newLimit) => {
    const params = { page: 1, limit: newLimit };
    return fetchUsers(params);
  }, [fetchUsers]);

  // Acciones bulk para múltiples usuarios
  const bulkActions = {
    // Activar múltiples usuarios
    activate: useCallback(async (userIds) => {
      try {
        setLoading(true);
        const results = await Promise.allSettled(
          userIds.map(id => {
            const user = users.find(u => u.id === id);
            return user?.status === 'inactive' ? toggleUserStatus(id) : Promise.resolve(user);
          })
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        if (successful > 0) {
          toast.success(`${successful} usuario(s) activado(s) exitosamente`);
        }
        if (failed > 0) {
          toast.error(`Error al activar ${failed} usuario(s)`);
        }

        return { successful, failed };
      } catch (err) {
        console.error('❌ useUsers: Error in bulk activate:', err);
        toast.error('Error en activación masiva');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [users, toggleUserStatus]),

    // Desactivar múltiples usuarios
    deactivate: useCallback(async (userIds) => {
      try {
        setLoading(true);
        const results = await Promise.allSettled(
          userIds.map(id => {
            const user = users.find(u => u.id === id);
            return user?.status === 'active' ? toggleUserStatus(id) : Promise.resolve(user);
          })
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        if (successful > 0) {
          toast.success(`${successful} usuario(s) desactivado(s) exitosamente`);
        }
        if (failed > 0) {
          toast.error(`Error al desactivar ${failed} usuario(s)`);
        }

        return { successful, failed };
      } catch (err) {
        console.error('❌ useUsers: Error in bulk deactivate:', err);
        toast.error('Error en desactivación masiva');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [users, toggleUserStatus]),

    // Eliminar múltiples usuarios
    delete: useCallback(async (userIds) => {
      try {
        setLoading(true);
        const results = await Promise.allSettled(
          userIds.map(id => deleteUser(id))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        if (successful > 0) {
          toast.success(`${successful} usuario(s) eliminado(s) exitosamente`);
        }
        if (failed > 0) {
          toast.error(`Error al eliminar ${failed} usuario(s)`);
        }

        return { successful, failed };
      } catch (err) {
        console.error('❌ useUsers: Error in bulk delete:', err);
        toast.error('Error en eliminación masiva');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [deleteUser])
  };

  // Utilidades de filtrado y búsqueda
  const filterUsers = useCallback((filterCriteria) => {
    return users.filter(user => {
      const matchesRole = !filterCriteria.role || user.role === filterCriteria.role;
      const matchesStatus = !filterCriteria.status || user.status === filterCriteria.status;
      const matchesDepartment = !filterCriteria.department || user.profile?.department === filterCriteria.department;
      const matchesSearch = !filterCriteria.search || 
        user.email.toLowerCase().includes(filterCriteria.search.toLowerCase()) ||
        `${user.profile?.firstName} ${user.profile?.lastName}`.toLowerCase().includes(filterCriteria.search.toLowerCase());
      
      return matchesRole && matchesStatus && matchesDepartment && matchesSearch;
    });
  }, [users]);

  // Limpiar estado
  const clearState = useCallback(() => {
    setUsers([]);
    setCurrentUser(null);
    setStats(null);
    setError(null);
    setPagination({
      page: 1,
      limit: 25,
      total: 0,
      pages: 0,
      hasNext: false,
      hasPrev: false
    });
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    users,
    currentUser,
    stats,
    loading,
    error,
    pagination,
    
    // Acciones CRUD
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    updateProfile,
    
    // Estadísticas y búsqueda
    fetchUserStats,
    searchUsers,
    filterUsers,
    
    // Paginación
    changePage,
    changeItemsPerPage,
    
    // Acciones bulk
    bulkActions,
    
    // Utilidades
    clearState,
    clearError,
    
    // Setters directos (para casos especiales)
    setUsers,
    setCurrentUser,
    setError,
    setLoading
  };
};

export default useUsers;