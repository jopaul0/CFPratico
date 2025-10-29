// src/services/dataSync.ts
import * as DB from './database';
import { dbPromise } from './database/connection';
import type { Category, PaymentMethod, Transaction } from '../types/Database';

/**
 * Define a estrutura do nosso arquivo de backup JSON.
 */
interface BackupData {
  categories: Category[];
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
}

/**
 * Busca todos os dados relevantes do banco e os formata como uma string JSON.
 */
export const exportDataAsJson = async (): Promise<string> => {
  try {
    // Busca os dados puros
    const categories = await DB.fetchCategories();
    const paymentMethods = await DB.fetchPaymentMethods();
    const transactions = await DB.fetchAllRawTransactions(); 

    const backupData: BackupData = {
      categories,
      paymentMethods,
      transactions,
    };

    return JSON.stringify(backupData, null, 2); // 'null, 2' formata o JSON
  } catch (e) {
    console.error("Erro ao gerar JSON de exportação:", e);
    throw new Error("Falha ao exportar dados.");
  }
};

/**
 * Lê uma string JSON de backup, limpa as tabelas atuais e
 * re-insere os dados, re-mapeando as chaves estrangeiras.
 */
export const importDataFromJson = async (jsonString: string): Promise<void> => {
  let data: BackupData;
  try {
    data = JSON.parse(jsonString);
    // Validação básica
    if (!data.categories || !data.paymentMethods || !data.transactions) {
      throw new Error("Arquivo JSON inválido ou mal formatado.");
    }
  } catch (e: any) {
    console.error("Erro ao parsear JSON de importação:", e);
    throw new Error("Falha ao ler o arquivo: " + e.message);
  }

  const db = await dbPromise;

  try {
    await db.withTransactionAsync(async () => {
      console.log("Iniciando transação de importação...");

      // 1. Limpar dados existentes
      await db.runAsync('DELETE FROM "transaction";');
      await db.runAsync('DELETE FROM "category";');
      await db.runAsync('DELETE FROM "payment_method";');

      // 2. Re-mapear e Inserir Categorias
      const categoryIdMap = new Map<number, number>(); // <OldID, NewID>
      for (const cat of data.categories) {
        const result = await db.runAsync(
          'INSERT INTO category (name, icon_name) VALUES (?, ?);',
          [cat.name, cat.icon_name]
        );
        categoryIdMap.set(cat.id, result.lastInsertRowId);
      }

      // 3. Re-mapear e Inserir Métodos de Pagamento
      const paymentMethodIdMap = new Map<number, number>(); // <OldID, NewID>
      for (const pm of data.paymentMethods) {
        const result = await db.runAsync(
          'INSERT INTO payment_method (name) VALUES (?);',
          [pm.name]
        );
        paymentMethodIdMap.set(pm.id, result.lastInsertRowId);
      }

      // 4. Re-mapear e Inserir Transações
      for (const tx of data.transactions) {
        // Encontra os novos IDs com base nos IDs antigos
        const newCatId = categoryIdMap.get(tx.category_id) || null;
        const newPmId = paymentMethodIdMap.get(tx.payment_method_id) || null;

        await db.runAsync(
          `INSERT INTO "transaction" (date, description, value, type, condition, installments, payment_method_id, category_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            tx.date,
            tx.description,
            tx.value,
            tx.type,
            tx.condition,
            tx.installments,
            newPmId,
            newCatId,
          ]
        );
      }
      console.log("Transação de importação concluída com sucesso.");
    });
  } catch (e: any) {
    console.error("Erro durante a transação de importação:", e);
    throw new Error("Falha ao salvar dados no banco: " + e.message);
  }
};