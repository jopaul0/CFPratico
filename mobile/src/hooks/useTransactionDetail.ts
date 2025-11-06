import { useState, useCallback, useEffect } from 'react';
import * as DB from '../services/database';
import {
    Category,
    PaymentMethod,
    TransactionWithNames,
    NewTransactionData,
    TransactionType,
    TransactionCondition,
} from '../services/database';
import { formatBRLToNumber, formatNumberToBRLInput, formatBRLInputMask } from '../utils/Value';

// Estado do formulário
interface FormState {
    dateISO: string;
    description: string;
    valueInput: string;
    movementType: TransactionType;
    condition: TransactionCondition;
    installments: string;
    categoryId: number;
    paymentMethodId: number;
}

interface UseTransactionDetailProps {
    transactionId: number;
}

export const useTransactionDetail = ({ transactionId }: UseTransactionDetailProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Estados de Dados
    const [transaction, setTransaction] = useState<TransactionWithNames | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    // Estado do Formulário
    const [formState, setFormState] = useState<FormState | null>(null);

    const txToFormState = (tx: TransactionWithNames): FormState => ({
        dateISO: tx.date.split('T')[0],
        description: tx.description || '',
        valueInput: formatNumberToBRLInput(Math.abs(tx.value)),
        movementType: tx.type,
        condition: tx.condition,
        installments: String(tx.installments),
        categoryId: tx.category_id,
        paymentMethodId: tx.payment_method_id,
    });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [txData, catData, pmData] = await Promise.all([
                DB.fetchTransactionById(transactionId),
                DB.fetchCategories(),
                DB.fetchPaymentMethods(),
            ]);

            if (!txData) {
                throw new Error('Transação não encontrada.');
            }

            setTransaction(txData);
            setCategories(catData);
            setPaymentMethods(pmData);
            setFormState(txToFormState(txData));

        } catch (e: any) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    }, [transactionId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const setField = (field: keyof FormState, value: any) => {
        if (field === 'valueInput') {
            const maskedValue = formatBRLInputMask(value as string);
            setFormState(prev => prev ? { ...prev, [field]: maskedValue } : null);
        } else {
            setFormState(prev => prev ? { ...prev, [field]: value } : null);
        }
    };

    const handleEditToggle = () => setIsEditing(true);

    const handleCancel = () => {
        setIsEditing(false);
        // Reseta o formulário para os dados originais
        if (transaction) {
            setFormState(txToFormState(transaction));
        }
    };

    /**
     * Valida e salva as alterações.
     */
    const handleSave = async (): Promise<void> => {
        if (!formState) throw new Error('Formulário não inicializado.');

        setIsSaving(true);
        try {
            // 1. Validar e Converter Valor
            const value = formatBRLToNumber(formState.valueInput);
            if (isNaN(value) || value <= 0) {
                throw new Error('Valor inválido. Deve ser maior que zero.');
            }

            // 2. Ajustar Valor (negativo para despesa)
            const finalValue = formState.movementType === 'expense' ? -Math.abs(value) : Math.abs(value);

            // 3. Validar e Converter Parcelas
            let installments = parseInt(formState.installments, 10);
            if (formState.condition === 'paid') {
                installments = 1;
            } else if (isNaN(installments) || installments < 1) {
                installments = 1; // Ou lançar erro se preferir
            }

            // 4. Montar Objeto
            const data: NewTransactionData = {
                date: formState.dateISO,
                description: formState.description,
                value: finalValue,
                type: formState.movementType,
                condition: formState.condition,
                installments: installments,
                categoryId: formState.categoryId,
                paymentMethodId: formState.paymentMethodId,
            };

            // 5. Salvar
            await DB.updateTransaction(transactionId, data);

            // 6. Sucesso
            setIsSaving(false);
            setIsEditing(false);
            await loadData(); // Recarrega os dados para exibir info fresca

        } catch (e) {
            setIsSaving(false);
            throw e; // Deixa a tela tratar a exibição do erro
        }
    };

    /**
     * Deleta a transação (será chamada pela tela).
     */
    const handleDelete = async (): Promise<void> => {
        await DB.deleteTransaction(transactionId);
    };

    return {
        isLoading,
        isSaving,
        isEditing,
        error,
        transaction, // Para modo de visualização
        formState, // Para modo de edição
        categories,
        paymentMethods,

        setField,
        handleEditToggle,
        handleCancel,
        handleSave,
        handleDelete,
    };
};