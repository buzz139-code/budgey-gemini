import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, Plane, Heart, Shield, Cloud, Train, Info } from 'lucide-react';
import { type CountryData, type TripParams, type TripEstimate } from '../types';
import { fetchRestCountryMeta, fetchClimateData } from '../services/currencyService';
import { type CountryMeta, type ClimateData } from '../types';
import { SavingsCalendar } from './SavingsCalendar';

interface BottomSheetProps {
  country: CountryData;
  tripParams: TripParams;
  onTripParamsChange: (params: TripParams) => void;
  onClose: () => void;
  getCostInBase: (usd: number) => number;
  formatCurrency: (amount: number, currency: string) => string;
  baseCurrency: string;
  calculateTripCost: (country: CountryData, params: TripParams, getCostInBase: (usd: number) => number) => TripEstimate;
  getTimingScore: (country: CountryData, months: number[]) => any;
  MONTHS: string[];
  onCompare: (country: CountryData) => void;
  isInCompare: boolean;
  isDesktop: boolean;
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
  isInCompare,
  isDesktop
}: BottomSheetProps) {
  const [meta, setMeta] = useState<CountryMeta | null>(null);
  const [climate, setClimate] = useState<ClimateData[] | null>(null);

  useEffect(() => {
    fetchRestCountryMeta(country.name).then((meta) => {
      setMeta(meta);
      if (meta?.latlng && meta.latlng.length >= 2) {
        fetchClimateData(meta.latlng[0], meta.latlng[1], country.id).then(setClimate);
      }
    });
  }, [country.name, country.id]);

  const estimate = useMemo(() => calculateTripCost(country, tripParams, getCostInBase), [country, tripParams, getCostInBase]);
  const timing = useMemo(() => getTimingScore(country, tripParams.months), [country, tripParams.months]);

  const updateParams = (key: keyof TripParams, value: any) => {
    onTripParamsChange({ ...tripParams, [key]: value });
  };

  return (
    <motion.div
      initial={isDesktop ? { x: '100%' } : { y: '100%' }}
      animate={isDesktop ? { x: 0 } : { y: 0 }}
      exit={isDesktop ? { x: '100%' } : { y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{
        position: 'fixed',
        right: 0,
        bottom: 0,
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

      {/* Sticky Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {meta?.flagSvgUrl ? (
            <img src={meta.flagSvgUrl} alt={`${country.name} flag`}
              style={{ width: 40, height: 26, objectFit: 'cover', borderRadius: 4, border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
          ) : (
            <span style={{ fontSize: 32 }}>{meta?.flag || country.flag || '📍'}</span>
          )}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#283618', margin: 0 }}>{country.name}</h2>
            <div style={{ fontSize: 11, color: 'rgba(40,54,24,0.5)', fontWeight: 600 }}>
              {meta?.capital ? `${meta.capital} · ` : ''}{country.region}
              {meta?.population ? ` · Pop. ${(meta.population / 1_000_000).toFixed(1)}M` : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button 
            onClick={() => onCompare(country)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: isInCompare ? '#fefae0' : 'rgba(0,0,0,0.05)', border: isInCompare ? '1px solid #dda15e' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Heart size={18} fill={isInCompare ? '#bc6c25' : 'none'} color={isInCompare ? '#bc6c25' : '#283618'} />
          </button>
          <button 
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={20} color="#283618" />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 40px' }}>
        {/* Timing Hero Card */}
        {(() => {
          const score = getTimingScore(country, tripParams.months);
          const isGood = score.isOffSeason || (score.isShoulder && score.discount > 10);
          return (
            <div style={{ background: '#283618', borderRadius: 16, padding: '16px 20px', margin: '0 0 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: isGood ? '#a8d5a2' : 'rgba(240,200,152,0.4)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: isGood ? '#a8d5a2' : 'rgba(240,200,152,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isGood ? `Good timing · ${score.label}` : `Peak season · higher prices`}
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#f0c898', letterSpacing: '-0.02em', marginBottom: 4 }}>
                {formatCurrency(estimate.total, baseCurrency)}
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{formatCurrency(estimate.perPerson, baseCurrency)} per person</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{formatCurrency(estimate.perDayExFlights, baseCurrency)}/day excl. flights</span>
              </div>
            </div>
          );
        })()}

        {/* Savings Calendar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(40,54,24,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Savings Calendar</div>
          <SavingsCalendar
            country={country}
            selectedMonths={tripParams.months}
            onMonthToggle={(month) => {
              const newMonths = tripParams.months.includes(month)
                ? tripParams.months.length > 1
                  ? tripParams.months.filter(m => m !== month)
                  : tripParams.months
                : [...tripParams.months, month].sort((a, b) => a - b);
              onTripParamsChange({ ...tripParams, months: newMonths });
            }}
          />
        </div>

        {/* Stat Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }}>
          <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={18} color="#606c38" />
            <div>
              <div style={{ fontSize: 10, color: 'rgba(40,54,24,0.5)', fontWeight: 600 }}>Safety</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#283618' }}>
                {country.safetyScore >= 90 ? 'Excellent' : country.safetyScore >= 75 ? 'Good' : country.safetyScore >= 60 ? 'Fair' : 'Use caution'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(40,54,24,0.4)' }}>{country.safetyScore}/100</div>
            </div>
          </div>
          <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cloud size={18} color="#bc6c25" />
            <div>
              <div style={{ fontSize: 10, color: 'rgba(40,54,24,0.5)', fontWeight: 600 }}>
                {meta?.capital || 'Weather'} in {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][tripParams.months[0]]}
              </div>
              {(() => {
                const currentMonth = new Date().getMonth() + 1;
                const selectedMonth = tripParams.months[0] + 1;
                const monthClimate = climate?.find(c => c.month === selectedMonth) || climate?.find(c => c.month === currentMonth);
                if (monthClimate) {
                  return (
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#283618' }}>
                      {monthClimate.avgTempC}°C · {monthClimate.sunshineHours}h sun
                    </div>
                  );
                }
                return <div style={{ fontSize: 13, fontWeight: 700, color: '#283618' }}>{country.weatherScore}%</div>;
              })()}
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
        {(() => {
          const level = country.advisoryLevel || 1;
          const colours = {
            1: { bg: 'rgba(96,108,56,0.08)', border: 'rgba(96,108,56,0.2)', text: '#3B6D11', label: 'Safe to visit' },
            2: { bg: 'rgba(221,161,94,0.1)', border: 'rgba(221,161,94,0.3)', text: '#854F0B', label: 'Exercise caution' },
            3: { bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.2)', text: '#991b1b', label: 'Avoid non-essential travel' },
            4: { bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.3)', text: '#7f1d1d', label: 'Avoid all travel' },
          };
          const c = colours[level as keyof typeof colours] || colours[1];
          return (
            <div style={{ padding: 14, borderRadius: 12, background: c.bg, border: `1px solid ${c.border}`, marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: c.text, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                Canadian Advisory · {c.label}
              </div>
              <div style={{ fontSize: 12, color: '#283618', fontWeight: 500, lineHeight: 1.5 }}>
                {country.travelAdvisory || 'Take normal security precautions.'}
              </div>
            </div>
          );
        })()}

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

        {/* Find Flights Button */}
        <button
          onClick={() => {
            window.open(`https://www.google.com/travel/flights/search?q=flights+to+${encodeURIComponent(country.name)}`, '_blank');
          }}
          style={{ width: '100%', padding: '14px 0', background: '#bc6c25', color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 24 }}
        >
          Find flights to {country.name}
        </button>
      </div>
    </motion.div>
  );
}
