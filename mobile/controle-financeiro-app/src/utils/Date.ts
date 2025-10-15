export const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const parseStringToDate = (dateString: string): Date => {
    // Cria um Date object no fuso horário local
    const [year, month, day] = dateString.split('-').map(Number);
    // Nota: Mês é 0-indexado no construtor de Date
    return new Date(year, month - 1, day); 
};