import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { 
  FiBarChart2, FiBookOpen, FiLogOut, FiMenu, FiPieChart, FiUsers // Adicionei FiUsers para Demográfico
} from 'react-icons/fi';

const NavItem = ({ to, icon: Icon, children, isCollapsed }) => {
  const getLinkClass = ({ isActive }) =>
    `flex items-center p-2 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-ifce-green-dark text-white'
        : 'text-gray-200 hover:bg-ifce-green-dark hover:text-white'
    }`;

  return (
    <NavLink to={to} className={getLinkClass}>
      <Icon size={20} className="flex-shrink-0" />
      {!isCollapsed && <span className="ml-3 font-medium">{children}</span>}
    </NavLink>
  );
};

export const Layout = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUI(); // Não precisamos mais de theme e toggleTheme aqui

  return (
    <div className="flex min-h-screen bg-ifce-gray-light dark:bg-dark-bg text-ifce-gray-dark dark:text-dark-text-primary">
      {/* Barra Lateral Dinâmica */}
      <aside className={`transition-all duration-300 bg-ifce-green-primary text-white flex flex-col ${
        isSidebarCollapsed ? 'w-20 items-center' : 'w-64'
      } shadow-lg z-40`}> {/* Adicionado shadow e z-index */}
        
        {/* Cabeçalho com Logo e Botão de Colapsar */}
        <div className={`p-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} mb-4`}>
          {/* Logo Maior quando expandido, ícone de logo quando colapsado */}
          {!isSidebarCollapsed ? (
            <div className="flex flex-col items-start">
              <img src="/logo-ifce.png" alt="Logo IFCE" className="h-12 bg-white p-1 rounded-md mb-2" />
              <h1 className="text-2xl font-bold text-white">CREAD</h1>
              <p className="text-sm text-green-100">Dashboard</p>
            </div>
          ) : (
            <img src="/logo-ifce.png" alt="Logo IFCE" className="h-8 bg-white p-1 rounded-md" />
          )}
          <button onClick={toggleSidebar} className={`p-2 rounded-lg hover:bg-ifce-green-dark ${isSidebarCollapsed ? 'hidden' : ''}`}> {/* Esconde o botão quando colapsado para centralizar a logo */}
            <FiMenu size={20} />
          </button>
        </div>

        {/* Botão para colapsar/expandir no modo colapsado */}
        {isSidebarCollapsed && (
          <div className="w-full flex justify-center p-4">
            <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-ifce-green-dark">
              <FiMenu size={20} />
            </button>
          </div>
        )}

        {/* Navegação */}
        <nav className={`flex-grow ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
          <ul className="space-y-2">
            <li><NavItem to="/" icon={FiUsers} isCollapsed={isSidebarCollapsed}>Perfil Demográfico</NavItem></li>
            <li><NavItem to="/enrollments" icon={FiBarChart2} isCollapsed={isSidebarCollapsed}>Matrículas</NavItem></li>
            <li><NavItem to="/courses" icon={FiBookOpen} isCollapsed={isSidebarCollapsed}>Cursos</NavItem></li>
            <li><NavItem to="/dropout" icon={FiLogOut} isCollapsed={isSidebarCollapsed}>Evasão</NavItem></li>
          </ul>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className={`flex-1 p-8 overflow-auto transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
        <Outlet />
      </main>
    </div>
  );
};