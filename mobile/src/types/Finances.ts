export const CONTA_OPTIONS = {
    'pix': 'Pix',
    'cartao': 'Cartão de Crédito',
    'ted': 'Transferência TED',
    'boleto': 'Boleto',
    'cheque': 'Cheque',
    'dinheiro': 'Dinheiro',
};

// Mapeamento dos novos valores de "Forma" (agora Condição)
export const FORMA_OPTIONS = {
    'avista': 'À vista',
    'parcelado': 'Parcelado',
};

// JSON de Categorias (Para simulação no RN)
export const MOCK_CATEGORIES = [
    "Saldo Inicial",
    "Venda",
    "Prestação de Serviço",
    "Transferência",
    "Fornecedor",
    "Imposto",
    "Folha de Pagamento",
    "Taxa Bancária",
    "Aluguel",
    "Energia",
    "Água",
    "Internet",
    "Telefone",
    "Manutenção",
    "Marketing",
    "Transporte",
    "Combustível",
    "Equipamentos",
    "Honorários",
    "Trabalhista",
    "Tarifas",
    "Outras Despesas",
    "Outras Receitas",
    "Despesas Pessoais",
    "Outros"
];


export type PagamentoType = keyof typeof CONTA_OPTIONS;
export type CondicaoType = keyof typeof FORMA_OPTIONS;
export type MovimentacaoType = 'receita' | 'despesa';

export interface Movimentacao {
  id: string;
  data: string; // Formato: YYYY-MM-DD
  tipo: MovimentacaoType;
  conta: PagamentoType;
  categoria: string;
  historico: string;
  valor: number;
  forma: CondicaoType;
  parcelas: number | null;
}

export interface ReportSummary {
  receitas: number;
  despesas: number;
  saldoPeriodo: number;
  saldoAnterior: number;
  saldoTotal: number;
}

export type Category = typeof MOCK_CATEGORIES[number];