// src/services/database/transactionRepository.ts
import { dbPromise } from '../connection';
import { NewTransactionData, TransactionWithNames } from '../../../types/Database';

/**
 * Adiciona uma nova transação.
 * Retorna o ID da transação inserida.
 */
export const addTransaction = async (data: NewTransactionData): Promise<number> => {
  const db = await dbPromise;
  const { date, description, value, type, condition, installments, paymentMethodId, categoryId } = data;

  try {
    // runAsync é para INSERT, UPDATE, DELETE
    const result = await db.runAsync(
      `INSERT INTO "transaction" (date, description, value, type, condition, installments, payment_method_id, category_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [date, description, value, type, condition, installments, paymentMethodId, categoryId]
    );
    
    // O ID está em lastInsertRowId
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Erro ao adicionar transação:', error);
    throw error;
  }
};

/**
 * Busca todas as transações com JOIN.
 */
export const fetchTransactions = async (): Promise<TransactionWithNames[]> => {
  const db = await dbPromise;
  try {
    const results = await db.getAllAsync<TransactionWithNames>(
      `SELECT 
         t.*, 
         c.name AS category_name, 
         p.name AS payment_method_name 
       FROM "transaction" t
       LEFT JOIN category c ON t.category_id = c.id
       LEFT JOIN payment_method p ON t.payment_method_id = p.id
       ORDER BY t.date DESC;`
    );
    return results;
  } catch (error) {
    console.error('Erro ao buscar transações com JOIN:', error);
    throw error;
  }
};

/**
 * Deleta todas as transações (para testes).
 */
export const clearAllTransactions = async (): Promise<void> => {
  const db = await dbPromise;
  try {
    await db.runAsync('DELETE FROM "transaction";');
  } catch (error) {
    console.error('Erro ao limpar transações:', error);
    throw error;
  }
};