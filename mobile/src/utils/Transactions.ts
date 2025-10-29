import type { ISODate } from '../types/Date';
import type { Tx, TransactionGroup } from '../types/Transactions';

export const formatDailyHeader = (iso: ISODate): string => {
    const d = new Date(`${iso}T00:00:00`); 
    return d.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const computeDailyBalance = (txs: Tx[], initialBalance: number): Record<ISODate, number> => {
    const byDateAsc = [...txs].sort((a, b) => a.date.localeCompare(b.date));
    const result: Record<ISODate, number> = {} as Record<ISODate, number>;
    let running = initialBalance;

    const grouped: Record<ISODate, Tx[]> = {} as Record<ISODate, Tx[]>;
    for (const t of byDateAsc) {
        (grouped[t.date] ??= []).push(t);
    }

    for (const day of Object.keys(grouped) as ISODate[]) {
        for (const t of grouped[day]) {
            running += t.isNegative ? -t.value : t.value;
        }
        result[day] = running;
    }
    return result;
};

export const groupTransactionsByDay = (filteredTxs: Tx[], initialBalance: number): TransactionGroup[] => {
    const dailyBalance = computeDailyBalance(filteredTxs, initialBalance);
    const map: Record<ISODate, Tx[]> = {} as Record<ISODate, Tx[]>;
    for (const t of filteredTxs) {
        (map[t.date] ??= []).push(t);
    }

    const days = Object.keys(map).sort((a, b) => b.localeCompare(a)) as ISODate[];

    return days.map((iso) => ({
        dateISO: iso,
        dateLabel: formatDailyHeader(iso),
        balance: dailyBalance[iso] ?? 0,
        transactions: map[iso],
    }));
};
