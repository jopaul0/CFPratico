// src/services/database/types.ts

// --- Tipos Base ---
export type TransactionType = 'revenue' | 'expense';
export type TransactionCondition = 'paid' | 'pending'; // Você decide quais são

export interface Category {
  id: number;
  name: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface UserConfig {
  id: 1; // A linha de config será sempre '1'
  company_name: string | null;
  initial_balance: number;
}

export interface Transaction {
  id: number;
  date: string; // Salvar como string ISO (new Date().toISOString())
  description: string | null;
  value: number;
  type: TransactionType;
  condition: TransactionCondition;
  installments: number;
  payment_method_id: number;
  category_id: number;
}

// --- Tipos para CRUD ---

/**
 * Dados necessários para CRIAR uma nova transação.
 * O ID é gerado pelo banco.
 */
export interface NewTransactionData {
  date: string;
  description: string | null;
  value: number;
  type: TransactionType;
  condition: TransactionCondition;
  installments: number;
  paymentMethodId: number;
  categoryId: number;
}

/**
 * Tipo de dado que a consulta com JOIN retorna.
 */
export interface TransactionWithNames extends Transaction {
  category_name: string | null;
  payment_method_name: string | null;
}