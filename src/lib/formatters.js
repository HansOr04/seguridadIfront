/**
 * Utilidades de formateo para el frontend SIGRISK-EC
 */

/**
 * Formatear moneda en USD
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatear porcentaje
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  // Si el valor es mayor a 1, asumimos que ya está en porcentaje
  const percentage = value > 1 ? value : value * 100;
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(percentage / 100);
};

/**
 * Formatear números grandes con abreviaciones
 */
export const formatLargeNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const absNum = Math.abs(num);
  
  if (absNum >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  } else if (absNum >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  } else if (absNum >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  
  return num.toLocaleString();
};

/**
 * Formatear fecha relativa (ej: "hace 2 días")
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Nunca';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now - targetDate;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) {
    return 'Hace unos segundos';
  } else if (diffMins < 60) {
    return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  } else if (diffWeeks < 4) {
    return `Hace ${diffWeeks} semana${diffWeeks !== 1 ? 's' : ''}`;
  } else if (diffMonths < 12) {
    return `Hace ${diffMonths} mes${diffMonths !== 1 ? 'es' : ''}`;
  } else {
    return `Hace ${diffYears} año${diffYears !== 1 ? 's' : ''}`;
  }
};

/**
 * Formatear fecha absoluta
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '-';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('es-ES', defaultOptions);
};

/**
 * Formatear fecha y hora
 */
export const formatDateTime = (date, options = {}) => {
  if (!date) return '-';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return new Date(date).toLocaleDateString('es-ES', defaultOptions);
};

/**
 * Formatear duración en horas/días
 */
export const formatDuration = (hours) => {
  if (!hours || hours < 0) return '0 horas';
  
  if (hours < 24) {
    return `${Math.round(hours)} hora${hours !== 1 ? 's' : ''}`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  let result = `${days} día${days !== 1 ? 's' : ''}`;
  
  if (remainingHours > 0) {
    result += ` y ${Math.round(remainingHours)} hora${remainingHours !== 1 ? 's' : ''}`;
  }
  
  return result;
};

/**
 * Formatear puntuación CVSS
 */
export const formatCVSSScore = (score) => {
  if (score === null || score === undefined || isNaN(score)) {
    return 'N/A';
  }
  
  return parseFloat(score).toFixed(1);
};

/**
 * Obtener severidad CVSS basada en puntuación
 */
export const getCVSSSeverity = (score) => {
  if (!score || score === 0) return 'none';
  if (score >= 9.0) return 'critical';
  if (score >= 7.0) return 'high';
  if (score >= 4.0) return 'medium';
  return 'low';
};

/**
 * Formatear nivel de riesgo para mostrar
 */
export const formatRiskLevel = (level) => {
  const levels = {
    'very_low': 'Muy Bajo',
    'low': 'Bajo',
    'medium': 'Medio',
    'high': 'Alto',
    'critical': 'Crítico'
  };
  
  return levels[level] || level;
};

/**
 * Formatear estado de tratamiento
 */
export const formatTreatmentStatus = (status) => {
  const statuses = {
    'identified': 'Identificado',
    'analyzed': 'Analizado',
    'treatment_planned': 'Tratamiento Planificado',
    'treatment_in_progress': 'En Tratamiento',
    'monitored': 'Monitoreado',
    'closed': 'Cerrado'
  };
  
  return statuses[status] || status;
};

/**
 * Formatear estado de remediación CVE
 */
export const formatRemediationStatus = (status) => {
  const statuses = {
    'pending': 'Pendiente',
    'in_progress': 'En Progreso',
    'completed': 'Completado',
    'risk_accepted': 'Riesgo Aceptado',
    'not_applicable': 'No Aplicable'
  };
  
  return statuses[status] || status;
};

/**
 * Formatear bytes a unidades legibles
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Truncar texto con elipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalizar primera letra
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formatear ID de riesgo para mostrar
 */
export const formatRiskId = (riskId) => {
  if (!riskId) return '';
  
  // Formato esperado: ORG-ASSET-THREAT-001
  const parts = riskId.split('-');
  if (parts.length >= 4) {
    return `${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}`;
  }
  
  return riskId;
};

/**
 * Formatear código MAGERIT
 */
export const formatMageritCode = (code) => {
  if (!code) return '';
  
  // Formato esperado: A.1, E.2, etc.
  return code.toUpperCase();
};

/**
 * Obtener color para nivel de riesgo
 */
export const getRiskLevelColor = (level) => {
  const colors = {
    'very_low': '#10b981',   // Verde
    'low': '#84cc16',        // Verde claro
    'medium': '#f59e0b',     // Amarillo
    'high': '#f97316',       // Naranja
    'critical': '#dc2626'    // Rojo
  };
  
  return colors[level] || '#6b7280';
};

/**
 * Obtener color para severidad CVE
 */
export const getCVSSSeverityColor = (severity) => {
  const colors = {
    'none': '#6b7280',
    'low': '#84cc16',
    'medium': '#f59e0b',
    'high': '#f97316',
    'critical': '#dc2626'
  };
  
  return colors[severity] || '#6b7280';
};

/**
 * Formatear probabilidad como texto descriptivo
 */
export const formatProbabilityText = (probability) => {
  if (probability >= 0.8) return 'Muy Alta';
  if (probability >= 0.6) return 'Alta';
  if (probability >= 0.4) return 'Media';
  if (probability >= 0.2) return 'Baja';
  return 'Muy Baja';
};

/**
 * Formatear impacto como texto descriptivo
 */
export const formatImpactText = (impact) => {
  if (impact >= 0.8) return 'Muy Alto';
  if (impact >= 0.6) return 'Alto';
  if (impact >= 0.4) return 'Medio';
  if (impact >= 0.2) return 'Bajo';
  return 'Muy Bajo';
};

/**
 * Formatear valor económico con moneda local
 */
export const formatLocalCurrency = (amount) => {
  // Para Ecuador - USD es la moneda oficial
  return formatCurrency(amount, 'USD');
};

/**
 * Generar texto de resumen de riesgo
 */
export const generateRiskSummary = (risk) => {
  const levelText = formatRiskLevel(risk.classification.riskLevel);
  const probabilityText = formatProbabilityText(risk.calculation.threatProbability);
  const impactText = formatImpactText(risk.calculation.aggregatedImpact);
  
  return `Riesgo ${levelText.toLowerCase()} con probabilidad ${probabilityText.toLowerCase()} e impacto ${impactText.toLowerCase()}`;
};

/**
 * Validar y formatear email
 */
export const formatEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Formatear número de teléfono (Ecuador)
 */
export const formatEcuadorPhone = (phone) => {
  if (!phone) return '';
  
  // Remover caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formato ecuatoriano: +593 9 XXXX XXXX
  if (cleaned.length === 10 && cleaned.startsWith('09')) {
    return `+593 ${cleaned.substring(1, 2)} ${cleaned.substring(2, 6)} ${cleaned.substring(6)}`;
  }
  
  return phone;
};

/**
 * Formatear RUC ecuatoriano
 */
export const formatEcuadorRUC = (ruc) => {
  if (!ruc) return '';
  
  const cleaned = ruc.replace(/\D/g, '');
  
  if (cleaned.length === 13) {
    return `${cleaned.substring(0, 10)}-${cleaned.substring(10)}`;
  }
  
  return ruc;
};