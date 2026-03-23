import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { motion, AnimatePresence } from 'motion/react';
import { type CountryData, type TripParams } from '../types';
import { COUNTRIES_DATA } from '../data/countries';
import { TIMING_FILLS, MONTHS } from '../utils/timing';

interface WorldMapProps {
  countries: CountryData[];
  tripParams: TripParams;
  onCountrySelect: (country: CountryData) => void;
  onCountryHover: (country: CountryData | null) => void;
  hoveredCountry: CountryData | null;
  selectedCountry: CountryData | null;
  isDesktop: boolean;
  getCostInBase: (usd: number) => number;
  formatCurrency: (amount: number, currency: string) => string;
  baseCurrency: string;
  getTimingScore: (country: CountryData, months: number[]) => any;
}

const NAME_MAPPING: Record<string, string> = {
  "United States of America": "United States of America",
  "Czech Rep.": "Czechia", "Czech Republic": "Czechia",
  "S. Korea": "South Korea", "South Korea": "South Korea",
  "Dem. Rep. Congo": "DR Congo", "Bosnia and Herz.": "Bosnia and Herzegovina",
  "Dominican Rep.": "Dominican Republic", "Eq. Guinea": "Equatorial Guinea",
  "Solomon Is.": "Solomon Islands", "Falkland Is.": "Falkland Islands",
  "W. Sahara": "Western Sahara", "Viet Nam": "Vietnam",
  "Lao PDR": "Laos", "Myanmar": "Myanmar", "Tanzania": "Tanzania",
  "Eswatini": "Eswatini", "North Macedonia": "North Macedonia",
  "S. Sudan": "South Sudan", "Central African Rep.": "Central African Republic",
  "Congo": "DR Congo", "Ivory Coast": "Ivory Coast",
};

