'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Download,
  ExternalLink,
  Activity,
  DollarSign,
  BarChart3,
  PieChart,
  FileText,
  Clock
} from 'lucide-react';
import { useAssets } from '../../hooks/useAssets';
import { useThreats } from '../../hooks/useThreats';
import { useVulnerabilities } from '../../hooks/useVulnerabilities';
import { useRisks } from '../../hooks/useRisks';
import { formatPercentage, formatCurrency } from '../../lib/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CALCULATION_STEPS = [
  { id: 'asset', title: 'Seleccionar Activo', icon: Target },
  { id: 'threat', title: 'Seleccionar Amenaza', icon: AlertTriangle },
  { id: 'vulnerability', title: 'Seleccionar Vulnerabilidad', icon: Shield },
  { id: 'review', title: 'Revisar y Calcular', icon: Calculator }
];

const RiskCalculator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState({});

  const { assets, searchAssets } = useAssets();
  const { threats, getThreatsByAsset } = useThreats();
  const { vulnerabilities, getVulnerabilitiesByAsset } = useVulnerabilities();
  const { calculateRisk, saveRisk } = useRisks();

  // Filtrar amenazas aplicables al activo seleccionado
  const applicableThreats = useMemo(() => {
    if (!selectedAsset) return [];
    return getThreatsByAsset(selectedAsset.id);
  }, [selectedAsset, getThreatsByAsset]);

  // Filtrar vulnerabilidades del activo seleccionado
  const applicableVulnerabilities = useMemo(() => {
    if (!selectedAsset) return [];
    return getVulnerabilitiesByAsset(selectedAsset.id);
  }, [selectedAsset, getVulnerabilitiesByAsset]);

  // Calcular preview del riesgo en tiempo real
  const riskPreview = useMemo(() => {
    if (!selectedAsset || !selectedThreat || !selectedVulnerability) return null;

    // Cálculo simplificado para preview (el real se hace en el backend)
    const threatProbability = selectedThreat.adjustedProbability || selectedThreat.baseProbability;
    const vulnerabilityLevel = selectedVulnerability.vulnerabilityLevel;
    const aggregatedImpact = calculateAggregatedImpact(selectedAsset, selectedVulnerability);
    
    const baseRisk = threatProbability * vulnerabilityLevel * aggregatedImpact;
    const temporalFactor = 1.1; // Simplificado
    const environmentalFactor = 1.0; // Simplificado
    const adjustedRisk = Math.min(baseRisk * temporalFactor * environmentalFactor, 1.0);

    return {
      threatProbability,
      vulnerabilityLevel,
      aggregatedImpact,
      baseRisk,
      adjustedRisk,
      riskLevel: getRiskLevel(adjustedRisk),
      economicImpact: (selectedAsset.economicValue || 0) * adjustedRisk
    };
  }, [selectedAsset, selectedThreat, selectedVulnerability]);

  const calculateAggregatedImpact = (asset, vulnerability) => {
    if (!asset.valuation || !vulnerability.affectedDimensions) return 0.5;

    const dimensions = ['confidentiality', 'integrity', 'availability', 'authenticity', 'traceability'];
    let totalWeightedImpact = 0;
    let totalWeight = 0;

    dimensions.forEach(dimension => {
      const assetValue = (asset.valuation[dimension] || 0) / 10; // Normalizar 0-10 a 0-1
      const vulnerabilityImpact = vulnerability.affectedDimensions[dimension]?.impact || 0;
      
      totalWeightedImpact += assetValue * vulnerabilityImpact;
      totalWeight += assetValue;
    });

    return totalWeight > 0 ? totalWeightedImpact / totalWeight : 0.5;
  };

  const getRiskLevel = (risk) => {
    if (risk >= 0.8) return 'critical';
    if (risk >= 0.6) return 'high';
    if (risk >= 0.4) return 'medium';
    if (risk >= 0.2) return 'low';
    return 'very_low';
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, CALCULATION_STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 0: // Asset selection
        if (!selectedAsset) {
          newErrors.asset = 'Debe seleccionar un activo';
        }
        break;
      case 1: // Threat selection
        if (!selectedThreat) {
          newErrors.threat = 'Debe seleccionar una amenaza';
        }
        break;
      case 2: // Vulnerability selection
        if (!selectedVulnerability) {
          newErrors.vulnerability = 'Debe seleccionar una vulnerabilidad';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = async () => {
    if (!selectedAsset || !selectedThreat || !selectedVulnerability) return;

    setIsCalculating(true);
    try {
      const result = await calculateRisk({
        assetId: selectedAsset.id,
        threatId: selectedThreat.id,
        vulnerabilityId: selectedVulnerability.id
      });
      
      setCalculationResult(result);
      setCurrentStep(CALCULATION_STEPS.length); // Ir a paso de resultados
      toast.success('Riesgo calculado exitosamente');
    } catch (error) {
      setErrors({ calculation: error.message });
      toast.error('Error al calcular riesgo');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedAsset(null);
    setSelectedThreat(null);
    setSelectedVulnerability(null);
    setCalculationResult(null);
    setErrors({});
  };

  const handleSaveRisk = async () => {
    if (calculationResult) {
      try {
        await saveRisk(calculationResult);
        toast.success('Riesgo guardado exitosamente');
      } catch (error) {
        toast.error('Error al guardar riesgo');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Calculator className="h-6 w-6 mr-2 text-primary-600" />
              Calculadora de Riesgos MAGERIT
            </h2>
            <p className="text-gray-600 mt-1">
              Evalúe riesgos siguiendo la metodología MAGERIT v3.0
            </p>
          </div>
          
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {CALCULATION_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  index <= currentStep 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
                
                {index < CALCULATION_STEPS.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && (
                  <AssetSelectionStep
                    assets={assets}
                    selectedAsset={selectedAsset}
                    onSelect={setSelectedAsset}
                    error={errors.asset}
                  />
                )}

                {currentStep === 1 && (
                  <ThreatSelectionStep
                    threats={applicableThreats}
                    selectedThreat={selectedThreat}
                    onSelect={setSelectedThreat}
                    error={errors.threat}
                    asset={selectedAsset}
                  />
                )}

                {currentStep === 2 && (
                  <VulnerabilitySelectionStep
                    vulnerabilities={applicableVulnerabilities}
                    selectedVulnerability={selectedVulnerability}
                    onSelect={setSelectedVulnerability}
                    error={errors.vulnerability}
                    asset={selectedAsset}
                  />
                )}

                {currentStep === 3 && (
                  <ReviewStep
                    asset={selectedAsset}
                    threat={selectedThreat}
                    vulnerability={selectedVulnerability}
                    preview={riskPreview}
                    onCalculate={handleCalculate}
                    isCalculating={isCalculating}
                    error={errors.calculation}
                  />
                )}

                {currentStep === 4 && calculationResult && (
                  <ResultsStep
                    result={calculationResult}
                    onSave={handleSaveRisk}
                    onReset={handleReset}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            {riskPreview && currentStep < 4 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Preview del Cálculo</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Probabilidad:</span>
                    <span className="font-medium">{formatPercentage(riskPreview.threatProbability)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Vulnerabilidad:</span>
                    <span className="font-medium">{formatPercentage(riskPreview.vulnerabilityLevel)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Impacto:</span>
                    <span className="font-medium">{formatPercentage(riskPreview.aggregatedImpact)}</span>
                  </div>
                  <div className="border-t border-blue-300 pt-2 mt-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-blue-900">Riesgo:</span>
                      <span className={`px-2 py-1 rounded text-xs text-white bg-${getRiskColor(riskPreview.riskLevel)}-500`}>
                        {formatPercentage(riskPreview.adjustedRisk)}
                      </span>
                    </div>
                  </div>
                  {riskPreview.economicImpact > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Impacto Económico:</span>
                      <span className="font-medium">{formatCurrency(riskPreview.economicImpact)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selection Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Selección Actual</h3>
              
              <div className="space-y-3">
                <div className={`${selectedAsset ? 'text-gray-900' : 'text-gray-500'}`}>
                  <div className="text-xs font-medium uppercase tracking-wide">Activo</div>
                  <div className="mt-1">
                    {selectedAsset ? selectedAsset.name : 'No seleccionado'}
                  </div>
                </div>

                <div className={`${selectedThreat ? 'text-gray-900' : 'text-gray-500'}`}>
                  <div className="text-xs font-medium uppercase tracking-wide">Amenaza</div>
                  <div className="mt-1">
                    {selectedThreat ? `${selectedThreat.mageritCode} - ${selectedThreat.name}` : 'No seleccionada'}
                  </div>
                </div>

                <div className={`${selectedVulnerability ? 'text-gray-900' : 'text-gray-500'}`}>
                  <div className="text-xs font-medium uppercase tracking-wide">Vulnerabilidad</div>
                  <div className="mt-1">
                    {selectedVulnerability ? selectedVulnerability.name : 'No seleccionada'}
                  </div>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-900">Metodología MAGERIT</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    El riesgo se calcula como: <strong>R = A × V × I</strong>, donde A es la amenaza, 
                    V la vulnerabilidad e I el impacto en las dimensiones de seguridad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </button>

            <div className="text-sm text-gray-500">
              Paso {currentStep + 1} de {CALCULATION_STEPS.length}
            </div>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleCalculate}
                disabled={isCalculating || !riskPreview}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCalculating ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calcular Riesgo
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Función auxiliar para obtener color del riesgo
const getRiskColor = (level) => {
  const colors = {
    critical: 'red',
    high: 'orange',
    medium: 'yellow',
    low: 'green',
    very_low: 'green'
  };
  return colors[level] || 'gray';
};

// Componentes de pasos individuales
const AssetSelectionStep = ({ assets, selectedAsset, onSelect, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Activo de Información</h3>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar activos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => onSelect(asset)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedAsset?.id === asset.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{asset.name}</h4>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {asset.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{asset.description}</p>
            {asset.economicValue && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                Valor: {formatCurrency(asset.economicValue)}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron activos que coincidan con la búsqueda
        </div>
      )}
    </div>
  );
};

const ThreatSelectionStep = ({ threats, selectedThreat, onSelect, error, asset }) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Seleccionar Amenaza para "{asset?.name}"
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {threats.map((threat) => (
          <div
            key={threat.id}
            onClick={() => onSelect(threat)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedThreat?.id === threat.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-2">
                  {threat.mageritCode}
                </span>
                <h4 className="font-medium text-gray-900">{threat.name}</h4>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {formatPercentage(threat.adjustedProbability || threat.baseProbability)}
                </div>
                <div className="text-xs text-gray-500">Probabilidad</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{threat.description}</p>
            
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              <span>Categoría: {threat.category}</span>
              <span>Aplicabilidad: {threat.applicabilityScore ? formatPercentage(threat.applicabilityScore) : '100%'}</span>
            </div>
          </div>
        ))}
      </div>

      {threats.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay amenazas aplicables para este activo
        </div>
      )}
    </div>
  );
};

const VulnerabilitySelectionStep = ({ vulnerabilities, selectedVulnerability, onSelect, error, asset }) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Seleccionar Vulnerabilidad en "{asset?.name}"
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {vulnerabilities.map((vulnerability) => (
          <div
            key={vulnerability.id}
            onClick={() => onSelect(vulnerability)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedVulnerability?.id === vulnerability.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{vulnerability.name}</h4>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  vulnerability.severityLevel === 'critical' ? 'bg-red-100 text-red-800' :
                  vulnerability.severityLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                  vulnerability.severityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {vulnerability.severityLevel}
                </span>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatPercentage(vulnerability.vulnerabilityLevel)}
                  </div>
                  <div className="text-xs text-gray-500">Nivel</div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-2">{vulnerability.description}</p>
            
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              <span>Tipo: {vulnerability.type}</span>
              <span>Categoría: {vulnerability.category}</span>
              {vulnerability.cveDetails?.cveId && (
                <span>CVE: {vulnerability.cveDetails.cveId}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {vulnerabilities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay vulnerabilidades registradas para este activo
        </div>
      )}
    </div>
  );
};

const ReviewStep = ({ asset, threat, vulnerability, preview, onCalculate, isCalculating, error }) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Revisar Selección y Calcular Riesgo</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Asset Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Target className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-blue-900">Activo</h4>
          </div>
          <p className="text-sm font-medium text-gray-900">{asset?.name}</p>
          <p className="text-xs text-gray-600 mt-1">Tipo: {asset?.type}</p>
          {asset?.economicValue && (
            <p className="text-xs text-green-600 mt-1">
              Valor: {formatCurrency(asset.economicValue)}
            </p>
          )}
        </div>

        {/* Threat Card */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
            <h4 className="font-medium text-orange-900">Amenaza</h4>
          </div>
          <p className="text-sm font-medium text-gray-900">{threat?.name}</p>
          <p className="text-xs text-gray-600 mt-1">Código: {threat?.mageritCode}</p>
          <p className="text-xs text-orange-600 mt-1">
            Probabilidad: {formatPercentage(threat?.adjustedProbability || threat?.baseProbability)}
          </p>
        </div>

        {/* Vulnerability Card */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Shield className="h-5 w-5 text-red-600 mr-2" />
            <h4 className="font-medium text-red-900">Vulnerabilidad</h4>
          </div>
          <p className="text-sm font-medium text-gray-900">{vulnerability?.name}</p>
          <p className="text-xs text-gray-600 mt-1">Severidad: {vulnerability?.severityLevel}</p>
          <p className="text-xs text-red-600 mt-1">
            Nivel: {formatPercentage(vulnerability?.vulnerabilityLevel)}
          </p>
        </div>
      </div>

      {/* Preview Results */}
      {preview && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-gray-600" />
            Preview del Cálculo de Riesgo
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatPercentage(preview.threatProbability)}
              </div>
              <div className="text-sm text-gray-600">Probabilidad</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatPercentage(preview.vulnerabilityLevel)}
              </div>
              <div className="text-sm text-gray-600">Vulnerabilidad</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(preview.aggregatedImpact)}
              </div>
              <div className="text-sm text-gray-600">Impacto</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold text-${getRiskColor(preview.riskLevel)}-600`}>
                {formatPercentage(preview.adjustedRisk)}
              </div>
              <div className="text-sm text-gray-600">Riesgo Final</div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className={`px-4 py-2 rounded-lg text-white bg-${getRiskColor(preview.riskLevel)}-500`}>
              <span className="font-medium">Nivel de Riesgo: {getRiskLevelLabel(preview.riskLevel)}</span>
            </div>
          </div>

          {preview.economicImpact > 0 && (
            <div className="mt-4 text-center">
              <div className="text-lg font-medium text-gray-900">
                Impacto Económico Estimado: {formatCurrency(preview.economicImpact)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calculation Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Detalles del Cálculo MAGERIT</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Fórmula:</strong> Riesgo = Amenaza × Vulnerabilidad × Impacto × Factores</p>
          <p><strong>Metodología:</strong> MAGERIT v3.0 - Análisis y Gestión de Riesgos</p>
          <p><strong>Dimensiones evaluadas:</strong> Confidencialidad, Integridad, Disponibilidad, Autenticidad, Trazabilidad</p>
        </div>
      </div>
    </div>
  );
};

const ResultsStep = ({ result, onSave, onReset }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    // Implementar exportación del resultado
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `riesgo_${result.riskId || 'calculado'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">¡Riesgo Calculado Exitosamente!</h3>
        <p className="text-gray-600 mt-2">El análisis de riesgo ha sido completado según MAGERIT v3.0</p>
      </div>

      {/* Main Results */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatPercentage(result.calculation?.adjustedRisk)}
            </div>
            <div className="text-sm text-gray-600">Riesgo Ajustado</div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white mt-2 bg-${getRiskColor(result.classification?.riskLevel)}-500`}>
              {getRiskLevelLabel(result.classification?.riskLevel)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(result.calculation?.economicImpact?.expectedLoss || 0)}
            </div>
            <div className="text-sm text-gray-600">Pérdida Esperada</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {result.riskMatrix?.riskScore || 0}
            </div>
            <div className="text-sm text-gray-600">Puntuación en Matriz</div>
            <div className="text-xs text-gray-500 mt-1">
              Posición: {result.riskMatrix?.matrixPosition}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Calculation Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Desglose del Cálculo
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Probabilidad de Amenaza:</span>
              <span className="font-medium">{formatPercentage(result.calculation?.threatProbability)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nivel de Vulnerabilidad:</span>
              <span className="font-medium">{formatPercentage(result.calculation?.vulnerabilityLevel)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Impacto Agregado:</span>
              <span className="font-medium">{formatPercentage(result.calculation?.aggregatedImpact)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Factor Temporal:</span>
              <span className="font-medium">{result.calculation?.temporalFactor?.toFixed(2) || '1.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Factor Ambiental:</span>
              <span className="font-medium">{result.calculation?.environmentalFactor?.toFixed(2) || '1.00'}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Riesgo Base:</span>
                <span>{formatPercentage(result.calculation?.baseRisk)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary-600">
                <span>Riesgo Ajustado:</span>
                <span>{formatPercentage(result.calculation?.adjustedRisk)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Analysis */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Análisis de Impacto
          </h4>
          
          <div className="space-y-3">
            {result.calculation?.impact && Object.entries(result.calculation.impact).map(([dimension, value]) => (
              <div key={dimension} className="flex items-center justify-between">
                <span className="text-gray-600 capitalize">
                  {getDimensionLabel(dimension)}:
                </span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full bg-${getDimensionColor(dimension)}-500`}
                      style={{ width: `${value * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-medium w-12 text-right">{formatPercentage(value)}</span>
                </div>
              </div>
            ))}
          </div>

          {result.calculation?.economicImpact && (
            <div className="mt-6 pt-4 border-t">
              <h5 className="font-medium text-gray-900 mb-2">Impacto Económico</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pérdida Potencial:</span>
                  <span className="font-medium">{formatCurrency(result.calculation.economicImpact.potentialLoss)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pérdida Esperada:</span>
                  <span className="font-medium">{formatCurrency(result.calculation.economicImpact.expectedLoss)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pérdida Anualizada:</span>
                  <span className="font-medium">{formatCurrency(result.calculation.economicImpact.annualizedLoss)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Treatment Recommendations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Recomendaciones de Tratamiento
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Estrategia Recomendada</h5>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              result.treatment?.strategy === 'mitigate' ? 'bg-blue-100 text-blue-800' :
              result.treatment?.strategy === 'accept' ? 'bg-green-100 text-green-800' :
              result.treatment?.strategy === 'transfer' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {getStrategyLabel(result.treatment?.strategy)}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Prioridad</h5>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              result.treatment?.priority === 'critical' ? 'bg-red-100 text-red-800' :
              result.treatment?.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              result.treatment?.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {result.treatment?.priority?.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Próximos pasos:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Documentar el riesgo en el registro organizacional</li>
            <li>Definir controles específicos para mitigar el riesgo</li>
            <li>Establecer métricas de monitoreo continuo</li>
            <li>Programar revisiones periódicas del riesgo</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? (
            <>
              <Zap className="h-5 w-5 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Guardar Riesgo
            </>
          )}
        </button>

        <button
          onClick={handleExport}
          className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-5 w-5 mr-2" />
          Exportar Resultado
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Nuevo Cálculo
        </button>
      </div>
    </div>
  );
};

// Funciones auxiliares
const getRiskLevelLabel = (level) => {
  const labels = {
    critical: 'Crítico',
    high: 'Alto',
    medium: 'Medio',
    low: 'Bajo',
    very_low: 'Muy Bajo'
  };
  return labels[level] || 'No Definido';
};

const getDimensionLabel = (dimension) => {
  const labels = {
    confidentiality: 'Confidencialidad',
    integrity: 'Integridad',
    availability: 'Disponibilidad',
    authenticity: 'Autenticidad',
    traceability: 'Trazabilidad'
  };
  return labels[dimension] || dimension;
};

const getDimensionColor = (dimension) => {
  const colors = {
    confidentiality: 'blue',
    integrity: 'purple',
    availability: 'green',
    authenticity: 'yellow',
    traceability: 'pink'
  };
  return colors[dimension] || 'gray';
};

const getStrategyLabel = (strategy) => {
  const labels = {
    accept: 'Aceptar',
    mitigate: 'Mitigar',
    transfer: 'Transferir',
    avoid: 'Evitar'
  };
  return labels[strategy] || 'No Definida';
};

export default RiskCalculator;