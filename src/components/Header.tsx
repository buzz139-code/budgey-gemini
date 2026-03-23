import React from 'react';

interface Props {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  baseCurrency: string;
  onCurrencyChange: (v: string) => void;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const CURRENCIES = ['CAD','USD','EUR','GBP','AUD','JPY','CNY','INR','BRL'];

export default function Header({ searchQuery, onSearchChange, baseCurrency, onCurrencyChange, onMenuClick }: Props) {
  return (
    <header style={{ height: 56, background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0, zIndex: 60 }}>
      <button onClick={onMenuClick} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#283618', borderRadius: 8 }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingRight: 12, borderRight: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#bc6c25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="9" rx="2" stroke="white" strokeWidth="1.5"/><path d="M1 6h12" stroke="white" strokeWidth="1.5"/><path d="M4 9.5h2M8 9.5h2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: '#283618' }}>Budgey</span>
      </div>
      <div style={{ flex: 1, position: 'relative', maxWidth: 480, margin: '0 auto' }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><circle cx="5.5" cy="5.5" r="4" stroke="#bbb" strokeWidth="1.3"/><path d="M9 9l2.5 2.5" stroke="#bbb" strokeWidth="1.3" strokeLinecap="round"/></svg>
        <input type="text" placeholder="Search destinations..." value={searchQuery} onChange={e => onSearchChange(e.target.value)}
          style={{ width: '100%', background: '#f5f0e8', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 24, height: 34, paddingLeft: 34, paddingRight: 12, fontSize: 13, color: '#283618', outline: 'none' }} />
      </div>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <select value={baseCurrency} onChange={e => onCurrencyChange(e.target.value)}
          style={{ appearance: 'none', background: 'rgba(188,108,37,0.1)', border: '1px solid rgba(188,108,37,0.2)', color: '#bc6c25', fontSize: 11, fontWeight: 700, borderRadius: 8, padding: '5px 24px 5px 10px', cursor: 'pointer', outline: 'none' }}>
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path d="M2 4l3 3 3-3" stroke="#bc6c25" strokeWidth="1.2" strokeLinecap="round"/></svg>
      </div>
    </header>
  );
}
