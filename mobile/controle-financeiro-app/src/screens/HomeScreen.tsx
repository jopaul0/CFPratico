import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { SummaryCard } from '../components/SummaryCard';
import { ActionButtons } from '../components/ActionButtons';
import { InputGroup } from '../components/InputGroup';
import { CONTA_OPTIONS, FORMA_OPTIONS, MOCK_CATEGORIES, MovimentacaoType, PagamentoType, CondicaoType } from '../types/Finances'; 
// Importação de @react-native-picker/picker foi removida daqui e movida para InputGroup

// Componente Tabela de Movimentações (Simplificado)
const MockMovementsTable: React.FC = () => {
    // Cabeçalho da Tabela (8 Colunas + 1 Ações = 9)
    const headers = ['DATA', 'TIPO', 'PAGAMENTO', 'CATEGORIA', 'HISTÓRICO', 'VALOR', 'CONDIÇÃO', 'PARCELAS', 'AÇÕES'];
    
    // Mock de dados para uma linha
    const mockRow = {
        data: '15/10/2025',
        tipo: 'Receita',
        pagamento: 'Pix',
        categoria: 'Venda',
        historico: 'Pagamento do cliente A',
        valor: 1500.00,
        condicao: 'À vista',
        parcelas: '-',
    };

    const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mockRow.valor);

    return (
        <View className="p-5 border border-gray-200 rounded-xl shadow-lg bg-white mt-6">
            <Text className="font-semibold text-xl text-gray-800 mb-4">Movimentações</Text>
            
            <View className="rounded-lg border border-gray-200 overflow-hidden">
                {/* Cabeçalho da Tabela */}
                <View className="flex-row py-3 bg-gray-50 border-b border-gray-200">
                    {headers.map(h => (
                        <Text key={h} className="text-xs font-semibold uppercase text-gray-600 px-2 flex-1 text-center">
                            {h}
                        </Text>
                    ))}
                </View>

                {/* Mock: Linha Saldo Anterior (Colspan manual com largura) */}
                <View className="flex-row bg-gray-100 font-bold py-2 border-b border-gray-300">
                    <Text className="flex-1 px-2 text-sm text-left" style={{ width: '66.666%' }}>
                        SALDO ANTERIOR (Até 01/10/2025)
                    </Text>
                    <Text className="w-1/3 px-2 text-sm text-right">
                        R$ 0,00
                    </Text>
                </View>

                {/* Mock: Linha de Movimentação */}
                <View className="flex-row py-2 border-b border-gray-100 items-center">
                    <Text className="text-xs px-2" style={{ flex: 1, width: '10%' }}>{mockRow.data}</Text>
                    <Text className="text-xs px-2 text-emerald-700" style={{ flex: 1, width: '7%' }}>{mockRow.tipo}</Text>
                    <Text className="text-xs px-2" style={{ flex: 1, width: '12%' }}>{mockRow.pagamento}</Text>
                    <Text className="text-xs px-2" style={{ flex: 1, width: '15%' }}>{mockRow.categoria}</Text>
                    <Text className="text-xs px-2" style={{ flex: 1, width: '34%' }}>{mockRow.historico}</Text>
                    <Text className="text-xs px-2 text-right font-medium" style={{ flex: 1, width: '10%' }}>{formattedValue}</Text>
                    <Text className="text-xs px-2 text-right" style={{ flex: 1, width: '6%' }}>{mockRow.condicao}</Text>
                    <Text className="text-xs px-2 text-right" style={{ flex: 1, width: '6%' }}>{mockRow.parcelas}</Text>
                    <Text className="text-xs px-2 text-right" style={{ flex: 1, width: '10%' }}>Ações</Text>
                </View>
                
                {/* Mock: Linha Saldo Final */}
                 <View className="flex-row bg-gray-200 font-bold py-2 mt-2 rounded-b-xl">
                    <Text className="flex-1 px-2 text-sm text-left" style={{ width: '66.666%' }}>
                        SALDO TOTAL FINAL (Até 31/10/2025)
                    </Text>
                    <Text className="w-1/3 px-2 text-sm text-right">
                        R$ 6.666,77
                    </Text>
                </View>
            </View>
        </View>
    );
};

