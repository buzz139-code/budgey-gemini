import React from 'react';
import { motion } from 'motion/react';
import { Map, List, TrendingDown, Info, Calendar, Users, Wallet, ChevronRight } from 'lucide-react';
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
  getTimingScore
}: ContextRailProps) {
  if (!isOpen && isDesktop) return null;

  return (
    <aside style={{ 
      width: isDesktop ? 320 : '100%', 
      height: '100%', 
      background: '#fff', 
      borderRight: '1px solid rgba(0,0,0,0.06)', 
      display: 'flex', 
      flexDirection: 'column',
      position: isDesktop ? 'relative' : 'absolute',
      left: 0,
      top: 0,
      zIndex: 50,
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease'
    }}>
      <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
        <section style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#bc6c25', marginBottom: 16 }}>Trip Parameters</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#f5f0e8', padding: 12, borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Calendar size={14} color="#bc6c25" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#283618' }}>Timing</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
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
                        padding: '6px 4px',
                        borderRadius: 8,
                        border: 'none',
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
            </div>

            <div style={{ background: '#f5f0e8', padding: 12, borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Wallet size={14} color="#bc6c25" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#283618' }}>Budget ({baseCurrency})</span>
              </div>
              <input 
                type="number" 
                value={tripParams.totalBudgetCAD} 
                onChange={e => onTripParamsChange({ ...tripParams, totalBudgetCAD: parseInt(e.target.value) || 0 })}
                style={{ width: '100%', background: 'none', border: 'none', fontSize: 13, color: '#283618', fontWeight: 500, outline: 'none' }}
              />
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#bc6c25', marginBottom: 16 }}>Best Value Destinations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bestTimingCountries.map(country => {
              const score = getTimingScore(country, tripParams.months);
              return (
                <button 
                  key={country.id}
                  onClick={() => onCountrySelect(country)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    padding: 12, 
                    background: '#fff', 
                    border: '1px solid rgba(0,0,0,0.06)', 
                    borderRadius: 12, 
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {country.flag || '📍'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#283618' }}>{country.name}</div>
                    <div style={{ fontSize: 11, color: '#bc6c25', fontWeight: 500 }}>{score.label} • {score.discount}% off</div>
                  </div>
                  <ChevronRight size={14} color="#ccc" />
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div style={{ padding: 16, borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fcfaf7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#bc6c25' }}>
          <Info size={16} />
          <span style={{ fontSize: 11, fontWeight: 500 }}>Prices are estimates based on 2 travellers for {tripParams.nights} nights.</span>
        </div>
      </div>
    </aside>
  );
}
