import Dexie, { type Table } from 'dexie';
import type { Category, PaymentMethod, UserConfig, Transaction } from '../../types/Database';

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

export class AppDatabase extends Dexie {
  categories!: Table<Category, number>;
  paymentMethods!: Table<PaymentMethod, number>;
  userConfig!: Table<UserConfig, 1>;
  transactions!: Table<Transaction, number>;

  constructor() {
    super('meuapp.db');
    this.version(1).stores({
      categories: '++id, &name, icon_name',
      paymentMethods: '++id, &name',
      userConfig: 'id',
      transactions: '++id, date, type, condition, payment_method_id, category_id, *description',
    });

    this.on('populate', () => this.seedInitialData());
  }

  async seedInitialData() {
    console.log("Inserindo dados padrão (seeding)...");
    
    await this.userConfig.put({
      id: 1,
      company_name: null,
      initial_balance: 0.00
    });

    await this.categories.bulkAdd(
      DEFAULT_CATEGORIES.map(cat => ({ name: cat.name, icon_name: cat.icon })) as any[]
    );

    await this.paymentMethods.bulkAdd(
      DEFAULT_PAYMENT_METHODS.map(name => ({ name })) as any[]
    );
    
    const today = new Date().toISOString();
    
    const catVenda = await this.categories.where('name').equals('Venda').first();
    const catFornecedor = await this.categories.where('name').equals('Fornecedor').first();
    const pmPix = await this.paymentMethods.where('name').equals('Pix').first();
    const pmBoleto = await this.paymentMethods.where('name').equals('Boleto').first();

    if (catVenda && pmPix) {
        await this.transactions.add({
            date: today,
            description: 'Venda de software (Exemplo)',
            value: 1500.00,
            type: 'revenue',
            condition: 'paid',
            installments: 1,
            payment_method_id: pmPix.id,
            category_id: catVenda.id,
        } as any);
    }

    if (catFornecedor && pmBoleto) {
        await this.transactions.add({
            date: today,
            description: 'Pagamento fornecedor de internet (Exemplo)',
            value: -350.50,
            type: 'expense',
            condition: 'paid',
            installments: 1,
            payment_method_id: pmBoleto.id,
            category_id: catFornecedor.id,
        } as any);
    }
    
    console.log("Dados padrão inseridos.");
  }
}

export const db = new AppDatabase();

export const resetDatabaseToDefaults = async (): Promise<void> => {
    console.warn("INICIANDO RESET TOTAL DO BANCO DE DADOS (DEXIE)...");
    try {
        await db.transaction('rw', db.tables, async () => {
            await Promise.all(db.tables.map(table => table.clear()));
            await db.seedInitialData();
        });
        console.warn("RESET DO BANCO DE DADOS CONCLUÍDO.");
    } catch (error : any) {
        console.error("Erro catastrófico durante o reset do banco:", error);
        throw error;
    }
};

export const initDatabase = async (): Promise<void> => {
    try {
        await db.open();
        console.log("Banco de dados Dexie (IndexedDB) aberto com sucesso.");
    } catch (error) {
        console.error('Erro ao abrir o banco de dados Dexie:', error);
        throw error;
    }
};