import { type CountryData, type TripEstimate, type TripParams } from '../types';

const FLIGHT_ESTIMATES: Record<string, number> = {
  'North America / Caribbean': 400,
  'Central America': 500,
  'South America': 700,
  'Western Europe': 900,
  'Eastern Europe': 700,
  'Middle East': 1000,
  'Africa': 1200,
  'South/Southeast Asia': 1100,
  'East Asia': 1300,
  'Oceania': 1500,
};

export function calculateTripCost(country: CountryData, params: TripParams, getCostInBase: (usd: number) => number): TripEstimate {
  const { nights, travellers } = params;
  const style = 'standard';
  const rooms = Math.ceil(travellers / 2);
  const accommodation = country.avgHotelCost * rooms * nights;
  const baseFood = country.avgHotelCost < 80 ? 25 : country.avgHotelCost >= 150 ? 70 : 45;
  const food = baseFood * travellers * nights;
  const baseTransport = country.transitScore >= 80 ? 8 : country.transitScore < 50 ? 25 : 15;
  const transport = baseTransport * travellers * nights;
  const activities = 25 * travellers * nights;
  const flightPerPerson = FLIGHT_ESTIMATES[country.region] || 900;
  const flights = flightPerPerson * travellers;
  const total = accommodation + food + transport + activities + flights;
  const totalExFlights = accommodation + food + transport + activities;

  return {
    accommodation: getCostInBase(accommodation),
    food: getCostInBase(food),
    transport: getCostInBase(transport),
    activities: getCostInBase(activities),
    flights: getCostInBase(flights),
    total: getCostInBase(total),
    perPerson: getCostInBase(total / travellers),
    perDayExFlights: getCostInBase(totalExFlights / nights),
    isRegionUnknown: !FLIGHT_ESTIMATES[country.region],
  };
}
