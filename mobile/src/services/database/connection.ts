import * as SQLite from 'expo-sqlite';

function openDb() {
  console.log("Abrindo conexão com o banco de dados (API Async)...");
  return SQLite.openDatabaseAsync('meuapp.db');
}

export const dbPromise = openDb();