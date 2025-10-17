// src/types/Transactions.ts (Atualizado)

import type { ISODate } from './Date';

// Novos Tipos de Enum/União
export type MovementType = 'Receita' | 'Despesa';
export type PaymentType = 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Boleto' | 'Cheque' | 'Dinheiro' | 'Transferência Bancária TED' | 'Outros';
export type Condition = 'À Vista' | 'Parcelado';

export type Tx = {
    id: string;
    date: ISODate; // "YYYY-MM-DD"
    type: MovementType; // NOVO: Receita ou Despesa
    paymentType: PaymentType; // NOVO: Tipo de Pagamento
    category: string; // As 25 categorias completas
    value: number;
    condition: Condition; // NOVO: À Vista ou Parcelado
    installments: number; // NOVO: Número de Parcelas (1 para À Vista)
    description: string; // Histórico/Descrição
    isNegative?: boolean; // Mantido para cálculo de saldo, mas pode ser deduzido de 'type'
};

export type TransactionGroup = {
    dateISO: ISODate;
    dateLabel: string;
    balance: number;
    transactions: Tx[];
}