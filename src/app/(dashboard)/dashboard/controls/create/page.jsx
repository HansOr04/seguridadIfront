                   // src/app/(dashboard)/dashboard/controls/create/page.jsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, Home, Shield, ShieldPlus, ArrowLeft, Save, 
  AlertCircle, CheckCircle, Target, Eye, Settings, DollarSign,
  Calendar, Users, BarChart3
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

// API específica para controles
const controlsAPI = {
  createControl: (data) => {
    console.log('➕ controlsAPI.createControl: Creando control');
    return api.post('/controls', data);
  },

  getISO27002Catalog: () => {
    console.log('📋 controlsAPI.getISO27002Catalog: Obteniendo catálogo ISO 27002');
    return api.get('/controls/iso27002-catalog');
  }
};

const CreateControlPage = () => {
  const router = useRouter();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    category: 'access_control',
    type: 'preventive',
    controlObjective: '',
    implementation: '',
    maturityLevel: 1,
    implementationCost: '',
    annualCost: '',
    effectiveness: '',
    status: 'planned',
    owner: '',
    reviewFrequency: 'annual',
    nextReviewDate: '',
    tags: [],
    references: {
      iso27002: '',
      nist: '',
      cobit: '',
      custom: ''
    }
  });
  
  // Estado de UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [iso27002Catalog, setIso27002Catalog] = useState([]);

  // Opciones de categorías
  const categoryOptions = [
    { 
      value: 'access_control', 
      label: 'Control de Acceso',
      description: 'Gestión de identidades, autenticación y autorización',
      icon: <Shield className="w-5 h-5 text-blue-600" />
    },
    { 
      value: 'cryptography', 
      label: 'Criptografía',
      description: 'Cifrado, firmas digitales y gestión de claves',
      icon: <Shield className="w-5 h-5 text-purple-600" />
    },
    { 
      value: 'physical_security', 
      label: 'Seguridad Física',
      description: 'Protección física de instalaciones y equipos',
      icon: <Shield className="w-5 h-5 text-green-600" />
    },
    { 
      value: 'network_security', 
      label: 'Seguridad de Red',
      description: 'Firewalls, IDS, segmentación de redes',
      icon: <Shield className="w-5 h-5 text-red-600" />
    },
    { 
      value: 'incident_response', 
      label: 'Respuesta a Incidentes',
      description: 'Detección, respuesta y recuperación',
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />
    },
    { 
      value: 'business_continuity', 
      label: 'Continuidad del Negocio',
      description: 'Planes de contingencia y recuperación',
      icon: <Target className="w-5 h-5 text-indigo-600" />
    },
    { 
      value: 'compliance', 
      label: 'Cumplimiento',
      description: 'Auditorías, políticas y procedimientos',
      icon: <CheckCircle className="w-5 h-5 text-teal-600" />
    },
    { 
      value: 'data_protection', 
      label: 'Protección de Datos',
      description: 'Privacidad, clasificación y manejo de datos',
      icon: <Shield className="w-5 h-5 text-cyan-600" />
    },
    { 
      value: 'risk_management', 
      label: 'Gestión de Riesgos',
      description: 'Identificación, evaluación y tratamiento',
      icon: <BarChart3 className="w-5 h-5 text-pink-600" />
    }
  ];

  // Opciones de tipos
  const typeOptions = [
    { 
      value: 'preventive', 
      label: 'Preventivo',
      description: 'Evita que ocurran incidentes de seguridad',
      icon: <Shield className="w-5 h-5 text-green-600" />
    },
    { 
      value: 'detective', 
      label: 'Detectivo',
      description: 'Identifica incidentes cuando ocurren',
      icon: <Eye className="w-5 h-5 text-blue-600" />
    },
    { 
      value: 'corrective', 
      label: 'Correctivo',
      description: 'Corrige problemas después de detectarlos',
      icon: <Settings className="w-5 h-5 text-orange-600" />
    },
    { 
      value: 'compensating', 
      label: 'Compensatorio',
      description: 'Compensa la ausencia de otros controles',
      icon: <Target className="w-5 h-5 text-purple-600" />
    }
  ];

  // Opciones de estado
  const statusOptions = [
    { value: 'planned', label: 'Planificado', color: 'text-orange-600' },
    { value: 'implementing', label: 'En implementación', color: 'text-blue-600' },
    { value: 'implemented', label: 'Implementado', color: 'text-green-600' },
    { value: 'inactive', label: 'Inactivo', color: 'text-red-600' }
  ];

  // Opciones de frecuencia de revisión
  const reviewFrequencyOptions = [
    { value: 'monthly', label: 'Mensual' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'annual', label: 'Anual' },
    { value: 'biannual', label: 'Bianual' }
  ];

  // Cargar catálogo ISO 27002 al montar
  React.useEffect(() => {
    const loadISO27002Catalog = async () => {
      try {
        const response = await controlsAPI.getISO27002Catalog();
        if (response.data.status === 'success') {
          setIso27002Catalog(response.data.data.controls || []);
        }
      } catch (error) {
        console.error('Error loading ISO 27002 catalog:', error);
      }
    };

    loadISO27002Catalog();
  }, []);

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

    // Limpiar errores al modificar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Manejar tags
  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    // Descripción
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    }

    // Objetivo del control
    if (!formData.controlObjective.trim()) {
      newErrors.controlObjective = 'El objetivo del control es requerido';
    }

    // Implementación
    if (!formData.implementation.trim()) {
      newErrors.implementation = 'La descripción de implementación es requerida';
    }

    // Nivel de madurez
    if (formData.maturityLevel < 1 || formData.maturityLevel > 5) {
      newErrors.maturityLevel = 'El nivel de madurez debe estar entre 1 y 5';
    }

    // Costo de implementación
    if (formData.implementationCost && isNaN(parseFloat(formData.implementationCost))) {
      newErrors.implementationCost = 'El costo debe ser un número válido';
    }

    // Costo anual
    if (formData.annualCost && isNaN(parseFloat(formData.annualCost))) {
      newErrors.annualCost = 'El costo anual debe ser un número válido';
    }

    // Efectividad
    if (formData.effectiveness && (isNaN(parseFloat(formData.effectiveness)) || parseFloat(formData.effectiveness) < 0 || parseFloat(formData.effectiveness) > 100)) {
      newErrors.effectiveness = 'La efectividad debe ser un número entre 0 y 100';
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
      const controlData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        code: formData.code.trim(),
        category: formData.category,
        type: formData.type,
        controlObjective: formData.controlObjective.trim(),
        implementation: formData.implementation.trim(),
        maturityLevel: parseInt(formData.maturityLevel),
        implementationCost: formData.implementationCost ? parseFloat(formData.implementationCost) : 0,
        annualCost: formData.annualCost ? parseFloat(formData.annualCost) : 0,
        effectiveness: formData.effectiveness ? parseFloat(formData.effectiveness) : 0,
        status: formData.status,
        owner: formData.owner.trim(),
        reviewFrequency: formData.reviewFrequency,
        nextReviewDate: formData.nextReviewDate || null,
        tags: formData.tags,
        references: formData.references
      };

      console.log('🔄 Creating control with data:', controlData);
      
      const response = await controlsAPI.createControl(controlData);
      
      if (response.data.status === 'success') {
        toast.success('Control creado exitosamente');
        router.push('/dashboard/controls');
      }
    } catch (error) {
      console.error('❌ Error creating control:', error);
      
      if (error.response?.data?.errors) {
        // Errores de validación del backend
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
      }
      
      const errorMessage = error.response?.data?.message || 'Error al crear control';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Navegación entre pasos
  const nextStep = () => {
    if (currentStep === 1) {
      // Validar paso 1
      const step1Fields = ['name', 'description', 'category', 'type'];
      const hasErrors = step1Fields.some(field => {
        if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
          return true;
        }
        return false;
      });

      if (hasErrors) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validar paso 2
      if (!formData.controlObjective.trim() || !formData.implementation.trim()) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getSelectedCategory = () => {
    return categoryOptions.find(cat => cat.value === formData.category);
  };

  const getSelectedType = () => {
    return typeOptions.find(type => type.value === formData.type);
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
                href="/dashboard/controls" 
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <Shield className="w-4 h-4" />
                Controles
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium flex items-center gap-1">
                <ShieldPlus className="w-4 h-4" />
                Crear Control
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
            href="/dashboard/controls"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Controles
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldPlus className="w-7 h-7 text-blue-600" />
            Crear Nuevo Control
          </h1>
          <p className="text-gray-600 mt-1">
            Define un control de seguridad basado en marcos internacionales
          </p>
        </div>

        {/* Indicador de progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className={`text-center ${currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Información Básica
            </div>
            <div className={`text-center ${currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Implementación
            </div>
            <div className={`text-center ${currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Configuración
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Paso 1: Información Básica */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Información Básica del Control
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Control *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Control de Acceso Biométrico"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Código */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código del Control
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: AC-001"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Código único para identificar el control
                  </p>
                </div>

                {/* Owner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsable del Control
                  </label>
                  <input
                    type="text"
                    name="owner"
                    value={formData.owner}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del responsable"
                  />
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe detalladamente qué hace este control y cómo funciona..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Categoría */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría de Control *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {categoryOptions.map((category) => (
                      <label key={category.value} className={`block p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        formData.category === category.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}>
                        <input
                          type="radio"
                          name="category"
                          value={category.value}
                          checked={formData.category === category.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-2 mb-2">
                          {category.icon}
                          <span className="font-medium text-gray-900">{category.label}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {category.description}
                        </p>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tipo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Control *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {typeOptions.map((type) => (
                      <label key={type.value} className={`block p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        formData.type === type.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}>
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={formData.type === type.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-2 mb-2">
                          {type.icon}
                          <span className="font-medium text-gray-900">{type.label}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {type.description}
                        </p>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Implementación */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Implementación del Control
              </h2>
              
              <div className="space-y-6">
                {/* Objetivo del control */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objetivo del Control *
                  </label>
                  <textarea
                    name="controlObjective"
                    value={formData.controlObjective}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.controlObjective ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="¿Qué se espera lograr con este control? ¿Qué riesgos mitiga?"
                  />
                  {errors.controlObjective && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.controlObjective}
                    </p>
                  )}
                </div>

                {/* Implementación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción de la Implementación *
                  </label>
                  <textarea
                    name="implementation"
                    value={formData.implementation}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.implementation ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe paso a paso cómo se implementa este control, qué herramientas se usan, etc."
                  />
                  {errors.implementation && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.implementation}
                    </p>
                  )}
                </div>

                {/* Estado y nivel de madurez */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado del Control
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel de Madurez (1-5)
                    </label>
                    <select
                      name="maturityLevel"
                      value={formData.maturityLevel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>Nivel 1 - Inicial</option>
                      <option value={2}>Nivel 2 - Básico</option>
                      <option value={3}>Nivel 3 - Definido</option>
                      <option value={4}>Nivel 4 - Gestionado</option>
                      <option value={5}>Nivel 5 - Optimizado</option>
                    </select>
                  </div>
                </div>

                {/* Costos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Costo de Implementación (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        name="implementationCost"
                        value={formData.implementationCost}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.implementationCost ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.implementationCost && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.implementationCost}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Costo Anual de Operación (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        name="annualCost"
                        value={formData.annualCost}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.annualCost ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.annualCost && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.annualCost}
                      </p>
                    )}
                  </div>
                </div>

                {/* Efectividad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Efectividad Estimada (0-100%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      name="effectiveness"
                      value={formData.effectiveness || 0}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="flex-1"
                    />
                    <div className="w-20">
                      <input
                        type="number"
                        name="effectiveness"
                        value={formData.effectiveness || ''}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className={`w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 ${
                          errors.effectiveness ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                  {errors.effectiveness && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.effectiveness}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Porcentaje estimado de efectividad en la mitigación del riesgo
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Configuración */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Configuración y Referencias
              </h2>
              
              <div className="space-y-6">
                {/* Frecuencia de revisión */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frecuencia de Revisión
                    </label>
                    <select
                      name="reviewFrequency"
                      value={formData.reviewFrequency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {reviewFrequencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Próxima Fecha de Revisión
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        name="nextReviewDate"
                        value={formData.nextReviewDate}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiquetas
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={handleTagsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: crítico, automatizado, iso27001"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separa las etiquetas con comas
                  </p>
                </div>

                {/* Referencias */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Referencias a Marcos de Trabajo
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">ISO 27002</label>
                      <input
                        type="text"
                        name="references.iso27002"
                        value={formData.references.iso27002}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: A.9.1.1"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">NIST</label>
                      <input
                        type="text"
                        name="references.nist"
                        value={formData.references.nist}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: AC-2"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">COBIT</label>
                      <input
                        type="text"
                        name="references.cobit"
                        value={formData.references.cobit}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: DSS05.04"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Otros</label>
                      <input
                        type="text"
                        name="references.custom"
                        value={formData.references.custom}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Referencias personalizadas"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resumen antes de enviar */}
          {currentStep === 3 && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Resumen del Control
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Nombre:</span>
                  <span className="ml-2 text-blue-700">{formData.name || 'Sin nombre'}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Categoría:</span>
                  <span className="ml-2 text-blue-700">{getSelectedCategory()?.label}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Tipo:</span>
                  <span className="ml-2 text-blue-700">{getSelectedType()?.label}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Estado:</span>
                  <span className="ml-2 text-blue-700">
                    {statusOptions.find(s => s.value === formData.status)?.label}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Madurez:</span>
                  <span className="ml-2 text-blue-700">Nivel {formData.maturityLevel}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Efectividad:</span>
                  <span className="ml-2 text-blue-700">{formData.effectiveness || 0}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="flex items-center justify-between pt-6 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/controls"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creando Control...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Crear Control
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateControlPage;
 