import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import './index.css';

import { AppLayout } from './components/AppLayout';


import { DashboardScreen } from './screens/DashboardScreen';
import { StatementScreen } from './screens/StatementScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TransactionDetailScreen } from './screens/TransactionDetailScreen';
import { AddTransaction } from './screens/AddTransaction';
import { ManageCategoriesScreen } from './screens/ManageCategoriesScreen';
import { ManagePaymentMethodsScreen } from './screens/ManagePaymentMethodsScreen';
import AdminScreen from './screens/AdminScreen';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardScreen />,
      },
      {
        path: 'statement',
        element: <StatementScreen />,
      },
      {
        path: 'settings',
        element: <SettingsScreen />,
      },
      {
        path: 'test',
        element: <AdminScreen />,
      },
      
      {
        path: 'transaction/add',
        element: <AddTransaction />,
      },
      {
        path: 'transaction/:id', 
        element: <TransactionDetailScreen />,
      },
      {
        path: 'settings/categories',
        element: <ManageCategoriesScreen />,
      },
      {
        path: 'settings/payment-methods',
        element: <ManagePaymentMethodsScreen />,
      },
    ],
  },
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);