'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAssets } from '@/hooks/useAssets';
import { useAuth } from '@/hooks/useAuth';
import { 
  Save, 
  ArrowLeft, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Package,
  Database,
  Server,
  Shield,
  Activity,
  HelpCircle
} from 'lucide-react';

// Taxonomía MAGERIT completa
const ASSET_TYPES = {
  I: {
    name: 'Información',
    icon: Database,
    color: 'blue',
    subtypes: {
      'I.1': 'Datos almacenados',
      'I.2': 'Datos transmitidos',
      'I.3': 'Propiedad intelectual',
      'I.4': 'Datos de carácter personal',
      'I.5': 'Información estratégica',
      'I.6': 'Información financiera'
    }
  },
  S: {
    name: 'Servicios',
    icon: Activity,
    color: 'green',
    subtypes: {
      'S.1': 'Servicios internos',
      'S.2': 'Servicios externos',
      'S.3': 'Servicios web',
      'S.4': 'Servicios de correo',
      'S.5': 'Servicios de comunicaciones',
      'S.6': 'Procesos de negocio'
    }
  },
  SW: {
    name: 'Software',
    icon: Package,
    color: 'purple',
    subtypes: {
      'SW.1': 'Sistema operativo',
      'SW.2': 'Aplicaciones',
      'SW.3': 'Herramientas de desarrollo',
      'SW.4': 'Software de seguridad',
      'SW.5': 'Sistemas de gestión de bases de datos',
      'SW.6': 'Software de oficina'
    }
  },
  HW: {
    name: 'Hardware',
    icon: Server,
    color: 'red',
    subtypes: {
      'HW.1': 'Servidores',
      'HW.2': 'Estaciones de trabajo',
      'HW.3': 'Dispositivos portátiles',
      'HW.4': 'Equipos de red',
      'HW.5': 'Dispositivos de almacenamiento',
      'HW.6': 'Dispositivos de seguridad'
    }
  },
  COM: {
    name: 'Comunicaciones',
    icon: Activity,
    color: 'yellow',
    subtypes: {
      'COM.1': 'Red de área local (LAN)',
      'COM.2': 'Red de área extensa (WAN)',
      'COM.3': 'Internet',
      'COM.4': 'Redes inalámbricas',
      'COM.5': 'Telefonía',
      'COM.6': 'Redes privadas virtuales'
    }
  },
  SI: {
    name: 'Soportes de Información',
    icon: Database,
    color: 'indigo',
    subtypes: {
      'SI.1': 'Soportes electrónicos',
      'SI.2': 'Documentos en papel',
      'SI.3': 'Soportes ópticos',
      'SI.4': 'Soportes magnéticos',
      'SI.5': 'Soportes de estado sólido'
    }
  },
  AUX: {
    name: 'Equipamiento Auxiliar',
    icon: Package,
    color: 'gray',
    subtypes: {
      'AUX.1': 'Suministro eléctrico',
      'AUX.2': 'Climatización',
      'AUX.3': 'Mobiliario',
      'AUX.4': 'Material fungible',
      'AUX.5': 'Mantenimiento'
    }
  },
  L: {
    name: 'Instalaciones',
    icon: Package,
    color: 'orange',
    subtypes: {
      'L.1': 'Edificios',
      'L.2': 'Centros de proceso de datos',
      'L.3': 'Despachos',
      'L.4': 'Áreas de almacenamiento',
      'L.5': 'Salas de reuniones'
    }
  },
  P: {
    name: 'Personal',
    icon: Shield,
    color: 'pink',
    subtypes: {
      'P.1': 'Personal de decisión',
      'P.2': 'Personal de operación',
      'P.3': 'Personal de desarrollo',
      'P.4': 'Personal de mantenimiento',
      'P.5': 'Personal de seguridad',
      'P.6': 'Usuarios'
    }
  }
};

// Esquema de validación
const assetSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  
  code: yup
    .string()
    .required('El código es requerido')
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(20, 'El código no puede exceder 20 caracteres')
    .matches(/^[A-Za-z0-9\-_.]+$/, 'El código solo puede contener letras, números, guiones y puntos'),
  
  description: yup
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  
  type: yup
    .string()
    .required('El tipo es requerido')
    .oneOf(Object.keys(ASSET_TYPES), 'Tipo de activo inválido'),
  
  subtype: yup
    .string()
    .required('El subtipo es requerido'),
  
  economicValue: yup
    .number()
    .min(0, 'El valor económico debe ser mayor o igual a 0')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  sectoralFactor: yup
    .number()
    .min(0.5, 'El factor sectorial debe ser mayor a 0.5')
    .max(2.0, 'El factor sectorial no puede exceder 2.0')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? 1.0 : value),

  valuation: yup.object({
    confidentiality: yup.number().min(0).max(10).required(),
    integrity: yup.number().min(0).max(10).required(),
    availability: yup.number().min(0).max(10).required(),
    authenticity: yup.number().min(0).max(10).required(),
    traceability: yup.number().min(0).max(10).required()
  }),

  'owner.userId': yup
    .string()
    .required('El propietario es requerido'),

  'owner.department': yup
    .string()
    .max(100, 'El departamento no puede exceder 100 caracteres')
});

