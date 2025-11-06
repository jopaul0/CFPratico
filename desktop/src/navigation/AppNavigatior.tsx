import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CustomDrawer } from '../components/CustomDrawer';
import { Menu } from 'lucide-react';
import { TitleBar } from '../components/TitleBar';

export const AppNavigator: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      
      <TitleBar />

      <div className="flex flex-1 pt-8 overflow-hidden"> 
        <CustomDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
        {isDrawerOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={closeDrawer}
            aria-label="Fechar menu"
          />
        )}

        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-20 flex items-center justify-between bg-white p-4 shadow-sm md:hidden">
            <span className="text-xl font-bold text-gray-800">CF Prático</span>
            <button
              onClick={toggleDrawer}
              className="p-1 text-gray-700"
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>
          </header>

          <Outlet />
        </main>

      </div>
    </div>
  );
};