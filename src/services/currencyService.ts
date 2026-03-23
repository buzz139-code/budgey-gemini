import { ExchangeRates } from '../types';

const CACHE_KEY = 'budgey_exchange_rates';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached) as ExchangeRates;
    if (Date.now() - parsed.timestamp < CACHE_DURATION) {
      return parsed;
    }
  }

  try {
    // Using a free API for exchange rates. 
    // Note: In a real app, you'd use a paid API with an API key.
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    
    const rates: ExchangeRates = {
      base: data.base_code,
      date: data.time_last_update_utc,
      rates: data.rates,
      timestamp: Date.now()
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
    return rates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    // Fallback rates if API fails
    return {
      base: 'USD',
      date: new Date().toISOString(),
      rates: { 'CAD': 1.35, 'EUR': 0.92, 'GBP': 0.79, 'JPY': 150, 'THB': 35 },
      timestamp: Date.now()
    };
  }
};

export const convertCurrency = (amount: number, from: string, to: string, rates: Record<string, number>): number => {
  if (from === to) return amount;
  
  // Convert to USD first (base)
  const inUSD = from === 'USD' ? amount : amount / rates[from];
  // Convert from USD to target
  return to === 'USD' ? inUSD : inUSD * rates[to];
};
