'use client';

import React from 'react';

// Miniatures des images jointes à un message (clic : image en grand dans un nouvel onglet).
export const MessageAttachments: React.FC<{ names?: string[]; className?: string }> = ({ names, className = '' }) => {
  if (!names || names.length === 0) return null;
  return (
    <div className={`grid grid-cols-3 gap-1.5 mt-2 max-w-[260px] ${className}`}>
      {names.map((n) => (
        <a
          key={n}
          href={`/api/uploads/${n}`}
          target="_blank"
          rel="noreferrer"
          className="block aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/40 hover:opacity-80 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/uploads/${n}`} alt="Reference" loading="lazy" className="w-full h-full object-cover" />
        </a>
      ))}
    </div>
  );
};
