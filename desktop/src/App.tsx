import { createHashRouter, RouterProvider } from 'react-router-dom';
import { RefreshProvider } from './contexts/RefreshContext';
import { ModalProvider } from './contexts/ModalContext'

import { AppNavigator } from './navigation/AppNavigatior';

import { DashboardScreen } from './screens/DashboardScreen';
import { StatementScreen } from './screens/StatementScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TransactionDetailScreen } from './screens/TransactionDetailScreen';
import { AddTransaction } from './screens/AddTransaction';
import { ManageCategoriesScreen } from './screens/ManageCategoriesScreen';
import { ManagePaymentMethodsScreen } from './screens/ManagePaymentMethodsScreen';
import { HelpScreen } from './screens/HelpScreen';
import { OnValeScreen } from './screens/OnValeScreen';

const router = createHashRouter([
  {
    path: '/',
    element: <AppNavigator />,
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
        path: 'statement/new',
        element: <AddTransaction />,
      },
      {
        path: 'statement/:id',
        element: <TransactionDetailScreen />,
      },
      {
        path: 'settings',
        element: <SettingsScreen />,
      },
      {
        path: 'settings/categories',
        element: <ManageCategoriesScreen />,
      },
      {
        path: 'settings/payment-methods',
        element: <ManagePaymentMethodsScreen />,
      },
      {
        path: 'settings/help',
        element: <HelpScreen />,
      },
      {
        path: 'onvale-contact',
        element: <OnValeScreen />,
      },
    ],
  },
]);

export function App() {
  return (
    <ModalProvider>
      <RefreshProvider>
        <RouterProvider router={router} />
      </RefreshProvider>
    </ModalProvider>
  );
}