export default function WorldMap({
  countries,
  tripParams,
  onCountrySelect,
  onCountryHover,
  hoveredCountry,
  selectedCountry,
  isDesktop,
  getCostInBase,
  formatCurrency,
  baseCurrency,
  getTimingScore
}: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topology, setTopology] = useState<any>(null);

  const onCountrySelectRef = useRef(onCountrySelect);
  const onCountryHoverRef = useRef(onCountryHover);
  const tripParamsRef = useRef(tripParams);
  const selectedCountryRef = useRef(selectedCountry);
  const hoveredCountryRef = useRef(hoveredCountry);
  const countriesRef = useRef(countries);
  const updateMapColoursRef = useRef<() => void>(() => {});

  useEffect(() => { onCountrySelectRef.current = onCountrySelect; });
  useEffect(() => { onCountryHoverRef.current = onCountryHover; });
  useEffect(() => { tripParamsRef.current = tripParams; });
  useEffect(() => { selectedCountryRef.current = selectedCountry; });
  useEffect(() => { hoveredCountryRef.current = hoveredCountry; });
  useEffect(() => { countriesRef.current = countries; });

  const getCountryData = useCallback((topoName: string) => {
    const mappedName = NAME_MAPPING[topoName] || topoName;
    return COUNTRIES_DATA[mappedName];
  }, []);

  // Fetch topology
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch map data');
        return res.json();
      })
      .then(data => {
        setTopology(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!topology || !svgRef.current || !containerRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    
    let isFirstRender = true;
    let pointerDownPos = { x: 0, y: 0 };
    let isTouchInteraction = false;
    let activeCountryName: string | null = null;

    const updateMapColours = () => {
      const matchedIds = new Set(countriesRef.current.map(c => c.id));
      g.selectAll('path').style('fill', null).each(function(d: any) {
        const data = getCountryData(d.properties.name);
        if (!data) { 
          d3.select(this).style('fill', '#e5e5e5').style('opacity', '0.4'); 
          return; 
        }
        
        const isMatched = matchedIds.has(data.id);
        if (!isMatched) {
          d3.select(this).style('fill', '#e5e5e5').style('opacity', '0.25');
          return;
        }

        const score = getTimingScore(data, tripParamsRef.current.months);
        const isSelected = selectedCountryRef.current?.id === data.id;
        const isHovered = hoveredCountryRef.current?.id === data.id;
        
        let fill = TIMING_FILLS[score.colour as keyof typeof TIMING_FILLS] || '#e5e5e5';
        if (isSelected) fill = '#bc6c25';
        else if (isHovered && !isTouchInteraction) fill = d3.color(fill)?.brighter(0.5).toString() || fill;

        d3.select(this).style('fill', fill).style('opacity', '1');
      });
    };
    updateMapColoursRef.current = updateMapColours;

    const renderMap = () => {
      const width = containerRef.current?.clientWidth || 0;
      const height = containerRef.current?.clientHeight || 0;
      if (width === 0 || height === 0) return;

      const projection = d3.geoMercator()
        .fitExtent([[20, 20], [width - 20, height - 20]], topojson.feature(topology, topology.objects.countries));
      
      const pathGenerator = d3.geoPath().projection(projection);

      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });

      svg.call(zoom);

      if (isFirstRender) {
        isFirstRender = false;
      } else {
        const t = d3.zoomTransform(svg.node() as Element);
        g.attr('transform', t.toString());
      }

      g.selectAll('path').attr('d', pathGenerator as any);
    };

    // Initial setup
    const countriesGeo = topojson.feature(topology, topology.objects.countries) as any;
    
    g.selectAll('path')
      .data(countriesGeo.features)
      .enter()
      .append('path')
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('pointerenter', (event, d: any) => {
        if (event.pointerType === 'touch') return;
        const data = getCountryData(d.properties.name);
        if (data) onCountryHoverRef.current(data);
      })
      .on('pointerleave', (event) => {
        if (event.pointerType === 'touch') return;
        onCountryHoverRef.current(null);
      })
      .on('pointerdown', (event, d: any) => {
        if (!event.isPrimary) return;
        pointerDownPos = { x: event.clientX, y: event.clientY };
        isTouchInteraction = event.pointerType === 'touch';
        activeCountryName = d.properties.name;
        if (isTouchInteraction) {
          const data = getCountryData(activeCountryName);
          if (data) d3.select(event.currentTarget as Element).style('fill', '#283618');
        }
      });

    svg.on('pointerup.custom', (event) => {
      if (!event.isPrimary || !activeCountryName) return;
      const dx = Math.abs(event.clientX - pointerDownPos.x);
      const dy = Math.abs(event.clientY - pointerDownPos.y);
      if (dx > 5 || dy > 5) {
        if (isTouchInteraction) updateMapColours();
        activeCountryName = null;
        return;
      }
      const data = getCountryData(activeCountryName);
      if (data) {
        onCountrySelectRef.current(data);
        onCountryHoverRef.current(null);
      }
      activeCountryName = null;
    }).on('pointercancel.custom', () => { 
      updateMapColours(); 
      activeCountryName = null; 
    });

    renderMap();
    updateMapColours();

    const resizeObserver = new ResizeObserver(() => {
      renderMap();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      svg.on('pointerup.custom', null).on('pointercancel.custom', null);
    };
  }, [topology]);

  // Update colours when params change
  useEffect(() => {
    updateMapColoursRef.current();
  }, [tripParams.months, countries, baseCurrency, selectedCountry, hoveredCountry]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', background: '#fefae0', overflow: 'hidden' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(254,250,224,0.8)', zIndex: 10 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #bc6c25', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: '#283618' }}>Loading World Atlas...</div>
          </div>
        </div>
      )}

      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(254,250,224,0.8)', zIndex: 10 }}>
          <div style={{ textAlign: 'center', color: '#bc6c25' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Error loading map: {error}</div>
          </div>
        </div>
      )}

      <svg ref={svgRef} style={{ width: '100%', height: '100%', touchAction: 'none' }}>
        <g ref={gRef} />
      </svg>

      {/* Destination Count Badge */}
      <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '8px 16px', borderRadius: 100, boxShadow: '0 4px 12px rgba(40,54,24,0.1)', border: '1px solid rgba(0,0,0,0.06)', zIndex: 20 }}>
        {countries.length > 0 && (
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#606c38' }} 
          />
        )}
        <span style={{ fontSize: 12, fontWeight: 700, color: '#283618' }}>
          {countries.length === 0 ? 'All destinations are at peak pricing for these months — try adjusting your travel months' : `${countries.length} destinations off-peak this ${MONTHS[tripParams.months[0]].substring(0, 3)}`}
        </span>
      </div>

      {/* Empty State Overlay */}
      {countries.length === 0 && !loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(254,250,224,0.4)', zIndex: 15, pointerEvents: 'none' }}>
          <div style={{ background: '#fff', padding: '24px 32px', borderRadius: 24, boxShadow: '0 20px 40px rgba(40,54,24,0.1)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: 300, pointerEvents: 'auto' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🏜️</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#283618', marginBottom: 8 }}>No matches found</h3>
            <p style={{ fontSize: 14, color: 'rgba(40,54,24,0.6)', lineHeight: 1.5 }}>All destinations are at peak pricing for these months — try adjusting your travel months.</p>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div style={{ position: 'absolute', bottom: 24, right: 24, background: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 4px 12px rgba(40,54,24,0.1)', border: '1px solid rgba(0,0,0,0.06)', zIndex: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { color: TIMING_FILLS.strong, label: '30%+ off' },
            { color: TIMING_FILLS.good, label: '15%+ off' },
            { color: TIMING_FILLS.shoulder, label: 'Shoulder' },
            { color: TIMING_FILLS.peak, label: 'Peak' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#283618' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredCountry && isDesktop && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{ 
              position: 'absolute', 
              bottom: 48, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              background: '#fff', 
              padding: '12px 16px', 
              borderRadius: 16, 
              boxShadow: '0 8px 24px rgba(40,54,24,0.12)',
              border: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              pointerEvents: 'none',
              zIndex: 40
            }}
          >
            <span style={{ fontSize: 24 }}>{hoveredCountry.flag || '📍'}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#283618' }}>{hoveredCountry.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {getTimingScore(hoveredCountry, tripParams.months).discount > 0 && (
                  <span style={{ fontSize: 11, color: '#606c38', fontWeight: 700 }}>
                    {getTimingScore(hoveredCountry, tripParams.months).label}
                  </span>
                )}
                <span style={{ fontSize: 11, color: '#bc6c25', fontWeight: 600 }}>
                  {formatCurrency(getCostInBase(hoveredCountry.avgHotelCost), baseCurrency)}/night
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
