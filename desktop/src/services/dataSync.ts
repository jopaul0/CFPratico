// src/services/dataSync.ts
import { db } from './database/db';
// 1. Importar o tipo UserConfig
import type { Category, PaymentMethod, Transaction, UserConfig } from '../types/Database';

// Importa as funções de CRUD para evitar dependência cíclica
import { fetchCategories } from './database/crud/Category';
import { fetchPaymentMethods } from './database/crud/PaymentMethods';
import { fetchAllRawTransactions } from './database/crud/Transaction';
// 2. Importar a função para buscar o UserConfig
import { fetchOrCreateUserConfig } from './database/crud/UserConfig';

/**
 * Define a estrutura do nosso arquivo de backup JSON.
 */
interface BackupData {
  categories: Category[];
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  userConfig: UserConfig; // 3. Adicionar userConfig à interface
}

/**
 * Busca todos os dados relevantes do banco (Dexie) e formata como string JSON.
 */
export const exportDataAsJson = async (): Promise<string> => {
  try {
    // 4. Buscar o userConfig junto com os outros dados
    const [categories, paymentMethods, transactions, userConfig] = await Promise.all([
      fetchCategories(),
      fetchPaymentMethods(),
      fetchAllRawTransactions(),
      fetchOrCreateUserConfig() // Adicionado
    ]);

    const backupData: BackupData = {
      categories,
      paymentMethods,
      transactions,
      userConfig, // 5. Adicionar o userConfig ao objeto de backup
    };

    return JSON.stringify(backupData, null, 2);
  } catch (e) {
    console.error("Erro ao gerar JSON de exportação:", e);
    throw new Error("Falha ao exportar dados.");
  }
};

/**
 * Lê uma string JSON, limpa as tabelas (Dexie) e re-insere os dados,
 * re-mapeando as chaves estrangeiras.
 */
export const importDataFromJson = async (jsonString: string): Promise<void> => {
  let data: BackupData;
  try {
    data = JSON.parse(jsonString);
    // 6. Validar se o userConfig está presente no JSON
    if (!data.categories || !data.paymentMethods || !data.transactions || !data.userConfig) {
      throw new Error("Arquivo JSON inválido ou mal formatado.");
    }
  } catch (e: any) {
    console.error("Erro ao parsear JSON de importação:", e);
    throw new Error("Falha ao ler o arquivo: " + e.message);
  }

  try {
    // Inicia uma transação de escrita em todas as tabelas
    await db.transaction('rw', db.tables, async () => {
      console.log("Iniciando transação de importação (Dexie)...");

      // 1. Limpar dados existentes
      await Promise.all([
          db.transactions.clear(),
          db.categories.clear(),
          db.paymentMethods.clear(),
          db.userConfig.clear() // 7. Limpar a tabela userConfig
      ]);

      // 2. Restaurar o UserConfig primeiro
      // Como o ID é fixo (1), usamos 'put' para inserir
      await db.userConfig.put(data.userConfig);

      // 3. Re-mapear e Inserir Categorias
      const categoryIdMap = new Map<number, number>(); // <OldID, NewID>
      
      const newCatIds = await db.categories.bulkAdd(data.categories, { allKeys: true });
      data.categories.forEach((cat, index) => {
          categoryIdMap.set(cat.id, newCatIds[index] as number);
      });

      // 4. Re-mapear e Inserir Métodos de Pagamento
      const paymentMethodIdMap = new Map<number, number>(); // <OldID, NewID>
      
      const newPmIds = await db.paymentMethods.bulkAdd(data.paymentMethods, { allKeys: true });
      data.paymentMethods.forEach((pm, index) => {
          paymentMethodIdMap.set(pm.id, newPmIds[index] as number);
      });

      // 5. Re-mapear Transações
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
      
      // 6. Inserir Transações re-mapeadas
      await db.transactions.bulkAdd(remappedTransactions as any[]);

      console.log("Transação de importação concluída com sucesso.");
    });
  } catch (e: any) {
    console.error("Erro durante a transação de importação:", e);
    throw new Error("Falha ao salvar dados no banco: " + e.message);
  }
};