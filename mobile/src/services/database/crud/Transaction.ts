import { dbPromise } from '../connection';
import { NewTransactionData, TransactionWithNames, Transaction } from '../../../types/Database';

interface FetchTransactionsOptions {
  startDate?: string;
  endDate?: string;
  type?: 'revenue' | 'expense';
}

export const addTransaction = async (data: NewTransactionData): Promise<number> => {
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

export const deleteTransaction = async (id: number): Promise<void> => {
  const db = await dbPromise;
  try {
    await db.runAsync('DELETE FROM "transaction" WHERE id = ?;', [id]);
  } catch (error : any) {
    console.error(`Erro ao deletar transação ${id}:`, error);
    throw error;
  }
};

export const deleteTransactions = async (ids: number[]): Promise<void> => {
    if (ids.length === 0) return;

    const db = await dbPromise;
    try {
        const placeholders = ids.map(() => '?').join(',');
        
        await db.withTransactionAsync(async () => {
            await db.runAsync(
                `DELETE FROM "transaction" WHERE id IN (${placeholders});`,
                [...ids]
            );
        });
        console.log(`${ids.length} transações deletadas.`);
    } catch (error : any) {
        console.error(`Erro ao deletar transações em massa:`, error);
        throw error;
    }
};


/**
 * Busca transações com JOIN e filtros dinâmicos.
 */
export const fetchTransactions = async (
  options?: FetchTransactionsOptions
): Promise<TransactionWithNames[]> => {
  const db = await dbPromise;

  let query = `
    SELECT 
      t.*, 
      c.name AS category_name, 
      c.icon_name AS category_icon_name,
      p.name AS payment_method_name 
    FROM "transaction" t
    LEFT JOIN category c ON t.category_id = c.id
    LEFT JOIN payment_method p ON t.payment_method_id = p.id
  `;
  
  const whereClauses: string[] = [];
  const params: any[] = [];

  if (options?.startDate) {
    whereClauses.push('t.date >= ?');
    params.push(`${options.startDate}T00:00:00`);
  }
  if (options?.endDate) {
    whereClauses.push('t.date <= ?');
    params.push(`${options.endDate}T23:59:59`);
  }
  if (options?.type) {
    whereClauses.push('t.type = ?');
    params.push(options.type);
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }
  
  query += ' ORDER BY t.date DESC;';

  try {
    const results = await db.getAllAsync<TransactionWithNames>(query, params);
    return results;
  } catch (error : any) {
    console.error('Erro ao buscar transações com JOIN (e filtros):', error);
    throw error;
  }
};

/**
 * Busca TODAS as transações puras, sem JOIN, para exportação ou cálculos.
 */
export const fetchAllRawTransactions = async (): Promise<Transaction[]> => {
  const db = await dbPromise;
  try {
    const results = await db.getAllAsync<Transaction>(
      'SELECT * FROM "transaction";'
    );
    return results;
  } catch (error : any) {
    console.error('Erro ao buscar transações puras:', error);
    throw error;
  }
};

export const fetchTransactionById = async (id: number): Promise<TransactionWithNames | null> => {
  const db = await dbPromise;
  try {
    const result = await db.getFirstAsync<TransactionWithNames>(
      `SELECT 
         t.*, 
         c.name AS category_name, 
         c.icon_name AS category_icon_name,
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

export const clearAllTransactions = async (): Promise<void> => {
  const db = await dbPromise;
  try {
    await db.runAsync('DELETE FROM "transaction";');
  } catch (error : any) {
    console.error('Erro ao limpar transações:', error);
    throw error;
  }
};