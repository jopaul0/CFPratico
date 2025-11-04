import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'
import { StatementScreen } from './screens/StatementScreen'
import { TransactionDetailScreen } from './screens/TransactionDetailScreen'
import { AddTransaction } from './screens/AddTransaction'
import SettingsScreen from './screens/SettingsScreen'
import AdminScreen from './screens/AdminScreen'
import PrototypeScreen from './screens/PrototypeScreen'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <StatementScreen /> },
      { path: 'transaction/:id', element: <TransactionDetailScreen /> },
      { path: 'add', element: <AddTransaction /> },
      { path: 'settings', element: <SettingsScreen /> },
      { path: 'admin', element: <AdminScreen /> },
      { path: 'prototype', element: <PrototypeScreen /> },
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
)