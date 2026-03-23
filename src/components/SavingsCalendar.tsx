import React from 'react';
import { CountryData } from '../types';
import { getMonthName } from '../utils/timing';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SavingsCalendarProps {
  country: CountryData;
  selectedMonths: number[];
  onMonthToggle: (month: number) => void;
}

export const SavingsCalendar: React.FC<SavingsCalendarProps> = ({ 
  country, 
  selectedMonths, 
  onMonthToggle 
}) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {months.map((month) => {
        const isCheapest = country.cheapestMonths?.includes(month);
        const isOffSeason = country.offSeasonMonths?.includes(month);
        const isPeak = country.peakSeasonMonths?.includes(month);
        const isSelected = selectedMonths.includes(month);

        return (
          <button
            key={month}
            onClick={() => onMonthToggle(month)}
            className={cn(
              "relative group p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-1",
              isSelected 
                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                : "bg-white border-black/5 hover:border-zinc-300 text-zinc-900"
            )}
          >
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">
              {getMonthName(month)}
            </span>
            
            <div className="flex gap-1 mt-1">
              {isCheapest && (
                <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white" : "bg-emerald-500")} />
              )}
              {isPeak && (
                <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white" : "bg-rose-400")} />
              )}
            </div>

            {isCheapest && !isSelected && (
              <span className="absolute -top-2 -right-2 bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-emerald-200">
                SAVE
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
