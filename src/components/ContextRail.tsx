import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, Wallet, ChevronRight, Moon } from 'lucide-react';
import { type CountryData, type TripParams } from '../types';

interface ContextRailProps {
  isOpen: boolean;
  isDesktop: boolean;
  tripParams: TripParams;
  onTripParamsChange: (params: TripParams) => void;
  bestTimingCountries: CountryData[];
  onCountrySelect: (country: CountryData) => void;
  getCostInBase: (usd: number) => number;
  formatCurrency: (amount: number, currency: string) => string;
  baseCurrency: string;
  MONTHS: string[];
  getTimingScore: (country: CountryData, months: number[]) => any;
  matchCount: number;
  calculateTripCost: (country: CountryData, params: TripParams, getCostInBase: (usd: number) => number) => any;
}

export default function ContextRail({ 
  isOpen, 
  isDesktop, 
  tripParams, 
  onTripParamsChange,
  bestTimingCountries,
  onCountrySelect,
  getCostInBase,
  formatCurrency,
  baseCurrency,
  MONTHS,
  getTimingScore,
  matchCount,
  calculateTripCost
}: ContextRailProps) {
  const sidebarWidth = isDesktop ? 220 : 280;

  return (
    <aside style={{ 
      width: isOpen ? sidebarWidth : 0, 
      opacity: isOpen ? 1 : 0,
      height: '100%', 
      background: '#fff', 
      borderRight: '1px solid rgba(0,0,0,0.06)', 
      display: 'flex', 
      flexDirection: 'column',
      position: isDesktop ? 'relative' : 'absolute',
      left: 0,
      top: 0,
      zIndex: 50,
      transition: 'width 0.3s ease, opacity 0.3s ease',
      overflow: 'hidden'
    }}>
      <div style={{ padding: 16, flex: 1, overflowY: 'auto', minWidth: sidebarWidth }}>
        {/* Active Trip Card */}
        <section style={{ marginBottom: 24 }}>
          <div style={{ 
            background: '#283618', 
            borderRadius: 16, 
            padding: 16, 
            color: '#fff',
            boxShadow: '0 4px 12px rgba(40,54,24,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6 }}>Active Trip</h3>
              <div style={{ 
                background: '#bc6c25', 
                color: '#fff', 
                fontSize: 10, 
                fontWeight: 700, 
                padding: '2px 8px', 
                borderRadius: 100 
              }}>
                {matchCount} Matches
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 9, textTransform: 'uppercase', opacity: 0.5, marginBottom: 4 }}>Nights</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Moon size={12} opacity={0.6} />
                  <input 
                    type="number" 
                    value={tripParams.nights} 
                    onChange={e => onTripParamsChange({ ...tripParams, nights: Math.max(1, parseInt(e.target.value) || 1) })}
                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, width: '100%', outline: 'none' }}
                  />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, textTransform: 'uppercase', opacity: 0.5, marginBottom: 4 }}>Travellers</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={12} opacity={0.6} />
                  <input 
                    type="number" 
                    value={tripParams.travellers} 
                    onChange={e => onTripParamsChange({ ...tripParams, travellers: Math.max(1, parseInt(e.target.value) || 1) })}
                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, width: '100%', outline: 'none' }}
                  />
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', opacity: 0.5, marginBottom: 4 }}>Budget ({baseCurrency})</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Wallet size={12} opacity={0.6} />
                  <input 
                    type="number" 
                    value={tripParams.totalBudgetCAD} 
                    onChange={e => onTripParamsChange({ ...tripParams, totalBudgetCAD: Math.max(0, parseInt(e.target.value) || 0) })}
                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, width: '100%', outline: 'none' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Month Picker */}
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#283618', marginBottom: 12 }}>When are you going?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {MONTHS.map((m, i) => {
              const isSelected = tripParams.months.includes(i);
              return (
                <button
                  key={m}
                  onClick={() => {
                    let newMonths;
                    if (isSelected) {
                      if (tripParams.months.length > 1) {
                        newMonths = tripParams.months.filter(month => month !== i);
                      } else {
                        return;
                      }
                    } else {
                      newMonths = [...tripParams.months, i].sort((a, b) => a - b);
                    }
                    onTripParamsChange({ ...tripParams, months: newMonths });
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 8,
                    border: '1px solid rgba(0,0,0,0.06)',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: isSelected ? '#bc6c25' : '#fff',
                    color: isSelected ? '#fff' : '#283618',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase',
                    outline: 'none'
                  }}
                >
                  {m.substring(0, 3)}
                </button>
              );
            })}
          </div>
        </section>

        {/* Best Timing Picks */}
        <section>
          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#283618', marginBottom: 12 }}>Best Timing Now</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bestTimingCountries.map(country => {
              const score = getTimingScore(country, tripParams.months);
              const estimate = calculateTripCost(country, tripParams, getCostInBase);
              return (
                <button 
                  key={country.id}
                  onClick={() => onCountrySelect(country)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 4, 
                    padding: 12, 
                    background: '#fff', 
                    border: '1px solid rgba(0,0,0,0.06)', 
                    borderRadius: 12, 
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#283618' }}>{country.name}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#606c38' }}>{score.discount}% OFF</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, color: 'rgba(40,54,24,0.4)', fontWeight: 500 }}>{score.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#bc6c25' }}>{formatCurrency(estimate.total, baseCurrency)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
}
