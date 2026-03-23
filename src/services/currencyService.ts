const FRANKFURTER_API = 'https://api.frankfurter.app/latest';
const EXCHANGERATE_API = 'https://api.exchangerate-api.com/v4/latest';
const CACHE_KEY = 'budgey_exchange_rates';
const CACHE_TTL = 60 * 60 * 1000;

import { type ExchangeRates, type CountryMeta, type ClimateData } from '../types';

export async function fetchExchangeRates(base: string = 'CAD'): Promise<ExchangeRates | null> {
  const cacheKey = `${CACHE_KEY}_${base}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const parsed: ExchangeRates = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < CACHE_TTL) return parsed;
  }
  try {
    const res = await fetch(`${FRANKFURTER_API}?from=${base}`);
    let data: ExchangeRates | null = null;
    if (res.ok) {
      const json = await res.json();
      data = { base: json.base, date: json.date, rates: { ...json.rates, [base]: 1 }, timestamp: Date.now() };
    }
    try {
      const fb = await fetch(`${EXCHANGERATE_API}/${base}`);
      if (fb.ok) {
        const fj = await fb.json();
        if (!data) data = { base: fj.base, date: fj.date, rates: fj.rates, timestamp: Date.now() };
        else data.rates = { ...fj.rates, ...data.rates };
      }
    } catch {}
    if (data) { localStorage.setItem(cacheKey, JSON.stringify(data)); return data; }
    throw new Error('All APIs failed');
  } catch {
    if (cached) return JSON.parse(cached);
    return null;
  }
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

export async function fetchRestCountryMeta(countryName: string): Promise<CountryMeta | null> {
  const key = `budgey_rcmeta_v2_${countryName}`;
  const cached = localStorage.getItem(key);
  if (cached) return JSON.parse(cached);
  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true&fields=flag,flags,capital,population,languages,borders,latlng`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const c = data[0];
    const result: CountryMeta = {
      flag: c.flag || '',
      flagSvgUrl: c.flags?.svg || c.flags?.png || '',
      capital: c.capital?.[0] || '',
      population: c.population || 0,
      languages: Object.values(c.languages || {}) as string[],
      neighbours: c.borders || [],
    };
    localStorage.setItem(key, JSON.stringify(result));
    return result;
  } catch { return null; }
}

export async function fetchClimateData(lat: number, lon: number, countryId: string): Promise<ClimateData[] | null> {
  const key = `budgey_climate_${countryId}`;
  const cached = localStorage.getItem(key);
  if (cached) return JSON.parse(cached);
  try {
    // Use Open-Meteo forecast API to get the next 16 days then aggregate by month
    // This gives us real current conditions rather than just historical averages
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunshine_duration&timezone=auto&forecast_days=16`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Climate API failed');
    const data = await res.json();
    
    // Group daily data by month and average
    const monthlyMap: Record<number, { temps: number[], precip: number[], sunshine: number[] }> = {};
    data.daily.time.forEach((dateStr: string, i: number) => {
      const month = new Date(dateStr).getMonth() + 1;
      if (!monthlyMap[month]) monthlyMap[month] = { temps: [], precip: [], sunshine: [] };
      const avgTemp = ((data.daily.temperature_2m_max[i] || 0) + (data.daily.temperature_2m_min[i] || 0)) / 2;
      monthlyMap[month].temps.push(avgTemp);
      monthlyMap[month].precip.push(data.daily.precipitation_sum[i] || 0);
      monthlyMap[month].sunshine.push((data.daily.sunshine_duration[i] || 0) / 3600); // convert seconds to hours
    });

    const result: ClimateData[] = Object.entries(monthlyMap).map(([month, d]) => ({
      month: parseInt(month),
      avgTempC: Math.round(d.temps.reduce((a, b) => a + b, 0) / d.temps.length),
      precipMm: Math.round(d.precip.reduce((a, b) => a + b, 0)),
      sunshineHours: Math.round(d.sunshine.reduce((a, b) => a + b, 0) / d.sunshine.length),
    }));

    // Cache for 24 hours — weather data doesn't need to be fresher than that
    localStorage.setItem(key, JSON.stringify(result));
    return result;
  } catch { return null; }
}

export function convertCurrency(amount: number, from: string, to: string, rates: Record<string, number>): number {
  if (from === to) return amount;
  const inBase = from === 'USD' ? amount / (rates['USD'] || 1) : amount / rates[from];
  return to === 'USD' ? inBase * (rates['USD'] || 1) : inBase * rates[to];
}
