'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';

// Boutons segmentés : un fond blanc glisse sous l'option choisie.
export function SegmentedControl({ options, value, onChange, label }: { options: string[]; value: string; onChange: (v: string) => void; label?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ left: 0, top: 0, width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = wrap.current?.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(value)}"]`);
    if (el) setPill({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight });
  }, [value, options]);

  return (
    <div ref={wrap} role="radiogroup" aria-label={label} className="relative inline-flex flex-wrap gap-1 p-1 rounded-2xl bg-white/[0.05] border border-white/10 max-w-full">
      <span
        aria-hidden="true"
        className="absolute rounded-xl bg-white shadow-[0_4px_18px_rgba(255,255,255,0.15)] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{ left: pill.left, top: pill.top, width: pill.width, height: pill.height, opacity: pill.width ? 1 : 0 }}
      />
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          data-value={o}
          onClick={() => onChange(o)}
          className={`relative z-10 h-9 px-4 rounded-xl text-xs font-medium transition-colors duration-300 ${value === o ? 'text-zinc-950' : 'text-zinc-300 hover:text-white'}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
