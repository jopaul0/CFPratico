// src/services/database/paymentMethodRepository.ts
import { dbPromise } from '../connection';
import { PaymentMethod } from '../../../types/Database';



export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  // ... (código existente, sem alteração)
  const db = await dbPromise;
  try {
    const results = await db.getAllAsync<PaymentMethod>(
      'SELECT * FROM payment_method ORDER BY name ASC;'
    );
    return results;
  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error);
    throw error;
  }
};

/**
 * Adiciona um novo método de pagamento.
 * Retorna o objeto do novo método com o ID.
 */
export const addPaymentMethod = async (name: string): Promise<PaymentMethod> => {
  // ... (código existente, da resposta anterior)
  const db = await dbPromise;
  try {
    const result = await db.runAsync('INSERT INTO payment_method (name) VALUES (?);', [name]);
    const newId = result.lastInsertRowId;
    return { id: newId, name: name };
  } catch (error : any) {
    console.error(`Erro ao adicionar método de pagamento '${name}':`, error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Esse método de pagamento já existe.');
    }
    throw error;
  }
};

/**
 * // NOVO
 * Atualiza o nome de um método de pagamento.
 */
export const updatePaymentMethod = async (id: number, name: string): Promise<void> => {
  const db = await dbPromise;
  try {
    await db.runAsync('UPDATE payment_method SET name = ? WHERE id = ?;', [name, id]);
  } catch (error : any) {
    console.error(`Erro ao atualizar método de pagamento ${id}:`, error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Esse nome de método já está em uso.');
    }
    throw error;
  }
};

/**
 * // NOVO
 * Deleta um método de pagamento.
 * ATENÇÃO: Graças ao "ON DELETE CASCADE" no seu schema,
 * isso irá deletar AUTOMATICAMENTE todas as transações
 * que usavam este método.
 */
export const deletePaymentMethod = async (id: number): Promise<void> => {
  const db = await dbPromise;
  try {
    await db.runAsync('DELETE FROM payment_method WHERE id = ?;', [id]);
    console.log(`Método de pagamento ${id} deletado (e transações associadas).`);
  } catch (error) {
    console.error(`Erro ao deletar método de pagamento ${id}:`, error);
    throw error;
  }
};