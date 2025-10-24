// src/services/database/initialize.ts
import { dbPromise } from './connection';

const DB_CREATE_SCRIPTS = [
    `CREATE TABLE IF NOT EXISTS category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon_name TEXT NOT NULL DEFAULT 'DollarSign' 
  );`, // <--- COLUNA ADICIONADA
    `CREATE TABLE IF NOT EXISTS payment_method (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
  );`,
    // ... (user_config e transaction permanecem iguais)
    `CREATE TABLE IF NOT EXISTS user_config (
      id INTEGER PRIMARY KEY,
      company_name TEXT,
      initial_balance REAL NOT NULL DEFAULT 0.00
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

// --- DADOS INICIAIS ATUALIZADOS ---
// Agora é um objeto com nome e ícone
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
    // A categoria "Saldo Inicial" será tratada de outra forma, se necessário
];
const DEFAULT_PAYMENT_METHODS = ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Cheque', 'Transferência Bancária (TED)', 'Dinheiro', 'Boleto'];


/**
 * Executa os scripts de criação das tabelas.
 */
export const initDatabase = async (): Promise<void> => {
    // ... (função initDatabase sem alteração)
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


/**
 * Insere os dados iniciais (categorias e métodos)
 */
export const seedInitialData = async (): Promise<void> => {
  const db = await dbPromise;

  try {
    await db.withTransactionAsync(async () => {
      
      const firstRunCheck = await db.getFirstAsync(
        'SELECT id FROM user_config WHERE id = 1'
      );

      if (!firstRunCheck) {
        console.log("Primeira execução detectada. Populando TUDO...");

        await db.runAsync(
          'INSERT INTO user_config (id, company_name, initial_balance) VALUES (1, ?, ?);',
          [null, 0.00]
        );

        // --- ATUALIZADO: Loop de Categorias ---
        for (const cat of DEFAULT_CATEGORIES) {
          await db.runAsync(
              'INSERT INTO category (name, icon_name) VALUES (?, ?);', 
              [cat.name, cat.icon]
          );
        }
        
        // Loop de Métodos (sem alteração)
        for (const name of DEFAULT_PAYMENT_METHODS) {
          await db.runAsync('INSERT INTO payment_method (name) VALUES (?);', [name]);
        }
        
        // Transações de teste (sem alteração)
        const today = new Date().toISOString();
        await db.runAsync(
          `INSERT INTO "transaction" (date, description, value, type, condition, installments, payment_method_id, category_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [ today, 'Venda de software (Exemplo)', 1500.00, 'revenue', 'paid', 1, 1, 1 ] // Venda
        );
        await db.runAsync(
          `INSERT INTO "transaction" (date, description, value, type, condition, installments, payment_method_id, category_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [ today, 'Pagamento fornecedor de internet (Exemplo)', -350.50, 'expense', 'paid', 1, 7, 4 ] // Fornecedor
        );

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