import {
  LucideIcon,
  DollarSign, // Padrão
  Wallet, // Saldo Inicial
  Receipt, // Venda, Prestação de Serviço
  Move, // Transferência
  Truck, // Fornecedor, Transporte
  LandPlot, // Imposto, Aluguel
  Briefcase, // Folha de Pagamento, Honorários, Trabalhista
  CreditCard, // Taxa Bancária, Tarifas, Despesas Pessoais
  Plug, // Energia
  Droplet, // Água
  Wifi, // Internet
  Phone, // Telefone
  Wrench, // Manutenção
  Megaphone, // Marketing
  Fuel, // Combustível
  HardHat, // Equipamentos
  MoreHorizontal, // Outras Despesas/Receitas/Outros
} from 'lucide-react-native';

const categoryIconMap: Record<string, LucideIcon> = {
    // RECEITAS/SALDO
    "Saldo Inicial": Wallet,
    "Venda": Receipt,
    "Prestação de Serviço": Receipt,
    "Outras Receitas": DollarSign,

    // DESPESAS GERAIS E OPERACIONAIS
    "Transferência": Move,
    "Fornecedor": Truck,
    "Imposto": LandPlot, // Ou FileText
    "Folha de Pagamento": Briefcase, // Ou Users
    "Honorários": Briefcase,

    // SERVIÇOS E CONTAS
    "Taxa Bancária": CreditCard,
    "Aluguel": LandPlot,
    "Energia": Plug,
    "Água": Droplet,
    "Internet": Wifi,
    "Telefone": Phone,

    // MANUTENÇÃO E RECURSOS
    "Manutenção": Wrench,
    "Marketing": Megaphone,
    "Transporte": Truck,
    "Combustível": Fuel,
    "Equipamentos": HardHat,

    // OUTROS E ESPECÍFICOS
    "Trabalhista": Briefcase,
    "Tarifas": CreditCard,
    "Despesas Pessoais": CreditCard,
    "Outras Despesas": MoreHorizontal,
    "Outros": MoreHorizontal,
};

export const getCategoryIcon = (category: string): LucideIcon => {
    return categoryIconMap[category] || DollarSign;
};

export const ALL_CATEGORIES = Object.keys(categoryIconMap);