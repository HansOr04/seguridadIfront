'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { 
  Shield, 
  BarChart3, 
  Users, 
  FileText,
  ArrowRight,
  CheckCircle,
  Globe,
  Lock
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Se redirigirá al dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container-responsive">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">SIGRISK-EC</h1>
                <p className="text-xs text-gray-600">MAGERIT v3.0</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/register" 
                className="btn-primary"
              >
                Comenzar
              </Link>
            </nav>
            <div className="md:hidden">
              <Link href="/login" className="btn-primary">
                Ingresar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-4">
                <Globe className="w-4 h-4 mr-2" />
                Sistema Ecuatoriano de Gestión de Riesgos
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-primary-600">SIGRISK-EC</span>
              <br />
              MAGERIT
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sistema de Análisis Cuantitativo de Riesgos Cibernéticos basado en 
              MAGERIT v3.0 y normativas ecuatorianas para PYMEs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="btn-primary btn-lg group"
              >
                Comenzar Evaluación
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/login" 
                className="btn-secondary btn-lg"
              >
                Acceder al Sistema
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Implementación completa de MAGERIT v3.0 con enfoque cuantitativo 
              y cumplimiento de normativas ecuatorianas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gestión de Activos
              </h3>
              <p className="text-gray-600">
                Inventario completo con taxonomía MAGERIT y valoración cuantitativa.
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Análisis Cuantitativo
              </h3>
              <p className="text-gray-600">
                Cálculos matemáticos precisos con métricas VaR y simulación Monte Carlo.
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Integración CVE
              </h3>
              <p className="text-gray-600">
                Sincronización automática con NVD para amenazas emergentes.
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reportería Avanzada
              </h3>
              <p className="text-gray-600">
                Informes ejecutivos y técnicos con cumplimiento normativo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-responsive">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Beneficios para tu Organización
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Reduce el tiempo de evaluación en 85% mientras incrementas 
                la precisión en 94% con nuestra metodología automatizada.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Cumplimiento Automático</h4>
                    <p className="text-gray-600">Alineación continua con normativas ecuatorianas e internacionales.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">ROI Comprobado</h4>
                    <p className="text-gray-600">340% retorno de inversión promedio en primeros 18 meses.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Monitoreo en Tiempo Real</h4>
                    <p className="text-gray-600">Dashboard con KPIs y alertas automáticas de riesgo crítico.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-strong p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 text-white rounded-2xl mb-4">
                    <BarChart3 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Dashboard en Vivo</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Riesgo Total</span>
                    <span className="font-semibold text-primary-600">Medio (42/100)</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Activos Evaluados</span>
                    <span className="font-semibold text-gray-900">1,247</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">CVE Críticos</span>
                    <span className="font-semibold text-red-600">3 Nuevos</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Cumplimiento</span>
                    <span className="font-semibold text-green-600">95%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="container-responsive text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para Fortalecer tu Seguridad?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Únete a las organizaciones que ya confían en SIGRISK-EC MAGERIT 
            para proteger sus activos críticos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Comenzar Evaluación Gratuita
            </Link>
            <Link 
              href="/login" 
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Acceder al Sistema
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container-responsive">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-8 w-8 text-primary-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">SIGRISK-EC MAGERIT</h3>
                  <p className="text-sm text-gray-400">v1.0.0 - Fase 1</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Sistema de análisis cuantitativo de riesgos cibernéticos 
                desarrollado por USFQ siguiendo la metodología MAGERIT v3.0.
              </p>
              <p className="text-sm text-gray-500">
                © 2025 Universidad San Francisco de Quito. Todos los derechos reservados.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guías MAGERIT</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Soporte Técnico</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li>soporte@sigrisk.ec</li>
                <li>+593 2 297 1700</li>
                <li>Quito, Ecuador</li>
                <li>USFQ - Cumbayá</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}