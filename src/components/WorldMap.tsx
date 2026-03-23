import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { type CountryData, type TripParams } from '../types';
import { COUNTRIES_DATA } from '../data/countries';
import { TIMING_FILLS } from '../utils/timing';

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
  "Czech Rep.": "Czechia", 
  "S. Korea": "South Korea", 
  "Viet Nam": "Vietnam", 
  "Lao PDR": "Laos", 
  "Dominican Rep.": "Dominican Republic", 
  "Bosnia and Herz.": "Bosnia and Herzegovina" 
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
  const [topology, setTopology] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const isFirstRender = useRef(true);
  const pointerDownPos = useRef<{ x: number, y: number } | null>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const onCountrySelectRef = useRef(onCountrySelect);
  const onCountryHoverRef = useRef(onCountryHover);
  const updateMapColoursRef = useRef<() => void>(() => {});

  useEffect(() => { onCountrySelectRef.current = onCountrySelect; });
  useEffect(() => { onCountryHoverRef.current = onCountryHover; });

  const updateMapColours = useCallback(() => {
    if (!gRef.current) return;

    gRef.current.selectAll('path')
      .style('fill', null)
      .each(function(d: any) {
        const mappedName = NAME_MAPPING[d.properties.name] || d.properties.name;
        const country = COUNTRIES_DATA[mappedName];
        
        const selection = d3.select(this);
        
        if (!country) {
          selection
            .attr('fill', '#e5e5e5')
            .attr('fill-opacity', 0.4);
          return;
        }

        const score = getTimingScore(country, tripParams.months);
        const isSelected = selectedCountry?.id === country.id;
        const isHovered = hoveredCountry?.id === country.id;

        let fill = TIMING_FILLS[score.colour as keyof typeof TIMING_FILLS] || '#e5e5e5';
        
        if (isSelected) fill = '#bc6c25';
        else if (isHovered) fill = d3.color(fill)?.brighter(0.5).toString() || fill;

        selection
          .attr('fill', fill)
          .attr('fill-opacity', 1);
      });
  }, [tripParams.months, selectedCountry, hoveredCountry, getTimingScore]);

  useEffect(() => {
    updateMapColoursRef.current = updateMapColours;
  }, [updateMapColours]);

  useEffect(() => {
    updateMapColoursRef.current();
  }, [tripParams.months, selectedCountry, hoveredCountry]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(data => setTopology(data));
  }, []);

  useEffect(() => {
    if (!topology || !svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    
    // Preserve zoom transform if it exists
    const currentTransform = gRef.current ? d3.zoomTransform(svgRef.current) : d3.zoomIdentity;

    svg.selectAll('*').remove();

    const projection = d3.geoMercator()
      .fitExtent([[20, 20], [dimensions.width - 20, dimensions.height - 20]], topojson.feature(topology, topology.objects.countries));

    const path = d3.geoPath().projection(projection);
    const countriesGeo = topojson.feature(topology, topology.objects.countries) as any;

    const g = svg.append('g');
    gRef.current = g;

    g.selectAll('path')
      .data(countriesGeo.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .style('cursor', (d: any) => {
        const mappedName = NAME_MAPPING[d.properties.name] || d.properties.name;
        return COUNTRIES_DATA[mappedName] ? 'pointer' : 'default';
      });

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    zoomRef.current = zoom;
    svg.call(zoom);

    if (!isFirstRender.current) {
      svg.call(zoom.transform, currentTransform);
    } else {
      isFirstRender.current = false;
    }

    updateMapColours();
  }, [topology, dimensions]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    svg.on('pointerdown', (event) => {
      if (!event.isPrimary) return;
      pointerDownPos.current = { x: event.clientX, y: event.clientY };
    });

    svg.on('pointerup', (event) => {
      if (!event.isPrimary || !pointerDownPos.current) return;
      
      const dx = Math.abs(event.clientX - pointerDownPos.current.x);
      const dy = Math.abs(event.clientY - pointerDownPos.current.y);
      
      if (dx < 5 && dy < 5) {
        const target = event.target as SVGPathElement;
        if (target.tagName === 'path') {
          const d = d3.select(target).datum() as any;
          if (d && d.properties) {
            const mappedName = NAME_MAPPING[d.properties.name] || d.properties.name;
            const country = COUNTRIES_DATA[mappedName];
            if (country) onCountrySelectRef.current(country);
          }
        }
      }
      pointerDownPos.current = null;
    });

    svg.on('pointercancel', () => {
      pointerDownPos.current = null;
    });

    // Event delegation for hover
    svg.on('mousemove', (event) => {
      const target = event.target as SVGPathElement;
      if (target.tagName === 'path') {
        const d = d3.select(target).datum() as any;
        if (d && d.properties) {
          const mappedName = NAME_MAPPING[d.properties.name] || d.properties.name;
          const country = COUNTRIES_DATA[mappedName];
          if (country) {
            onCountryHoverRef.current(country);
            return;
          }
        }
      }
      onCountryHoverRef.current(null);
    });

    svg.on('mouseleave', () => {
      onCountryHoverRef.current(null);
    });
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', background: '#fefae0' }}>
      <svg 
        ref={svgRef} 
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
      />
      
      {hoveredCountry && (
        <div style={{ 
          position: 'absolute', 
          bottom: 24, 
          left: 24, 
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
        }}>
          <span style={{ fontSize: 24 }}>{hoveredCountry.flag || '📍'}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#283618' }}>{hoveredCountry.name}</div>
            <div style={{ fontSize: 11, color: '#bc6c25', fontWeight: 600 }}>
              {getTimingScore(hoveredCountry, tripParams.months).label} • {getTimingScore(hoveredCountry, tripParams.months).discount}% off
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
