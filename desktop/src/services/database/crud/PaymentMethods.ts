import { db } from '../db';
import { PaymentMethod } from '../../../types/Database';

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    return await db.paymentMethods.orderBy('name').toArray();
  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error);
    throw error;
  }
};

export const addPaymentMethod = async (name: string): Promise<PaymentMethod> => {
  try {
    const newId = await db.paymentMethods.add({ name } as any);
    return { id: newId as number, name: name };
  } catch (error: any) {
    console.error(`Erro ao adicionar método de pagamento '${name}':`, error);
    if (error.name === 'ConstraintError') {
      throw new Error('Esse método de pagamento já existe.');
    }
    throw error;
  }
};

export const updatePaymentMethod = async (id: number, name: string): Promise<void> => {
  try {
    const count = await db.paymentMethods.update(id, { name: name });
     if (count === 0) {
      throw new Error("Método de pagamento não encontrado para atualizar.");
    }
  } catch (error: any) {
    console.error(`Erro ao atualizar método de pagamento ${id}:`, error);
    if (error.name === 'ConstraintError') {
      throw new Error('Esse nome de método já está em uso.');
    }
    throw error;
  }
};

export const deletePaymentMethod = async (id: number): Promise<void> => {
  try {
     await db.transaction('rw', db.paymentMethods, db.transactions, async () => {
        await db.transactions
            .where({ payment_method_id: id })
            .modify({ payment_method_id: null as any });
    
        await db.paymentMethods.delete(id);
     });
    console.log(`Método de pagamento ${id} deletado (e transações associadas atualizadas).`);
  } catch (error) {
    console.error(`Erro ao deletar método de pagamento ${id}:`, error);
    throw error;
  }
};