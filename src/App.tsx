import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { type CountryData, type TripParams, type ExchangeRates } from './types';
import { COUNTRIES_DATA } from './data/countries';
import { fetchExchangeRates, formatCurrency } from './services/currencyService';
import { getTimingScore } from './utils/timing';
import { calculateTripCost } from './utils/tripCost';
import Header from './components/Header';
import ContextRail from './components/ContextRail';
import WorldMap from './components/WorldMap';
import BottomSheet from './components/BottomSheet';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function App() {
  const [tripParams, setTripParams] = useState<TripParams>({
    months: [new Date().getMonth()],
    nights: 14,
    totalBudgetCAD: 3000,
    travellers: 2,
    travelStyle: 'standard',
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

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handle = () => { setIsDesktop(mq.matches); setIsSidebarOpen(mq.matches); };
    handle();
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, []);

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
    if (!exchangeRates || baseCurrency === 'USD') return tripParams.totalBudgetCAD;
    const cadRate = exchangeRates.rates['CAD'];
    const usdRate = exchangeRates.rates['USD'];
    if (!cadRate || !usdRate) return tripParams.totalBudgetCAD;
    return (tripParams.totalBudgetCAD / cadRate) * usdRate;
  }, [tripParams.totalBudgetCAD, exchangeRates, baseCurrency]);

  const filteredCountries = useMemo(() => {
    return Object.values(COUNTRIES_DATA)
      .filter(c => {
        if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        const estimate = calculateTripCost(c, tripParams, getCostInBase);
        if (estimate.total > getCostInBase(maxBudgetUSD * 20)) return false;
        return true;
      })
      .sort((a, b) => getTimingScore(b, tripParams.months).discount - getTimingScore(a, tripParams.months).discount);
  }, [searchQuery, tripParams, getCostInBase, maxBudgetUSD]);

  const bestTimingCountries = useMemo(() => {
    return Object.values(COUNTRIES_DATA)
      .filter(c => {
        const s = getTimingScore(c, tripParams.months);
        return s.isOffSeason || s.isShoulder;
      })
      .sort((a, b) => getTimingScore(b, tripParams.months).discount - getTimingScore(a, tripParams.months).discount)
      .slice(0, 6);
  }, [tripParams.months]);

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
          bestTimingCountries={bestTimingCountries}
          onCountrySelect={(c) => { setSelectedCountry(c); if (!isDesktop) setIsSidebarOpen(false); }}
          getCostInBase={getCostInBase}
          formatCurrency={formatCurrency}
          baseCurrency={baseCurrency}
          MONTHS={MONTHS}
          getTimingScore={getTimingScore}
          matchCount={filteredCountries.length}
          calculateTripCost={calculateTripCost}
        />
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden', transition: 'margin-left 0.3s', marginLeft: isDesktop && isSidebarOpen ? 0 : 0 }}>
          <WorldMap
            countries={filteredCountries}
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
          {selectedCountry && (
            <BottomSheet
              country={selectedCountry}
              tripParams={tripParams}
              onTripParamsChange={setTripParams}
              onClose={() => setSelectedCountry(null)}
              getCostInBase={getCostInBase}
              formatCurrency={formatCurrency}
              baseCurrency={baseCurrency}
              exchangeRates={exchangeRates}
              calculateTripCost={calculateTripCost}
              getTimingScore={getTimingScore}
              MONTHS={MONTHS}
              onCompare={toggleCompare}
              isInCompare={!!compareList.find(c => c.id === selectedCountry.id)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
