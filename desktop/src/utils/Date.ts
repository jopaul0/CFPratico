export const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const parseStringToDate = (dateString: string): Date => {
    if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    const [year, month, day] = dateString.split('-').map(Number);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month - 1, day);
    }
    return new Date();
};

export const toISODate = (d: Date) => d.toISOString().slice(0, 10);

export const parseNumberBR = (s: string) => {
  if (!s?.trim()) return 0;
  const norm = s.replace(/\./g, '').replace(',', '.');
  const n = Number(norm);
  return Number.isFinite(n) ? n : 0;
};