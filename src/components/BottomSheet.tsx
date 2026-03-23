import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Wallet, TrendingDown, Plus, Check } from 'lucide-react';
import { type CountryData, type TripParams, type ExchangeRates } from '../types';

interface BottomSheetProps {
  country: CountryData;
  tripParams: TripParams;
  onTripParamsChange: (params: TripParams) => void;
  onClose: () => void;
  getCostInBase: (usd: number) => number;
  formatCurrency: (amount: number, currency: string) => string;
  baseCurrency: string;
  exchangeRates: ExchangeRates | null;
  calculateTripCost: (country: CountryData, params: TripParams, getCostInBase: (usd: number) => number) => any;
  getTimingScore: (country: CountryData, months: number[]) => any;
  MONTHS: string[];
  onCompare: (country: CountryData) => void;
  isInCompare: boolean;
}

export default function BottomSheet({ 
  country, 
  tripParams, 
  onTripParamsChange,
  onClose,
  getCostInBase,
  formatCurrency,
  baseCurrency,
  exchangeRates,
  calculateTripCost,
  getTimingScore,
  MONTHS,
  onCompare,
  isInCompare
}: BottomSheetProps) {
  const estimate = calculateTripCost(country, tripParams, getCostInBase);
  const score = getTimingScore(country, tripParams.months);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(40,54,24,0.3)', backdropFilter: 'blur(4px)', zIndex: 60 }}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          background: '#fff', 
          borderTopLeftRadius: 32, 
          borderTopRightRadius: 32, 
          zIndex: 70, 
          maxHeight: '90vh', 
          overflowY: 'auto',
          boxShadow: '0 -10px 40px rgba(40,54,24,0.15)'
        }}
      >
        <div style={{ position: 'sticky', top: 0, background: '#fff', padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'between', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>{country.flag || '📍'}</span>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#283618', margin: 0 }}>{country.name}</h2>
              <span style={{ fontSize: 12, color: '#bc6c25', fontWeight: 600 }}>{country.region}</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button 
              onClick={() => onCompare(country)}
              style={{ 
                padding: '8px 16px', 
                borderRadius: 12, 
                background: isInCompare ? '#283618' : '#f5f0e8', 
                color: isInCompare ? '#fff' : '#283618',
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {isInCompare ? <Check size={14} /> : <Plus size={14} />}
              {isInCompare ? 'Added' : 'Compare'}
            </button>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: '#f5f0e8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={18} color="#283618" />
            </button>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <section>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#bc6c25', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Cost Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'between', padding: '12px 16px', background: '#fcfaf7', borderRadius: 16 }}>
                  <span style={{ fontSize: 14, color: '#606c38' }}>Flights (est.)</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#283618' }}>{formatCurrency(estimate.flights, baseCurrency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'between', padding: '12px 16px', background: '#fcfaf7', borderRadius: 16 }}>
                  <span style={{ fontSize: 14, color: '#606c38' }}>Daily Budget</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#283618' }}>{formatCurrency(estimate.daily, baseCurrency)}/day</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'between', padding: '16px', background: '#283618', borderRadius: 16, color: '#fff' }}>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>Total Estimate</span>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>{formatCurrency(estimate.total, baseCurrency)}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#bc6c25', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Timing Insights</h3>
              <div style={{ padding: 20, background: '#fefae0', borderRadius: 24, border: '1px solid rgba(188,108,37,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#bc6c25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingDown color="#fff" size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#283618' }}>{score.label}</div>
                    <div style={{ fontSize: 12, color: '#bc6c25', fontWeight: 600 }}>{score.discount}% cheaper than peak</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#606c38', lineHeight: 1.5, margin: 0 }}>
                  Traveling in {MONTHS[tripParams.months[0]]} is {score.isOffSeason ? 'ideal for budget travelers' : score.isShoulder ? 'a great balance of cost and weather' : 'peak season, expect higher prices'}.
                </p>
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
