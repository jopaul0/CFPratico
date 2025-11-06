// src/utils/Value.ts

/**
 * (Sua função existente)
 * Formata um número para a exibição de moeda (ex: -1500.5 => "-R$ 1.500,50")
 */
export function formatToBRL(value: number): string {
    // ... (função existente, sem alteração)
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    const fixedValue = absoluteValue.toFixed(2);
    const [integerPart, decimalPart] = fixedValue.split('.');
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const formattedValueWithoutSign = `${formattedIntegerPart},${decimalPart}`;
    return `${isNegative ? '-' : ''}R$ ${formattedValueWithoutSign}`;
}

/**
 * (Sua função existente)
 * Converte uma string de input BRL (ex: "1.500,00" ou "1500,00") 
 * para um número (ex: 1500.00).
 */
export const formatBRLToNumber = (input: string): number => {
    // ... (função existente, sem alteração)
    if (!input) return NaN;
    let cleanInput = String(input);
    cleanInput = cleanInput.replace(/R\$\s?/, '').trim();
    cleanInput = cleanInput.replace(/\./g, '');
    cleanInput = cleanInput.replace(/,/g, '.');
    const value = parseFloat(cleanInput);
    return value;
};

/**
 * (Sua função existente)
 * Formata um número para uma string de input BRL (ex: 1500.5 => "1.500,50").
 */
export const formatNumberToBRLInput = (value: number): string => {
    // ... (função existente, sem alteração)
    if (isNaN(value) || value === null || value === undefined) {
      return '';
    }
    const fixedValue = value.toFixed(2);
    const [integerPart, decimalPart] = fixedValue.split('.');
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedIntegerPart},${decimalPart}`;
};


// --- INÍCIO DA NOVA FUNÇÃO ---
/**
 * Formata uma string de input (ex: "1234a56") para um formato de
 * input monetário (ex: "1.234,56").
 */
export const formatBRLInputMask = (input: string): string => {
    if (!input) return '';

    // 1. Remove tudo que não for dígito
    const digits = input.replace(/\D/g, '');
    if (digits.length === 0) return '';

    // 2. Transforma em número (ex: "123456" -> 1234.56)
    let numValue: number;
    if (digits.length === 1) numValue = parseInt(digits, 10) / 100; // "1" -> 0.01
    else if (digits.length === 2) numValue = parseInt(digits, 10) / 100; // "12" -> 0.12
    else {
        const integerPart = digits.slice(0, -2);
        const decimalPart = digits.slice(-2);
        numValue = parseFloat(`${integerPart}.${decimalPart}`); // "123456" -> 1234.56
    }

    // 3. Re-formata usando a função existente
    return formatNumberToBRLInput(numValue);
};
// --- FIM DA NOVA FUNÇÃO ---