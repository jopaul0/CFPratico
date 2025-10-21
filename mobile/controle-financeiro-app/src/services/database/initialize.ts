import { dbPromise } from './connection';

const DB_CREATE_SCRIPTS = [
    `CREATE TABLE IF NOT EXISTS category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
  );`,
    `CREATE TABLE IF NOT EXISTS payment_method (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
  );`,
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
      payment_method_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      FOREIGN KEY (payment_method_id) REFERENCES payment_method (id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE
  );`
];

// Dados iniciais
const DEFAULT_CATEGORIES = [
    "Venda", "Prestação de Serviço", "Transferência", "Fornecedor",
    "Imposto", "Folha de Pagamento", "Taxa Bancária", "Aluguel", "Energia",
    "Água", "Internet", "Telefone", "Manutenção", "Marketing",
    "Transporte", "Combustível", "Equipamentos", "Honorários", "Trabalhista",
    "Tarifas", "Outras Despesas", "Outras Receitas", "Despesas Pessoais", "Outros"
];
const DEFAULT_PAYMENT_METHODS = ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Cheque', 'Transferência Bancária (TED)', 'Dinheiro', 'Boleto'];



/**
 * Executa os scripts de criação das tabelas.
 */
export const initDatabase = async (): Promise<void> => {
    const db = await dbPromise;

    try {
        // Habilita chaves estrangeiras
        await db.execAsync('PRAGMA foreign_keys = ON;');
        console.log("Chaves estrangeiras habilitadas.");

        // Executa os scripts de criação dentro de uma transação
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
            // Usamos db.runAsync para INSERTs
            for (const name of DEFAULT_CATEGORIES) {
                await db.runAsync('INSERT OR IGNORE INTO category (name) VALUES (?);', [name]);
            }
            for (const name of DEFAULT_PAYMENT_METHODS) {
                await db.runAsync('INSERT OR IGNORE INTO payment_method (name) VALUES (?);', [name]);
            }
        });
        console.log('Seeding de dados iniciais concluído.');
    } catch (error) {
        console.error('Erro na transação de seeding:', error);
        throw error;
    }
};