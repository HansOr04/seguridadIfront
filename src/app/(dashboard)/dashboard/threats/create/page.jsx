'use client';

import { Suspense } from 'react';
import ThreatList from '@/components/threats/ThreatList';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Loading component
const ThreatsLoading = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mt-2 animate-pulse"></div>
      </div>
      <div className="mt-4 sm:mt-0">
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
    </div>

    {/* Stats skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-12 mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Controls skeleton */}
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-10 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Table skeleton */}
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2 animate-pulse"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="flex space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Error boundary component
const ThreatsError = ({ error, retry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
      </div>
      
      <h1 className="text-lg font-semibold text-gray-900 text-center mb-2">
        Error al cargar amenazas
      </h1>
      
      <p className="text-sm text-gray-600 text-center mb-6">
        {error?.message || 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.'}
      </p>
      
      <div className="flex flex-col space-y-3">
        <button
          onClick={retry}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Intentar de nuevo
        </button>
        
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Volver al Dashboard
        </button>
      </div>
      
      {/* Technical details for developers */}
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <summary className="cursor-pointer font-medium">Detalles técnicos</summary>
          <pre className="mt-2 whitespace-pre-wrap text-gray-700">
            {error.stack || error.toString()}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// Breadcrumb component
const ThreatsBreadcrumb = () => (
  <nav className="flex mb-6" aria-label="Breadcrumb">
    <ol className="inline-flex items-center space-x-1 md:space-x-3">
      <li className="inline-flex items-center">
        <a
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
        >
          Dashboard
        </a>
      </li>
      <li>
        <div className="flex items-center">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
            Amenazas
          </span>
        </div>
      </li>
    </ol>
  </nav>
);

// Main page component
export default function ThreatsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <ThreatsBreadcrumb />
        
        {/* Main content */}
        <Suspense fallback={<ThreatsLoading />}>
          <ThreatList />
        </Suspense>
      </div>
    </div>
  );
}

// Error boundary wrapper for production
export function ThreatsPageWithErrorBoundary() {
  return (
    <ErrorBoundary
      fallback={ThreatsError}
      onError={(error, errorInfo) => {
        // Log error to monitoring service
        console.error('Threats page error:', error, errorInfo);
        
        // In production, send to error tracking service
        if (process.env.NODE_ENV === 'production') {
          // Example: Sentry.captureException(error, { contexts: { errorInfo } });
        }
      }}
    >
      <ThreatsPage />
    </ErrorBoundary>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback({
        error: this.state.error,
        retry: () => this.setState({ hasError: false, error: null })
      });
    }

    return this.props.children;
  }
}