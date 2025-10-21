export type Tx = {
    id: string;
    date: string; // "YYYY-MM-DD"
    type: string; // NOVO: Receita ou Despesa
    paymentType: string; // NOVO: Tipo de Pagamento
    category: string; // As 25 categorias completas
    value: number;
    condition: string; // NOVO: À Vista ou Parcelado
    installments: number; // NOVO: Número de Parcelas (1 para À Vista)
    description: string; // Histórico/Descrição
    isNegative?: boolean; // Mantido para cálculo de saldo, mas pode ser deduzido de 'type'
};

export type TransactionGroup = {
    dateISO: string;
    dateLabel: string;
    balance: number;
    transactions: Tx[];
}