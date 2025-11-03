import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, List, Settings, TestTube2 } from 'lucide-react'; 


const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:text-gray-900 ${
    isActive ? '!text-gray-900 bg-gray-100' : ''
  }`;

export const AppLayout: React.FC = () => {
  return (
    // Layout principal com sidebar (seu antigo Drawer)
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr]">
      
      {/* Sidebar (Seu antigo CustomDrawer.tsx) */}
      <aside className="hidden border-r bg-gray-50/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          {/* Topo da Sidebar (Logo) */}
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold text-gray-800">CF Prático</h1>
          </div>

          {/* Links de Navegação (Substitui DrawerItemList) */}
          <nav className="flex-1 gap-2 p-4 text-base font-medium">
            <NavLink to="/" className={getNavLinkClass} end>
              <Home className="h-5 w-5" />
              Resumo (Dashboard)
            </NavLink>
            <NavLink to="/statement" className={getNavLinkClass}>
              <List className="h-5 w-5" />
              Movimentação
            </NavLink>
            <NavLink to="/settings" className={getNavLinkClass}>
              <Settings className="h-5 w-5" />
              Configurações
            </NavLink>
            <NavLink to="/test" className={getNavLinkClass}>
              <TestTube2 className="h-5 w-5" />
              Teste (Admin)
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex flex-1 flex-col bg-gray-100">
        {/* A "Mágica" do React Router:
          Aqui é onde todas as suas "telas" (Dashboard, Statement, etc.) 
          serão renderizadas, substituindo este <Outlet />.
        */}
        <Outlet />
      </main>
    </div>
  );
};