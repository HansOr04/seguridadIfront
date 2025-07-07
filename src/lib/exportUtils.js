/**
 * Utilidades para exportación de datos en diferentes formatos
 */

/**
 * Exportar elemento DOM como imagen
 */
export const exportToImage = async (element, filename = 'export.png', options = {}) => {
  try {
    // Importar html2canvas dinámicamente
    const html2canvas = (await import('html2canvas')).default;
    
    const defaultOptions = {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      ...options
    };
    
    const canvas = await html2canvas(element, defaultOptions);
    
    // Convertir a blob y descargar
    canvas.toBlob((blob) => {
      downloadBlob(blob, filename);
    }, 'image/png');
    
  } catch (error) {
    console.error('Error exportando imagen:', error);
    throw new Error('Error exportando imagen');
  }
};

/**
 * Exportar datos como CSV
 */
export const exportToCSV = (data, filename = 'export.csv', headers = null) => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No hay datos para exportar');
    }
    
    // Obtener headers de los datos si no se proporcionan
    const csvHeaders = headers || Object.keys(data[0]);
    
    // Crear contenido CSV
    const csvContent = [
      csvHeaders.join(','),
      ...data.map(row => 
        csvHeaders.map(header => {
          let value = row[header] || '';
          
          // Manejar valores especiales
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          }
          
          // Escapar comillas y envolver en comillas si contiene comas
          value = String(value);
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          
          return value;
        }).join(',')
      )
    ].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
    
  } catch (error) {
    console.error('Error exportando CSV:', error);
    throw new Error('Error exportando CSV');
  }
};

/**
 * Exportar datos como Excel
 */
export const exportToExcel = async (data, filename = 'export.xlsx', sheetName = 'Data') => {
  try {
    // Importar xlsx dinámicamente
    const XLSX = (await import('xlsx')).default;
    
    if (!data || data.length === 0) {
      throw new Error('No hay datos para exportar');
    }
    
    // Crear workbook y worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Añadir worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Escribir archivo
    XLSX.writeFile(workbook, filename);
    
  } catch (error) {
    console.error('Error exportando Excel:', error);
    throw new Error('Error exportando Excel');
  }
};

/**
 * Exportar como JSON
 */
export const exportToJSON = (data, filename = 'export.json') => {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Error exportando JSON:', error);
    throw new Error('Error exportando JSON');
  }
};

/**
 * Exportar como PDF usando jsPDF
 */
export const exportToPDF = async (content, filename = 'export.pdf', options = {}) => {
  try {
    // Importar jsPDF dinámicamente
    const { jsPDF } = await import('jspdf');
    
    const defaultOptions = {
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      ...options
    };
    
    const doc = new jsPDF(defaultOptions);
    
    if (typeof content === 'string') {
      // Contenido de texto simple
      doc.text(content, 10, 10);
    } else if (content instanceof HTMLElement) {
      // Convertir elemento HTML a canvas primero
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(content);
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190; // A4 width in mm minus margins
      const pageHeight = 295; // A4 height in mm minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 10; // Top margin
      
      doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Añadir páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }
    
    doc.save(filename);
    
  } catch (error) {
    console.error('Error exportando PDF:', error);
    throw new Error('Error exportando PDF');
  }
};

/**
 * Exportar matriz de riesgo como imagen
 */
export const exportRiskMatrix = async (matrixElement, filename = 'matriz-riesgo.png') => {
  return await exportToImage(matrixElement, filename, {
    backgroundColor: '#ffffff',
    scale: 3, // Mayor resolución para matrices
    useCORS: true
  });
};

/**
 * Exportar dashboard como PDF
 */
export const exportDashboardPDF = async (dashboardElement, filename = 'dashboard.pdf') => {
  return await exportToPDF(dashboardElement, filename, {
    orientation: 'landscape',
    format: 'a4'
  });
};

/**
 * Exportar datos de riesgos como Excel con múltiples hojas
 */
