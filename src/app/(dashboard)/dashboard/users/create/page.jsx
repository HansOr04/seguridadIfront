// src/app/(dashboard)/dashboard/users/create/page.jsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, Home, Users, UserPlus, ArrowLeft, Save, 
  Eye, EyeOff, Mail, User, Phone, Building2, Shield,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { usersAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

const CreateUserPage = () => {
  const router = useRouter();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      department: '',
      position: ''
    },
    role: 'viewer'
  });
  
  // Estado de UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Opciones de roles
  const roleOptions = [
    { 
      value: 'admin', 
      label: 'Administrador',
      description: 'Acceso completo al sistema y gestión de usuarios',
      icon: <Shield className="w-5 h-5 text-red-600" />
    },
    { 
      value: 'analyst', 
      label: 'Analista',
      description: 'Gestión de riesgos, activos y análisis avanzados',
      icon: <Shield className="w-5 h-5 text-blue-600" />
    },
    { 
      value: 'viewer', 
      label: 'Visualizador',
      description: 'Solo lectura de reportes y dashboard',
      icon: <Eye className="w-5 h-5 text-gray-600" />
    }
  ];

  // Opciones de departamentos
  const departmentOptions = [
    'Tecnología',
    'Administración',
    'Riesgos',
    'Auditoría',
    'Finanzas',
    'Recursos Humanos',
    'Legal',
    'Operaciones',
    'Otro'
  ];

  // Validar fortaleza de contraseña
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Calcular fortaleza de contraseña
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Limpiar errores al modificar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    // Contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (passwordStrength < 60) {
      newErrors.password = 'La contraseña debe ser más fuerte';
    }

    // Confirmar contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Nombre
    if (!formData.profile.firstName.trim()) {
      newErrors['profile.firstName'] = 'El nombre es requerido';
    }

    // Apellido
    if (!formData.profile.lastName.trim()) {
      newErrors['profile.lastName'] = 'El apellido es requerido';
    }

    // Teléfono (opcional pero con formato)
    if (formData.profile.phone && !/^(\+593|0)?[0-9]{9,10}$/.test(formData.profile.phone.replace(/\s/g, ''))) {
      newErrors['profile.phone'] = 'Formato de teléfono inválido (ej: +593 99 123 4567)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    
    try {
      // Preparar datos para la API
      const userData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: formData.role,
        profile: {
          firstName: formData.profile.firstName.trim(),
          lastName: formData.profile.lastName.trim(),
          phone: formData.profile.phone.trim(),
          department: formData.profile.department,
          position: formData.profile.position.trim()
        }
      };

      console.log('🔄 Creating user with data:', { ...userData, password: '[HIDDEN]' });
      
      const response = await usersAPI.createUser(userData);
      
      if (response.data.status === 'success') {
        toast.success('Usuario creado exitosamente');
        router.push('/dashboard/users');
      }
    } catch (error) {
      console.error('❌ Error creating user:', error);
      
      if (error.response?.data?.errors) {
        // Errores de validación del backend
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
      }
      
      const errorMessage = error.response?.data?.message || 'Error al crear usuario';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return 'bg-red-500';
    if (passwordStrength < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return 'Débil';
    if (passwordStrength < 60) return 'Media';
    return 'Fuerte';
  };

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
              <span className="text-gray-900 font-medium flex items-center gap-1">
                <UserPlus className="w-4 h-4" />
                Crear Usuario
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/users"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Usuarios
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-blue-600" />
            Crear Nuevo Usuario
          </h1>
          <p className="text-gray-600 mt-1">
            Completa la información para crear un nuevo usuario en el sistema
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información de Acceso */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Información de Acceso
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="usuario@organizacion.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Indicador de fortaleza */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength < 30 ? 'text-red-600' :
                        passwordStrength < 60 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Repetir contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Las contraseñas coinciden
                  </p>
                )}
                
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Información Personal */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Información Personal
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="profile.firstName"
                  value={formData.profile.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['profile.firstName'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del usuario"
                />
                {errors['profile.firstName'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors['profile.firstName']}
                  </p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="profile.lastName"
                  value={formData.profile.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['profile.lastName'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Apellido del usuario"
                />
                {errors['profile.lastName'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors['profile.lastName']}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="profile.phone"
                    value={formData.profile.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['profile.phone'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+593 99 123 4567"
                  />
                </div>
                {errors['profile.phone'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors['profile.phone']}
                  </p>
                )}
              </div>

              {/* Departamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    name="profile.department"
                    value={formData.profile.department}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar departamento</option>
                    {departmentOptions.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cargo/Posición */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo/Posición
                </label>
                <input
                  type="text"
                  name="profile.position"
                  value={formData.profile.position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Analista de Seguridad, Gerente de Riesgos, etc."
                />
              </div>
            </div>
          </div>

          {/* Rol y Permisos */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Rol y Permisos
            </h2>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Selecciona el rol que tendrá este usuario. Los permisos se asignan automáticamente según el rol.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roleOptions.map((role) => (
                  <div key={role.value}>
                    <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      formData.role === role.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}>
                      <div className="flex items-center mb-3">
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-2">
                          {role.icon}
                          <span className="font-medium text-gray-900">{role.label}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {role.description}
                      </p>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen de Permisos */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Permisos para {roleOptions.find(r => r.value === formData.role)?.label}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.role === 'admin' && (
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
              
              {formData.role === 'analyst' && (
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
              
              {formData.role === 'viewer' && (
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

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Link
              href="/dashboard/users"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creando Usuario...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Crear Usuario
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserPage;