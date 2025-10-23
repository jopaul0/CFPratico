// src/services/database/transactionRepository.ts
import { dbPromise } from '../connection';
import { NewTransactionData, TransactionWithNames } from '../../../types/Database';

/**
 * Adiciona uma nova transação.
 */
export const addTransaction = async (data: NewTransactionData): Promise<number> => {
  // ... (código existente, sem alteração)
  const db = await dbPromise;
  const { date, description, value, type, condition, installments, paymentMethodId, categoryId } = data;

  try {
    const result = await db.runAsync(
      `INSERT INTO "transaction" (date, description, value, type, condition, installments, payment_method_id, category_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [date, description, value, type, condition, installments, paymentMethodId, categoryId]
    );
    return result.lastInsertRowId;
  } catch (error : any) {
    console.error('Erro ao adicionar transação:', error);
    throw error;
  }
};

/**
 * // NOVO
 * Atualiza uma transação existente.
 */
export const updateTransaction = async (id: number, data: NewTransactionData): Promise<void> => {
  const db = await dbPromise;
  const { date, description, value, type, condition, installments, paymentMethodId, categoryId } = data;

  try {
    await db.runAsync(
      `UPDATE "transaction" SET 
         date = ?, 
         description = ?, 
         value = ?, 
         type = ?, 
         condition = ?, 
         installments = ?, 
         payment_method_id = ?, 
         category_id = ?
       WHERE id = ?;`,
      [date, description, value, type, condition, installments, paymentMethodId, categoryId, id]
    );
  } catch (error : any) {
    console.error(`Erro ao atualizar transação ${id}:`, error);
    throw error;
  }
};

/**
 * // NOVO
 * Deleta uma transação.
 */
export const deleteTransaction = async (id: number): Promise<void> => {
  const db = await dbPromise;
  try {
    await db.runAsync('DELETE FROM "transaction" WHERE id = ?;', [id]);
  } catch (error : any) {
    console.error(`Erro ao deletar transação ${id}:`, error);
    throw error;
  }
};


/* // NOVO
 * Deleta múltiplas transações de uma vez.
 */
export const deleteTransactions = async (ids: number[]): Promise<void> => {
    if (ids.length === 0) return;

    const db = await dbPromise;
    try {
        // Cria os placeholders (?) dinamicamente
        const placeholders = ids.map(() => '?').join(',');
        
        // Executa dentro de uma transação para performance e segurança
        await db.withTransactionAsync(async () => {
            await db.runAsync(
                `DELETE FROM "transaction" WHERE id IN (${placeholders});`,
                [...ids] // O driver SQLite trata a passagem do array
            );
        });
        console.log(`${ids.length} transações deletadas.`);
    } catch (error : any) {
        console.error(`Erro ao deletar transações em massa:`, error);
        throw error;
    }
};


/**
 * Busca todas as transações com JOIN.
 */
export const fetchTransactions = async (): Promise<TransactionWithNames[]> => {
  // ... (código existente, sem alteração)
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
  } catch (error : any) {
    console.error('Erro ao buscar transações com JOIN:', error);
    throw error;
  }
};

/**
 * // NOVO (Recomendado)
 * Busca uma transação específica pelo ID (útil para a tela de edição).
 */
export const fetchTransactionById = async (id: number): Promise<TransactionWithNames | null> => {
  const db = await dbPromise;
  try {
    const result = await db.getFirstAsync<TransactionWithNames>(
      `SELECT 
         t.*, 
         c.name AS category_name, 
         p.name AS payment_method_name 
       FROM "transaction" t
       LEFT JOIN category c ON t.category_id = c.id
       LEFT JOIN payment_method p ON t.payment_method_id = p.id
       WHERE t.id = ?;`,
      [id]
    );
    return result;
  } catch (error : any) {
    console.error(`Erro ao buscar transação ${id}:`, error);
    throw error;
  }
};

/**
 * Deleta todas as transações (para testes).
 */
export const clearAllTransactions = async (): Promise<void> => {
  // ... (código existente, sem alteração)
  const db = await dbPromise;
  try {
    await db.runAsync('DELETE FROM "transaction";');
  } catch (error : any) {
    console.error('Erro ao limpar transações:', error);
    throw error;
  }
};