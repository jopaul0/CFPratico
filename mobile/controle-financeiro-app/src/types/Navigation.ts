export type RootStackParamList = {
  // Tela principal, que é o Drawer Navigator inteiro
  HomeDrawer: undefined; 
  // Futuras telas que fariam parte do Stack principal (ex: Settings)
};

// Parâmetros para o Drawer (Barra Lateral)
export type DrawerParamList = {
  Prototype: undefined; // A tela principal com Cards, Filtros e Tabela
  Statement: undefined;  // Tela de Relatórios/Busca (Sua tela atual)
  // Outras seções...
};


// types/Navigation.ts
import type { ISODate } from './Date';

export type StatementStackParamList = {
  StatementMain: undefined;
  TransactionDetail: {
    id: string;
    category: 'transporte' | 'alimentacao' | 'servico' | 'outros';
    paymentType: string;
    description: string;
    value: number;
    isNegative?: boolean;
    date: ISODate; // <-- só string "YYYY-MM-DD"
  };
};



// // Tipos para as rotas dentro do Stack Navigator (as telas em si)
// export type HomeStackParamList = {
//   Prototype: undefined; // A tela principal com Cards, Filtros e Tabela
//   Statement: undefined; // A tela principal com Cards, Filtros e Tabela
//   // Futuras telas que seriam acessadas a partir da Home (ex: Detalhes da Movimentação)
// };