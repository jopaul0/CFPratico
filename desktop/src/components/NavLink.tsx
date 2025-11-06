import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const NavLink: React.FC<{ title: string; description: string; to: string; icon: React.ReactNode; }> =
  ({ title, description, to, icon }) => (
    <Link
      to={to}
      className="flex items-center p-4 bg-white rounded-lg mb-3 shadow transition-colors hover:bg-gray-50"
    >
      <div className="mr-4 p-2 bg-gray-100 rounded-full">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </Link>
  );