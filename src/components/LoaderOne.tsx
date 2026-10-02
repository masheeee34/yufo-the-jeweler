import React from 'react';

// Indicateur de chargement : trois billes argentées qui rebondissent l'une après l'autre.
export const LoaderOne: React.FC<{ size?: number; label?: string; className?: string }> = ({ size = 16, label, className = '' }) => (
  <div className={`flex flex-col items-center gap-4 ${className}`} role="status" aria-live="polite">
    <div className="flex items-center gap-2" style={{ height: size * 2 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="loader-one-dot rounded-full border border-neutral-300 bg-gradient-to-b from-neutral-400 to-neutral-300"
          style={{ width: size, height: size, animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
    {label ? <span className="text-xs text-zinc-500">{label}</span> : <span className="sr-only">Loading</span>}
  </div>
);
