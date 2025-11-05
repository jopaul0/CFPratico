import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const TransactionDetailScreen: React.FC = () => {
  // O hook 'useParams' do React Router substitui o 'useRoute'
  const { id } = useParams(); 

  return (
    <div className="p-4 md:p-8">
      <Link to="/statement" className="text-blue-500 mb-4 inline-block">
        &larr; Voltar para Movimentação
      </Link>
      <h1 className="text-3xl font-bold text-gray-800">Detalhe da Transação {id}</h1>
      {/* O conteúdo do seu useTransactionDetail virá aqui */}
    </div>
  );
};