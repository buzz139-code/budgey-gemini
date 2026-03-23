import React from 'react';
import { CountryData } from '../types';
import { getMonthName } from '../utils/timing';

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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
      {months.map((month) => {
        const isCheapest = country.cheapestMonths?.includes(month);
        const isOffSeason = country.offSeasonMonths?.includes(month);
        const isPeak = country.peakSeasonMonths?.includes(month);
        const isSelected = selectedMonths.includes(month - 1); // months in tripParams are 0-indexed

        let bgColor = '#fff';
        let textColor = '#1a1a1a';
        let borderColor = 'rgba(0,0,0,0.05)';

        if (isSelected) {
          bgColor = '#606c38';
          textColor = '#fff';
          borderColor = '#606c38';
        }

        return (
          <button
            key={month}
            onClick={() => onMonthToggle(month - 1)}
            style={{
              position: 'relative',
              padding: '12px 4px',
              borderRadius: 12,
              border: `1px solid ${borderColor}`,
              background: bgColor,
              color: textColor,
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <span style={{ fontSize: 9, fontWeight: 800, uppercase: 'true', letterSpacing: '0.05em', opacity: isSelected ? 0.8 : 0.5 } as any}>
              {getMonthName(month - 1).substring(0, 3)}
            </span>
            
            <div style={{ display: 'flex', gap: 2 }}>
              {isCheapest && (
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? '#fff' : '#606c38' }} />
              )}
              {isPeak && (
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? '#fff' : '#bc6c25' }} />
              )}
            </div>

            {isCheapest && !isSelected && (
              <span style={{ 
                position: 'absolute', 
                top: -6, 
                right: -4, 
                background: '#fefae0', 
                color: '#bc6c25', 
                fontSize: 8, 
                fontWeight: 900, 
                padding: '2px 4px', 
                borderRadius: 4, 
                border: '1px solid #dda15e',
                boxShadow: '0 2px 4px rgba(188,108,37,0.1)'
              }}>
                SAVE
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
