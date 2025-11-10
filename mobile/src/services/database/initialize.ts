import { dbPromise } from './connection';
import type { SQLiteDatabase } from 'expo-sqlite';

const DB_CREATE_SCRIPTS = [
    `CREATE TABLE IF NOT EXISTS category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon_name TEXT NOT NULL DEFAULT 'DollarSign' 
  );`,
    `CREATE TABLE IF NOT EXISTS payment_method (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
  );`,
    `CREATE TABLE IF NOT EXISTS user_config (
      id INTEGER PRIMARY KEY,
      company_name TEXT,
      initial_balance REAL NOT NULL DEFAULT 0.00,
      company_logo TEXT DEFAULT NULL
  );`,
    `CREATE TABLE IF NOT EXISTS "transaction" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      description TEXT,
      value REAL NOT NULL,
      type TEXT NOT NULL,
      condition TEXT NOT NULL,
      installments INTEGER NOT NULL,
      payment_method_id INTEGER,
      category_id INTEGER,
      FOREIGN KEY (payment_method_id) REFERENCES payment_method (id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE SET NULL
  );`
];

const DEFAULT_CATEGORIES = [
    { name: "Venda", icon: "Receipt" },
    { name: "Prestação de Serviço", icon: "Receipt" },
    { name: "Transferência", icon: "Move" },
    { name: "Fornecedor", icon: "Truck" },
    { name: "Imposto", icon: "LandPlot" },
    { name: "Folha de Pagamento", icon: "Briefcase" },
    { name: "Taxa Bancária", icon: "CreditCard" },
    { name: "Aluguel", icon: "LandPlot" },
    { name: "Energia", icon: "Plug" },
    { name: "Água", icon: "Droplet" },
    { name: "Internet", icon: "Wifi" },
    { name: "Telefone", icon: "Phone" },
    { name: "Manutenção", icon: "Wrench" },
    { name: "Marketing", icon: "Megaphone" },
    { name: "Transporte", icon: "Truck" },
    { name: "Combustível", icon: "Fuel" },
    { name: "Equipamentos", icon: "HardHat" },
    { name: "Honorários", icon: "Briefcase" },
    { name: "Trabalhista", icon: "Briefcase" },
    { name: "Tarifas", icon: "CreditCard" },
    { name: "Outras Despesas", icon: "MoreHorizontal" },
    { name: "Outras Receitas", icon: "DollarSign" },
    { name: "Despesas Pessoais", icon: "CreditCard" },
    { name: "Outros", icon: "MoreHorizontal" },
];
const DEFAULT_PAYMENT_METHODS = ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Cheque', 'Transferência Bancária (TED)', 'Dinheiro', 'Boleto'];


export const initDatabase = async (): Promise<void> => {
    const db = await dbPromise;
    try {
        await db.execAsync('PRAGMA foreign_keys = ON;');
        console.log("Chaves estrangeiras habilitadas.");
        await db.withTransactionAsync(async () => {
            for (const script of DB_CREATE_SCRIPTS) {
                await db.execAsync(script);
            }
        });
        console.log('Banco de dados inicializado com sucesso.');
    } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
        throw error;
    }
};

const _seedDefaults = async (db: SQLiteDatabase) => {
    console.log("Inserindo dados padrão...");
    
    await db.runAsync(
      'INSERT INTO user_config (id, company_name, initial_balance, company_logo) VALUES (1, ?, ?, ?);',
      [null, 0.00, null]
    );

    for (const cat of DEFAULT_CATEGORIES) {
      await db.runAsync(
          'INSERT INTO category (name, icon_name) VALUES (?, ?);', 
          [cat.name, cat.icon]
      );
    }
    

    for (const name of DEFAULT_PAYMENT_METHODS) {
      await db.runAsync('INSERT INTO payment_method (name) VALUES (?);', [name]);
    }
    
    const today = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO "transaction" (date, description, value, type, condition, installments, payment_method_id, category_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [ today, 'Venda de software (Exemplo)', 1500.00, 'revenue', 'paid', 1, 1, 1 ]
    );
    await db.runAsync(
      `INSERT INTO "transaction" (date, description, value, type, condition, installments, payment_method_id, category_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [ today, 'Pagamento fornecedor de internet (Exemplo)', -350.50, 'expense', 'paid', 1, 7, 4 ]
    );
    console.log("Dados padrão inseridos.");
};

export const seedInitialData = async (): Promise<void> => {
  const db = await dbPromise;
  try {
    await db.withTransactionAsync(async () => {
      const firstRunCheck = await db.getFirstAsync(
        'SELECT id FROM user_config WHERE id = 1'
      );
      if (!firstRunCheck) {
        console.log("Primeira execução detectada. Populando TUDO...");
        await _seedDefaults(db);
      } else {
        console.log("Seeding de dados já executado anteriormente. Pulando.");
      }
    });
    console.log('Processo de seeding de dados concluído.');
  } catch (error) {
    console.error('Erro na transação de seeding:', error);
    throw error;
  }
};

export const resetDatabaseToDefaults = async (): Promise<void> => {
  const db = await dbPromise;
  console.warn("INICIANDO RESET TOTAL DO BANCO DE DADOS...");
  try {
    await db.withTransactionAsync(async () => {

      await db.runAsync('DELETE FROM "transaction";');
      await db.runAsync('DELETE FROM "category";');
      await db.runAsync('DELETE FROM "payment_method";');
      await db.runAsync('DELETE FROM "user_config";');
   
      await db.runAsync("DELETE FROM sqlite_sequence WHERE name = 'transaction';");
      await db.runAsync("DELETE FROM sqlite_sequence WHERE name = 'category';");
      await db.runAsync("DELETE FROM sqlite_sequence WHERE name = 'payment_method';");
 
      await _seedDefaults(db);
    });
    console.warn("RESET DO BANCO DE DADOS CONCLUÍDO.");
  } catch (error : any) {
    console.error("Erro catastrófico durante o reset do banco:", error);
    throw error;
  }
};