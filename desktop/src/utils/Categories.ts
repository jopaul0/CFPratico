type CategoryName = string;
export const ALL_CATEGORY_NAMES: CategoryName[] = [
    "Saldo Inicial", "Venda", "Prestação de Serviço", "Transferência", "Fornecedor",
    "Imposto", "Folha de Pagamento", "Taxa Bancária", "Aluguel", "Energia",
    "Água", "Internet", "Telefone", "Manutenção", "Marketing",
    "Transporte", "Combustível", "Equipamentos", "Honorários", "Trabalhista",
    "Tarifas", "Outras Despesas", "Outras Receitas", "Despesas Pessoais", "Outros"
];

export const categoryToSlug = (name: CategoryName): string => {
    return name
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        .replace(/\s/g, '_'); 
};