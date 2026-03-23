import { CountryData, TimingScore } from '../types';

export const getTimingScore = (country: CountryData, months: number[]): TimingScore => {
  if (!months.length) return { discount: 0, isOffSeason: false, isShoulder: false, isPeak: false, label: 'Select months', colour: 'none' };

  const isOff = months.every(m => country.offSeasonMonths?.includes(m));
  const isPeak = months.some(m => country.peakSeasonMonths?.includes(m));
  const isCheapest = months.every(m => country.cheapestMonths?.includes(m));

  if (isCheapest) {
    return {
      discount: 0.35,
      isOffSeason: true,
      isShoulder: false,
      isPeak: false,
      label: 'Cheapest Time',
      colour: 'strong'
    };
  }

  if (isOff) {
    return {
      discount: 0.25,
      isOffSeason: true,
      isShoulder: false,
      isPeak: false,
      label: 'Off-Season',
      colour: 'good'
    };
  }

  if (isPeak) {
    return {
      discount: -0.4,
      isOffSeason: false,
      isShoulder: false,
      isPeak: true,
      label: 'Peak Season',
      colour: 'peak'
    };
  }

  return {
    discount: 0,
    isOffSeason: false,
    isShoulder: true,
    isPeak: false,
    label: 'Shoulder Season',
    colour: 'shoulder'
  };
};

export const getMonthName = (month: number): string => {
  return new Date(2000, month - 1).toLocaleString('default', { month: 'short' });
};
