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
      payment_method_id INTEGER,
      category_id INTEGER,
      FOREIGN KEY (payment_method_id) REFERENCES payment_method (id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE SET NULL
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
      
      // 1. Verifica se é a primeira execução (checa se a config ID=1 existe)
      const firstRunCheck = await db.getFirstAsync(
        'SELECT id FROM user_config WHERE id = 1'
      );

      // 2. Se a config NÃO existir, é a primeira execução
      if (!firstRunCheck) {
        console.log("Primeira execução detectada. Populando TUDO (config, categorias, métodos e transações de teste).");

        // a. Cria a config padrão (o "sinalizador")
        await db.runAsync(
          'INSERT INTO user_config (id, company_name, initial_balance) VALUES (1, ?, ?);',
          [null, 0.00]
        );

        // b. Popula Categorias (SÓ NA PRIMEIRA VEZ)
        // MOVEMOS PARA DENTRO DO IF
        for (const name of DEFAULT_CATEGORIES) {
          await db.runAsync('INSERT INTO category (name) VALUES (?);', [name]);
        }
        
        // c. Popula Métodos (SÓ NA PRIMEIRA VEZ)
        // MOVEMOS PARA DENTRO DO IF
        for (const name of DEFAULT_PAYMENT_METHODS) {
          await db.runAsync('INSERT INTO payment_method (name) VALUES (?);', [name]);
        }
        
        // d. Cria transações de teste (SÓ NA PRIMEIRA VEZ)
        const today = new Date().toISOString();
        
        // Transação 1: Receita (Venda, Pix)
        await db.runAsync(
          `INSERT INTO "transaction" (date, description, value, type, condition, installments, payment_method_id, category_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            today,
            'Venda de software (Exemplo)',
            1500.00,
            'revenue',
            'paid',
            1,
            1, // ID 'Pix'
            1  // ID 'Venda'
          ]
        );
        
        // Transação 2: Despesa (Fornecedor, Boleto)
        await db.runAsync(
          `INSERT INTO "transaction" (date, description, value, type, condition, installments, payment_method_id, category_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            today,
            'Pagamento fornecedor de internet (Exemplo)',
            -350.50,
            'expense',
            'paid',
            1,
            7,
            4 
          ]
        );

      } else {
        // Se o app já rodou, não faz NADA.
        console.log("Seeding de dados já executado anteriormente. Pulando.");
      }
    });

    console.log('Processo de seeding de dados concluído.');
  
  } catch (error) {
    console.error('Erro na transação de seeding:', error);
    throw error;
  }
};