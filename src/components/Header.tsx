import React from 'react';
import { Plane, Wallet, Calendar } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-black/5 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Plane className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Budgey</h1>
      </div>
      
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
          <Wallet className="w-4 h-4" />
          <span>Smart Budgeting</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
          <Calendar className="w-4 h-4" />
          <span>Timing Insights</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors">
          CAD $
        </button>
      </div>
    </header>
  );
};
