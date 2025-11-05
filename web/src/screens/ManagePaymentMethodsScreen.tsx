
import React from 'react';
import { MainContainer } from '../components/MainContainer';
import { InputGroup } from '../components/InputGroup';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import { useManagePaymentMethods } from '../hooks/useManagePaymentMethods';
import { PaymentMethod } from '../types/Database';
import { Trash, Edit, Wallet } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

// Componente de Item (traduzido para web)
const PaymentMethodItem: React.FC<{
  item: PaymentMethod;
  onSelect: (item: PaymentMethod) => void;
  onDelete: (item: PaymentMethod) => void;
  isSelected: boolean;
}> = ({ item, onSelect, onDelete, isSelected }) => {
  const selectionClass = isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-white';

  return (
    <div className={`p-3 border border-gray-200 rounded-lg mb-2 shadow-sm ${selectionClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <Wallet size={20} className="text-gray-600 shrink-0" />
          <span className="text-base text-gray-800 truncate">{item.name}</span>
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => onSelect(item)} className="p-1 hover:cursor-pointer">
            <Edit size={18} className="text-blue-600 hover:text-blue-800" />
          </button>
          <button onClick={() => onDelete(item)} className="p-1 hover:cursor-pointer">
            <Trash size={18} className="text-red-600 hover:text-red-800" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Tela Principal
export const ManagePaymentMethodsScreen: React.FC = () => {
  const {
    paymentMethods,
    isLoading,
    isSaving,
    error,
    formName,
    setFormName,
    selectedMethod,
    handleSelectMethod,
    handleClearForm,
    handleSave,
    handleDelete,
  } = useManagePaymentMethods();
  const { alert, confirm } = useModal();

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSave();
    } catch (e: any) {
      await alert('Erro', e.message, 'error');
    }
  };

  const onDelete = async (item: PaymentMethod) => {
      // 3. Substituir o confirm
      const userConfirmed = await confirm(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir "${item.name}"? As transações associadas não serão excluídas, mas ficarão sem categoria.`,
        { confirmText: 'Excluir', type: 'warning' }
      );
      if (userConfirmed) {
        try {
          await handleDelete(item.id);
        } catch (e: any) {
          await alert('Erro ao Excluir', e.message, 'error');
        }
      }
    };

  const onDeleteFromForm = () => {
    if (selectedMethod) {
      onDelete(selectedMethod);
    }
  }

  const renderList = () => {
    if (isLoading) {
      return <div className="text-center my-4">Carregando...</div>;
    }
    if (error) {
      return <p className="text-red-500 text-center my-4">Erro ao carregar: {error.message}</p>;
    }
    if (paymentMethods.length === 0) {
      return <p className="text-gray-500 text-center my-4">Nenhuma forma de pagamento encontrada.</p>;
    }

    return (
      <div>
        {paymentMethods.map((item) => (
          <PaymentMethodItem
            key={item.id.toString()}
            item={item}
            onSelect={handleSelectMethod}
            onDelete={onDelete}
            isSelected={selectedMethod?.id === item.id}
          />
        ))}
      </div>
    );
  };

  return (
    <MainContainer title="Gerenciar Formas de Pagamento" showBackButton>
      {/* Formulário de Edição/Criação */}
      <form onSubmit={onSave} className="p-4 bg-white rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          {selectedMethod ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
        </h2>
        <InputGroup
          label="Nome da Forma de Pagamento"
          placeholder="Ex: Cartão de Débito"
          value={formName}
          onChangeText={setFormName}
        />
        <div className="flex flex-wrap justify-end gap-3 mt-2">
          {selectedMethod && (
            <SimpleButton
              title="Excluir"
              type="button"
              onPress={onDeleteFromForm}
              disabled={isSaving}
              className="bg-red-100 text-red-700 hover:bg-red-200"
            />
          )}
          <SimpleButton
            title="Limpar"
            type="button"
            onPress={handleClearForm}
            disabled={isSaving}
          />
          <SimpleButton
            title={isSaving ? 'Salvando...' : (selectedMethod ? 'Salvar' : 'Adicionar')}
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white hover:bg-blue-700"
          />
        </div>
      </form>

      <Divider />

      {/* Lista */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Formas de Pagamento Existentes</h2>
      {renderList()}
    </MainContainer>
  );
};