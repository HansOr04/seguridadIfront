'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAssets } from '@/hooks/useAssets';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Eye,
  RefreshCw,
  FileText,
  Info,
  AlertCircle,
  Users,
  Package
} from 'lucide-react';

// Componente para arrastrar y soltar archivos
const FileDropzone = ({ onFileSelect, accept, maxSize = 10485760 }) => {
  const [dragError, setDragError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setDragError('');
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setDragError('El archivo es demasiado grande. Máximo 10MB.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setDragError('Tipo de archivo no válido. Solo archivos Excel (.xlsx, .xls) y CSV.');
      } else {
        setDragError('Error al cargar el archivo.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxSize,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive 
          ? 'border-primary-400 bg-primary-50' 
          : isDragReject || dragError
          ? 'border-red-400 bg-red-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-4">
        <div className="flex justify-center">
          {isDragReject || dragError ? (
            <XCircle className="h-12 w-12 text-red-400" />
          ) : isDragActive ? (
            <Upload className="h-12 w-12 text-primary-400" />
          ) : (
            <FileSpreadsheet className="h-12 w-12 text-gray-400" />
          )}
        </div>
        
        <div>
          {isDragActive ? (
            <p className="text-lg font-medium text-primary-600">
              Suelta el archivo aquí...
            </p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-900">
                Arrastra tu archivo Excel o CSV aquí
              </p>
              <p className="text-sm text-gray-500">
                o <span className="text-primary-600 hover:text-primary-700">haz clic para seleccionar</span>
              </p>
            </>
          )}
        </div>
        
        {dragError && (
          <p className="text-sm text-red-600">{dragError}</p>
        )}
        
        <div className="text-xs text-gray-400">
          Formatos soportados: .xlsx, .xls, .csv • Máximo 10MB
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar resultados de importación
const ImportResults = ({ results, onViewErrors, onDownloadReport }) => {
  const successRate = results.total > 0 ? (results.successful / results.total) * 100 : 0;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Resultados de Importación</h3>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            successRate >= 90 ? 'bg-green-100 text-green-800' :
            successRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {successRate.toFixed(1)}% éxito
          </span>
        </div>
      </div>

      {/* Resumen visual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Procesados</p>
              <p className="text-2xl font-bold text-blue-900">{results.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Exitosos</p>
              <p className="text-2xl font-bold text-green-900">{results.successful}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Fallidos</p>
              <p className="text-2xl font-bold text-red-900">{results.failed}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Omitidos</p>
              <p className="text-2xl font-bold text-yellow-900">{results.skipped?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progreso de importación</span>
          <span>{results.successful} de {results.total} completados</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${successRate}%` }}
          ></div>
        </div>
      </div>

      {/* Activos creados exitosamente */}
      {results.created && results.created.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Activos Creados Exitosamente</h4>
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="max-h-32 overflow-y-auto">
              {results.created.slice(0, 10).map((asset, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <span className="text-sm text-green-800">
                    <strong>{asset.code}</strong> - {asset.name}
                  </span>
                  <span className="text-xs text-green-600">Fila {asset.row}</span>
                </div>
              ))}
              {results.created.length > 10 && (
                <p className="text-xs text-green-600 text-center mt-2">
                  Y {results.created.length - 10} más...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Errores */}
      {results.errors && results.errors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Errores Encontrados</h4>
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="max-h-32 overflow-y-auto">
              {results.errors.slice(0, 5).map((error, index) => (
                <div key={index} className="py-1">
                  <p className="text-sm text-red-800">
                    <strong>Fila {error.row}:</strong> {error.errors.join(', ')}
                  </p>
                </div>
              ))}
              {results.errors.length > 5 && (
                <p className="text-xs text-red-600 text-center mt-2">
                  Y {results.errors.length - 5} errores más...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activos omitidos */}
      {results.skipped && results.skipped.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Activos Omitidos</h4>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="max-h-32 overflow-y-auto">
              {results.skipped.slice(0, 5).map((skipped, index) => (
                <div key={index} className="py-1">
                  <p className="text-sm text-yellow-800">
                    <strong>Fila {skipped.row}:</strong> {skipped.code} - {skipped.reason}
                  </p>
                </div>
              ))}
              {results.skipped.length > 5 && (
                <p className="text-xs text-yellow-600 text-center mt-2">
                  Y {results.skipped.length - 5} omitidos más...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-wrap gap-3">
        {results.errors && results.errors.length > 0 && (
          <button
            onClick={onViewErrors}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Todos los Errores
          </button>
        )}
        
        <button
          onClick={onDownloadReport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Descargar Reporte
        </button>
      </div>
    </div>
  );
};

export default function ImportAssetsPage() {
  const router = useRouter();
  const { importAssets, downloadTemplate, loading } = useAssets();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [importOptions, setImportOptions] = useState({
    skipErrors: true,
    updateExisting: false,
    defaultOwner: null
  });
  const [step, setStep] = useState('upload'); // upload, preview, results

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setImportResults(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate();
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      setStep('processing');
      const results = await importAssets(selectedFile, importOptions);
      setImportResults(results);
      setStep('results');
    } catch (error) {
      console.error('Error importing assets:', error);
      setStep('upload');
    }
  };

  const handleViewErrors = () => {
    // Implementar modal para ver errores detallados
    console.log('View detailed errors:', importResults.errors);
  };

  const handleDownloadReport = () => {
    // Generar y descargar reporte de importación
    const reportData = {
      timestamp: new Date().toISOString(),
      results: importResults,
      filename: selectedFile?.name
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-importacion-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResults(null);
    setStep('upload');
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Importación Masiva de Activos</h1>
            <p className="text-gray-600">Carga múltiples activos desde archivos Excel o CSV</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            ['upload', 'preview', 'processing', 'results'].includes(step) 
              ? 'bg-primary-600 border-primary-600 text-white' 
              : 'border-gray-300 text-gray-400'
          }`}>
            {step === 'processing' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </div>
          <div className={`flex-1 h-0.5 ${
            ['processing', 'results'].includes(step) ? 'bg-primary-600' : 'bg-gray-300'
          }`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            step === 'results' 
              ? 'bg-primary-600 border-primary-600 text-white' 
              : 'border-gray-300 text-gray-400'
          }`}>
            <CheckCircle className="h-4 w-4" />
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>Cargar Archivo</span>
          <span>Resultados</span>
        </div>
      </div>

      {/* Paso 1: Cargar archivo */}
      {step === 'upload' && (
        <div className="space-y-6">
          {/* Instrucciones y plantilla */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Antes de comenzar</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Descarga la plantilla Excel para asegurar el formato correcto</li>
                    <li>Completa todos los campos obligatorios marcados con *</li>
                    <li>Utiliza los códigos de taxonomía MAGERIT válidos</li>
                    <li>Verifica que los códigos de activos sean únicos</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleDownloadTemplate}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? 'Descargando...' : 'Descargar Plantilla Excel'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Área de carga */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Archivo</h2>
            
            <FileDropzone
              onFileSelect={handleFileSelect}
              maxSize={10485760} // 10MB
            />

            {selectedFile && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-8 w-8 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Opciones de importación */}
          {selectedFile && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Opciones de Importación</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="skip-errors"
                    type="checkbox"
                    checked={importOptions.skipErrors}
                    onChange={(e) => setImportOptions({
                      ...importOptions,
                      skipErrors: e.target.checked
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="skip-errors" className="ml-2 block text-sm text-gray-900">
                    Continuar importación aunque algunos registros tengan errores
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="update-existing"
                    type="checkbox"
                    checked={importOptions.updateExisting}
                    onChange={(e) => setImportOptions({
                      ...importOptions,
                      updateExisting: e.target.checked
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="update-existing" className="ml-2 block text-sm text-gray-900">
                    Actualizar activos existentes con el mismo código
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleImport}
                  disabled={!selectedFile || loading}
                  className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Iniciar Importación
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paso 2: Procesando */}
      {step === 'processing' && (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
              <RefreshCw className="h-6 w-6 text-primary-600 animate-spin" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Procesando Importación</h3>
            <p className="mt-2 text-sm text-gray-500">
              Estamos validando y creando los activos. Esto puede tomar unos momentos...
            </p>
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2 w-64 mx-auto">
                <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 3: Resultados */}
      {step === 'results' && importResults && (
        <div className="space-y-6">
          <ImportResults 
            results={importResults}
            onViewErrors={handleViewErrors}
            onDownloadReport={handleDownloadReport}
          />

          {/* Acciones finales */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetImport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Otro Archivo
              </button>
              
              <button
                onClick={() => router.push('/dashboard/assets')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Package className="h-4 w-4 mr-2" />
                Ver Todos los Activos
              </button>

              {importResults.successful > 0 && (
                <button
                  onClick={() => router.push('/dashboard/valuation')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Continuar con Valoración
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Formatos de Archivo Soportados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="font-medium text-gray-900">Excel (.xlsx)</p>
              <p className="text-gray-500">Recomendado para importaciones grandes</p>
            </div>
          </div>
          <div className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="font-medium text-gray-900">Excel Legacy (.xls)</p>
              <p className="text-gray-500">Compatible con versiones anteriores</p>
            </div>
          </div>
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-orange-500 mr-2" />
            <div>
              <p className="font-medium text-gray-900">CSV (.csv)</p>
              <p className="text-gray-500">Texto separado por comas</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Los archivos grandes (más de 1000 registros) pueden tomar varios minutos en procesarse. 
                No cierres esta página durante la importación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}