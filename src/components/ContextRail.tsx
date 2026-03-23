import React from 'react';
import { motion } from 'motion/react';
import { Map, List, TrendingDown, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ContextRailProps {
  activeTab: 'map' | 'list' | 'trends';
  onTabChange: (tab: 'map' | 'list' | 'trends') => void;
}

export const ContextRail: React.FC<ContextRailProps> = ({ activeTab, onTabChange }) => {
  const items = [
    { id: 'map', icon: Map, label: 'Explore' },
    { id: 'list', icon: List, label: 'Directory' },
    { id: 'trends', icon: TrendingDown, label: 'Savings' },
  ] as const;

  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={cn(
            "group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
            activeTab === item.id 
              ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20" 
              : "bg-white text-zinc-400 hover:text-zinc-600 border border-black/5"
          )}
        >
          <item.icon className="w-5 h-5" />
          <span className="absolute left-16 bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            {item.label}
          </span>
          {activeTab === item.id && (
            <motion.div
              layoutId="rail-active"
              className="absolute -left-2 w-1 h-6 bg-emerald-500 rounded-full"
            />
          )}
        </button>
      ))}
      
      <div className="mt-8 pt-8 border-t border-black/5">
        <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors">
          <Info className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};