export const HomeScreen: React.FC = () => {
    // --- Mapeamento de Opções ---
    const paymentOptions = Object.keys(CONTA_OPTIONS).map(key => ({ 
        label: CONTA_OPTIONS[key as PagamentoType], 
        value: key 
    }));
    const conditionOptions = Object.keys(FORMA_OPTIONS).map(key => ({ 
        label: FORMA_OPTIONS[key as CondicaoType], 
        value: key 
    }));
    const typeOptions = [
        { label: 'Receita', value: 'receita' }, 
        { label: 'Despesa', value: 'despesa' }
    ];

    // --- ESTADO DO FORMULÁRIO ---
    const [movData, setMovData] = useState('2025-10-15');
    const [movTipo, setMovTipo] = useState<string>('receita');
    const [movConta, setMovConta] = useState<string>('pix');
    const [movCondicao, setMovCondicao] = useState<string>('avista');
    const [movValor, setMovValor] = useState('1500,00');
    // Adicionar mais estados (Categoria, Histórico, Parcelas) aqui...

    // --- Mocks para Resumo e Ações ---
    const mockSummary = {
        totalReceitas: 12345.67,
        totalDespesas: 5678.90,
        saldoPeriodo: 6666.77,
    };
    const handleAction = (action: string) => { alert(`Ação: ${action}`); };
    
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
                <View className="p-4 md:p-8 max-w-6xl mx-auto w-full">

                    {/* HEADER & AÇÕES */}
                    <View className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-gray-200">
                        <View className="flex flex-row items-center gap-3">
                            <View className="h-10 w-10 bg-gray-700 rounded-full" /> 
                            <View>
                                <Text className="text-2xl font-bold text-gray-800">Controle Financeiro Prático</Text>
                                <Text className="text-sm text-gray-500">Protótipo em React Native.</Text>
                            </View>
                        </View>
                        <ActionButtons 
                            onExportCSV={() => handleAction('Export CSV')}
                            onImportCSV={() => handleAction('Import CSV')}
                            onExportPDF={() => handleAction('Export PDF')}
                            onPrint={() => handleAction('Print')}
                        />
                    </View>

                    {/* RESUMO (CARDS) */}
                    <View className="flex-row flex-wrap mt-8 -mx-2">
                        <SummaryCard 
                            title="Receitas" 
                            value={mockSummary.totalReceitas} 
                            valueColorClass="text-emerald-600" 
                        />
                        <SummaryCard 
                            title="Despesas" 
                            value={mockSummary.totalDespesas} 
                            valueColorClass="text-rose-600" 
                        />
                        <SummaryCard 
                            title="Saldo do Período" 
                            value={mockSummary.saldoPeriodo} 
                            valueColorClass={mockSummary.saldoPeriodo >= 0 ? "text-gray-800" : "text-rose-600"} 
                        />
                    </View>
                    
                    {/* FILTROS */}
                    <View className="p-5 border border-gray-200 rounded-xl shadow-lg bg-white mt-8">
                        <View className="flex-row flex-wrap gap-3">
                            {/* Ajuste de largura para 4 colunas em mobile e 7 em desktop */}
                            <View className="w-[48%] md:w-1/7">
                                <InputGroup label="Data Início" placeholder="YYYY-MM-DD" value={'2025-10-01'} />
                            </View>
                            <View className="w-[48%] md:w-1/7">
                                <InputGroup label="Data Fim" placeholder="YYYY-MM-DD" value={'2025-10-31'} />
                            </View>
                            <View className="w-[48%] md:w-1/7 relative">
                                <InputGroup label="Categoria" placeholder="Ex.: Vendas" />
                            </View>
                            <View className="w-[48%] md:w-1/7">
                                <InputGroup label="Tipo" placeholder="Todos" isSelect options={[{ label: 'Todos', value: '' }, ...typeOptions]} />
                            </View>
                            <View className="w-[48%] md:w-1/7">
                                <InputGroup label="Pagamento" placeholder="Todas" isSelect options={[{ label: 'Todas', value: '' }, ...paymentOptions]} />
                            </View>
                            <View className="w-[48%] md:w-1/7">
                                <InputGroup label="Condição" placeholder="Todas" isSelect options={[{ label: 'Todas', value: '' }, ...conditionOptions]} />
                            </View>
                            <View className="w-[48%] md:w-1/7">
                                <InputGroup label="Histórico" placeholder="Contém no histórico..." />
                            </View>
                            <View className="w-[48%] md:w-1/7 self-end">
                                <TouchableOpacity className="w-full py-2 px-4 rounded-lg border border-gray-300 bg-white active:bg-gray-50 shadow-sm">
                                    <Text className="text-sm font-semibold text-gray-700 text-center">Limpar filtros</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    
                    {/* FORMULÁRIO */}
                    <View className="p-5 border border-gray-200 rounded-xl shadow-lg bg-white mt-6">
                        <Text className="font-semibold text-xl text-gray-800 mb-4">Nova movimentação</Text>
                        <View className="flex-row flex-wrap gap-3">
                            
                            {/* Linha 1: Data, Tipo, Pagamento */}
                            <View className="w-full flex-row flex-wrap gap-3">
                                <View className="w-[30%]">
                                    <InputGroup label="Data" placeholder="YYYY-MM-DD" value={movData} onChangeText={setMovData} />
                                </View>
                                <View className="w-[30%]">
                                    <InputGroup 
                                        label="Tipo" 
                                        isSelect 
                                        options={typeOptions} 
                                        currentValue={movTipo} 
                                        onValueChange={setMovTipo}
                                    />
                                </View>
                                <View className="w-[30%]">
                                    <InputGroup 
                                        label="Formas de Pagamento" 
                                        isSelect 
                                        options={paymentOptions} 
                                        currentValue={movConta} 
                                        onValueChange={setMovConta}
                                    />
                                </View>
                            </View>
                            
                            {/* Linha 2: Categoria, Histórico */}
                            <View className="w-full flex-row flex-wrap gap-3">
                                <View className="w-[45%]">
                                    <InputGroup label="Categoria" placeholder="Selecione ou digite..." />
                                </View>
                                <View className="w-[45%]">
                                    <InputGroup label="Histórico" placeholder="Venda #123, Energia" />
                                </View>
                            </View>

                            {/* Linha 3: Valor, Condição, Parcelas */}
                            <View className="w-full flex-row flex-wrap gap-3">
                                <View className="w-[30%]">
                                    <InputGroup label="Valor" placeholder="1500,00" keyboardType="numeric" value={movValor} onChangeText={setMovValor} />
                                </View>
                                <View className="w-[30%]">
                                    <InputGroup 
                                        label="Condição" 
                                        isSelect 
                                        options={conditionOptions} 
                                        currentValue={movCondicao} 
                                        onValueChange={setMovCondicao}
                                    />
                                </View>
                                {/* Simulação de Parcelas Wrap (hidden) - Mostra se Condição for 'parcelado' */}
                                {movCondicao === 'parcelado' && (
                                    <View className="w-[30%]">
                                        <InputGroup label="Parcelas" placeholder="1" isSelect />
                                    </View>
                                )}
                            </View>
                            
                            {/* Botões de Ação do Form */}
                            <View className="flex-row justify-end w-full gap-2 mt-4">
                                <TouchableOpacity className="py-2 px-4 rounded-lg border border-gray-300 bg-white active:bg-gray-50 shadow-sm">
                                    <Text className="text-sm font-semibold text-gray-700">Limpar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="py-2 px-4 rounded-lg font-semibold text-white bg-blue-600 active:bg-blue-700 shadow-lg">
                                    <Text className="text-sm font-semibold text-white">Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    
                    {/* TABELA DE MOVIMENTAÇÕES */}
                    <MockMovementsTable />

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};