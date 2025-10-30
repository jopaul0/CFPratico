import React, { useCallback } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MainContainer } from '../components/MainContainer';
import { DatePickerInput } from '../components/DatePickerInput';
import { InputGroup } from '../components/InputGroup';
import { Divider } from '../components/Divider';
import { SimpleButton } from '../components/SimpleButton';

import { useAddTransaction } from '../hooks/useAddTransaction';
import type { StatementStackParamList } from '../types/Navigation';
import { useRefresh } from '../contexts/RefreshContext';

export const AddTransaction: React.FC = () => {
  const nav = useNavigation<NativeStackNavigationProp<StatementStackParamList>>();
  const { triggerReload } = useRefresh();
  const {
    loading, saving, error,
    categories, paymentMethods,
    state, setField, save
  } = useAddTransaction();

  const onSubmit = useCallback(async () => {
    try {
      await save();
      Alert.alert('Sucesso', 'Transação adicionada!');
      triggerReload();
      nav.goBack();
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Falha ao salvar.');
    }
  }, [save, nav, triggerReload]);

  return (
    <MainContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24, paddingTop: 16, paddingHorizontal: 16 }}>
          
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

          <Divider marginVertical={14} />

          <View className="flex-row justify-center gap-3">
            <SimpleButton
              title="Cancelar"
              onPress={() => nav.goBack()}
            />
            <SimpleButton
              title={saving ? 'Salvando…' : 'Salvar'}
              onPress={onSubmit}
              className={saving || loading ? 'opacity-60' : ''}
              backgroundColor='#3b82f6'
              textColor='#fff'
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MainContainer>
  );
};