// Componente para slider de valoración
const ValuationSlider = ({ name, label, value, onChange, description, color = 'primary' }) => {
  const getValueLabel = (val) => {
    if (val === 0) return 'Sin valor';
    if (val <= 2) return 'Muy Bajo';
    if (val <= 4) return 'Bajo';
    if (val <= 6) return 'Medio';
    if (val <= 8) return 'Alto';
    return 'Crítico';
  };

  const getSliderColor = (val) => {
    if (val === 0) return '#e5e7eb';
    if (val <= 2) return '#3b82f6';
    if (val <= 4) return '#10b981';
    if (val <= 6) return '#f59e0b';
    if (val <= 8) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            value === 0 ? 'bg-gray-100 text-gray-700' :
            value <= 2 ? 'bg-blue-100 text-blue-700' :
            value <= 4 ? 'bg-green-100 text-green-700' :
            value <= 6 ? 'bg-yellow-100 text-yellow-700' :
            value <= 8 ? 'bg-orange-100 text-orange-700' :
            'bg-red-100 text-red-700'
          }`}>
            {getValueLabel(value)}
          </span>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="0"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${getSliderColor(value)} 0%, ${getSliderColor(value)} ${value * 10}%, #e5e7eb ${value * 10}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
      
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
};

export default function CreateAssetPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createAsset, loading, validateAssetCode } = useAssets();
  const [currentStep, setCurrentStep] = useState(1);
  const [availableSubtypes, setAvailableSubtypes] = useState({});
  const [codeValidation, setCodeValidation] = useState({ isValid: true, message: '' });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    trigger
  } = useForm({
    resolver: yupResolver(assetSchema),
    defaultValues: {
      valuation: {
        confidentiality: 0,
        integrity: 0,
        availability: 0,
        authenticity: 0,
        traceability: 0
      },
      sectoralFactor: 1.0,
      'owner.userId': user?._id || '',
      'owner.department': '',
      economicValue: null,
      status: 'ACTIVE'
    },
    mode: 'onChange'
  });

  const watchedType = watch('type');
  const watchedCode = watch('code');
  const watchedValuation = watch('valuation');

  // Actualizar subtipos disponibles cuando cambia el tipo
  useEffect(() => {
    if (watchedType && ASSET_TYPES[watchedType]) {
      setAvailableSubtypes(ASSET_TYPES[watchedType].subtypes);
      setValue('subtype', ''); // Limpiar subtipo cuando cambia el tipo
    }
  }, [watchedType, setValue]);

  // Validar código en tiempo real
  useEffect(() => {
    const validateCode = async () => {
      if (watchedCode && watchedCode.length >= 2) {
        try {
          const isUnique = await validateAssetCode(watchedCode);
          setCodeValidation({
            isValid: isUnique,
            message: isUnique ? 'Código disponible' : 'Este código ya existe'
          });
        } catch (error) {
          setCodeValidation({ isValid: true, message: '' });
        }
      } else {
        setCodeValidation({ isValid: true, message: '' });
      }
    };

    const timeoutId = setTimeout(validateCode, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedCode, validateAssetCode]);

  const onSubmit = async (data) => {
    try {
      // Formatear datos antes de enviar
      const formattedData = {
        ...data,
        code: data.code.toUpperCase(),
        owner: {
          userId: data['owner.userId'],
          department: data['owner.department'] || ''
        },
        economicValue: data.economicValue || 0,
        sectoralFactor: data.sectoralFactor || 1.0
      };

      // Remover campos con notación de punto
      delete formattedData['owner.userId'];
      delete formattedData['owner.department'];

      const createdAsset = await createAsset(formattedData);
      
      if (createdAsset) {
        router.push(`/dashboard/assets/${createdAsset._id}`);
      }
    } catch (error) {
      console.error('Error creating asset:', error);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['name', 'code', 'type', 'subtype']
      : ['valuation.confidentiality', 'valuation.integrity', 'valuation.availability', 'valuation.authenticity', 'valuation.traceability'];
    
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid && codeValidation.isValid) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const calculateCriticality = () => {
    const values = Object.values(watchedValuation || {});
    const maxValue = Math.max(...values.filter(v => typeof v === 'number'));
    return isNaN(maxValue) ? 0 : maxValue;
  };

  const getCriticalityLevel = (score) => {
    if (score >= 9) return { level: 'CRÍTICO', color: 'text-red-600', bg: 'bg-red-100' };
    if (score >= 7) return { level: 'ALTO', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (score >= 5) return { level: 'MEDIO', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 3) return { level: 'BAJO', color: 'text-green-600', bg: 'bg-green-100' };
    return { level: 'MUY BAJO', color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  const criticalityScore = calculateCriticality();
  const criticalityInfo = getCriticalityLevel(criticalityScore);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Activo</h1>
            <p className="text-gray-600">Registra un activo según metodología MAGERIT v3.0</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            currentStep >= 1 ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 text-gray-400'
          }`}>
            {currentStep > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
          </div>
          <div className={`flex-1 h-0.5 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            currentStep >= 2 ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 text-gray-400'
          }`}>
            2
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>Información Básica</span>
          <span>Valoración MAGERIT</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Paso 1: Información Básica */}
        {currentStep === 1 && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Información Básica del Activo</h2>
              <p className="text-sm text-gray-500">Define las características principales según taxonomía MAGERIT</p>
            </div>

            <div className="p-6 space-y-8">
              {/* Indicador de criticidad actual */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Criticidad Calculada</h3>
                    <p className="text-xs text-gray-500">Basada en el valor máximo de las dimensiones</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{criticalityScore}</div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${criticalityInfo.bg} ${criticalityInfo.color}`}>
                      {criticalityInfo.level}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimensiones de valoración */}
              <div className="space-y-6">
                <Controller
                  name="valuation.confidentiality"
                  control={control}
                  render={({ field }) => (
                    <ValuationSlider
                      name="confidentiality"
                      label="Confidencialidad"
                      value={field.value}
                      onChange={field.onChange}
                      description="Propiedad de que la información no se ponga a disposición ni se revele a individuos, entidades o procesos no autorizados"
                      color="blue"
                    />
                  )}
                />

                <Controller
                  name="valuation.integrity"
                  control={control}
                  render={({ field }) => (
                    <ValuationSlider
                      name="integrity"
                      label="Integridad"
                      value={field.value}
                      onChange={field.onChange}
                      description="Propiedad de salvaguardar la exactitud y completitud de los activos"
                      color="green"
                    />
                  )}
                />

                <Controller
                  name="valuation.availability"
                  control={control}
                  render={({ field }) => (
                    <ValuationSlider
                      name="availability"
                      label="Disponibilidad"
                      value={field.value}
                      onChange={field.onChange}
                      description="Propiedad de ser accesible y utilizable cuando lo requiera una entidad autorizada"
                      color="yellow"
                    />
                  )}
                />

                <Controller
                  name="valuation.authenticity"
                  control={control}
                  render={({ field }) => (
                    <ValuationSlider
                      name="authenticity"
                      label="Autenticidad"
                      value={field.value}
                      onChange={field.onChange}
                      description="Propiedad de que una entidad es quien dice ser o bien que garantiza la fuente de la que proceden los datos"
                      color="purple"
                    />
                  )}
                />

                <Controller
                  name="valuation.traceability"
                  control={control}
                  render={({ field }) => (
                    <ValuationSlider
                      name="traceability"
                      label="Trazabilidad"
                      value={field.value}
                      onChange={field.onChange}
                      description="Propiedad que asegura que en todo momento se podrá determinar quién hizo qué y cuándo"
                      color="red"
                    />
                  )}
                />
              </div>

              {/* Información de ayuda */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Guía de Valoración MAGERIT
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>0-2:</strong> Impacto muy bajo o despreciable</li>
                        <li><strong>3-4:</strong> Impacto bajo, afectación limitada</li>
                        <li><strong>5-6:</strong> Impacto medio, afectación considerable</li>
                        <li><strong>7-8:</strong> Impacto alto, afectación grave</li>
                        <li><strong>9-10:</strong> Impacto crítico, afectación muy grave</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advertencias basadas en valoración */}
              {criticalityScore >= 8 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Activo de Alta Criticidad</h3>
                      <p className="mt-1 text-sm text-red-700">
                        Este activo requiere controles de seguridad reforzados y monitoreo continuo.
                        Considera implementar medidas adicionales de protección.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                type="submit"
                disabled={loading || !isValid}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando Activo...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Activo
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 