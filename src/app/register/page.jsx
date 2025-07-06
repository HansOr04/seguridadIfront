'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Building,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Phone
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Schema de validación
const registerSchema = yup.object({
  // Datos de la organización
  organizationName: yup
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(200, 'Máximo 200 caracteres')
    .required('El nombre de la organización es requerido'),
  ruc: yup
    .string()
    .matches(/^\d{13}$/, 'El RUC debe tener exactamente 13 dígitos')
    .required('El RUC es requerido'),
  organizationType: yup
    .string()
    .required('Selecciona el tipo de organización'),
  sector: yup
    .string()
    .required('Selecciona el sector'),
  size: yup
    .string()
    .required('Selecciona el tamaño de la empresa'),
  
  // Datos del usuario administrador
  firstName: yup
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras')
    .required('El nombre es requerido'),
  lastName: yup
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras')
    .required('El apellido es requerido'),
  email: yup
    .string()
    .email('Ingresa un email válido')
    .required('El email es requerido'),
  phone: yup
    .string()
    .matches(/^[0-9+\-\s()]+$/, 'Formato de teléfono inválido')
    .optional(),
  password: yup
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Debe contener mayúscula, minúscula, número y carácter especial'
    )
    .required('La contraseña es requerida'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
  
  // Términos y condiciones
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'Debes aceptar los términos y condiciones'),
});

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { registerOrganization, user, loading } = useAuth();
  const router = useRouter();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Configuración del formulario
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
  });

  // Opciones para los selects
  const organizationTypes = [
    { value: 'comercial', label: 'Comercial' },
    { value: 'financiera', label: 'Financiera' },
    { value: 'salud', label: 'Salud' },
    { value: 'educativa', label: 'Educativa' },
    { value: 'gubernamental', label: 'Gubernamental' },
    { value: 'manufactura', label: 'Manufactura' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'ong', label: 'ONG' },
    { value: 'otro', label: 'Otro' },
  ];

  const sectors = [
    { value: 'publico', label: 'Público' },
    { value: 'privado', label: 'Privado' },
    { value: 'mixto', label: 'Mixto' },
  ];

  const sizes = [
    { value: 'micro', label: 'Micro (1-9 empleados)' },
    { value: 'pequena', label: 'Pequeña (10-49 empleados)' },
    { value: 'mediana', label: 'Mediana (50-199 empleados)' },
    { value: 'grande', label: 'Grande (200+ empleados)' },
  ];

  // Manejar siguiente paso
  const handleNextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['organizationName', 'ruc', 'organizationType', 'sector', 'size']
      : ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword', 'acceptTerms'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Manejar paso anterior
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const organizationData = {
        name: data.organizationName,
        ruc: data.ruc,
        type: data.organizationType,
        sector: data.sector,
        size: data.size,
      };

      const userData = {
        email: data.email,
        password: data.password,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        },
      };

      const result = await registerOrganization(organizationData, userData);

      if (result.success) {
        toast.success('¡Registro exitoso! Bienvenido a SIGRISK-EC');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Error al registrar la organización');
      }
    } catch (error) {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loader mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // No mostrar nada si ya está autenticado
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-600 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">SIGRISK-EC</h1>
                <p className="text-sm text-gray-600">MAGERIT v3.0</p>
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Registrar Organización
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Crea tu cuenta y comienza a gestionar los riesgos de tu organización
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                </div>
                <span className="text-sm font-medium">Organización</span>
              </div>
              
              <div className={`w-16 h-px ${currentStep > 1 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Usuario</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white shadow-soft rounded-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Paso 1: Datos de la Organización */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Building className="mx-auto h-12 w-12 text-primary-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Información de la Organización
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ingresa los datos básicos de tu empresa u organización
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Nombre de la organización */}
                  <div className="md:col-span-2">
                    <label className="label label-required">
                      Nombre de la Organización
                    </label>
                    <input
                      {...register('organizationName')}
                      type="text"
                      className={`input ${errors.organizationName ? 'input-error' : ''}`}
                      placeholder="Ej: Empresa ABC S.A."
                    />
                    {errors.organizationName && (
                      <div className="form-error flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.organizationName.message}
                      </div>
                    )}
                  </div>

                  {/* RUC */}
                  <div>
                    <label className="label label-required">
                      RUC
                    </label>
                    <input
                      {...register('ruc')}
                      type="text"
                      maxLength="13"
                      className={`input ${errors.ruc ? 'input-error' : ''}`}
                      placeholder="1234567890001"
                    />
                    {errors.ruc && (
                      <div className="form-error flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.ruc.message}
                      </div>
                    )}
                    <p className="form-help">
                      Ingresa el RUC de 13 dígitos de tu organización
                    </p>
                  </div>

                  {/* Tipo de organización */}
                  <div>
                    <label className="label label-required">
                      Tipo de Organización
                    </label>
                    <select
                      {...register('organizationType')}
                      className={`input ${errors.organizationType ? 'input-error' : ''}`}
                    >
                      <option value="">Seleccionar tipo</option>
                      {organizationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.organizationType && (
                      <div className="form-error flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.organizationType.message}
                      </div>
                    )}
                  </div>

                  {/* Sector */}
                  <div>
                    <label className="label label-required">
                      Sector
                    </label>
                    <select
                      {...register('sector')}
                      className={`input ${errors.sector ? 'input-error' : ''}`}
                    >
                      <option value="">Seleccionar sector</option>
                      {sectors.map((sector) => (
                        <option key={sector.value} value={sector.value}>
                          {sector.label}
                        </option>
                      ))}
                    </select>
                    {errors.sector && (
                      <div className="form-error flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.sector.message}
                      </div>
                    )}
                  </div>

                  {/* Tamaño */}
                  <div>
                    <label className="label label-required">
                      Tamaño de la Empresa
                    </label>
                    <select
                      {...register('size')}
                      className={`input ${errors.size ? 'input-error' : ''}`}
                    >
                      <option value="">Seleccionar tamaño</option>
                      {sizes.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                    {errors.size && (
                      <div className="form-error flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.size.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn-primary group"
                  >
                    Siguiente
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* Paso 2: Datos del Usuario */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <User className="mx-auto h-12 w-12 text-primary-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Usuario Administrador
                  </h3>
                  <p className="text-sm text-gray-600">
                    Crea tu cuenta de administrador para la organización
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div>
                    <label className="label label-required">
                      Nombre
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('firstName')}
                        type="text"
                        className={`input pl-10 ${errors.firstName ? 'input-error' : ''}`}
                        placeholder="Juan"
                      />
                    </div>
                    {errors.firstName && (
                      <div className="form-error flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.firstName.message}
                      </div>
                    )}
                  </div>

                  {/* Apellido */}
                  <div>
                    <label className="label label-required">
                      Apellido
                    </label>
                    <input
                      {...register('lastName')}
                      type="text"
                      className={`input ${errors.lastName ? 'input-error' : ''}`}
                      placeholder="Pérez"
                    />
                    {errors.lastName && (
                      <div className="form-error flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.lastName.message}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="label label-required">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('email')}
                        type="email"
                        className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                        placeholder="juan@empresa.com"
                      />
                    </div>
                    {errors.email && (
                      <div className="form-error flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.email.message}
                      </div>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="label">
                      Teléfono (Opcional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('phone')}
                        type="tel"
                        className={`input pl-10 ${errors.phone ? 'input-error' : ''}`}
                        placeholder="+593 99 123 4567"
                      />
                    </div>
                    {errors.phone && (
                      <div className="form-error flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.phone.message}
                      </div>
                    )}
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label className="label label-required">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="form-error flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.password.message}
                      </div>
                    )}
                    <p className="form-help">
                      Mínimo 8 caracteres con mayúscula, minúscula, número y carácter especial
                    </p>
                  </div>

                  {/* Confirmar contraseña */}
                  <div>
                    <label className="label label-required">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`input pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="form-error flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.confirmPassword.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Términos y condiciones */}
                <div className="mt-6">
                  <div className="flex items-start">
                    <input
                      {...register('acceptTerms')}
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                    />
                    <div className="ml-3">
                      <label className="text-sm text-gray-700">
                        Acepto los{' '}
                        <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                          términos y condiciones
                        </Link>{' '}
                        y la{' '}
                        <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                          política de privacidad
                        </Link>
                      </label>
                      {errors.acceptTerms && (
                        <div className="form-error flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.acceptTerms.message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="btn-secondary"
                  >
                    Anterior
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Registrando...
                      </div>
                    ) : (
                      <>
                        Crear Cuenta
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Link de login */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}