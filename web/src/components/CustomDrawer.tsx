
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, List, Settings, X } from 'lucide-react';
import { Divider } from './Divider';
import { useUserConfig } from '../hooks/useUserConfig';

interface LinkItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const LinkItem: React.FC<LinkItemProps> = ({ to, label, icon, onClick }) => {
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-200 ${isActive ? 'bg-gray-200 font-semibold' : ''
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
};

interface CustomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}


export const CustomDrawer: React.FC<CustomDrawerProps> = ({ isOpen, onClose }) => {
  const { config } = useUserConfig();

  const logoSrc = config?.company_logo || '/icon.png';
  const companyName = config?.company_name || 'CF Prático';

  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-40 flex h-full w-64 transform flex-col gap-2 bg-white p-4 shadow-lg
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:static md:translate-x-0
      `}
    >
      {/* Topo do Drawer */}
      <div className="flex items-center justify-between p-2 mb-1">
        <div className="flex flex-col items-center gap-3">

          {/* --- LOGO ATUALIZADA --- */}
          <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
            <img
              src={logoSrc}
              className="w-full h-full object-contain"
              alt="Logo"
            />
          </div>
          {/* --- FIM DA ATUALIZAÇÃO --- */}

          <span className="text-xl font-bold text-gray-800">{companyName}</span>
        </div>



        {/* Botão de Fechar (só no mobile) */}
        <button
          onClick={onClose}
          className="p-1 text-gray-600 hover:bg-gray-200 rounded-full md:hidden"
          aria-label="Fechar menu"
        >
          <X size={22} />
        </button>

      </div>

      <Divider />

      {/* Itens de Navegação */}
      {/* ... (sem alterações) ... */}
      <nav className="flex flex-col gap-1">
        <LinkItem to="/" label="Resumo" icon={<LayoutDashboard size={20} />} onClick={onClose} />
        <LinkItem to="/statement" label="Movimentação" icon={<List size={20} />} onClick={onClose} />
        <LinkItem to="/settings" label="Configurações" icon={<Settings size={20} />} onClick={onClose} />
      </nav>

      {/* Rodapé do Drawer */}
      {/* ... (sem alterações) ... */}
      <div className="mt-auto p-2">
        <span className="text-xs text-gray-500 block">
          Disponibilizado por:
        </span>
        <Link
          to="/onvale-contact"
          onClick={onClose}
          className="text-sm font-semibold text-gray-700 hover:text-red-800 block transition-colors"
        >
          OnVale Contabilidade
        </Link>
        <Divider className="my-2" />
        <span className="text-xs text-gray-400 block">Versão Web 1.0</span>
      </div>
    </div>
  );
};