import React from 'react';
import { Link } from 'react-router-dom';

export const StatementScreen: React.FC = () => {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800">Movimentação</h1>
      
      <Link 
        to="/statement/new" 
        className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white"
      >
        Adicionar Transação
      </Link>
      
      <div className="mt-4">
        {/* O conteúdo do seu useStatementData (a lista) virá aqui */}
        <p>A lista de transações aparecerá aqui...</p>
        <Link to="/statement/123" className="text-blue-500">Ver transação 123 (exemplo)</Link>
      </div>
    </div>
  );
};