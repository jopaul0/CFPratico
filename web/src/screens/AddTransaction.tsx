// src/screens/AddTransaction.tsx
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { MainContainer } from '../components/MainContainer';
import { DatePickerInput } from '../components/DatePickerInput';
import { InputGroup } from '../components/InputGroup';
import { Divider } from '../components/Divider';
import { SimpleButton } from '../components/SimpleButton';

import { useAddTransaction } from '../hooks/useAddTransaction';
import { useRefresh } from '../contexts/RefreshContext';

export const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { triggerReload } = useRefresh();
  const {
    loading, saving, error,
    categories, paymentMethods,
    state, setField, save
  } = useAddTransaction();

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); // Impede o reload da página
    try {
      await save();
      alert('Sucesso! Transação adicionada.');
      triggerReload();
      navigate(-1); // Volta para a página anterior
    } catch (e: any) {
      alert(`Erro: ${e?.message ?? 'Falha ao salvar.'}`);
    }
  }, [save, navigate, triggerReload]);

  return (
    <MainContainer>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Adicionar Transação</h1>
        
        {loading && <p>Carregando categorias...</p>}
        {error && <p className="text-red-500">{error.message}</p>}

        <form onSubmit={onSubmit}>
          <DatePickerInput
            label="Data"
            value={state.dateISO}
            onChange={(v) => setField('dateISO', v)}
          />

          <InputGroup
            label="Descrição"
            placeholder="ex.: Venda de serviço"
            value={state.description}
            onChangeText={(v) => setField('description', v)}
          />

          <InputGroup
            label="Valor"
            placeholder="ex.: 1.500,00"
            keyboardType="numeric"
            value={state.valueInput}
            onChangeText={(v) => setField('valueInput', v)}
          />

          <InputGroup
            label="Tipo"
            isSelect
            currentValue={state.movementType}
            onValueChange={(v) => setField('movementType', v as any)}
            options={[
              { label: 'Receita', value: 'revenue' },
              { label: 'Despesa', value: 'expense' },
            ]}
          />

          <InputGroup
            label="Condição"
            isSelect
            currentValue={state.condition}
            onValueChange={(v) => setField('condition', v as any)}
            options={[
              { label: 'À vista', value: 'paid' },
              { label: 'Parcelado', value: 'pending' },
            ]}
          />

          {state.condition === 'pending' && (
            <InputGroup
              label="Parcelas"
              placeholder="ex.: 3"
              keyboardType="numeric"
              value={state.installments}
              onChangeText={(v) => setField('installments', v)}
            />
          )}

          <InputGroup
            label="Categoria"
            isSelect
            currentValue={String(state.categoryId ?? (categories[0]?.id ?? ''))}
            onValueChange={(v) => setField('categoryId', Number(v))}
            options={categories.map(c => ({ label: c.name, value: String(c.id) }))}
          />

          <InputGroup
            label="Forma de pagamento"
            isSelect
            currentValue={String(state.paymentMethodId ?? (paymentMethods[0]?.id ?? ''))}
            onValueChange={(v) => setField('paymentMethodId', Number(v))}
            options={paymentMethods.map(p => ({ label: p.name, value: String(p.id) }))}
          />

          <Divider className="my-6" />

          <div className="flex justify-center gap-3">
            <SimpleButton
              title="Cancelar"
              type="button"
              onPress={() => navigate(-1)}
            />
            <SimpleButton
              title={saving ? 'Salvando…' : 'Salvar'}
              type="submit"
              disabled={saving || loading}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            />
          </div>
        </form>
      </div>
    </MainContainer>
  );
};