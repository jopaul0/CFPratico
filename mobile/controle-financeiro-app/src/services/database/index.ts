// src/services/database/index.ts
export * from '../../types/Database';

// Exporta as funções de inicialização
// --- (MODIFICADO) ---
export { initDatabase, seedInitialData, resetDatabaseToDefaults } from './initialize';

// Exporta as funções do repositório de Categoria
export {
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
} from './crud/Category';

// Exporta as funções do repositório de Método de Pagamento
export {
    fetchPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
} from './crud/PaymentMethods';

// Exporta as funções do repositório de Configuração
export {
    fetchUserConfig,
    fetchOrCreateUserConfig,
    saveOrUpdateUserConfig
} from './crud/UserConfig';

// Exporta as funções do repositório de Transação
// --- (MODIFICADO) ---
export {
    addTransaction,
    fetchTransactions,
    clearAllTransactions,
    updateTransaction,
    deleteTransaction,
    fetchTransactionById,
    deleteTransactions,
    fetchAllRawTransactions // <-- Adicionado
} from './crud/Transaction';

// --- (NOVO) ---
// Exporta as funções de Sincronização
export { exportDataAsJson, importDataFromJson } from '../dataSync';