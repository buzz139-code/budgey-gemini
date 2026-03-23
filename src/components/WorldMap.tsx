import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { type CountryData, type TripParams } from '../types';
import { COUNTRIES_DATA } from '../data/countries';

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
  const svgRef = useRef<SVGSVGElement>(null);
  const [topology, setTopology] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        const { width, height } = svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(data => setTopology(data));
  }, []);

  useEffect(() => {
    if (!topology || !svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const projection = d3.geoNaturalEarth1()
      .scale(dimensions.width / 5.5)
      .translate([dimensions.width / 2, dimensions.height / 1.8]);

    const path = d3.geoPath().projection(projection);

    const countriesGeo = topojson.feature(topology, topology.objects.countries) as any;

    const g = svg.append('g');

    g.selectAll('path')
      .data(countriesGeo.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', (d: any) => {
        const country = Object.values(COUNTRIES_DATA).find(c => c.id === d.id);
        if (!country) return '#f0f0f0';
        if (selectedCountry?.id === country.id) return '#bc6c25';
        if (hoveredCountry?.id === country.id) return '#dda15e';
        return '#e9edc9';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .style('cursor', (d: any) => Object.values(COUNTRIES_DATA).find(c => c.id === d.id) ? 'pointer' : 'default')
      .on('mouseenter', (event, d: any) => {
        const country = Object.values(COUNTRIES_DATA).find(c => c.id === d.id);
        if (country) onCountryHover(country);
      })
      .on('mouseleave', () => {
        onCountryHover(null);
      })
      .on('click', (event, d: any) => {
        const country = Object.values(COUNTRIES_DATA).find(c => c.id === d.id);
        if (country) onCountrySelect(country);
      });

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

  }, [topology, dimensions, selectedCountry, hoveredCountry]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#fefae0' }}>
      <svg 
        ref={svgRef} 
        style={{ width: '100%', height: '100%' }}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
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
