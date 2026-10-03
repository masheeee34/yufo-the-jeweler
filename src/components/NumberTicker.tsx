'use client';

import React from 'react';

// Compteur à chiffres qui roulent : chaque chiffre glisse vers sa nouvelle valeur, avec un léger décalage et un flou.
function Digit({ d, index }: { d: number; index: number }) {
  return (
    <span className="ticker-digit relative inline-block h-[1em] overflow-hidden align-baseline" style={{ width: '0.62em' }}>
      <span
        className="ticker-strip absolute left-0 top-0 flex flex-col"
        style={{ transform: `translateY(-${d * 10}%)`, transitionDelay: `${index * 45}ms` }}
      >
        {Array.from({ length: 10 }).map((_, n) => (
          <span key={n} className="h-[1em] leading-none text-center" style={{ width: '0.62em' }}>{n}</span>
        ))}
      </span>
    </span>
  );
}

export function NumberTicker({ value, prefix = '', decimals = 2, className = '' }: { value: number; prefix?: string; decimals?: number; className?: string }) {
  const text = value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const chars = text.split('');
  return (
    <span className={`inline-flex items-baseline tabular-nums leading-none ${className}`} aria-label={`${prefix}${text}`}>
      {prefix && <span aria-hidden="true">{prefix}</span>}
      {chars.map((c, i) => {
        // Les chiffres sont indexés depuis la droite pour que les unités bougent en premier.
        if (/\d/.test(c)) {
          const idx = chars.slice(i + 1).filter((x) => /\d/.test(x)).length;
          return <Digit key={`${chars.length - i}-d`} d={Number(c)} index={idx} />;
        }
        return <span key={`${chars.length - i}-${c}`} aria-hidden="true">{c}</span>;
      })}
    </span>
  );
}
