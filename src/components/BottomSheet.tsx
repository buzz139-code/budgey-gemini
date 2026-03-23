import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, Plane, Heart, Shield, Cloud, Train, Info } from 'lucide-react';
import { type CountryData, type TripParams, type ExchangeRates, type TripEstimate } from '../types';
import { fetchRestCountryMeta } from '../services/currencyService';

interface BottomSheetProps {
  country: CountryData;
  tripParams: TripParams;
  onTripParamsChange: (params: TripParams) => void;
  onClose: () => void;
  getCostInBase: (usd: number) => number;
  formatCurrency: (amount: number, currency: string) => string;
  baseCurrency: string;
  exchangeRates: ExchangeRates | null;
  calculateTripCost: (country: CountryData, params: TripParams, getCostInBase: (usd: number) => number) => TripEstimate;
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
  calculateTripCost,
  getTimingScore,
  MONTHS,
  onCompare,
  isInCompare
}: BottomSheetProps) {
  const [meta, setMeta] = useState<{ flag: string; capital: string } | null>(null);
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  useEffect(() => {
    fetchRestCountryMeta(country.name).then(setMeta);
  }, [country.name]);

  const estimate = useMemo(() => calculateTripCost(country, tripParams, getCostInBase), [country, tripParams, getCostInBase]);
  const timing = useMemo(() => getTimingScore(country, tripParams.months), [country, tripParams.months]);

  const updateParams = (key: keyof TripParams, value: any) => {
    onTripParamsChange({ ...tripParams, [key]: value });
  };

  const openGoogleFlights = () => {
    const monthsStr = tripParams.months.map(m => MONTHS[m]).join('+');
    const url = `https://www.google.com/search?q=flights+to+${encodeURIComponent(country.name)}+in+${encodeURIComponent(monthsStr)}`;
    window.open(url, '_blank');
  };

  const calendarMonths = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <motion.div
      initial={isDesktop ? { x: '100%' } : { y: '100%' }}
      animate={isDesktop ? { x: 0 } : { y: 0 }}
      exit={isDesktop ? { x: '100%' } : { y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{
        position: 'fixed',
        right: isDesktop ? 0 : 0,
        bottom: isDesktop ? 0 : 0,
        width: isDesktop ? 420 : '100%',
        height: isDesktop ? '100%' : '85vh',
        background: '#fff',
        zIndex: 70,
        borderLeft: isDesktop ? '1px solid rgba(0,0,0,0.1)' : 'none',
        borderRadius: isDesktop ? 0 : '24px 24px 0 0',
        boxShadow: '-10px 0 30px rgba(40,54,24,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Mobile Drag Handle */}
      {!isDesktop && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
          <div style={{ width: 40, height: 4, background: 'rgba(0,0,0,0.1)', borderRadius: 2 }} />
        </div>
      )}

      {/* Close Button */}
      <button 
        onClick={onClose}
        style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
      >
        <X size={18} color="#283618" />
      </button>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 40px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 32 }}>{meta?.flag || country.flag || '📍'}</span>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#283618', margin: 0 }}>{country.name}</h2>
          </div>
          {meta?.capital && (
            <div style={{ fontSize: 14, color: 'rgba(40,54,24,0.6)', fontWeight: 500 }}>Capital: {meta.capital}</div>
          )}
        </div>

        {/* Timing Hero */}
        <div style={{ background: '#283618', padding: 20, borderRadius: 20, color: '#fff', marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#dda15e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            {timing.label}
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
            {formatCurrency(estimate.total, baseCurrency)}
            <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.7, marginLeft: 8 }}>total est.</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', marginBottom: 2 }}>Per person</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{formatCurrency(estimate.perPerson, baseCurrency)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', marginBottom: 2 }}>Daily ex-flights</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{formatCurrency(estimate.perDayExFlights, baseCurrency)}</div>
            </div>
          </div>
        </div>

        {/* Savings Calendar */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#283618', marginBottom: 12 }}>Savings Calendar</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
            {calendarMonths.map(m => {
              const isCheapest = country.cheapestMonths?.includes(m);
              const isOff = country.offSeasonMonths?.includes(m);
              const isPeak = country.peakSeasonMonths?.includes(m);
              const isSelected = tripParams.months.includes(m - 1);
              
              let bg = '#fff';
              let color = '#283618';
              if (isCheapest) { bg = '#3B6D11'; color = '#fff'; }
              else if (isOff) { bg = '#606c38'; color = '#fff'; }
              else if (isPeak) { bg = '#dda15e'; color = '#fff'; }

              return (
                <div 
                  key={m} 
                  style={{ 
                    aspectRatio: '1', 
                    background: bg, 
                    color: color, 
                    borderRadius: 8, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 10, 
                    fontWeight: 700,
                    border: isSelected ? '2px solid #bc6c25' : '1px solid rgba(0,0,0,0.05)',
                    boxShadow: isSelected ? '0 0 0 2px #fff inset' : 'none'
                  }}
                >
                  {MONTHS[m-1].substring(0, 3)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stat Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }}>
          <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={18} color="#606c38" />
            <div>
              <div style={{ fontSize: 10, color: 'rgba(40,54,24,0.5)', fontWeight: 600 }}>Safety</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#283618' }}>{country.safetyScore}/100</div>
            </div>
          </div>
          <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cloud size={18} color="#bc6c25" />
            <div>
              <div style={{ fontSize: 10, color: 'rgba(40,54,24,0.5)', fontWeight: 600 }}>Weather</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#283618' }}>{country.weatherScore}%</div>
            </div>
          </div>
          <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Train size={18} color="#dda15e" />
            <div>
              <div style={{ fontSize: 10, color: 'rgba(40,54,24,0.5)', fontWeight: 600 }}>Transit</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#283618' }}>{country.transitScore >= 80 ? 'Excellent' : country.transitScore >= 60 ? 'Good' : 'Fair'}</div>
            </div>
          </div>
          <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Info size={18} color="#283618" />
            <div>
              <div style={{ fontSize: 10, color: 'rgba(40,54,24,0.5)', fontWeight: 600 }}>Visa</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#283618' }}>{country.visaRequirement}</div>
            </div>
          </div>
        </div>

        {/* Travel Advisory */}
        {country.travelAdvisory && country.travelAdvisory !== 'Normal security precautions' && (
          <div style={{ padding: 16, borderRadius: 16, background: '#fefae0', border: '1px solid #dda15e', marginBottom: 32, display: 'flex', gap: 12 }}>
            <Info size={20} color="#bc6c25" />
            <div style={{ fontSize: 13, color: '#283618', fontWeight: 500 }}>{country.travelAdvisory}</div>
          </div>
        )}

        {/* Trip Estimator */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#283618', marginBottom: 16 }}>Trip Estimator</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Nights Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#283618' }}>Nights</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={() => updateParams('nights', Math.max(1, tripParams.nights - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={16} /></button>
                <span style={{ fontSize: 16, fontWeight: 700, width: 24, textAlign: 'center' }}>{tripParams.nights}</span>
                <button onClick={() => updateParams('nights', tripParams.nights + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={16} /></button>
              </div>
            </div>
            {/* Travellers Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#283618' }}>Travellers</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={() => updateParams('travellers', Math.max(1, tripParams.travellers - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={16} /></button>
                <span style={{ fontSize: 16, fontWeight: 700, width: 24, textAlign: 'center' }}>{tripParams.travellers}</span>
                <button onClick={() => updateParams('travellers', tripParams.travellers + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={16} /></button>
              </div>
            </div>
            {/* Travel Style Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#283618' }}>Style</span>
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', padding: 4, borderRadius: 10 }}>
                {(['budget', 'standard', 'luxury'] as const).map(s => (
                  <button 
                    key={s}
                    onClick={() => updateParams('travelStyle', s)}
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: 8, 
                      border: 'none', 
                      background: tripParams.travelStyle === s ? '#fff' : 'transparent',
                      color: '#283618',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: tripParams.travelStyle === s ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Breakdown */}
            <div style={{ marginTop: 12, padding: 16, background: 'rgba(0,0,0,0.02)', borderRadius: 16 }}>
              {[
                { label: 'Accommodation', value: estimate.accommodation },
                { label: 'Food & Dining', value: estimate.food },
                { label: 'Local Transport', value: estimate.transport },
                { label: 'Activities', value: estimate.activities },
                { label: 'Est. Flights', value: estimate.flights },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'rgba(40,54,24,0.6)' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: '#283618' }}>{formatCurrency(item.value, baseCurrency)}</span>
                </div>
              ))}
              <div style={{ fontSize: 10, color: 'rgba(40,54,24,0.4)', marginTop: 12, fontStyle: 'italic' }}>
                * Flight estimates are based on average regional costs. Actual prices vary by departure city and booking time.
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Cities */}
        {country.recommendedCities && country.recommendedCities.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#283618', marginBottom: 12 }}>Recommended Cities</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {country.recommendedCities.map(city => (
                <div key={city} style={{ padding: '6px 14px', borderRadius: 100, background: 'rgba(40,54,24,0.05)', color: '#283618', fontSize: 12, fontWeight: 600 }}>
                  {city}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={openGoogleFlights}
            style={{ flex: 2, height: 52, borderRadius: 16, background: '#283618', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}
          >
            <Plane size={20} />
            Find flights
          </button>
          <button 
            onClick={() => onCompare(country)}
            style={{ flex: 1, height: 52, borderRadius: 16, background: isInCompare ? '#fefae0' : '#fff', color: '#283618', border: '2px solid #283618', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
          >
            <Heart size={20} fill={isInCompare ? '#bc6c25' : 'none'} color={isInCompare ? '#bc6c25' : '#283618'} />
            {isInCompare ? 'Added' : 'Compare'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
