import { db } from './database/db';
import type { Category, PaymentMethod, Transaction, UserConfig } from '../types/Database';

import { fetchCategories } from './database/crud/Category';
import { fetchPaymentMethods } from './database/crud/PaymentMethods';
import { fetchAllRawTransactions } from './database/crud/Transaction';
import { fetchOrCreateUserConfig } from './database/crud/UserConfig';

interface BackupData {
  categories: Category[];
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  userConfig: UserConfig;
}

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

  try {
    await db.transaction('rw', db.tables, async () => {
      console.log("Iniciando transação de importação (Dexie)...");
      await Promise.all([
          db.transactions.clear(),
          db.categories.clear(),
          db.paymentMethods.clear(),
          db.userConfig.clear()
      ]);

      await db.userConfig.put(data.userConfig);

      const categoryIdMap = new Map<number, number>();
      
      const newCatIds = await db.categories.bulkAdd(data.categories, { allKeys: true });
      data.categories.forEach((cat, index) => {
          categoryIdMap.set(cat.id, newCatIds[index] as number);
      });

      const paymentMethodIdMap = new Map<number, number>();
      
      const newPmIds = await db.paymentMethods.bulkAdd(data.paymentMethods, { allKeys: true });
      data.paymentMethods.forEach((pm, index) => {
          paymentMethodIdMap.set(pm.id, newPmIds[index] as number);
      });

      const remappedTransactions = data.transactions.map(tx => {
        const newCatId = categoryIdMap.get(tx.category_id) || null;
        const newPmId = paymentMethodIdMap.get(tx.payment_method_id) || null;
        
        const { id, ...rest } = tx;
        
        return {
            ...rest,
            category_id: newCatId,
            payment_method_id: newPmId
        };
      });
      
      await db.transactions.bulkAdd(remappedTransactions as any[]);

      console.log("Transação de importação concluída com sucesso.");
    });
  } catch (e: any) {
    console.error("Erro durante a transação de importação:", e);
    throw new Error("Falha ao salvar dados no banco: " + e.message);
  }
};