'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';

type Box = { left: number; top: number; width: number; height: number };

// Sélecteur façon onglets (style coss.com/ui Tabs) : liste grise, fond plus clair sous l'option choisie.
// En choix unique, le fond glisse d'une option à l'autre ; en choix multiple, chaque option choisie a le sien.
export function TabSelect({ options, value, onChange, multiple, label }: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  multiple?: boolean;
  label?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Record<string, Box>>({});

  useLayoutEffect(() => {
    const measure = () => {
      const next: Record<string, Box> = {};
      wrap.current?.querySelectorAll<HTMLButtonElement>('[data-value]').forEach((el) => {
        next[el.dataset.value!] = { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight };
      });
      setBoxes(next);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [options]);

  const toggle = (o: string) => {
    if (!multiple) return onChange([o]);
    if (value.includes(o)) {
      if (value.length > 1) onChange(value.filter((x) => x !== o)); // toujours au moins une réponse
    } else onChange(options.filter((x) => x === o || value.includes(x)));
  };

  // Choix unique : un seul fond (clé fixe) qui se déplace. Choix multiple : un fond par option.
  const indicators = multiple ? value.map((v) => ({ key: v, box: boxes[v] })) : [{ key: 'one', box: boxes[value[0]] }];

  return (
    <div
      ref={wrap}
      role={multiple ? 'group' : 'radiogroup'}
      aria-label={label}
      className="tab-select relative z-0 inline-flex flex-wrap items-center gap-0.5 p-0.5 rounded-lg bg-white/[0.07] max-w-full"
    >
      {indicators.map(({ key, box }) =>
        box ? (
          <span
            key={key}
            aria-hidden="true"
            className={`absolute -z-10 rounded-md bg-white/[0.14] shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] transition-[left,top,width,height] duration-200 ease-in-out ${multiple ? 'tab-select-pop' : ''}`}
            style={box}
          />
        ) : null
      )}
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            role={multiple ? 'checkbox' : 'radio'}
            aria-checked={on}
            data-value={o}
            onClick={() => toggle(o)}
            className={`relative h-8 px-3 rounded-md text-sm font-medium whitespace-nowrap outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white/40 ${on ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
