import React from 'react';
import { TripEstimate, TimingScore } from '../types';
import { TrendingDown, TrendingUp, Info } from 'lucide-react';

interface TripEstimatorProps {
  estimate: TripEstimate;
  timing: TimingScore;
}

export const TripEstimator: React.FC<TripEstimatorProps> = ({ estimate, timing }) => {
  const items = [
    { label: 'Accommodation', value: estimate.accommodation, color: 'bg-blue-500' },
    { label: 'Food & Dining', value: estimate.food, color: 'bg-orange-400' },
    { label: 'Transport', value: estimate.transport, color: 'bg-indigo-400' },
    { label: 'Activities', value: estimate.activities, color: 'bg-purple-400' },
    { label: 'Flights (Est.)', value: estimate.flights, color: 'bg-zinc-400' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Total Estimate</span>
            {timing.discount > 0 ? (
              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">-{Math.round(timing.discount * 100)}% Saved</span>
              </div>
            ) : timing.discount < 0 ? (
              <div className="flex items-center gap-1.5 text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full border border-rose-400/20">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">+{Math.round(Math.abs(timing.discount) * 100)}% Peak</span>
              </div>
            ) : null}
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-black tracking-tighter">${estimate.total.toLocaleString()}</span>
            <span className="text-zinc-400 font-medium">CAD</span>
          </div>
          
          <p className="text-sm text-zinc-400 mb-8">
            Approximately <span className="text-white font-bold">${estimate.perPerson.toLocaleString()}</span> per person total.
          </p>
          
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-400">{item.label}</span>
                  <span>${item.value.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color}`} 
                    style={{ width: `${(item.value / estimate.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-emerald-900">Budget Insight</h3>
            </div>
            <p className="text-sm text-emerald-800 leading-relaxed mb-6">
              Traveling during <span className="font-bold">{timing.label}</span> helps you save on accommodation. 
              Your daily spend (excluding flights) is roughly <span className="font-bold">${estimate.perDayExFlights} CAD</span> per person.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-white rounded-xl text-[10px] font-black uppercase text-emerald-700 border border-emerald-200">
                Smart Choice
              </span>
              <span className="px-3 py-1.5 bg-white rounded-xl text-[10px] font-black uppercase text-emerald-700 border border-emerald-200">
                Optimized Timing
              </span>
            </div>
          </div>
          
          <div className="bg-zinc-50 border border-black/5 rounded-3xl p-8">
            <h3 className="font-bold text-zinc-900 mb-4">Flight Estimates</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Flight costs are estimated based on average round-trip prices from major Canadian hubs (YYZ, YVR, YUL). 
              Actual prices vary significantly by airline and booking time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
