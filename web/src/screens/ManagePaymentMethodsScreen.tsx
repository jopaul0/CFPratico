import React from 'react';
import { MainContainer } from '../components/MainContainer';
import { InputGroup } from '../components/InputGroup';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import { Trash, Edit, Wallet } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_METHODS = [
  { id: 1, name: 'Pix' },
  { id: 2, name: 'Cartão de Crédito' },
  { id: 3, name: 'Dinheiro' },
];
// --- FIM MOCK DATA ---

const PaymentMethodItem: React.FC<{ item: any; isSelected: boolean }> = ({
  item,
  isSelected,
}) => {
  const selectionClass = isSelected ? 'bg-blue-100' : 'bg-white';

  return (
    <div
      className={`p-3 border border-gray-200 rounded-lg mb-2 ${selectionClass}`}
    >
      <div className="flex-row items-center justify-between">
        <div className="flex-row items-center gap-3 flex-1 overflow-hidden">
          <Wallet size={20} color="#4b5563" />
          <span className="text-base text-gray-800 truncate">{item.name}</span>
        </div>
        <div className="flex-row gap-3">
          <button className="p-1">
            <Edit size={18} color="#3b82f6" />
          </button>
          <button className="p-1">
            <Trash size={18} color="#ef4444" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ManagePaymentMethodsScreen: React.FC = () => {
  const isSaving = false;
  const selectedMethod = null;

  return (
    <MainContainer>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Gerenciar Formas de Pagamento
      </h1>

      <div className="p-4 bg-white rounded-lg shadow mb-6">
        <p className="text-lg font-semibold text-gray-700 mb-3">
          {selectedMethod ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
        </p>
        <InputGroup
          label="Nome da Forma de Pagamento"
          placeholder="Ex: Cartão de Débito"
          value={""}
        />

        <div className="flex-row justify-end gap-3 mt-2">
          {selectedMethod && (
            <SimpleButton
              title="Excluir"
              className="bg-red-50 text-red-600 hover:bg-red-100"
              disabled={isSaving}
            />
          )}
          <SimpleButton title="Limpar" disabled={isSaving} />
          <SimpleButton
            title={isSaving ? 'Salvando...' : 'Adicionar'}
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={isSaving}
          />
        </div>
      </div>

      <Divider />

      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Formas de Pagamento Existentes
      </h2>

      <div>
        {MOCK_METHODS.map((item) => (
          <PaymentMethodItem
            key={item.id.toString()}
            item={item}
            isSelected={false}
          />
        ))}
      </div>
    </MainContainer>
  );
};