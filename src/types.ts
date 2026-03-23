export interface CountryData {
  id: string;
  name: string;
  flag?: string;
  region: string;
  avgHotelCost: number;
  peakAvgCost: number;
  offSeasonAvgCost: number;
  transitScore: number;
  walkScore: number;
  safetyScore: number;
  weatherScore: number;
  currency: string;
  visaRequirement: string;
  cheapestMonths?: number[];
  offSeasonMonths?: number[];
  peakSeasonMonths?: number[];
  highlights?: string[];
  description: string;
  advisoryLevel?: number;
  travelAdvisory?: string;
  lat?: number;
  lon?: number;
  recommendedCities?: string[];
}

export interface CountryMeta {
  flag: string;
  flagSvgUrl: string;
  capital: string;
  population: number;
  languages: string[];
  neighbours: string[];
}

export interface ClimateData {
  month: number;
  avgTempC: number;
  precipMm: number;
  sunshineHours: number;
}

export interface TripParams {
  months: number[];
  nights: number;
  totalBudgetCAD: number;
  travellers: number;
  travelStyle: 'budget' | 'standard' | 'luxury';
}

export interface TimingScore {
  discount: number;
  isOffSeason: boolean;
  isShoulder: boolean;
  isPeak: boolean;
  label: string;
  colour: 'strong' | 'good' | 'shoulder' | 'peak' | 'none';
}

export interface TripEstimate {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  flights: number;
  total: number;
  perPerson: number;
  perDayExFlights: number;
  isRegionUnknown: boolean;
}

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
  timestamp: number;
}
