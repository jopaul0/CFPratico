import { dbPromise } from '../connection';
import { NewTransactionData, TransactionWithNames, Transaction } from '../../../types/Database';

export interface FetchTransactionsFilters {
  startDate?: string;
  endDate?: string;
  type?: 'revenue' | 'expense';
  categoryId?: number | null;
  paymentMethodId?: number | null;
  condition?: 'paid' | 'pending';
  query?: string;
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
  options?: FetchTransactionsFilters
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
    // Adiciona T00:00:00 para garantir que o dia inteiro seja incluído
    params.push(`${options.startDate}T00:00:00`); 
  }
  if (options?.endDate) {
    whereClauses.push('t.date <= ?');
     // Adiciona T23:59:59 para garantir que o dia inteiro seja incluído
    params.push(`${options.endDate}T23:59:59`);
  }
  if (options?.type) {
    whereClauses.push('t.type = ?');
    params.push(options.type);
  }
  
  // --- NOVOS FILTROS ---
  if (options?.categoryId) {
    whereClauses.push('t.category_id = ?');
    params.push(options.categoryId);
  }
  if (options?.paymentMethodId) {
    whereClauses.push('t.payment_method_id = ?');
    params.push(options.paymentMethodId);
  }
  if (options?.condition) {
    whereClauses.push('t.condition = ?');
    params.push(options.condition);
  }
  if (options?.query && options.query.trim().length > 0) {
    const q = `%${options.query.trim().toLowerCase()}%`;
    whereClauses.push(
      `(t.description LIKE ? OR c.name LIKE ? OR p.name LIKE ?)`
    );
    params.push(q, q, q);
  }
  // --- FIM DOS NOVOS FILTROS ---

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }
  
  // Mantenha a ordem para o agrupamento
  query += ' ORDER BY t.date DESC;'; 

  try {
    const results = await db.getAllAsync<TransactionWithNames>(query, params);
    return results;
  } catch (error : any) {
    console.error('Erro ao buscar transações com JOIN (e filtros):', error);
    throw error;
  }
};

// ... (fetchTransactionById e clearAllTransactions não mudam) ...

// --- BÔNUS: Otimização de Saldo ---
// Adicione esta função para otimizar o useDashboardData
export const fetchCurrentBalance = async (initialBalance: number): Promise<number> => {
    const db = await dbPromise;
    try {
        const result = await db.getFirstAsync<{ total: number }>(
            'SELECT SUM(value) as total FROM "transaction";'
        );
        const totalFromTransactions = result?.total ?? 0;
        return initialBalance + totalFromTransactions;
    } catch (e) {
        console.error("Erro ao calcular saldo total:", e);
        return initialBalance;
    }
}

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

