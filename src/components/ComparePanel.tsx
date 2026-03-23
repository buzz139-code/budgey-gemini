import React from 'react';
import { CountryData } from '../types';
import { X, ArrowRight } from 'lucide-react';

interface ComparePanelProps {
  countries: CountryData[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const ComparePanel: React.FC<ComparePanelProps> = ({ countries, onRemove, onClear }) => {
  if (countries.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl">
      <div className="bg-zinc-900 text-white rounded-3xl shadow-2xl p-4 flex items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          {countries.map((country) => (
            <div 
              key={country.id}
              className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-2xl border border-white/5 whitespace-nowrap"
            >
              <span className="text-sm font-bold">{country.name}</span>
              <button 
                onClick={() => onRemove(country.id)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {countries.length < 3 && (
            <div className="px-4 py-2 border border-dashed border-white/20 rounded-2xl text-xs font-bold text-zinc-500 whitespace-nowrap">
              Add up to 3
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <button 
            onClick={onClear}
            className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            Clear
          </button>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
            Compare
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
