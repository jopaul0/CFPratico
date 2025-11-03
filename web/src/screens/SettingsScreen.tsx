// src/screens/SettingsScreen.tsx
// Traduzido de
// <TouchableOpacity> -> <button> ou <Link>
// O componente NavLink é definido localmente

import React from 'react';
import { MainContainer } from '../components/MainContainer';
import { InputGroup } from '../components/InputGroup';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import {
  ChevronRight,
  Database,
  Wallet,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom'; // Usaremos o Link do router

// NavLink (traduzido do componente local em SettingsScreen.tsx)
// Agora usa o <Link> do React Router
const NavLink: React.FC<{
  title: string;
  description: string;
  href: string; // Trocamos onPress por href
  icon: React.ReactNode;
}> = ({ title, description, href, icon }) => (
  <Link
    to={href}
    className="flex flex-row items-center p-4 bg-white rounded-lg mb-3 shadow hover:bg-gray-50"
  >
    <div className="mr-4 p-2 bg-gray-100 rounded-full">{icon}</div>
    <div className="flex-1">
      <p className="text-base font-semibold text-gray-800">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <ChevronRight size={20} color="#9ca3af" />
  </Link>
);

// Botão de Ação (para Importar/Exportar, que não são links)
const ActionButton: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ title, description, icon }) => (
  <button
    type="button"
    className="w-full flex flex-row items-center p-4 bg-white rounded-lg mb-3 shadow hover:bg-gray-50 text-left"
  >
    <div className="mr-4 p-2 bg-gray-100 rounded-full">{icon}</div>
    <div className="flex-1">
      <p className="text-base font-semibold text-gray-800">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <ChevronRight size={20} color="#9ca3af" />
  </button>
);

export const SettingsScreen: React.FC = () => {
  const isSaving = false;

  return (
    <MainContainer>
      {/* Dados da Empresa */}
      <div className="p-4 bg-white rounded-lg shadow mb-6">
        <p className="text-lg font-semibold text-gray-700 mb-3">
          Dados da Empresa
        </p>
        <InputGroup
          label="Nome da Empresa"
          placeholder="Minha Empresa LTDA"
          value={""}
        />
        <InputGroup
          label="Saldo Inicial"
          placeholder="0,00"
          keyboardType="numeric"
          value={"R$ 0,00"}
        />
        <SimpleButton
          title={isSaving ? 'Salvando...' : 'Salvar Dados'}
          className="bg-blue-600 text-white hover:bg-blue-700 w-full"
          disabled={isSaving}
        />
      </div>

      <Divider />

      {/* Personalização */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 mt-4">
        Personalização
      </h2>
      <NavLink
        title="Gerenciar Categorias"
        description="Adicione, edite ou remova categorias de transação."
        icon={<Database size={22} color="#4b5563" />}
        href="/settings/categories" // Rota definida no AppLayout
      />
      <NavLink
        title="Gerenciar Formas de Pagamento"
        description="Adicione, edite ou remova formas de pagamento."
        icon={<Wallet size={22} color="#4b5563" />}
        href="/settings/payment-methods" // Rota definida no AppLayout
      />

      <Divider />

      {/* Backup e Restauração */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 mt-4">
        Backup e Restauração de Dados
      </h2>
      <ActionButton
        title="Exportar Dados"
        description="Salva um arquivo (.json) com suas transações, categorias e métodos."
        icon={<UploadCloud size={22} color="#059669" />}
      />
      <ActionButton
        title="Importar (Restaurar) Dados"
        description="Substitui os dados atuais por um arquivo de backup (.json)."
        icon={<DownloadCloud size={22} color="#ca8a04" />}
      />
      <ActionButton
        title="Resetar Aplicativo"
        description="Apaga todos os dados e restaura o app para o padrão de fábrica."
        icon={<RefreshCw size={22} color="#dc2626" />}
      />
    </MainContainer>
  );
};