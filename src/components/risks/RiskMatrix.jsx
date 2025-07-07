'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Settings, 
  Filter, 
  Maximize2, 
  Minimize2, 
  Info,
  Eye,
  AlertTriangle,
  Target
} from 'lucide-react';
import { useRiskMatrix } from '../../hooks/useRiskMatrix';
import { exportToImage } from '../../lib/exportUtils';
import { motion, AnimatePresence } from 'framer-motion';

const RISK_COLORS = {
  very_low: '#10b981',
  low: '#84cc16',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#dc2626'
};

const RiskMatrix = () => {
  const {
    matrixData,
    loading,
    error,
    refreshMatrix,
    filters,
    setFilters
  } = useRiskMatrix();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [activeFilters, setActiveFilters] = useState({
    category: 'all',
    assetType: 'all',
    status: 'all'
  });

  const matrixRef = useRef(null);

  useEffect(() => {
    if (matrixData) {
      // Aplicar filtros cuando cambien
      setFilters(activeFilters);
    }
  }, [activeFilters, setFilters]);

  const handleCellClick = (cell) => {
    setSelectedCell(cell);
  };

  const handleCellHover = (cell, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setSelectedCell(cell);
    setShowTooltip(true);
  };

  const handleCellLeave = () => {
    setShowTooltip(false);
    setSelectedCell(null);
  };

  const handleExportImage = async () => {
    if (matrixRef.current) {
      try {
        await exportToImage(matrixRef.current, 'matriz-riesgo.png');
      } catch (error) {
        console.error('Error exportando imagen:', error);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-6 gap-2">
            {[...Array(36)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error cargando matriz</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshMatrix}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { matrix, probabilityLabels, impactLabels, totalRisks } = matrixData?.visualization || {};

  if (!matrix || !probabilityLabels || !impactLabels) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos de matriz</h3>
            <p className="text-gray-600">Configure una matriz de riesgo para su organización</p>
          </div>
        </div>
      </div>
    );
  }

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-white p-6 overflow-auto"
    : "bg-white rounded-lg shadow-sm border border-gray-200 p-6";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Matriz de Riesgo 5x5</h2>
          <p className="text-gray-600 mt-1">
            {totalRisks} riesgos totales • {matrixData?.name || 'Matriz MAGERIT'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filtros */}
          <div className="flex items-center space-x-2">
            <select
              value={activeFilters.category}
              onChange={(e) => setActiveFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="operational">Operacional</option>
              <option value="technical">Técnico</option>
              <option value="strategic">Estratégico</option>
              <option value="compliance">Cumplimiento</option>
            </select>

            <select
              value={activeFilters.assetType}
              onChange={(e) => setActiveFilters(prev => ({ ...prev, assetType: e.target.value }))}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Todos los activos</option>
              <option value="software">Software</option>
              <option value="hardware">Hardware</option>
              <option value="data">Datos</option>
              <option value="essential_services">Servicios esenciales</option>
            </select>
          </div>

          {/* Controles */}
          <button
            onClick={handleExportImage}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Exportar como imagen"
          >
            <Download className="h-5 w-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Matriz */}
      <div ref={matrixRef} className="select-none">
        <div className="grid grid-cols-6 gap-1 max-w-4xl mx-auto">
          {/* Celda vacía esquina superior izquierda */}
          <div className="h-16 flex items-center justify-center">
            <div className="text-xs font-medium text-gray-500 transform -rotate-45">
              Impacto / Probabilidad
            </div>
          </div>

          {/* Headers de probabilidad */}
          {probabilityLabels.map((label, index) => (
            <div
              key={`prob-header-${index}`}
              className="h-16 bg-blue-50 border border-blue-200 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="text-sm font-medium text-blue-900">{label}</div>
                <div className="text-xs text-blue-600">{index + 1}</div>
              </div>
            </div>
          ))}

          {/* Filas de la matriz */}
          {matrix.map((row, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              {/* Header de impacto */}
              <div className="h-16 bg-green-50 border border-green-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-medium text-green-900">
                    {impactLabels[impactLabels.length - 1 - rowIndex]}
                  </div>
                  <div className="text-xs text-green-600">
                    {impactLabels.length - rowIndex}
                  </div>
                </div>
              </div>

              {/* Celdas de la fila */}
              {row.map((cell, colIndex) => (
                <MatrixCell
                  key={`cell-${rowIndex}-${colIndex}`}
                  cell={cell}
                  onClick={() => handleCellClick(cell)}
                  onMouseEnter={(e) => handleCellHover(cell, e)}
                  onMouseLeave={handleCellLeave}
                  isSelected={selectedCell?.x === cell.x && selectedCell?.y === cell.y}
                />
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* Leyenda */}
        <div className="mt-8 flex flex-wrap items-center justify-center space-x-6">
          {Object.entries(RISK_COLORS).map(([level, color]) => (
            <div key={level} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm text-gray-700 capitalize">
                {level.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>

        {/* Tolerancia al riesgo */}
        {matrixData?.tolerance && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <ToleranceCard
              title="Aceptable"
              levels={matrixData.tolerance.acceptable.levels}
              description="Riesgos que pueden aceptarse sin tratamiento adicional"
              color="green"
            />
            <ToleranceCard
              title="Tolerable"
              levels={matrixData.tolerance.tolerable.levels}
              description="Riesgos que requieren monitoreo y posible tratamiento"
              color="yellow"
            />
            <ToleranceCard
              title="Inaceptable"
              levels={matrixData.tolerance.unacceptable.levels}
              description="Riesgos que requieren tratamiento inmediato"
              color="red"
            />
          </div>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && selectedCell && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-xs"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: 'translateX(-50%) translateY(-100%)'
            }}
          >
            <div className="text-sm">
              <div className="font-medium mb-1">
                Probabilidad {selectedCell.x} × Impacto {selectedCell.y}
              </div>
              <div className="text-gray-300 mb-2">
                Nivel: <span className="capitalize">{selectedCell.riskLevel.replace('_', ' ')}</span>
              </div>
              <div className="text-gray-300 mb-2">
                Score: {selectedCell.riskScore}
              </div>
              <div className="text-gray-300 mb-2">
                Riesgos: {selectedCell.riskCount}
              </div>
              <div className="text-gray-300">
                Acción: <span className="capitalize">{selectedCell.action}</span>
              </div>
            </div>
            
            {selectedCell.risks && selectedCell.risks.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Riesgos en esta celda:</div>
                {selectedCell.risks.slice(0, 3).map((risk, index) => (
                  <div key={index} className="text-xs text-gray-300">
                    • {risk.name}
                  </div>
                ))}
                {selectedCell.risks.length > 3 && (
                  <div className="text-xs text-gray-400">
                    +{selectedCell.risks.length - 3} más...
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de detalle de celda */}
      {selectedCell && (
        <CellDetailModal
          cell={selectedCell}
          isOpen={!!selectedCell}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </div>
  );
};

// Componente MatrixCell
const MatrixCell = ({ cell, onClick, onMouseEnter, onMouseLeave, isSelected }) => {
  const backgroundColor = RISK_COLORS[cell.riskLevel] || '#6b7280';
  
  return (
    <motion.div
      className={`h-16 border-2 cursor-pointer relative transition-all duration-200 ${
        isSelected ? 'border-gray-900 z-10' : 'border-gray-300'
      }`}
      style={{ backgroundColor }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <div className="text-xs font-bold">
          {cell.riskCount}
        </div>
        <div className="text-xs opacity-75">
          riesgos
        </div>
      </div>
      
      {cell.riskCount > 0 && (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
        </div>
      )}
    </motion.div>
  );
};

// Componente ToleranceCard
const ToleranceCard = ({ title, levels, description, color }) => {
  const colorClasses = {
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    red: 'border-red-200 bg-red-50'
  };

  const textColorClasses = {
    green: 'text-green-800',
    yellow: 'text-yellow-800',
    red: 'text-red-800'
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className={`font-medium ${textColorClasses[color]} mb-2`}>
        {title}
      </div>
      <div className="text-sm text-gray-600 mb-2">
        {description}
      </div>
      <div className="flex flex-wrap gap-1">
        {levels.map((level, index) => (
          <span
            key={index}
            className={`px-2 py-1 text-xs rounded ${textColorClasses[color]} bg-white bg-opacity-50`}
          >
            {level.replace('_', ' ')}
          </span>
        ))}
      </div>
    </div>
  );
};

// Componente CellDetailModal
const CellDetailModal = ({ cell, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center mb-4">
              <div 
                className="w-4 h-4 rounded mr-3"
                style={{ backgroundColor: RISK_COLORS[cell.riskLevel] }}
              ></div>
              <h3 className="text-lg font-medium text-gray-900">
                Celda de Riesgo: P{cell.x} × I{cell.y}
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nivel de Riesgo</label>
                  <div className="mt-1 capitalize text-lg font-semibold" style={{ color: RISK_COLORS[cell.riskLevel] }}>
                    {cell.riskLevel.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Score</label>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {cell.riskScore}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Acción Recomendada</label>
                <div className="mt-1 text-gray-900 capitalize">
                  {cell.action}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Riesgos en esta celda ({cell.riskCount})
                </label>
                {cell.risks && cell.risks.length > 0 ? (
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {cell.risks.map((risk, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{risk.name}</div>
                          <div className="text-xs text-gray-500">Activo: {risk.assetName}</div>
                        </div>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-500">
                    No hay riesgos en esta celda
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMatrix;