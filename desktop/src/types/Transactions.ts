export type Tx = {
    id: string;
    date: string;
    type: string; 
    paymentType: string; 
    category: string;
    categoryIcon: string;
    value: number;
    condition: string; 
    installments: number; 
    description: string; 
    isNegative?: boolean; 
};

export type TransactionGroup = {
    dateISO: string;
    dateLabel: string;
    balance: number;
    transactions: Tx[];
}