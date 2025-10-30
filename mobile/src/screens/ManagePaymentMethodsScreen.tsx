// src/screens/ManagePaymentMethodsScreen.tsx
import React from 'react';
import { View, Text, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
// (imports do DB não são mais necessários para deletar)
import { MainContainer } from '../components/MainContainer';
import { InputGroup } from '../components/InputGroup';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import { useManagePaymentMethods } from '../hooks/useManagePaymentMethods';
import { PaymentMethod } from '../services/database';
import { Trash, Edit, Wallet } from 'lucide-react-native';

// Componente de item da lista (Sem alterações)
const PaymentMethodItem: React.FC<{
  item: PaymentMethod;
  onSelect: (item: PaymentMethod) => void;
  onDelete: (item: PaymentMethod) => void;
  isSelected: boolean;
}> = ({ item, onSelect, onDelete, isSelected }) => {
  const selectionClass = isSelected ? 'bg-blue-100' : 'bg-white';

  return (
    <View className={`p-3 border border-gray-200 rounded-lg mb-2 ${selectionClass}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <Wallet size={20} color="#4b5563" /> 
          <Text className="text-base text-gray-800" numberOfLines={1}>{item.name}</Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={() => onSelect(item)} className="p-1">
            <Edit size={18} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item)} className="p-1">
            <Trash size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    handleDelete, // <-- PEGA A FUNÇÃO DO HOOK
    reload, 
  } = useManagePaymentMethods();

  const onSave = async () => {
    try {
      await handleSave();
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  };

  // --- (INÍCIO DA CORREÇÃO) ---
  const onDelete = (item: PaymentMethod) => {
    Alert.alert(
      'Excluir Forma de Pagamento',
      `Tem certeza que deseja excluir "${item.name}"? As transações associadas serão mantidas, mas ficarão sem esta forma de pagamento.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await handleDelete(item.id); // <-- CHAMA O HOOK
              // (O hook já limpa o form e recarrega tudo)
            } catch (e: any) {
              Alert.alert('Erro ao excluir', e.message);
            }
          },
        },
      ]
    );
  };
  
   const onDeleteFromForm = () => {
     if(selectedMethod) {
        onDelete(selectedMethod);
     }
   }
  // --- (FIM DA CORREÇÃO) ---

  // (renderList não muda)
  const renderList = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" className="my-4" />;
    }
    if (error) {
      return <Text className="text-red-500 text-center my-4">Erro ao carregar: {error.message}</Text>;
    }
    if (paymentMethods.length === 0) {
      return <Text className="text-gray-500 text-center my-4">Nenhuma forma de pagamento encontrada.</Text>;
    }
    
    return (
      <View>
        {paymentMethods.map((item) => (
          <PaymentMethodItem
            key={item.id.toString()}
            item={item}
            onSelect={handleSelectMethod}
            onDelete={onDelete}
            isSelected={selectedMethod?.id === item.id}
          />
        ))}
      </View>
    );
  };

  return (
    // (O JSX da tela não muda)
    <MainContainer>
      <Text className="text-2xl font-bold text-gray-800 mb-4">Gerenciar Formas de Pagamento</Text>

      <View className="p-4 bg-white rounded-lg shadow mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">
          {selectedMethod ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
        </Text>
        <InputGroup
          label="Nome da Forma de Pagamento"
          placeholder="Ex: Cartão de Débito"
          value={formName}
          onChangeText={setFormName}
        />
        
        <View className="flex-row justify-end gap-3 mt-2">
          {selectedMethod && (
            <SimpleButton
              title="Excluir"
              onPress={onDeleteFromForm}
              backgroundColor="#fef2f2"
              textColor="#ef4444"
              activeBackgroundColor="#fee2e2"
              disabled={isSaving}
            />
          )}
          <SimpleButton
            title="Limpar"
            onPress={handleClearForm}
            disabled={isSaving}
          />
          <SimpleButton
            title={isSaving ? 'Salvando...' : (selectedMethod ? 'Salvar' : 'Adicionar')}
            onPress={onSave}
            backgroundColor="#3b82f6"
            textColor="#ffffff"
            activeBackgroundColor="#2563eb"
            disabled={isSaving}
          />
        </View>
      </View>

      <Divider />

      <Text className="text-xl font-bold text-gray-800 mb-4">Formas de Pagamento Existentes</Text>
      
      {renderList()}
      
    </MainContainer>
  );
};