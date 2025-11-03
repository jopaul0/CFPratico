// src/screens/AddTransaction.tsx
// Traduzido de
// Tela de formulário simples. Apenas visual.

import React from 'react';
import { MainContainer } from '../components/MainContainer';
import { DatePickerInput } from '../components/DatePickerInput';
import { InputGroup } from '../components/InputGroup';
import { Divider } from '../components/Divider';
import { SimpleButton } from '../components/SimpleButton';

// --- MOCK DATA PARA VISUAL ---
const MOCK_OPTIONS = [{ label: 'Selecione...', value: '' }];
const MOCK_STATE = {
  dateISO: '2025-10-25',
  description: '',
  valueInput: '',
  movementType: 'revenue',
  condition: 'paid',
  installments: '1',
};
// --- FIM MOCK DATA ---

export const AddTransaction: React.FC = () => {
  const isSaving = false;

  return (
    <MainContainer>
      {/* <KeyboardAvoidingView> não é necessário na web */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Adicionar Transação
        </h1>

        <DatePickerInput
          label="Data"
          value={MOCK_STATE.dateISO}
          onChange={() => {}}
        />

        <InputGroup
          label="Descrição"
          placeholder="ex.: Venda de serviço"
          value={MOCK_STATE.description}
        />

        <InputGroup
          label="Valor"
          placeholder="ex.: 1.500,00"
          keyboardType="numeric"
          value={MOCK_STATE.valueInput}
        />

        <InputGroup
          label="Tipo"
          isSelect
          currentValue={MOCK_STATE.movementType}
          options={[
            { label: 'Receita', value: 'revenue' },
            { label: 'Despesa', value: 'expense' },
          ]}
        />

        <InputGroup
          label="Condição"
          isSelect
          currentValue={MOCK_STATE.condition}
          options={[
            { label: 'À vista', value: 'paid' },
            { label: 'Parcelado', value: 'pending' },
          ]}
        />

        {MOCK_STATE.condition === 'pending' && (
          <InputGroup
            label="Parcelas"
            placeholder="ex.: 3"
            keyboardType="numeric"
            value={MOCK_STATE.installments}
          />
        )}

        <InputGroup
          label="Categoria"
          isSelect
          currentValue={""}
          options={MOCK_OPTIONS}
        />

        <InputGroup
          label="Forma de pagamento"
          isSelect
          currentValue={""}
          options={MOCK_OPTIONS}
        />

        <Divider marginVertical={14} />

        <div className="flex flex-row justify-center gap-3">
          <SimpleButton title="Cancelar" />
          <SimpleButton
            title={isSaving ? 'Salvando…' : 'Salvar'}
            disabled={isSaving}
            className="bg-blue-600 text-white hover:bg-blue-700"
          />
        </div>
      </div>
    </MainContainer>
  );
};