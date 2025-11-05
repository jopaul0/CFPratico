// src/utils/Value.ts
export function formatToBRL(value: number): string {
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    const fixedValue = absoluteValue.toFixed(2);
    const [integerPart, decimalPart] = fixedValue.split('.');
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const formattedValueWithoutSign = `${formattedIntegerPart},${decimalPart}`;
    return `${isNegative ? '-' : ''}R$ ${formattedValueWithoutSign}`;
}

export const formatBRLToNumber = (input: string): number => {
    if (!input) return NaN;
    let cleanInput = String(input);
    cleanInput = cleanInput.replace(/R\$\s?/, '').trim();
    cleanInput = cleanInput.replace(/\./g, '');
    cleanInput = cleanInput.replace(/,/g, '.');
    const value = parseFloat(cleanInput);
    return value;
};

export const formatNumberToBRLInput = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined) {
      return '';
    }
    const fixedValue = value.toFixed(2);
    const [integerPart, decimalPart] = fixedValue.split('.');
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedIntegerPart},${decimalPart}`;
};