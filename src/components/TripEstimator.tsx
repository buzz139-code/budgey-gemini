import React from 'react';
import { TripEstimate, TimingScore } from '../types';
import { TrendingDown, TrendingUp, Info } from 'lucide-react';

interface TripEstimatorProps {
  estimate: TripEstimate;
  timing: TimingScore;
}

export const TripEstimator: React.FC<TripEstimatorProps> = ({ estimate, timing }) => {
  const items = [
    { label: 'Accommodation', value: estimate.accommodation, color: '#bc6c25' },
    { label: 'Food & Dining', value: estimate.food, color: '#dda15e' },
    { label: 'Transport', value: estimate.transport, color: '#606c38' },
    { label: 'Activities', value: estimate.activities, color: '#283618' },
    { label: 'Flights (Est.)', value: estimate.flights, color: '#aaa' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <div style={{ background: '#1a1a1a', borderRadius: 24, padding: 24, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>Total Estimate</span>
            {timing.isPeak ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#bc6c25', background: 'rgba(188,108,37,0.1)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(188,108,37,0.2)' }}>
                <TrendingUp size={14} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>Peak Season</span>
              </div>
            ) : timing.discount > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a8d5a2', background: 'rgba(168,213,162,0.1)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(168,213,162,0.2)' }}>
                <TrendingDown size={14} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>-{Math.round(timing.discount)}% Saved</span>
              </div>
            ) : null}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em' }}>${estimate.total.toLocaleString()}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>CAD</span>
          </div>
          
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
            Approximately <span style={{ color: '#fff', fontWeight: 700 }}>${estimate.perPerson.toLocaleString()}</span> per person total.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map((item) => (
              <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                  <span>${item.value.toLocaleString()}</span>
                </div>
                <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: 100, overflow: 'hidden' }}>
                  <div 
                    style={{ height: '100%', background: item.color, width: `${(item.value / estimate.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#fefae0', border: '1px solid #dda15e', borderRadius: 24, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Info size={20} style={{ color: '#bc6c25' }} />
              <h3 style={{ fontWeight: 700, color: '#283618', margin: 0 }}>Budget Insight</h3>
            </div>
            <p style={{ fontSize: 13, color: '#283618', lineHeight: 1.6, marginBottom: 16 }}>
              Traveling during <span style={{ fontWeight: 700 }}>{timing.label}</span> helps you save on accommodation. 
              Your daily spend (excluding flights) is roughly <span style={{ fontWeight: 700 }}>${estimate.perDayExFlights} CAD</span> per person.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ padding: '6px 12px', background: '#fff', borderRadius: 10, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: '#bc6c25', border: '1px solid #dda15e' }}>
                Smart Choice
              </span>
              <span style={{ padding: '6px 12px', background: '#fff', borderRadius: 10, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: '#bc6c25', border: '1px solid #dda15e' }}>
                Optimized Timing
              </span>
            </div>
          </div>
          
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 24, padding: 24 }}>
            <h3 style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: 12, marginTop: 0 }}>Flight Estimates</h3>
            <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, margin: 0 }}>
              Flight costs are estimated based on average round-trip prices from major Canadian hubs (YYZ, YVR, YUL). 
              Actual prices vary significantly by airline and booking time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
