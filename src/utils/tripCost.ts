import { CountryData, TripParams, TripEstimate, TimingScore } from '../types';
import { getTimingScore } from './timing';

export const calculateTripEstimate = (
  country: CountryData,
  params: TripParams,
  rates: Record<string, number>
): TripEstimate => {
  const { nights, travellers } = params;
  const timing = getTimingScore(country, params.months);
  
  // Base costs in USD (per person per night)
  const baseHotel = country.avgHotelCost;
  const baseFood = 30; // Average daily food cost
  const baseTransport = 15; // Average daily local transport
  const baseActivities = 20; // Average daily activities
  
  // Apply timing multipliers
  let hotelMultiplier = 1;
  if (timing.isPeak) hotelMultiplier = 1.6;
  if (timing.isOffSeason) hotelMultiplier = 0.65;
  
  const dailyHotel = baseHotel * hotelMultiplier;
  
  // Convert to CAD
  const usdToCad = rates['CAD'] || 1.35;
  
  const accommodationTotal = (dailyHotel * nights) * usdToCad;
  const foodTotal = (baseFood * (nights + 1) * travellers) * usdToCad;
  const transportTotal = (baseTransport * (nights + 1) * travellers) * usdToCad;
  const activitiesTotal = (baseActivities * (nights + 1) * travellers) * usdToCad;
  
  // Estimated flights from Canada (rough averages by region)
  const flightEstimates: Record<string, number> = {
    'Western Europe': 900,
    'Eastern Europe': 1100,
    'South/Southeast Asia': 1400,
    'East Asia': 1300,
    'South America': 800,
    'Central America': 500,
    'North America / Caribbean': 400,
    'Africa': 1500,
    'Middle East': 1200,
    'Oceania': 1800
  };

  const flightCostPerPerson = flightEstimates[country.region] || 1000;
  const flightsTotal = flightCostPerPerson * travellers;
  
  const total = accommodationTotal + foodTotal + transportTotal + activitiesTotal + flightsTotal;

  return {
    accommodation: Math.round(accommodationTotal),
    food: Math.round(foodTotal),
    transport: Math.round(transportTotal),
    activities: Math.round(activitiesTotal),
    flights: Math.round(flightsTotal),
    total: Math.round(total),
    perPerson: Math.round(total / travellers),
    perDayExFlights: Math.round((total - flightsTotal) / (nights + 1) / travellers),
    isRegionUnknown: !flightEstimates[country.region]
  };
};
