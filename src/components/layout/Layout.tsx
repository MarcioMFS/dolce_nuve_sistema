import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { 
  Home, 
  PackageOpen, 
  Clipboard, 
  IceCream2,
  ShoppingCart,
  BarChart3,
  Menu, 
  X,
  Settings,
  LogOut
} from 'lucide-react';

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, isActive }) => {
  return (
    <Link
      to={to}
      className={twMerge(
        'flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-primary-100',
        isActive && 'bg-primary-100 text-primary-600'
      )}
    >
      <span className={twMerge(isActive ? 'text-primary-600' : 'text-gray-500')}>
        {icon}
      </span>
      <span className={twMerge('text-sm font-medium', isActive ? 'text-primary-600' : 'text-gray-700')}>
        {label}
      </span>
    </Link>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { to: '/produtos', label: 'Produtos', icon: <PackageOpen size={20} /> },
    { to: '/receitas', label: 'Receitas', icon: <Clipboard size={20} /> },
    { to: '/geladinhos', label: 'Geladinhos', icon: <IceCream2 size={20} /> },
    { to: '/vendas', label: 'Vendas', icon: <ShoppingCart size={20} /> },
    { to: '/relatorios', label: 'Relatórios', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-50"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={twMerge(
          'fixed inset-0 z-20 transform transition-transform duration-300 ease-in-out md:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div
          className="absolute inset-0 bg-gray-500 bg-opacity-75"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        <div className="relative bg-white w-64 h-full overflow-y-auto shadow-xl">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/#FDEFC9.png" alt="Dolce Nuve" className="h-12 w-12" />
              <span className="text-xl font-bold text-primary-400">Dolce Nuve</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.to}
              />
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
            <div className="space-y-1">
              <Link
                to="/configuracoes"
                className="flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-primary-100"
              >
                <span className="text-gray-500">
                  <Settings size={20} />
                </span>
                <span className="text-sm font-medium text-gray-700">Configurações</span>
              </Link>
              <button
                className="flex w-full items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-primary-100"
              >
                <span className="text-gray-500">
                  <LogOut size={20} />
                </span>
                <span className="text-sm font-medium text-gray-700">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white shadow-md">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center justify-center px-4 mb-6">
                <img src="/#FDEFC9.png" alt="Dolce Nuve" className="h-12 w-12 mr-2" />
                <span className="text-xl font-bold text-primary-400">Dolce Nuve</span>
              </div>
              <nav className="p-3 space-y-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    isActive={location.pathname === item.to}
                  />
                ))}
              </nav>
            </div>
            <div className="p-3 border-t border-gray-200">
              <div className="space-y-1">
                <Link
                  to="/configuracoes"
                  className="flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-primary-100"
                >
                  <span className="text-gray-500">
                    <Settings size={20} />
                  </span>
                  <span className="text-sm font-medium text-gray-700">Configurações</span>
                </Link>
                <button
                  className="flex w-full items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-primary-100"
                >
                  <span className="text-gray-500">
                    <LogOut size={20} />
                  </span>
                  <span className="text-sm font-medium text-gray-700">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};