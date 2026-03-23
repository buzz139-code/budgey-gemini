const FRANKFURTER_API = 'https://api.frankfurter.app/latest';
const EXCHANGERATE_API = 'https://api.exchangerate-api.com/v4/latest';
const CACHE_KEY = 'budgey_exchange_rates';
const CACHE_TTL = 60 * 60 * 1000;

import { type ExchangeRates } from '../types';

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

export async function fetchRestCountryMeta(countryName: string): Promise<{ flag: string; capital: string } | null> {
  const key = `budgey_rcmeta_${countryName}`;
  const cached = localStorage.getItem(key);
  if (cached) return JSON.parse(cached);
  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true&fields=flag,capital`);
    if (!res.ok) return null;
    const data = await res.json();
    const result = { flag: data[0]?.flag || '', capital: data[0]?.capital?.[0] || '' };
    localStorage.setItem(key, JSON.stringify(result));
    return result;
  } catch { return null; }
}

export function convertCurrency(amount: number, from: string, to: string, rates: Record<string, number>): number {
  if (from === to) return amount;
  const inBase = from === 'USD' ? amount / (rates['USD'] || 1) : amount / rates[from];
  return to === 'USD' ? inBase * (rates['USD'] || 1) : inBase * rates[to];
}
