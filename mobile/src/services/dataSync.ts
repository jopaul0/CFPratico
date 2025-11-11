import { dbPromise } from './database/connection';
import type { Category, PaymentMethod, Transaction, UserConfig } from '../types/Database';
import { fetchCategories } from './database/crud/Category';
import { fetchPaymentMethods } from './database/crud/PaymentMethods';
import { fetchAllRawTransactions } from './database/crud/Transaction';
import { fetchOrCreateUserConfig } from './database/crud/UserConfig';


/**
 * Define a estrutura do nosso arquivo de backup JSON.
 */
interface BackupData {
  categories: Category[];
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  userConfig: UserConfig; 
}

/**
 * Busca todos os dados relevantes do banco e os formata como uma string JSON.
 */
export const exportDataAsJson = async (): Promise<string> => {
  try {
    const [categories, paymentMethods, transactions, userConfig] = await Promise.all([
      fetchCategories(),
      fetchPaymentMethods(),
      fetchAllRawTransactions(),
      fetchOrCreateUserConfig() 
    ]);

    const backupData: BackupData = {
      categories,
      paymentMethods,
      transactions,
      userConfig,
    };

    return JSON.stringify(backupData, null, 2);
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
    if (!data.categories || !data.paymentMethods || !data.transactions || !data.userConfig) {
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

      await db.runAsync('DELETE FROM "transaction";');
      await db.runAsync('DELETE FROM "category";');
      await db.runAsync('DELETE FROM "payment_method";');
      await db.runAsync('DELETE FROM "user_config";');

      await db.runAsync(
        'INSERT OR REPLACE INTO user_config (id, company_name, initial_balance, company_logo) VALUES (1, ?, ?, ?);',
        [
          data.userConfig.company_name, 
          data.userConfig.initial_balance,
          data.userConfig.company_logo
        ]
      );

      const categoryIdMap = new Map<number, number>();
      for (const cat of data.categories) {
        const result = await db.runAsync(
          'INSERT INTO category (name, icon_name) VALUES (?, ?);',
          [cat.name, cat.icon_name]
        );
        categoryIdMap.set(cat.id, result.lastInsertRowId);
      }

      const paymentMethodIdMap = new Map<number, number>();
      for (const pm of data.paymentMethods) {
        const result = await db.runAsync(
          'INSERT INTO payment_method (name) VALUES (?);',
          [pm.name]
        );
        paymentMethodIdMap.set(pm.id, result.lastInsertRowId);
      }

      for (const tx of data.transactions) {
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