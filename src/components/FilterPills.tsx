import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FilterPillsProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

const REGIONS = [
  'All Regions',
  'Western Europe',
  'Eastern Europe',
  'South/Southeast Asia',
  'East Asia',
  'South America',
  'Central America',
  'North America / Caribbean',
  'Africa',
  'Middle East',
  'Oceania'
];

export const FilterPills: React.FC<FilterPillsProps> = ({ selectedRegion, onRegionChange }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
      {REGIONS.map((region) => (
        <button
          key={region}
          onClick={() => onRegionChange(region)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border",
            selectedRegion === region
              ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
              : "bg-white text-zinc-600 border-black/5 hover:border-zinc-300"
          )}
        >
          {region}
        </button>
      ))}
    </div>
  );
};
