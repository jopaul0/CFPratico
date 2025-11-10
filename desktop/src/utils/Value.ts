export function formatToBRL(value: number): string {
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    const fixedValue = absoluteValue.toFixed(2);
    const [integerPart, decimalPart] = fixedValue.split('.');
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    const formattedValueWithoutSign = `${formattedIntegerPart},${decimalPart}`;
    return `${isNegative ? '-R$ ' : 'R$ '}${formattedValueWithoutSign}`;
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
    
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    
    const fixedValue = absoluteValue.toFixed(2);
    const [integerPart, decimalPart] = fixedValue.split('.');
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${isNegative ? '-' : ''}${formattedIntegerPart},${decimalPart}`;
};


export const formatBRLInputMask = (input: string): string => {
    if (!input) return '';
    const isNegative = input.startsWith('-');

    const digits = input.replace(/\D/g, '');
    if (digits.length === 0) return '';
 
    let numValue: number;
    if (digits.length === 1) numValue = parseInt(digits, 10) / 100;
    else if (digits.length === 2) numValue = parseInt(digits, 10) / 100;
    else {
        const integerPart = digits.slice(0, -2);
        const decimalPart = digits.slice(-2);
        numValue = parseFloat(`${integerPart}.${decimalPart}`);
    }
    
    const finalValue = isNegative ? -Math.abs(numValue) : Math.abs(numValue);
    return formatNumberToBRLInput(finalValue);
};