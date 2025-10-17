// types/Navigation.ts (CORRIGIDO)

import type { ISODate } from './Date';
// 🚀 Importamos os tipos de transação completos
import type { Tx } from './Transactions'; 


// Parâmetros para o Stack Navigator da seção Extrato/Movimentações
export type StatementStackParamList = {
    StatementMain: undefined;
    
    // 🚀 Usamos o tipo Tx (Transação) para definir todos os parâmetros 
    // da tela de detalhes. Isso garante que todos os campos necessários 
    // (id, category, paymentType, description, value, isNegative, date, 
    // type, condition, installments) sejam passados.
    TransactionDetail: Tx; 

    AddTransaction: undefined;
    
    // Se o tipo Tx for muito grande e você só quiser os campos essenciais:
    /*
    TransactionDetail: {
        id: string;
        date: ISODate;
        type: 'Receita' | 'Despesa'; // ou use o tipo MovementType
        paymentType: string;
        category: string;
        value: number;
        condition: 'À Vista' | 'Parcelado';
        installments: number;
        description: string; 
        isNegative?: boolean;
    };
    */
};


// Parâmetros para o Drawer (Barra Lateral)
export type DrawerParamList = {
    Prototype: undefined; 
    Statement: undefined; 
};


// Tela principal, que é o Drawer Navigator inteiro
export type RootStackParamList = {
    HomeDrawer: undefined; 
};

// O restante dos tipos (HomeStackParamList) não foram modificados, 
// pois não são usados no fluxo atual.