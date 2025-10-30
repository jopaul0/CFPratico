// src/screens/AdminScreen.tsx
import React, { useState, useEffect } from 'react';
// --- (INÍCIO DA CORREÇÃO) ---
import { View, Text, Button, FlatList, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // <-- Importado do lugar certo
// --- (FIM DA CORREÇÃO) ---

import * as DB from '../services/database';
import { TransactionWithNames } from '../types/Database';

export default function AdminScreen() {
  const [log, setLog] = useState('Tela de Admin pronta.');
  const [transactions, setTransactions] = useState<TransactionWithNames[]>([]);

  useEffect(() => {
    handleInitDatabase();
  }, []);
  
  
  const handleInitDatabase = async () => {
    try {
      await DB.initDatabase();
      setLog("Banco de dados inicializado com seu novo esquema.");
    } catch (error: any) {
      setLog(`Erro ao inicializar o banco: ${error.message}`);
    }
  };
  
  const handleSeedData = async () => {
    try {
      await DB.seedInitialData();
      setLog("Dados iniciais (Categorias e Métodos) inseridos.");
      
      const cats = await DB.fetchCategories();
      const pays = await DB.fetchPaymentMethods();
      Alert.alert("Dados Inseridos", 
        `Categorias: ${cats.map(c => c.name).join(', ')}\n\n` +
        `Métodos: ${pays.map(p => p.name).join(', ')}`
      );
    } catch (error: any) {
      setLog(`Erro ao popular dados: ${error.message}`);
    }
  };

  const handleAddTestTransaction = async () => {
    try {
      // IDs 1 e 1 (Salário, Pix)
      const testRevenue: DB.NewTransactionData = {
        description: 'Salário da Empresa',
        value: 7500.0,
        type: 'revenue',
        condition: 'paid',
        installments: 1,
        paymentMethodId: 1, // 'Pix'
        categoryId: 1,      // 'Salário'
        date: new Date().toISOString()
      };
      const id = await DB.addTransaction(testRevenue);
      setLog(`Receita de teste adicionada com ID: ${id}`);
      handleFetchTransactions();
    } catch (error: any) {
      setLog(`Erro ao adicionar receita: ${error.message}`);
    }
  };
  
  const handleAddTestExpense = async () => {
    try {
      // IDs 2 e 2 (Alimentação, Crédito)
      const testExpense: DB.NewTransactionData = {
        description: 'Jantar no restaurante',
        value: -180.50, // Note: Salve o valor como positivo e trate no app, ou negativo
        type: 'expense',
        condition: 'paid',
        installments: 1,
        paymentMethodId: 2, // 'Crédito'
        categoryId: 2,      // 'Alimentação'
        date: new Date().toISOString()
      };
      const id = await DB.addTransaction(testExpense);
      setLog(`Despesa de teste adicionada com ID: ${id}`);
      handleFetchTransactions();
    } catch (error: any) {
      setLog(`Erro ao adicionar despesa: ${error.message}`);
    }
  };

  const handleFetchTransactions = async () => {
    try {
      const data = await DB.fetchTransactions();
      setTransactions(data);
      setLog(`Total de ${data.length} transações carregadas (com JOIN).`);
    } catch (error: any) {
      setLog(`Erro ao buscar transações: ${error.message}`);
    }
  };

  const handleClearDatabase = async () => {
    try {
      await DB.clearAllTransactions();
      setLog("Todas as transações foram limpas.");
      handleFetchTransactions();
    } catch (error: any) {
      setLog(`Erro ao limpar transações: ${error.message}`);
    }
  };

  // --- RENDERIZAÇÃO ---
  
  // Adiciona o tipo do item
  const renderItem = ({ item }: { item: TransactionWithNames }) => (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemText}>{item.description}</Text>
        <Text style={styles.itemSubText}>
          {/* Usa os nomes do JOIN */}
          {item.category_name || 'Sem Categoria'} | {item.payment_method_name || 'Sem Método'}
        </Text>
      </View>
      <Text style={item.type === 'revenue' ? styles.revenue : styles.expense}>
        R$ {item.value.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={styles.header}>Painel de Teste - SQLite (TS)</Text>
        
        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>Log:</Text>
          <Text style={styles.logText}>{log}</Text>
        </View>

        <View style={styles.buttonGroup}>
          <Button title="1. Inicializar/Criar Tabelas" onPress={handleInitDatabase} />
          <Button title="2. Popular Dados Iniciais" onPress={handleSeedData} color="#17a2b8" />
          <Button title="3. Adicionar Receita Teste" onPress={handleAddTestTransaction} color="#28a745" />
          <Button title="4. Adicionar Despesa Teste" onPress={handleAddTestExpense} color="#dc3545" />
          <Button title="5. Ver Todas Transações (JOIN)" onPress={handleFetchTransactions} color="#007bff" />
          <Button title="X. Limpar Transações" onPress={handleClearDatabase} color="#ffc107" />
        </View>

        <Text style={styles.listHeader}>Transações no Banco:</Text>
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          scrollEnabled={false} // Desativa scroll da FlatList dentro da ScrollView
          ListEmptyComponent={<Text style={{textAlign: 'center', padding: 10}}>Nenhuma transação encontrada.</Text>}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS (os mesmos de antes) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f4f4' },
  container: { flex: 1, padding: 15 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  logContainer: { backgroundColor: '#fff', padding: 10, borderRadius: 5, marginBottom: 20, borderColor: '#ddd', borderWidth: 1, minHeight: 60 },
  logTitle: { fontWeight: 'bold', fontSize: 16 },
  logText: { fontSize: 14, color: '#333', marginTop: 5 },
  buttonGroup: { gap: 10, marginBottom: 20 },
  listHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10 },
  list: { flexGrow: 0 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', borderRadius: 5, marginBottom: 5 },
  itemLeft: { flex: 1, marginRight: 10 },
  itemText: { fontSize: 16, fontWeight: 'bold' },
  itemSubText: { fontSize: 12, color: '#666' },
  revenue: { fontSize: 16, color: 'green', fontWeight: 'bold' },
  expense: { fontSize: 16, color: 'red', fontWeight: 'bold' },
});