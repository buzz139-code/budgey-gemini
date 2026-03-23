import { type CountryData, type TimingScore } from '../types';

export function getTimingScore(country: CountryData, selectedMonths: number[]): TimingScore {
  const peak = country.peakAvgCost;
  const off = country.offSeasonAvgCost;
  const isOffSeason = selectedMonths.some(m => country.offSeasonMonths?.includes(m + 1));
  const isShoulder = !isOffSeason && selectedMonths.some(m =>
    !country.peakSeasonMonths?.includes(m + 1) && !country.offSeasonMonths?.includes(m + 1)
  );
  const isPeak = !isOffSeason && !isShoulder;
  const relevantCost = isOffSeason ? off : isShoulder ? country.avgHotelCost : peak;
  const discount = Math.max(0, Math.round(((peak - relevantCost) / peak) * 100));

  let colour: TimingScore['colour'] = 'none';
  if (isOffSeason && discount >= 30) colour = 'strong';
  else if (isOffSeason && discount >= 15) colour = 'good';
  else if (isShoulder) colour = 'shoulder';
  else if (isPeak) colour = 'peak';

  let label = '';
  if (isPeak) label = 'Peak season';
  else if (discount > 0) label = `${discount}% below peak`;
  else label = 'Shoulder season';

  return { discount, isOffSeason, isShoulder, isPeak, label, colour };
}

export const TIMING_FILLS: Record<TimingScore['colour'], string> = {
  strong: '#3B6D11',
  good: '#606c38',
  shoulder: '#dda15e',
  peak: '#c8832a',
  none: '#e5e5e5',
};

export function getMonthName(month: number): string {
  return new Date(2024, month - 1).toLocaleString('default', { month: 'short' });
}
