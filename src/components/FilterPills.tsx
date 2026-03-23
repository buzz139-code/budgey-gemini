import React from 'react';

interface FilterPillsProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

const REGIONS = [
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

export default function FilterPills({ activeFilter, onFilterChange }: FilterPillsProps) {
  return (
    <div style={{ 
      position: 'absolute', 
      top: 16, 
      left: 16, 
      right: 16, 
      zIndex: 30, 
      display: 'flex', 
      gap: 8, 
      overflowX: 'auto', 
      paddingBottom: 8,
      scrollbarWidth: 'none'
    }}>
      <button
        onClick={() => onFilterChange(null)}
        style={{
          padding: '6px 16px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          border: '1px solid rgba(0,0,0,0.06)',
          background: activeFilter === null ? '#283618' : '#fff',
          color: activeFilter === null ? '#fff' : '#283618',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        All Destinations
      </button>
      {REGIONS.map((region) => (
        <button
          key={region}
          onClick={() => onFilterChange(region)}
          style={{
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            border: '1px solid rgba(0,0,0,0.06)',
            background: activeFilter === region ? '#283618' : '#fff',
            color: activeFilter === region ? '#fff' : '#283618',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {region}
        </button>
      ))}
    </div>
  );
}
