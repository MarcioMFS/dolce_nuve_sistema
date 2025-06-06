import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { 
  Home, 
  PackageOpen, 
  Clipboard, 
  IceCream2,
  ShoppingCart,
  BarChart3,
  Package,
  Menu, 
  X,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, isActive, onClick }) => {
  return (
    <Link
      to={to}
      className={twMerge(
        'flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-primary-100',
        isActive && 'bg-primary-100 text-primary-600'
      )}
      onClick={onClick}
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
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { to: '/produtos', label: 'Produtos', icon: <PackageOpen size={20} /> },
    { to: '/receitas', label: 'Receitas', icon: <Clipboard size={20} /> },
    { to: '/geladinhos', label: 'Geladinhos', icon: <IceCream2 size={20} /> },
    { to: '/estoque', label: 'Estoque', icon: <Package size={20} /> },
    { to: '/vendas', label: 'Vendas', icon: <ShoppingCart size={20} /> },
    { to: '/relatorios', label: 'Relatórios', icon: <BarChart3 size={20} /> },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Get current page title
  const currentPage = navItems.find(item => item.to === location.pathname)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-20 md:hidden">
        <div className="bg-white shadow-sm px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{currentPage}</h1>
          <img src="/logodolcenuve.svg" alt="Dolce Nuve" className="h-10 w-10" />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={twMerge(
          'fixed inset-0 bg-black/50 z-30 transition-opacity md:hidden',
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeMobileMenu}
      />

      {/* Mobile Sidebar */}
      <div
        className={twMerge(
          'fixed inset-y-0 left-0 z-40 w-3/4 max-w-sm bg-white transform transition-transform duration-300 ease-in-out md:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <img src="/logodolcenuve.svg" alt="Dolce Nuve" className="h-12 w-12" />
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  isActive={location.pathname === item.to}
                  onClick={closeMobileMenu}
                />
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                closeMobileMenu();
                handleLogout();
              }}
              className="flex w-full items-center space-x-3 p-3 rounded-lg text-error-600 hover:bg-error-50 transition-colors"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white shadow-md">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center justify-center px-4 mb-6">
                <img src="/logodolcenuve.svg" alt="Dolce Nuve" className="h-16 w-16" />
              </div>
              <nav className="p-3 space-y-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.to}
                    {...item}
                    isActive={location.pathname === item.to}
                  />
                ))}
              </nav>
            </div>
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex w-full items-center space-x-3 p-3 rounded-lg text-error-600 hover:bg-error-50 transition-colors"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none md:pt-0 pt-16">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};