import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { type CountryData, type TripParams, type ExchangeRates } from './types';
import { COUNTRIES_DATA } from './data/countries';
import { fetchExchangeRates, formatCurrency } from './services/currencyService';
import { getTimingScore, MONTHS } from './utils/timing';
import { calculateTripCost } from './utils/tripCost';
import Header from './components/Header';
import ContextRail from './components/ContextRail';
import WorldMap from './components/WorldMap';
import BottomSheet from './components/BottomSheet';
import ComparePanel from './components/ComparePanel';
import { Heart, Map as MapIcon, Compass } from 'lucide-react';

const DEFAULT_PARAMS: TripParams = {
  months: [new Date().getMonth()],
  nights: 14,
  totalBudgetCAD: 3000,
  travellers: 2,
  travelStyle: 'standard',
};

export default function App() {
  // Initialize from URL if present
  const [tripParams, setTripParams] = useState<TripParams>(() => {
    if (typeof window === 'undefined') return DEFAULT_PARAMS;
    const params = new URLSearchParams(window.location.search);
    return {
      months: params.get('months')?.split(',').map(Number) || DEFAULT_PARAMS.months,
      nights: Number(params.get('nights')) || DEFAULT_PARAMS.nights,
      totalBudgetCAD: Number(params.get('budget')) || DEFAULT_PARAMS.totalBudgetCAD,
      travellers: Number(params.get('travellers')) || DEFAULT_PARAMS.travellers,
      travelStyle: (params.get('style') as any) || DEFAULT_PARAMS.travelStyle
    };
  });

  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [compareList, setCompareList] = useState<CountryData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [baseCurrency, setBaseCurrency] = useState<string>(() => localStorage.getItem('budgey_currency') || 'CAD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [mobileTab, setMobileTab] = useState<'map' | 'explore'>('map');

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handle = () => { 
      const matches = mq.matches;
      setIsDesktop(matches); 
      setIsSidebarOpen(matches); 
    };
    handle();
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, []);

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('months', tripParams.months.join(','));
    params.set('nights', tripParams.nights.toString());
    params.set('budget', tripParams.totalBudgetCAD.toString());
    params.set('travellers', tripParams.travellers.toString());
    params.set('style', tripParams.travelStyle);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [tripParams]);

  useEffect(() => {
    fetchExchangeRates(baseCurrency).then(r => { if (r) setExchangeRates(r); });
    localStorage.setItem('budgey_currency', baseCurrency);
  }, [baseCurrency]);

  const getCostInBase = useCallback((usdAmount: number): number => {
    if (baseCurrency === 'USD' || !exchangeRates) return usdAmount;
    const usdRate = exchangeRates.rates['USD'];
    if (!usdRate) return usdAmount;
    return usdAmount / usdRate;
  }, [exchangeRates, baseCurrency]);

  const maxBudgetUSD = useMemo(() => {
    if (!exchangeRates) return tripParams.totalBudgetCAD * 0.74; // fallback CAD->USD approx
    const cadRate = exchangeRates.rates['CAD'];
    const usdRate = exchangeRates.rates['USD'] || 1;
    if (!cadRate) return tripParams.totalBudgetCAD * 0.74;
    // Convert CAD budget to USD: divide by CAD rate (relative to base) then multiply by USD rate
    const budgetInBase = tripParams.totalBudgetCAD / cadRate;
    return budgetInBase * usdRate;
  }, [tripParams.totalBudgetCAD, exchangeRates]);

  const filteredCountries = useMemo(() => {
    return Object.values(COUNTRIES_DATA)
      .filter(c => {
        if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => getTimingScore(b, tripParams.months).discount - getTimingScore(a, tripParams.months).discount);
  }, [searchQuery, tripParams.months]);

  const offSeasonCountries = useMemo(() => {
    return Object.values(COUNTRIES_DATA)
      .filter(c => {
        if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        const score = getTimingScore(c, tripParams.months);
        return !score.isPeak;
      })
      .sort((a, b) => getTimingScore(b, tripParams.months).discount - getTimingScore(a, tripParams.months).discount);
  }, [searchQuery, tripParams.months]);

  const toggleCompare = (country: CountryData) => {
    setCompareList(prev => {
      if (prev.find(c => c.id === country.id)) return prev.filter(c => c.id !== country.id);
      if (prev.length >= 3) return prev;
      return [...prev, country];
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f0e8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflow: 'hidden' }}>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        baseCurrency={baseCurrency}
        onCurrencyChange={setBaseCurrency}
        onMenuClick={() => setIsSidebarOpen(v => !v)}
        isSidebarOpen={isSidebarOpen}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {isSidebarOpen && !isDesktop && (
          <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(40,54,24,0.3)', zIndex: 40 }} />
        )}
        <ContextRail
          isOpen={isSidebarOpen}
          isDesktop={isDesktop}
          tripParams={tripParams}
          onTripParamsChange={setTripParams}
          bestTimingCountries={offSeasonCountries.slice(0, 6)}
          onCountrySelect={(c) => { setSelectedCountry(c); if (!isDesktop) setIsSidebarOpen(false); }}
          getCostInBase={getCostInBase}
          formatCurrency={formatCurrency}
          baseCurrency={baseCurrency}
          MONTHS={MONTHS}
          getTimingScore={getTimingScore}
          matchCount={filteredCountries.length}
          calculateTripCost={calculateTripCost}
        />
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Mobile Tab Content */}
          <div style={{ flex: 1, position: 'relative', display: mobileTab === 'map' ? 'block' : 'none' }}>
            <WorldMap
              countries={offSeasonCountries}
              tripParams={tripParams}
              onCountrySelect={setSelectedCountry}
              onCountryHover={setHoveredCountry}
              hoveredCountry={hoveredCountry}
              selectedCountry={selectedCountry}
              isDesktop={isDesktop}
              getCostInBase={getCostInBase}
              formatCurrency={formatCurrency}
              baseCurrency={baseCurrency}
              getTimingScore={getTimingScore}
            />
          </div>

          {mobileTab === 'explore' && !isDesktop && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#fff' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#283618', marginBottom: 20 }}>Destinations within budget</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                {filteredCountries.map(country => {
                  const estimate = calculateTripCost(country, tripParams, getCostInBase);
                  const timing = getTimingScore(country, tripParams.months);
                  return (
                    <div 
                      key={country.id}
                      onClick={() => setSelectedCountry(country)}
                      style={{ padding: 16, borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: 32 }}>{country.flag}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#283618' }}>{country.name}</div>
                        <div style={{ fontSize: 12, color: 'rgba(40,54,24,0.5)' }}>{formatCurrency(estimate.total, baseCurrency)} total</div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#bc6c25', padding: '4px 8px', borderRadius: 8, background: '#fefae0' }}>
                        {timing.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Floating Compare Trigger */}
          {compareList.length > 0 && !showCompare && (
            <button
              onClick={() => setShowCompare(true)}
              style={{
                position: 'absolute',
                bottom: isDesktop ? 40 : 100,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#283618',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 100,
                border: 'none',
                boxShadow: '0 10px 30px rgba(40,54,24,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                zIndex: 60
              }}
            >
              <Heart size={18} fill="#fff" />
              Compare ({compareList.length})
            </button>
          )}

          {selectedCountry && (
            <BottomSheet
              country={selectedCountry}
              tripParams={tripParams}
              onTripParamsChange={setTripParams}
              onClose={() => setSelectedCountry(null)}
              getCostInBase={getCostInBase}
              formatCurrency={formatCurrency}
              baseCurrency={baseCurrency}
              calculateTripCost={calculateTripCost}
              getTimingScore={getTimingScore}
              MONTHS={MONTHS}
              onCompare={toggleCompare}
              isInCompare={!!compareList.find(c => c.id === selectedCountry.id)}
              isDesktop={isDesktop}
            />
          )}
        </main>

        {/* Mobile Nav */}
        {!isDesktop && (
          <nav style={{ 
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 72,
            background: '#fff',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            padding: '0 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 80
          }}>
            <button 
              onClick={() => setMobileTab('map')}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: mobileTab === 'map' ? '#283618' : 'rgba(0,0,0,0.3)', cursor: 'pointer' }}
            >
              <MapIcon size={20} />
              <span style={{ fontSize: 10, fontWeight: 700 }}>Map</span>
            </button>
            <button 
              onClick={() => setMobileTab('explore')}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: mobileTab === 'explore' ? '#283618' : 'rgba(0,0,0,0.3)', cursor: 'pointer' }}
            >
              <Compass size={20} />
              <span style={{ fontSize: 10, fontWeight: 700 }}>Explore</span>
            </button>
          </nav>
        )}

        <ComparePanel 
          isOpen={showCompare}
          onClose={() => setShowCompare(false)}
          compareList={compareList}
          onRemove={toggleCompare}
          tripParams={tripParams}
          calculateTripCost={calculateTripCost}
          getCostInBase={getCostInBase}
          formatCurrency={formatCurrency}
          baseCurrency={baseCurrency}
          getTimingScore={getTimingScore}
        />
      </div>
    </div>
  );
}
