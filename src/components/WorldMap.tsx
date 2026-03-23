import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { CountryData } from '../types';
import { COUNTRIES_DATA } from '../data/countries';
import { motion, AnimatePresence } from 'motion/react';

interface WorldMapProps {
  onCountrySelect: (country: CountryData) => void;
  selectedCountryId?: string;
  hoveredCountryId?: string;
  onCountryHover: (id?: string) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ 
  onCountrySelect, 
  selectedCountryId,
  hoveredCountryId,
  onCountryHover
}) => {
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

    const countries = topojson.feature(topology, topology.objects.countries) as any;

    const g = svg.append('g');

    g.selectAll('path')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('class', (d: any) => {
        const id = d.id;
        const country = Object.values(COUNTRIES_DATA).find(c => c.id === id);
        const isSupported = !!country;
        const isSelected = selectedCountryId === id;
        const isHovered = hoveredCountryId === id;
        
        return `transition-all duration-300 cursor-pointer outline-none
          ${isSupported ? 'fill-zinc-200 stroke-white stroke-[0.5px] hover:fill-emerald-400' : 'fill-zinc-100 stroke-white stroke-[0.2px] pointer-events-none'}
          ${isSelected ? 'fill-emerald-600 stroke-emerald-800 stroke-[1px]' : ''}
          ${isHovered && isSupported ? 'fill-emerald-400' : ''}`;
      })
      .on('mouseenter', (event, d: any) => {
        const country = Object.values(COUNTRIES_DATA).find(c => c.id === d.id);
        if (country) onCountryHover(country.id);
      })
      .on('mouseleave', () => {
        onCountryHover(undefined);
      })
      .on('click', (event, d: any) => {
        const country = Object.values(COUNTRIES_DATA).find(c => c.id === d.id);
        if (country) onCountrySelect(country);
      });

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

  }, [topology, dimensions, selectedCountryId, hoveredCountryId]);

  return (
    <div className="w-full h-full relative bg-zinc-50/50 rounded-3xl overflow-hidden border border-black/5">
      <svg 
        ref={svgRef} 
        className="w-full h-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      />
      
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <div className="bg-white/80 backdrop-blur-md border border-black/5 p-3 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Supported</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-zinc-200 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
};
