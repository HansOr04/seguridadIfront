'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  BarChart3, 
  Database, 
  Network, 
  AlertTriangle, 
  FileText, 
  Settings, 
  Menu, 
  X, 
  Home,
  Plus,
  Download,
  Upload,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Package,
  GitBranch,
  Activity,
  TrendingUp
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Vista general del sistema'
  },
  {
    title: 'Activos',
    icon: Package,
    children: [
      {
        title: 'Todos los Activos',
        href: '/dashboard/assets',
        icon: Database,
        description: 'Gestionar inventario completo'
      },
      {
        title: 'Crear Activo',
        href: '/dashboard/assets/create',
        icon: Plus,
        description: 'Agregar nuevo activo MAGERIT'
      },
      {
        title: 'Importar Activos',
        href: '/dashboard/assets/import',
        icon: Upload,
        description: 'Importación masiva desde Excel'
      },
      {
        title: 'Exportar Datos',
        href: '/dashboard/assets/export',
        icon: Download,
        description: 'Exportar en múltiples formatos'
      }
    ]
  },
  {
    title: 'Valoración MAGERIT',
    icon: BarChart3,
    children: [
      {
        title: 'Panel de Valoración',
        href: '/dashboard/valuation',
        icon: TrendingUp,
        description: 'Valoración según metodología MAGERIT'
      },
      {
        title: 'Matriz de Criticidad',
        href: '/dashboard/valuation/matrix',
        icon: BarChart3,
        description: 'Matriz 5x5 de criticidad'
      },
      {
        title: 'Taxonomía MAGERIT',
        href: '/dashboard/valuation/taxonomy',
        icon: GitBranch,
        description: 'Clasificación según estándares'
      }
    ]
  },
  {
    title: 'Dependencias',
    icon: Network,
    children: [
      {
        title: 'Mapa de Dependencias',
        href: '/dashboard/dependencies',
        icon: Network,
        description: 'Visualizar interrelaciones'
      },
      {
        title: 'Análisis de Impacto',
        href: '/dashboard/dependencies/analysis',
        icon: Activity,
        description: 'Impacto en cascada'
      }
    ]
  },
  {
    title: 'Reportes',
    icon: FileText,
    children: [
      {
        title: 'Reporte Ejecutivo',
        href: '/dashboard/reports/executive',
        icon: FileText,
        description: 'Resumen para directivos'
      },
      {
        title: 'Reporte MAGERIT',
        href: '/dashboard/reports/magerit',
        icon: Shield,
        description: 'Cumplimiento metodológico'
      },
      {
        title: 'Análisis de Duplicados',
        href: '/dashboard/reports/duplicates',
        icon: Search,
        description: 'Detección de activos duplicados'
      }
    ]
  }
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(['Activos']);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const toggleExpanded = (title) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActivePath = (href) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const SidebarItem = ({ item, level = 0 }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const isActive = item.href && isActivePath(item.href);

    if (hasChildren) {
      return (
        <div className="mb-1">
          <button
            onClick={() => toggleExpanded(item.title)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              level > 0 ? 'ml-4' : ''
            } ${
              isExpanded 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <item.icon className={`mr-3 h-5 w-5 ${isExpanded ? 'text-primary-600' : ''}`} />
              <span>{item.title}</span>
            </div>
            <ChevronDown 
              className={`h-4 w-4 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children.map((child) => (
                <SidebarItem key={child.title} item={child} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors mb-1 ${
          level > 0 ? 'ml-8' : ''
        } ${
          isActive
            ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
        title={item.description}
      >
        <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-600' : ''}`} />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-lg font-bold text-gray-900">SIGRISK-EC</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-5 px-4 space-y-1 max-h-screen overflow-y-auto">
              {sidebarItems.map((item) => (
                <SidebarItem key={item.title} item={item} />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Shield className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">SIGRISK-EC</span>
          </div>
          
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-4 space-y-1">
              {sidebarItems.map((item) => (
                <SidebarItem key={item.title} item={item} />
              ))}
            </nav>
          </div>

          {/* Usuario info en sidebar */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role === 'admin' ? 'Administrador' : 
                   user?.role === 'analyst' ? 'Analista' : 'Visualizador'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Header superior */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <label htmlFor="search-field" className="sr-only">
                  Buscar activos
                </label>
                <div className="relative w-full text-gray-400 focus-within:text-gray-600 max-w-lg">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    id="search-field"
                    className="block w-full h-full pl-10 pr-3 py-2 border-0 bg-gray-50 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:bg-white sm:text-sm"
                    placeholder="Buscar activos por nombre o código..."
                    type="search"
                  />
                </div>
              </div>
            </div>

            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notificaciones */}
              <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  3
                </span>
              </button>

              {/* Menú de usuario */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-gray-500 border-b">
                        {user?.email}
                      </div>
                      <Link
                        href="/dashboard/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="inline h-4 w-4 mr-2" />
                        Mi Perfil
                      </Link>
                      <Link
                        href="/dashboard/organization/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="inline h-4 w-4 mr-2" />
                        Configuración
                      </Link>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="inline h-4 w-4 mr-2" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Área de contenido principal */}
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}