export const exportRisksToExcel = async (risksData, filename = 'riesgos.xlsx') => {
  try {
    const XLSX = (await import('xlsx')).default;
    
    const workbook = XLSX.utils.book_new();
    
    // Hoja 1: Riesgos principales
    const risksSheet = XLSX.utils.json_to_sheet(risksData.risks || []);
    XLSX.utils.book_append_sheet(workbook, risksSheet, 'Riesgos');
    
    // Hoja 2: Estadísticas
    if (risksData.statistics) {
      const statsSheet = XLSX.utils.json_to_sheet([risksData.statistics]);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estadísticas');
    }
    
    // Hoja 3: Matriz de riesgo
    if (risksData.matrix) {
      const matrixSheet = XLSX.utils.json_to_sheet(risksData.matrix);
      XLSX.utils.book_append_sheet(workbook, matrixSheet, 'Matriz');
    }
    
    XLSX.writeFile(workbook, filename);
    
  } catch (error) {
    console.error('Error exportando riesgos a Excel:', error);
    throw new Error('Error exportando riesgos a Excel');
  }
};

/**
 * Exportar datos CVE como Excel
 */
export const exportCVEToExcel = async (cveData, filename = 'cves.xlsx') => {
  try {
    const XLSX = (await import('xlsx')).default;
    
    const workbook = XLSX.utils.book_new();
    
    // Preparar datos CVE para Excel
    const cveForExcel = cveData.map(cve => ({
      'CVE ID': cve.cveId,
      'Descripción': cve.description,
      'Severidad': cve.cvss.severity,
      'Puntuación CVSS': cve.cvss.score,
      'Fecha Publicación': cve.publishedDate,
      'Tiene Exploit': cve.exploitInfo.hasKnownExploit ? 'Sí' : 'No',
      'Activos Afectados': cve.organizationalImpact?.affectedAssetsCount || 0,
      'Estado Remediación': cve.organizationalImpact?.remediationStatus || 'N/A'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(cveForExcel);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CVEs');
    
    XLSX.writeFile(workbook, filename);
    
  } catch (error) {
    console.error('Error exportando CVEs a Excel:', error);
    throw new Error('Error exportando CVEs a Excel');
  }
};

/**
 * Generar reporte ejecutivo en PDF
 */
export const generateExecutiveReport = async (data, filename = 'reporte-ejecutivo.pdf') => {
  try {
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;
    
    // Título
    doc.setFontSize(20);
    doc.text('Reporte Ejecutivo de Riesgos', margin, yPosition);
    yPosition += 15;
    
    // Fecha
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin, yPosition);
    yPosition += 15;
    
    // Resumen ejecutivo
    doc.setFontSize(16);
    doc.text('Resumen Ejecutivo', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    const summary = [
      `Total de riesgos identificados: ${data.totalRisks || 0}`,
      `Riesgos críticos: ${data.criticalRisks || 0}`,
      `Riesgos altos: ${data.highRisks || 0}`,
      `Promedio de riesgo organizacional: ${((data.averageRisk || 0) * 100).toFixed(1)}%`,
      `VaR al 95%: ${data.var95 ? '$' + data.var95.toLocaleString() : 'N/A'}`
    ];
    
    summary.forEach(line => {
      doc.text(line, margin, yPosition);
      yPosition += 8;
    });
    
    // Recomendaciones
    yPosition += 10;
    doc.setFontSize(16);
    doc.text('Recomendaciones Principales', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    const recommendations = data.recommendations || [
      'Implementar controles para riesgos críticos identificados',
      'Establecer monitoreo continuo de amenazas',
      'Actualizar políticas de seguridad organizacional',
      'Capacitar al personal en gestión de riesgos'
    ];
    
    recommendations.forEach((rec, index) => {
      doc.text(`${index + 1}. ${rec}`, margin, yPosition);
      yPosition += 8;
    });
    
    doc.save(filename);
    
  } catch (error) {
    console.error('Error generando reporte ejecutivo:', error);
    throw new Error('Error generando reporte ejecutivo');
  }
};

/**
 * Función auxiliar para descargar blob
 */
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Generar nombre de archivo con timestamp
 */
export const generateFilename = (baseName, extension) => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  return `${baseName}_${timestamp}.${extension}`;
};

/**
 * Convertir datos para exportación
 */
export const prepareDataForExport = (data, type = 'risks') => {
  if (!data || !Array.isArray(data)) return [];
  
  switch (type) {
    case 'risks':
      return data.map(risk => ({
        'ID Riesgo': risk.riskId || risk.id,
        'Nombre': risk.name,
        'Descripción': risk.description,
        'Activo': risk.asset?.name || '',
        'Amenaza': risk.threat?.name || '',
        'Código MAGERIT': risk.threat?.mageritCode || '',
        'Vulnerabilidad': risk.vulnerability?.name || '',
        'Nivel de Riesgo': risk.classification?.riskLevel || '',
        'Probabilidad': ((risk.calculation?.threatProbability || 0) * 100).toFixed(1) + '%',
        'Impacto': ((risk.calculation?.aggregatedImpact || 0) * 100).toFixed(1) + '%',
        'Riesgo Ajustado': ((risk.calculation?.adjustedRisk || 0) * 100).toFixed(1) + '%',
        'Pérdida Esperada': risk.calculation?.economicImpact?.expectedLoss || 0,
        'Estrategia': risk.treatment?.strategy || '',
        'Estado': risk.treatment?.status || '',
        'Prioridad': risk.treatment?.priority || '',
        'Fecha Creación': risk.createdAt ? new Date(risk.createdAt).toLocaleDateString('es-ES') : '',
        'Última Actualización': risk.updatedAt ? new Date(risk.updatedAt).toLocaleDateString('es-ES') : ''
      }));
      
    case 'cves':
      return data.map(cve => ({
        'CVE ID': cve.cveId,
        'Descripción': cve.description,
        'Severidad': cve.cvss?.severity || '',
        'Puntuación CVSS': cve.cvss?.score || 0,
        'Vector CVSS': cve.cvss?.vector || '',
        'Vector de Ataque': cve.cvss?.attackVector || '',
        'Complejidad': cve.cvss?.attackComplexity || '',
        'Fecha Publicación': cve.publishedDate ? new Date(cve.publishedDate).toLocaleDateString('es-ES') : '',
        'Fecha Modificación': cve.lastModifiedDate ? new Date(cve.lastModifiedDate).toLocaleDateString('es-ES') : '',
        'Tiene Exploit': cve.exploitInfo?.hasKnownExploit ? 'Sí' : 'No',
        'Fuentes Exploit': cve.exploitInfo?.exploitSources || 0,
        'Parche Disponible': cve.mitigation?.patchAvailable ? 'Sí' : 'No',
        'Workarounds': cve.mitigation?.workaroundsCount || 0,
        'Activos Afectados': cve.organizationalImpact?.affectedAssetsCount || 0,
        'Impacto Negocio': cve.organizationalImpact?.businessImpact || '',
        'Estado Remediación': cve.organizationalImpact?.remediationStatus || '',
        'Asignado A': cve.organizationalImpact?.assignedTo || '',
        'Fecha Vencimiento': cve.organizationalImpact?.dueDate ? new Date(cve.organizationalImpact.dueDate).toLocaleDateString('es-ES') : '',
        'Trending': cve.tracking?.trending ? 'Sí' : 'No',
        'Menciones Sociales': cve.tracking?.socialMediaMentions || 0
      }));
      
    case 'threats':
      return data.map(threat => ({
        'Código MAGERIT': threat.mageritCode,
        'Nombre': threat.name,
        'Descripción': threat.description,
        'Categoría': threat.category,
        'Probabilidad Base': ((threat.baseProbability || 0) * 100).toFixed(1) + '%',
        'Nivel Probabilidad': threat.probabilityLevel,
        'Confidencialidad': threat.affectedDimensions?.confidentiality ? 'Sí' : 'No',
        'Integridad': threat.affectedDimensions?.integrity ? 'Sí' : 'No',
        'Disponibilidad': threat.affectedDimensions?.availability ? 'Sí' : 'No',
        'Autenticidad': threat.affectedDimensions?.authenticity ? 'Sí' : 'No',
        'Trazabilidad': threat.affectedDimensions?.traceability ? 'Sí' : 'No',
        'Tipos Activos': threat.susceptibleAssetTypes?.join(', ') || '',
        'Es Estándar': threat.isStandard ? 'Sí' : 'No',
        'Integración CVE': threat.cveIntegration?.enabled ? 'Sí' : 'No',
        'Estado': threat.status,
        'Versión': threat.version
      }));
      
    case 'vulnerabilities':
      return data.map(vuln => ({
        'Nombre': vuln.name,
        'Descripción': vuln.description,
        'Tipo': vuln.type,
        'Categoría': vuln.category,
        'Nivel': ((vuln.vulnerabilityLevel || 0) * 100).toFixed(1) + '%',
        'Severidad': vuln.severityLevel,
        'Activo': vuln.asset?.name || '',
        'CVE ID': vuln.cveDetails?.cveId || '',
        'CVSS Score': vuln.cveDetails?.cvssV3Score || '',
        'Método Descubrimiento': vuln.technicalAssessment?.discoveryMethod || '',
        'Estado Verificación': vuln.technicalAssessment?.verificationStatus || '',
        'Complejidad Exploit': vuln.technicalAssessment?.exploitComplexity || '',
        'Acceso Requerido': vuln.technicalAssessment?.accessRequired || '',
        'Estado Remediación': vuln.remediation?.status || '',
        'Prioridad': vuln.remediation?.priority || '',
        'Asignado A': vuln.remediation?.assignedTo || '',
        'Fecha Vencimiento': vuln.remediation?.dueDate ? new Date(vuln.remediation.dueDate).toLocaleDateString('es-ES') : '',
        'Esfuerzo Estimado': vuln.remediation?.estimatedEffort || '',
        'Costo Estimado': vuln.remediation?.estimatedCost || 0,
        'Fecha Creación': vuln.createdAt ? new Date(vuln.createdAt).toLocaleDateString('es-ES') : ''
      }));
      
    default:
      return data;
  }
};

/**
 * Exportar múltiples tipos de datos en un solo archivo Excel
 */
export const exportMultipleDataTypes = async (dataTypes, filename = 'reporte-completo.xlsx') => {
  try {
    const XLSX = (await import('xlsx')).default;
    
    const workbook = XLSX.utils.book_new();
    
    for (const [sheetName, data, type] of dataTypes) {
      const preparedData = prepareDataForExport(data, type);
      const worksheet = XLSX.utils.json_to_sheet(preparedData);
      
      // Ajustar ancho de columnas
      const maxWidths = {};
      preparedData.forEach(row => {
        Object.keys(row).forEach(key => {
          const length = String(row[key] || '').length;
          maxWidths[key] = Math.max(maxWidths[key] || 0, length, key.length);
        });
      });
      
      const wscols = Object.keys(maxWidths).map(key => ({
        wch: Math.min(maxWidths[key] + 2, 50) // Máximo 50 caracteres de ancho
      }));
      
      worksheet['!cols'] = wscols;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
    
    XLSX.writeFile(workbook, filename);
    
  } catch (error) {
    console.error('Error exportando datos múltiples:', error);
    throw new Error('Error exportando datos múltiples');
  }
};

/**
 * Generar reporte completo de riesgos
 */
export const generateCompleteRiskReport = async (data, filename = 'reporte-riesgos-completo.xlsx') => {
  const dataTypes = [
    ['Riesgos', data.risks || [], 'risks'],
    ['Amenazas', data.threats || [], 'threats'],
    ['Vulnerabilidades', data.vulnerabilities || [], 'vulnerabilities'],
    ['CVEs', data.cves || [], 'cves']
  ];
  
  await exportMultipleDataTypes(dataTypes, filename);
};

/**
 * Crear backup completo de datos
 */
export const createDataBackup = async (allData, filename = null) => {
  const backupFilename = filename || generateFilename('backup-sigrisk', 'json');
  
  const backupData = {
    timestamp: new Date().toISOString(),
    version: '1.0',
    organization: allData.organization || 'Unknown',
    data: allData,
    metadata: {
      totalRisks: allData.risks?.length || 0,
      totalCVEs: allData.cves?.length || 0,
      totalThreats: allData.threats?.length || 0,
      totalVulnerabilities: allData.vulnerabilities?.length || 0
    }
  };
  
  exportToJSON(backupData, backupFilename);
};

/**
 * Generar plantilla de importación
 */
export const generateImportTemplate = async (type = 'risks', filename = null) => {
  const templateFilename = filename || generateFilename(`plantilla-${type}`, 'xlsx');
  
  const templates = {
    risks: [
      {
        'Nombre': 'Ejemplo: Pérdida de datos confidenciales',
        'Descripción': 'Descripción detallada del riesgo',
        'Activo': 'Nombre del activo',
        'Amenaza': 'Nombre de la amenaza',
        'Vulnerabilidad': 'Nombre de la vulnerabilidad',
        'Probabilidad (0-1)': '0.3',
        'Impacto (0-1)': '0.7',
        'Estrategia': 'mitigate',
        'Prioridad': 'high'
      }
    ],
    threats: [
      {
        'Código MAGERIT': 'E.8',
        'Nombre': 'Difusión de software dañino',
        'Descripción': 'Instalación de programas maliciosos',
        'Categoría': 'cyberattacks',
        'Probabilidad Base (0-1)': '0.7',
        'Confidencialidad': 'Sí',
        'Integridad': 'Sí',
        'Disponibilidad': 'Sí'
      }
    ],
    vulnerabilities: [
      {
        'Nombre': 'Software desactualizado',
        'Descripción': 'Versiones obsoletas con vulnerabilidades conocidas',
        'Tipo': 'technical',
        'Categoría': 'software_vulnerabilities',
        'Nivel (0-1)': '0.8',
        'Activo': 'Nombre del activo',
        'Prioridad': 'high'
      }
    ]
  };
  
  const templateData = templates[type] || templates.risks;
  await exportToExcel(templateData, templateFilename, 'Plantilla');
};

/**
 * Validar archivo de importación
 */
export const validateImportFile = async (file, expectedType = 'risks') => {
  try {
    const XLSX = (await import('xlsx')).default;
    
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      throw new Error('El archivo está vacío');
    }
    
    // Validaciones específicas por tipo
    const requiredFields = {
      risks: ['Nombre', 'Descripción', 'Activo', 'Amenaza', 'Vulnerabilidad'],
      threats: ['Código MAGERIT', 'Nombre', 'Descripción', 'Categoría'],
      vulnerabilities: ['Nombre', 'Descripción', 'Tipo', 'Activo']
    };
    
    const required = requiredFields[expectedType] || requiredFields.risks;
    const headers = Object.keys(jsonData[0]);
    const missingFields = required.filter(field => !headers.includes(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
    }
    
    return {
      isValid: true,
      data: jsonData,
      rowCount: jsonData.length,
      headers: headers
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Exportar configuración de matriz de riesgo
 */
export const exportRiskMatrixConfig = async (matrixConfig, filename = 'configuracion-matriz.json') => {
  const exportConfig = {
    timestamp: new Date().toISOString(),
    version: matrixConfig.version || '1.0',
    name: matrixConfig.name,
    description: matrixConfig.description,
    dimensions: matrixConfig.dimensions,
    riskTolerance: matrixConfig.tolerance,
    escalation: matrixConfig.escalation,
    kpiConfiguration: matrixConfig.kpiConfiguration
  };
  
  exportToJSON(exportConfig, filename);
};

/**
 * Comprimir y exportar múltiples archivos
 */
export const exportCompressedFiles = async (files, filename = 'export.zip') => {
  try {
    // Importar JSZip dinámicamente
    const JSZip = (await import('jszip')).default;
    
    const zip = new JSZip();
    
    // Añadir archivos al ZIP
    for (const [fileName, content, type] of files) {
      if (type === 'json') {
        zip.file(fileName, JSON.stringify(content, null, 2));
      } else if (type === 'csv') {
        zip.file(fileName, content);
      } else if (type === 'blob') {
        zip.file(fileName, content);
      }
    }
    
    // Generar ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, filename);
    
  } catch (error) {
    console.error('Error creando archivo comprimido:', error);
    throw new Error('Error creando archivo comprimido');
  }
};