import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CustomDrawer } from '../components/CustomDrawer'; // O menu lateral
import { Menu } from 'lucide-react'; // Importar o ícone do menu

/**
 * Este é o Layout principal do site.
 * Ele renderiza o menu lateral (CustomDrawer) e, ao lado,
 * o componente da rota ativa (através do <Outlet />).
 */
export const AppNavigator: React.FC = () => {
  // 1. Estado para controlar o drawer no mobile
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 1. O Menu Lateral (Drawer) */}
      <CustomDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />

      {/* 2. Backdrop (overlay) para fechar o drawer no mobile */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeDrawer}
          aria-label="Fechar menu"
        />
      )}

      {/* 3. A Área de Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto">
        {/* 4. Botão de Menu Hamburguer (só aparece no mobile) */}
        <header className="sticky top-0 z-20 flex items-center justify-between bg-white p-4 shadow-sm md:hidden">
          {/* Você pode colocar o nome da empresa aqui se quiser */}
          <span className="text-xl font-bold text-gray-800">CF Prático</span>
          <button
            onClick={toggleDrawer}
            className="p-1 text-gray-700"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* O React Router renderiza a tela da rota atual (ex: DashboardScreen) aqui */}
        <Outlet />
      </main>
    </div>
  );
};