// src/screens/AdminScreen.tsx
// Traduzido de
// Layout simples, <View> -> <div>, <Button> -> <button>, <FlatList> -> .map()

import React from 'react';
import { MainContainer } from '../components/MainContainer';

// --- MOCK DATA ---
const MOCK_LOG = 'Tela de Admin pronta.';
const MOCK_TRANSACTIONS = [
  { id: 1, description: 'Salário da Empresa', category_name: 'Venda', payment_method_name: 'Pix', type: 'revenue', value: 7500.0 },
  { id: 2, description: 'Jantar no restaurante', category_name: 'Alimentação', payment_method_name: 'Crédito', type: 'expense', value: -180.50 },
];
// --- FIM MOCK DATA ---

const renderItem = ({ item }: { item: any }) => (
  <div className="flex flex-row justify-between items-center p-4 bg-white border-b border-gray-200 rounded-lg mb-2 shadow-sm">
    <div className="flex-1 mr-2">
      <p className="text-base font-semibold">{item.description}</p>
      <p className="text-sm text-gray-500">
        {item.category_name || 'Sem Categoria'} | {item.payment_method_name || 'Sem Método'}
      </p>
    </div>
    <span className={item.type === 'revenue' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
      R$ {item.value.toFixed(2)}
    </span>
  </div>
);

export default function AdminScreen() {
  // Estilos de botão para simular o <Button color="...">
  const btn = "w-full text-left p-3 rounded-lg text-white font-semibold";
  const btnBlue = "bg-blue-600 hover:bg-blue-700";
  const btnGreen = "bg-green-600 hover:bg-green-700";
  const btnRed = "bg-red-600 hover:bg-red-700";
  const btnCyan = "bg-cyan-600 hover:bg-cyan-700";
  const btnYellow = "bg-yellow-600 hover:bg-yellow-700 text-black";


  return (
    <MainContainer>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-center mb-6">
          Painel de Teste - Web
        </h1>

        <div className="bg-white p-4 rounded-lg mb-6 shadow border border-gray-200 min-h-[60px]">
          <p className="font-bold text-lg">Log:</p>
          <p className="text-sm text-gray-700 mt-1 font-mono">{MOCK_LOG}</p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <button className={`${btn} ${btnBlue}`}>1. Inicializar/Criar Tabelas</button>
          <button className={`${btn} ${btnCyan}`}>2. Popular Dados Iniciais</button>
          <button className={`${btn} ${btnGreen}`}>3. Adicionar Receita Teste</button>
          <button className={`${btn} ${btnRed}`}>4. Adicionar Despesa Teste</button>
          <button className={`${btn} ${btnBlue}`}>5. Ver Todas Transações (JOIN)</button>
          <button className={`${btn} ${btnYellow}`}>X. Limpar Transações</button>
        </div>

        <h2 className="text-xl font-bold mt-4 mb-4">Transações no Banco:</h2>
        
        {/* Substituição da <FlatList> */}
        <div className="flex flex-col">
          {MOCK_TRANSACTIONS.length === 0 ? (
            <p className="text-center text-gray-500 p-4">Nenhuma transação encontrada.</p>
          ) : (
            MOCK_TRANSACTIONS.map((item) => renderItem({ item }))
          )}
        </div>

      </div>
    </MainContainer>
  );
}