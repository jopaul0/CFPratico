import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as DB from '../services/database';
import { useRefresh } from '../contexts/RefreshContext';


interface useStatmentMassDeleteProps {
    reload: () => void;
}


export const useStatmentMassDelete = ({ reload }: useStatmentMassDeleteProps) => {
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const { triggerReload } = useRefresh();

    const handleLongPressItem = useCallback((txId: string) => {
        setIsSelectionMode(true);
        setSelectedIds(prev => new Set(prev).add(txId));
    }, []);

    const handleCancelSelection = useCallback(() => {
        setIsSelectionMode(false);
        setSelectedIds(new Set());
    }, []);

    const toggleSelectItem = useCallback((txId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(txId)) {
                newSet.delete(txId);
            } else {
                newSet.add(txId);
            }
            
            if (newSet.size === 0) {
                setIsSelectionMode(false);
            }
            return newSet;
        });
    }, []);

    const handleDeleteSelected = useCallback(async () => {
        if (selectedIds.size === 0) return;

        const idsToDelete = Array.from(selectedIds).map(id => parseInt(id, 10));

        Alert.alert(
            `Excluir ${idsToDelete.length} ${ idsToDelete.length > 1 ? "transações" : "transação" }?`,
            "Esta ação não pode ser desfeita.",
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Excluir', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await DB.deleteTransactions(idsToDelete);
                            
                            handleCancelSelection();
                            triggerReload();
                        } catch (e) {
                            console.error("Erro ao deletar em massa", e);
                            Alert.alert("Erro", "Não foi possível excluir as transações.");
                        }
                    }
                }
            ]
        );
    }, [selectedIds, triggerReload, handleCancelSelection]);

    return {
        isSelectionMode,
        selectedIds,
        handleLongPressItem,
        handleCancelSelection,
        toggleSelectItem,
        handleDeleteSelected,
    };
};