// src/utils/Date.ts

export const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * // ATUALIZADO
 * Converte uma string de data (ISO completo ou 'YYYY-MM-DD') 
 * para um objeto Date local.
 */
export const parseStringToDate = (dateString: string): Date => {
    // 1. Checa se é um ISO string completo (contém 'T')
    if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date; // Retorna a data ISO processada corretamente
        }
    }

    // 2. Se não tiver 'T', assume 'YYYY-MM-DD' (sua lógica original)
    // Isso garante que '2025-10-23' seja tratado como meia-noite local.
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Verifica se os números são válidos (evita NaN)
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month - 1, day);
    }

    // Fallback caso algo dê muito errado
    return new Date();
};

export const toISODate = (d: Date) => d.toISOString().slice(0, 10);

export const parseNumberBR = (s: string) => {
  if (!s?.trim()) return 0;
  const norm = s.replace(/\./g, '').replace(',', '.');
  const n = Number(norm);
  return Number.isFinite(n) ? n : 0;
};