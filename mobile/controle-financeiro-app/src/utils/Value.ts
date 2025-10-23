// src/utils/Value.ts

/**
 * (Sua função existente)
 * Formata um número para a exibição de moeda (ex: -1500.5 => "-R$ 1.500,50")
 */
export function formatToBRL(value: number): string {
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    const fixedValue = absoluteValue.toFixed(2);
    const [integerPart, decimalPart] = fixedValue.split('.');
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const formattedValueWithoutSign = `${formattedIntegerPart},${decimalPart}`;
    return `${isNegative ? '-' : ''}R$ ${formattedValueWithoutSign}`;
}

/**
 * // NOVO
 * Converte uma string de input BRL (ex: "1.500,00" ou "1500,00") 
 * para um número (ex: 1500.00).
 * Retorna NaN se a string for inválida.
 */
export const formatBRLToNumber = (input: string): number => {
    if (!input) return NaN;

    let cleanInput = String(input);
    
    // 1. Remove "R$", espaços em branco
    cleanInput = cleanInput.replace(/R\$\s?/, '').trim();
    
    // 2. Remove pontos (milhares)
    cleanInput = cleanInput.replace(/\./g, '');
    
    // 3. Substitui vírgula (decimal) por ponto
    cleanInput = cleanInput.replace(/,/g, '.');
    
    // 4. Converte para float
    const value = parseFloat(cleanInput);
    
    return value; // Retorna o número ou NaN se falhar
};

/**
 * // NOVO
 * Formata um número para uma string de input BRL (ex: 1500.5 => "1.500,50").
 * Usado para preencher o campo de valor no formulário.
 * Não inclui "R$" e usa 2 casas decimais.
 */
export const formatNumberToBRLInput = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined) {
      return '';
    }
    
    // Converte para string com 2 casas decimais
    const fixedValue = value.toFixed(2);
    
    // Separa parte inteira e decimal
    const [integerPart, decimalPart] = fixedValue.split('.');
    
    // Adiciona pontos de milhar
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // Retorna no formato "1.500,50"
    return `${formattedIntegerPart},${decimalPart}`;
};