import React from 'react';
import { Outlet } from 'react-router-dom';
import { CustomDrawer } from '../components/CustomDrawer'; // O menu lateral

/**
 * Este é o Layout principal do site.
 * Ele renderiza o menu lateral (CustomDrawer) e, ao lado,
 * o componente da rota ativa (através do <Outlet />).
 */
export const AppNavigator: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 1. O Menu Lateral (Drawer) */}
      <CustomDrawer />

      {/* 2. A Área de Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto">
        {/* O React Router renderiza a tela da rota atual (ex: DashboardScreen) aqui */}
        <Outlet />
      </main>
    </div>
  );
};