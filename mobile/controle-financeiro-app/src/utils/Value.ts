export function formatToBRL(value: number): string {
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    const fixedValue = absoluteValue.toFixed(2);
    const [integerPart, decimalPart] = fixedValue.split('.');
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const formattedValueWithoutSign = `${formattedIntegerPart},${decimalPart}`;
    return `${isNegative ? '-' : ''}R$ ${formattedValueWithoutSign}`;
}