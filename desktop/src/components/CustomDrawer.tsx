import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, List, Settings, X } from 'lucide-react'; // Importar X
import { Divider } from './Divider';

// 1. Props para o LinkItem
interface LinkItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void; // Para fechar o drawer ao clicar
}

const LinkItem: React.FC<LinkItemProps> = ({ to, label, icon, onClick }) => {
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
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

// 3. Props para o CustomDrawer
interface CustomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomDrawer: React.FC<CustomDrawerProps> = ({ isOpen, onClose }) => {
  return (
    // 4. Lógica de classes para responsividade
    <div
      className={`
        fixed inset-y-0 left-0 z-40 flex h-full w-64 pt-8 transform flex-col gap-2 bg-white p-4 shadow-lg
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:static md:translate-x-0
      `}
    >
      {/* Topo do Drawer */}
      <div className="flex items-center justify-between p-2 mb-4">
        <div className="flex items-center gap-3">
          {/* Usando um ícone placeholder, você pode trocar pela sua logo */}
          <img src="/icon.png" width={60} alt="icon" />
          <span className="text-xl font-bold text-gray-800">CF Prático</span>
        </div>
        {/* 5. Botão de Fechar (só no mobile) */}
        <button
          onClick={onClose}
          className="p-1 text-gray-600 hover:bg-gray-200 rounded-full md:hidden"
          aria-label="Fechar menu"
        >
          <X size={22} />
        </button>
        
      </div>

      {/* Itens de Navegação */}
      <nav className="flex flex-col gap-1">
        <LinkItem to="/" label="Resumo" icon={<LayoutDashboard size={20} />} onClick={onClose} />
        <LinkItem to="/statement" label="Movimentação" icon={<List size={20} />} onClick={onClose} />
        <LinkItem to="/settings" label="Configurações" icon={<Settings size={20} />} onClick={onClose} />
      </nav>

      {/* Rodapé do Drawer */}
      <div className="mt-auto p-2">
        <Divider/>
        <span className="text-xs text-gray-400">Versão Desktop 1.0</span>
      </div>
    </div>
  );
};