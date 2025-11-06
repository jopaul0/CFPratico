import Dexie from 'dexie';
import { db } from '../db';
import type { 
    NewTransactionData, 
    TransactionWithNames, 
    Transaction,
    Category,
    PaymentMethod
} from '../../../types/Database';

export interface FetchTransactionsFilters {
  startDate?: string;
  endDate?: string;
  type?: 'revenue' | 'expense';
  categoryId?: number | null;
  paymentMethodId?: number | null;
  condition?: 'paid' | 'pending';
  query?: string;
}

const mapTransactionNames = async (
    transactions: Transaction[]
): Promise<TransactionWithNames[]> => {
    const categoryIds = [...new Set(transactions.map(t => t.category_id).filter(id => id != null))] as number[];
    const paymentMethodIds = [...new Set(transactions.map(t => t.payment_method_id).filter(id => id != null))] as number[];

    const [categories, paymentMethods] = await Promise.all([
        db.categories.where('id').anyOf(categoryIds).toArray(),
        db.paymentMethods.where('id').anyOf(paymentMethodIds).toArray(),
    ]);

    const categoryMap = new Map<number, Category>(categories.map(c => [c.id, c]));
    const paymentMethodMap = new Map<number, PaymentMethod>(paymentMethods.map(p => [p.id, p]));

    return transactions.map(t => {
        const category = t.category_id ? categoryMap.get(t.category_id) : null;
        const paymentMethod = t.payment_method_id ? paymentMethodMap.get(t.payment_method_id) : null;

        return {
            ...t,
            category_name: category?.name || null,
            category_icon_name: category?.icon_name || null,
            payment_method_name: paymentMethod?.name || null,
        };
    });
};

export const addTransaction = async (data: NewTransactionData): Promise<number> => {
  try {
    const { date, description, value, type, condition, installments, paymentMethodId, categoryId } = data;
    const newId = await db.transactions.add({
        date,
        description,
        value,
        type,
        condition,
        installments,
        payment_method_id: paymentMethodId,
        category_id: categoryId
    } as any);
    return newId as number;
  } catch (error : any) {
    console.error('Erro ao adicionar transação:', error);
    throw error;
  }
};

export const updateTransaction = async (id: number, data: NewTransactionData): Promise<void> => {
  try {
    const { date, description, value, type, condition, installments, paymentMethodId, categoryId } = data;
    const count = await db.transactions.update(id, {
        date,
        description,
        value,
        type,
        condition,
        installments,
        payment_method_id: paymentMethodId,
        category_id: categoryId
    });
     if (count === 0) {
      throw new Error("Transação não encontrada para atualizar.");
    }
  } catch (error : any) {
    console.error(`Erro ao atualizar transação ${id}:`, error);
    throw error;
  }
};

export const deleteTransaction = async (id: number): Promise<void> => {
  try {
    await db.transactions.delete(id);
  } catch (error : any) {
    console.error(`Erro ao deletar transação ${id}:`, error);
    throw error;
  }
};

export const deleteTransactions = async (ids: number[]): Promise<void> => {
    if (ids.length === 0) return;
    try {
        await db.transactions.bulkDelete(ids);
        console.log(`${ids.length} transações deletadas.`);
    } catch (error : any) {
        console.error(`Erro ao deletar transações em massa:`, error);
        throw error;
    }
};

export const fetchTransactions = async (
  options?: FetchTransactionsFilters
): Promise<TransactionWithNames[]> => {
  
  try {
    let collection: Dexie.Collection<Transaction, number>;

    if (options?.startDate && options?.endDate) {
      collection = db.transactions.where('date').between(
          `${options.startDate}T00:00:00`,
          `${options.endDate}T23:59:59`
      );
    } else if (options?.startDate) {
      collection = db.transactions.where('date').aboveOrEqual(`${options.startDate}T00:00:00`);
    } else if (options?.endDate) {
      collection = db.transactions.where('date').belowOrEqual(`${options.endDate}T23:59:59`);
    } else {
      collection = db.transactions.toCollection();
    }

    const filteredTxs = await collection.filter(tx => {
        if (options?.type && tx.type !== options.type) {
            return false;
        }
        if (options?.categoryId && tx.category_id !== options.categoryId) {
            return false;
        }
        if (options?.paymentMethodId && tx.payment_method_id !== options.paymentMethodId) {
            return false;
        }
        if (options?.condition && tx.condition !== options.condition) {
            return false;
        }
        return true;
    })
    .reverse()
    .sortBy('date');

    let resultsWithNames = await mapTransactionNames(filteredTxs);

    if (options?.query && options.query.trim().length > 0) {
       const q = options.query.trim().toLowerCase();
       resultsWithNames = resultsWithNames.filter(tx => 
            tx.description?.toLowerCase().includes(q) ||
            tx.category_name?.toLowerCase().includes(q) ||
            tx.payment_method_name?.toLowerCase().includes(q)
       );
    }

    return resultsWithNames;

  } catch (error : any) {
    console.error('Erro ao buscar transações com filtros (Dexie):', error);
    throw error;
  }
};

export const fetchAllRawTransactions = async (): Promise<Transaction[]> => {
  try {
    return await db.transactions.toArray();
  } catch (error : any) {
    console.error('Erro ao buscar transações puras:', error);
    throw error;
  }
};

export const fetchTransactionById = async (id: number): Promise<TransactionWithNames | null> => {
  try {
    const transaction = await db.transactions.get(id);
    if (!transaction) return null;
    
    const [result] = await mapTransactionNames([transaction]);
    return result;
  } catch (error : any) {
    console.error(`Erro ao buscar transação ${id}:`, error);
    throw error;
  }
};

export const clearAllTransactions = async (): Promise<void> => {
  try {
    await db.transactions.clear();
  } catch (error : any) {
    console.error('Erro ao limpar transações:', error);
    throw error;
  }
};