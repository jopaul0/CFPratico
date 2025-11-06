import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useTransactionDetail } from '../hooks/useTransactionDetail';
import { getCategoryIcon } from '../utils/CategoryIcons';
import { formatToBRL } from '../utils/Value';
import { parseStringToDate } from '../utils/Date';

import { TransactionWithNames } from '../types/Database';

import { MainContainer } from '../components/MainContainer';
import { Divider } from '../components/Divider';
import { SimpleButton } from '../components/SimpleButton';
import { DatePickerInput } from '../components/DatePickerInput';
import { InputGroup } from '../components/InputGroup';
import { useRefresh } from '../contexts/RefreshContext';
import { useModal } from '../contexts/ModalContext';

const ViewMode: React.FC<{ tx: TransactionWithNames }> = ({ tx }) => {
    const Icon = getCategoryIcon(tx.category_icon_name);
    const iconColor = '#9ca3af';
    const formattedValue = formatToBRL(tx.value);
    const formattedDate = parseStringToDate(tx.date).toLocaleDateString('pt-BR');
    const paymentConditionText = tx.condition === 'pending' ? `Parcelado (${tx.installments}x)` : 'À Vista';
    const typeText = tx.type === 'expense' ? 'Despesa' : 'Receita';
    const valueColorClass = tx.type === 'expense' ? 'text-red-500' : 'text-green-600';

    const DetailRow: React.FC<{ label: string, value: string, colorClass?: string }> = ({ label, value, colorClass = 'text-gray-800' }) => (
        <>
            <div className="py-3">
                <span className="text-gray-500 text-xs font-medium">{label}</span>
                <p className={`text-base font-semibold ${colorClass}`}>{value}</p>
            </div>
            <Divider className="my-0" />
        </>
    );

    return (
        <div className="flex-1 bg-white rounded-lg m-4 p-4 shadow-lg w-full mx-auto">
            <div className="flex flex-col items-center mb-6">
                <div className="p-4 rounded-full bg-gray-100 mb-3">
                    <Icon size={36} color={iconColor} />
                </div>
                <p className={`text-3xl font-bold ${valueColorClass}`}>
                    {formattedValue}
                </p>
                <p className="text-gray-600 font-semibold mt-1">
                    {tx.category_name || 'Sem Categoria'}
                </p>
            </div>
            <Divider />
            <div className="p-2">
                <DetailRow label="Tipo de Movimentação" value={typeText} colorClass={valueColorClass} />
                <DetailRow label="Forma de Pagamento" value={tx.payment_method_name || 'N/A'} />
                <DetailRow label="Condição" value={paymentConditionText} />
                <DetailRow label="Data" value={formattedDate} />
                <DetailRow label="Histórico" value={tx.description || '-'} />
            </div>
        </div>
    );
};

const EditMode: React.FC<{ hook: ReturnType<typeof useTransactionDetail> }> = ({ hook }) => {
    const { formState, setField, categories, paymentMethods } = hook;
    if (!formState) return null;

    return (
        <div className="max-w-2xl mx-auto">
            <DatePickerInput label="Data" value={formState.dateISO} onChange={(v) => setField('dateISO', v)} />
            <InputGroup label="Descrição" value={formState.description} onChangeText={(v) => setField('description', v)} />
            <InputGroup label="Valor" keyboardType="numeric" value={formState.valueInput} onChangeText={(v) => setField('valueInput', v)} />
            <InputGroup label="Tipo" isSelect currentValue={formState.movementType} onValueChange={(v) => setField('movementType', v as any)} options={[{ label: 'Receita', value: 'revenue' }, { label: 'Despesa', value: 'expense' }]} />
            <InputGroup label="Condição" isSelect currentValue={formState.condition} onValueChange={(v) => setField('condition', v as any)} options={[{ label: 'À vista', value: 'paid' }, { label: 'Parcelado', value: 'pending' }]} />
            {formState.condition === 'pending' && <InputGroup label="Parcelas" keyboardType="numeric" value={formState.installments} onChangeText={(v) => setField('installments', v)} />}
            <InputGroup label="Categoria" isSelect currentValue={String(formState.categoryId)} onValueChange={(v) => setField('categoryId', Number(v))} options={categories.map(c => ({ label: c.name, value: String(c.id) }))} />
            <InputGroup label="Forma de pagamento" isSelect currentValue={String(formState.paymentMethodId)} onValueChange={(v) => setField('paymentMethodId', Number(v))} options={paymentMethods.map(p => ({ label: p.name, value: String(p.id) }))} />
        </div>
    );
};


export const TransactionDetailScreen: React.FC = () => {
    const navigate = useNavigate();
    const { triggerReload } = useRefresh();
    const { id } = useParams<{ id: string }>();
    const txId = parseInt(id || '0', 10);
    const { alert, confirm } = useModal();

    const hook = useTransactionDetail({ transactionId: txId });
    const {
        isLoading, isSaving, isEditing, error, transaction,
        handleEditToggle, handleCancel, handleSave, handleDelete
    } = hook;

    const onSave = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await handleSave();
            await alert('Sucesso!', 'Transação atualizada.', 'success');
            triggerReload();
        } catch (e: any) {
            await alert('Erro ao Salvar', e?.message ?? 'Falha ao salvar.', 'error');
        }
    }, [handleSave, triggerReload]);

    const onDelete = useCallback(async () => {
        const userConfirmed = await confirm(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.',
            { confirmText: 'Excluir', type: 'error' }
        );
        if (userConfirmed) {
            try {
                await handleDelete();
                await alert('Sucesso!', 'Transação excluída.', 'success');
                triggerReload();
                navigate('/statement');
            } catch (e: any) {
                await alert('Erro ao Excluir', e?.message ?? 'Falha ao excluir.', 'error');
            }
        }
    }, [handleDelete, navigate, triggerReload]);


    const renderMainContent = () => {
        if (isLoading) {
            return <div className="mt-16 text-center">Carregando...</div>;
        }
        if (error) {
            return <p className="mt-16 text-center text-red-500">Erro: {error.message}</p>;
        }
        if (!transaction) {
            return <p className="mt-16 text-center text-gray-500">Transação não encontrada.</p>;
        }

        if (!isEditing) {
            return <ViewMode tx={transaction} />;
        }

        return <EditMode hook={hook} />;
    };

    return (
        <MainContainer title={isEditing ? "Editar Transação" : "Detalhe da Transação"}
            showBackButton>
            {isEditing ? (
                <form onSubmit={onSave}>
                    {renderMainContent()}
                    {/* Botões de Ação para Edição */}
                    {!isLoading && !error && (
                        <>
                            <Divider className="my-6" />
                            <div className="p-2 max-w-2xl mx-auto">
                                <div className="flex justify-center gap-3">
                                    <SimpleButton
                                        title="Cancelar"
                                        type="button"
                                        onPress={handleCancel}
                                    />
                                    <SimpleButton
                                        title={isSaving ? 'Salvando…' : 'Salvar'}
                                        type="submit"
                                        disabled={isSaving}
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </form>
            ) : (
                <>
                    {renderMainContent()}
                    {/* Botões de Ação para Visualização */}
                    {!isLoading && !error && (
                        <>
                            <Divider className="my-6" />
                            <div className="p-2 max-w-2xl mx-auto">
                                <div className="flex justify-center gap-3">
                                    <SimpleButton
                                        title="Excluir"
                                        type="button"
                                        onPress={onDelete}
                                        className="bg-red-600 text-white hover:bg-red-700"
                                    />
                                    <SimpleButton
                                        title="Editar"
                                        type="button"
                                        onPress={handleEditToggle}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </MainContainer>
    );
};