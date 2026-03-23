import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Navigation, 
  Footprints, 
  Sun, 
  Globe,
  Star,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { Header } from './components/Header';
import { ContextRail } from './components/ContextRail';
import { FilterPills } from './components/FilterPills';
import { WorldMap } from './components/WorldMap';
import { BottomSheet } from './components/BottomSheet';
import { SavingsCalendar } from './components/SavingsCalendar';
import { TripEstimator } from './components/TripEstimator';
import { ComparePanel } from './components/ComparePanel';
import { COUNTRIES_DATA } from './data/countries';
import { CountryData, TripParams, ExchangeRates } from './types';
import { fetchExchangeRates } from './services/currencyService';
import { calculateTripEstimate } from './utils/tripCost';
import { getTimingScore } from './utils/timing';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'trends'>('map');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | undefined>();
  const [compareList, setCompareList] = useState<CountryData[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  
  // Trip Parameters
  const [tripParams, setTripParams] = useState<TripParams>({
    months: [new Date().getMonth() + 1],
    nights: 10,
    totalBudgetCAD: 5000,
    travellers: 2
  });

  useEffect(() => {
    fetchExchangeRates().then(setExchangeRates);
  }, []);

  const filteredCountries = useMemo(() => {
    return Object.values(COUNTRIES_DATA).filter(country => {
      const matchesRegion = selectedRegion === 'All Regions' || country.region === selectedRegion;
      const matchesSearch = country.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [selectedRegion, searchQuery]);

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
  };

  const toggleCompare = (country: CountryData) => {
    if (compareList.find(c => c.id === country.id)) {
      setCompareList(compareList.filter(c => c.id !== country.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, country]);
    }
  };

  const handleMonthToggle = (month: number) => {
    setTripParams(prev => ({
      ...prev,
      months: prev.months.includes(month) 
        ? prev.months.filter(m => m !== month)
        : [...prev.months, month]
    }));
  };

  const estimate = useMemo(() => {
    if (!selectedCountry || !exchangeRates) return null;
    return calculateTripEstimate(selectedCountry, tripParams, exchangeRates.rates);
  }, [selectedCountry, tripParams, exchangeRates]);

  const timingScore = useMemo(() => {
    if (!selectedCountry) return null;
    return getTimingScore(selectedCountry, tripParams.months);
  }, [selectedCountry, tripParams.months]);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <Header />
      <ContextRail activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pt-24 pb-32 px-6 lg:pl-28 max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">
          {/* Hero Section */}
          <section className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">
              Find the best time to <br />
              <span className="text-emerald-500 italic serif">fly and save.</span>
            </h2>
            <p className="text-zinc-500 max-w-xl text-lg font-medium leading-relaxed">
              Compare 90+ countries based on real-time costs, safety, and seasonal savings. 
              Optimize your next adventure for your budget.
            </p>
          </section>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-black/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <FilterPills selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 h-[500px] md:h-[600px]">
              <WorldMap 
                onCountrySelect={handleCountrySelect}
                selectedCountryId={selectedCountry?.id}
                hoveredCountryId={hoveredCountryId}
                onCountryHover={setHoveredCountryId}
              />
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-50 border border-black/5 rounded-[32px] p-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6">Trending Destinations</h3>
                <div className="space-y-4">
                  {filteredCountries.slice(0, 5).map((country) => (
                    <button
                      key={country.id}
                      onClick={() => handleCountrySelect(country)}
                      onMouseEnter={() => setHoveredCountryId(country.id)}
                      onMouseLeave={() => setHoveredCountryId(undefined)}
                      className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-lg font-bold">
                          {country.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm">{country.name}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{country.region}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-emerald-500 rounded-[32px] p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <TrendingDown className="w-8 h-8 mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2 leading-tight">Off-Season Savings</h3>
                  <p className="text-emerald-100 text-sm font-medium leading-relaxed">
                    Save up to 40% on hotels in Europe during November.
                  </p>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ComparePanel 
        countries={compareList} 
        onRemove={(id) => setCompareList(prev => prev.filter(c => c.id !== id))}
        onClear={() => setCompareList([])}
      />

      <BottomSheet 
        isOpen={!!selectedCountry} 
        onClose={() => setSelectedCountry(null)}
        title={selectedCountry?.name}
      >
        {selectedCountry && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-xl text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    {selectedCountry.region}
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Safety: {selectedCountry.safetyScore}/100
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold border border-blue-100">
                    <Navigation className="w-3.5 h-3.5" />
                    Transit: {selectedCountry.transitScore}/100
                  </div>
                </div>

                <p className="text-lg text-zinc-600 leading-relaxed">
                  {selectedCountry.description}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-zinc-50 rounded-3xl border border-black/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Avg. Hotel</p>
                    <p className="text-2xl font-black tracking-tighter">${selectedCountry.avgHotelCost} <span className="text-xs font-bold text-zinc-400">USD/nt</span></p>
                  </div>
                  <div className="p-6 bg-zinc-50 rounded-3xl border border-black/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Visa Status</p>
                    <p className="text-sm font-bold">{selectedCountry.visaRequirement}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">Top Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCountry.highlights?.map(h => (
                      <span key={h} className="px-4 py-2 bg-white border border-black/5 rounded-xl text-sm font-bold shadow-sm">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-zinc-50 rounded-[32px] p-8 border border-black/5">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">Select Travel Timing</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Cheapest</span>
                    </div>
                  </div>
                  <SavingsCalendar 
                    country={selectedCountry} 
                    selectedMonths={tripParams.months}
                    onMonthToggle={handleMonthToggle}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nights</label>
                    <input 
                      type="number" 
                      value={tripParams.nights}
                      onChange={(e) => setTripParams(prev => ({ ...prev, nights: parseInt(e.target.value) || 1 }))}
                      className="w-full bg-zinc-100 border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Travellers</label>
                    <input 
                      type="number" 
                      value={tripParams.travellers}
                      onChange={(e) => setTripParams(prev => ({ ...prev, travellers: parseInt(e.target.value) || 1 }))}
                      className="w-full bg-zinc-100 border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {estimate && timingScore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-12 border-t border-black/5"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black tracking-tighter">Budget Estimate</h3>
                  <button 
                    onClick={() => toggleCompare(selectedCountry)}
                    className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                      compareList.find(c => c.id === selectedCountry.id)
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {compareList.find(c => c.id === selectedCountry.id) ? "Added to Compare" : "Add to Compare"}
                  </button>
                </div>
                <TripEstimator estimate={estimate} timing={timingScore} />
              </motion.div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
