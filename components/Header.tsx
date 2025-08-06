import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';

interface HeaderProps {
  title: React.ReactNode;
  showBackButton?: boolean;
  backTo?: string;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = false, backTo = '-1', actions }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white text-slate-800 shadow-sm sticky top-0 z-20 border-b border-slate-200 h-16">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              onClick={() => backTo === '-1' ? navigate(-1) : navigate(backTo)}
              className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50"
              aria-label="Volver"
            >
              {React.cloneElement(ICONS.back, { className: 'h-6 w-6' })}
            </button>
          )}
          <h1 className="text-xl font-bold truncate">{title}</h1>
        </div>
        <div className="flex items-center">
          {actions}
        </div>
      </div>
      
    </header>
  );
};

export default Header;