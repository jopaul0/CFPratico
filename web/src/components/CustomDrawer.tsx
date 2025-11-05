import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, List, Settings, Package } from 'lucide-react';

const LinkItem: React.FC<{ to: string; label: string; icon: React.ReactNode }> = ({ to, label, icon }) => {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-200 ${
          isActive ? 'bg-gray-200 font-semibold' : ''
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
};

export const CustomDrawer: React.FC = () => {
  return (
    <div className="flex h-full w-64 flex-col gap-2 border-r bg-white p-4 shadow-lg">
      {/* Topo do Drawer */}
      <div className="flex items-center gap-3 p-2 mb-4">
        {/* Usando um ícone placeholder, você pode trocar pela sua logo */}
        <div className="p-2 rounded-lg bg-gray-800 text-white">
            <Package size={28} /> 
        </div>
        <span className="text-xl font-bold text-gray-800">CF Prático</span>
      </div>

      {/* Itens de Navegação */}
      <nav className="flex flex-col gap-1">
        <LinkItem to="/" label="Resumo" icon={<LayoutDashboard size={20} />} />
        <LinkItem to="/statement" label="Movimentação" icon={<List size={20} />} />
        <LinkItem to="/settings" label="Configurações" icon={<Settings size={20} />} />
      </nav>

      {/* Rodapé do Drawer */}
      <div className="mt-auto p-2">
        <span className="text-xs text-gray-400">Versão Web 1.0</span>
      </div>
    </div>
  );
};