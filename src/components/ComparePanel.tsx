import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Shield, Cloud, Train, Info, MapPin, Plus } from 'lucide-react';
import { type CountryData, type TripParams, type TripEstimate } from '../types';

interface ComparePanelProps {
  isOpen: boolean;
  onClose: () => void;
  compareList: CountryData[];
  onRemove: (country: CountryData) => void;
  tripParams: TripParams;
  calculateTripCost: (country: CountryData, params: TripParams, getCostInBase: (usd: number) => number) => TripEstimate;
  getCostInBase: (usd: number) => number;
  formatCurrency: (amount: number, currency: string) => string;
  baseCurrency: string;
  getTimingScore: (country: CountryData, months: number[]) => any;
}

export default function ComparePanel({
  isOpen,
  onClose,
  compareList,
  onRemove,
  tripParams,
  calculateTripCost,
  getCostInBase,
  formatCurrency,
  baseCurrency,
  getTimingScore
}: ComparePanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#fff',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#283618', margin: 0 }}>Compare Destinations</h2>
              <p style={{ fontSize: 13, color: 'rgba(40,54,24,0.5)', margin: '4px 0 0' }}>{compareList.length} destinations selected</p>
            </div>
            <button 
              onClick={onClose}
              style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={24} color="#283618" />
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowX: 'auto', padding: '40px 24px' }}>
            {compareList.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(40,54,24,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <MapPin size={40} color="rgba(40,54,24,0.2)" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#283618', marginBottom: 8 }}>No destinations to compare</h3>
                <p style={{ fontSize: 14, color: 'rgba(40,54,24,0.5)', maxWidth: 300 }}>Add destinations from the map to see them side-by-side.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 24, minWidth: 'max-content' }}>
                {compareList.map(country => {
                  const estimate = calculateTripCost(country, tripParams, getCostInBase);
                  const timing = getTimingScore(country, tripParams.months);
                  const isGood = timing.isOffSeason || (timing.isShoulder && timing.discount > 10);

                  return (
                    <div key={country.name} style={{ width: 320, background: '#fff', borderRadius: 24, border: '1px solid rgba(0,0,0,0.08)', padding: 24, position: 'relative', boxShadow: '0 10px 30px rgba(40,54,24,0.05)' }}>
                      <button 
                        onClick={() => onRemove(country)}
                        style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <X size={16} color="#283618" />
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <span style={{ fontSize: 32 }}>{country.flag}</span>
                        <div>
                          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#283618', margin: 0 }}>{country.name}</h3>
                          <div style={{ fontSize: 11, color: 'rgba(40,54,24,0.5)', fontWeight: 700, textTransform: 'uppercase' }}>{country.region}</div>
                        </div>
                      </div>

                      {/* Timing Badge */}
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 6, 
                        padding: '6px 12px', 
                        borderRadius: 100, 
                        background: isGood ? '#f0f9f0' : '#fff7ed', 
                        border: `1px solid ${isGood ? '#a8d5a2' : '#f0c898'}`,
                        marginBottom: 24
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: isGood ? '#3B6D11' : '#bc6c25' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: isGood ? '#3B6D11' : '#bc6c25' }}>{timing.label}</span>
                      </div>

                      {/* Costs */}
                      <div style={{ marginBottom: 32 }}>
                        <div style={{ fontSize: 11, color: 'rgba(40,54,24,0.4)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Total Estimate</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#283618', letterSpacing: '-0.02em' }}>{formatCurrency(estimate.total, baseCurrency)}</div>
                        <div style={{ fontSize: 13, color: 'rgba(40,54,24,0.6)', marginTop: 4 }}>{formatCurrency(estimate.perPerson, baseCurrency)} per person</div>
                      </div>

                      {/* Stats Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
                        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.02)' }}>
                          <div style={{ fontSize: 10, color: 'rgba(40,54,24,0.5)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Safety</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#283618' }}>{country.safetyScore}/100</div>
                        </div>
                        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.02)' }}>
                          <div style={{ fontSize: 10, color: 'rgba(40,54,24,0.5)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Weather</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#283618' }}>{country.weatherScore}%</div>
                        </div>
                        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.02)' }}>
                          <div style={{ fontSize: 10, color: 'rgba(40,54,24,0.5)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Transit</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#283618' }}>{country.transitScore >= 80 ? 'Excellent' : 'Good'}</div>
                        </div>
                        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.02)' }}>
                          <div style={{ fontSize: 10, color: 'rgba(40,54,24,0.5)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Visa</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#283618' }}>{country.visaRequirement}</div>
                        </div>
                      </div>

                      {/* Per Day */}
                      <div style={{ padding: 16, borderRadius: 16, background: '#283618', color: '#fff' }}>
                        <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Daily Budget</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(estimate.perDayExFlights, baseCurrency)}</div>
                        <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>Excluding flights</div>
                      </div>
                    </div>
                  );
                })}

                {compareList.length < 3 && (
                  <div style={{ width: 320, borderRadius: 24, border: '2px dashed rgba(40,54,24,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(40,54,24,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Plus size={24} color="rgba(40,54,24,0.3)" />
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(40,54,24,0.4)', fontWeight: 600 }}>Add another destination to compare</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
