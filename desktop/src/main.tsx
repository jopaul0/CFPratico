import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { initDatabase } from './services/database';


import './global.css'; 

initDatabase();


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);