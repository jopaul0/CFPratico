import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { initDatabase } from './services/database';

// Importe seu CSS global (Tailwind/NativeWind)
// Se você usar NativeWind para web, isso funcionará.
// Se usar TailwindCSS puro, será 'index.css' ou similar.
import './global.css'; 

// 1. Inicia o banco de dados (Dexie)
// Não precisamos "esperar" (await), o app pode carregar
// enquanto o Dexie abre em segundo plano.
initDatabase();

// 2. Renderiza o aplicativo
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);