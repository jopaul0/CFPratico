// src/screens/TransactionDetailScreen.tsx
// Traduzido de
// Apenas modo de visualização.

import React from 'react';
import { DollarSign } from 'lucide-react';

import { MainContainer } from '../components/MainContainer';
import { Divider } from '../components/Divider';
import { SimpleButton } from '../components/SimpleButton';

// --- MOCK DATA PARA VISUAL ---
const MOCK_TX = {
  id: 1,
  category_icon_name: 'DollarSign',
  value: 1500.00,
  category_name: 'Venda de Software',
  date: '2025-10-25T00:00:00',
  condition: 'paid',
  installments: 1,
  type: 'revenue',
  payment_method_name: 'Pix',
  description: 'Venda da licença anual para Cliente X',
};
// --- FIM MOCK DATA ---

// Componente para o MODO DE VISUALIZAÇÃO
const ViewMode: React.FC<{ tx: any }> = ({ tx }) => {
  const Icon = DollarSign; // Placeholder
  const iconColor = '#9ca3af';
  const formattedValue = 'R$ 1.500,00';
  const formattedDate = '25/10/2025';
  const paymentConditionText = 'À Vista';
  const typeText = 'Receita';
  const valueColorClass = 'text-green-500';

  return (
    // O container principal foi removido, MainContainer cuida disso
    <div className="flex-1 bg-white rounded-lg m-0 p-4 shadow-lg md:m-4">
      <div className="items-center mb-6 text-center">
        <div className="p-4 rounded-full bg-gray-100 mb-3 inline-block">
          <Icon size={36} color={iconColor} />
        </div>
        <p className={`text-3xl font-bold ${valueColorClass}`}>
          {formattedValue}
        </p>
        <p className="text-gray-600 font-semibold mt-1">{tx.category_name}</p>
      </div>

      <Divider className="bg-gray-200" />

      {/* Detalhes */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
        <div>
          <p className="text-gray-500 text-xs font-medium">Tipo</p>
          <p className={`text-base font-semibold ${valueColorClass}`}>
            {typeText}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs font-medium">Forma de Pagamento</p>
          <p className="text-gray-800 text-base">{tx.payment_method_name}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs font-medium">Condição</p>
          <p className="text-gray-800 text-base">{paymentConditionText}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs font-medium">Data</p>
          <p className="text-gray-800 text-base">{formattedDate}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-gray-500 text-xs font-medium">Histórico</p>
          <p className="text-gray-800 text-base">{tx.description || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export const TransactionDetailScreen: React.FC = () => {
  return (
    <MainContainer>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 hidden md:block">
        Detalhe da Transação
      </h1>

      <ViewMode tx={MOCK_TX} />

      <Divider className="bg-gray-200" />
      
      <div className="p-2">
        <div className="flex flex-row justify-center gap-3">
          <SimpleButton
            title="Excluir"
            className="bg-red-600 text-white hover:bg-red-700"
          />
          <SimpleButton
            title="Editar"
            className="bg-gray-50"
          />
        </div>
      </div>
    </MainContainer>
  );
};