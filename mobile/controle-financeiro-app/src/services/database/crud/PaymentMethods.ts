// src/services/database/paymentMethodRepository.ts
import { dbPromise } from '../connection';
import { PaymentMethod } from '../../../types/Database';

/**
 * Busca todos os métodos de pagamento.
 */
export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
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