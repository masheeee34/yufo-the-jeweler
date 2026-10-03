'use client';

import React, { useEffect, useRef, useState } from 'react';

// Carte à gratter : une feuille argentée (canvas) qu'on efface au doigt ou à la souris pour révéler le contenu.
export function ScratchCard({ children, onRevealed, width = 300, height = 180 }: { children: React.ReactNode; onRevealed: () => void; width?: number; height?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const ratio = window.devicePixelRatio || 1;
    c.width = width * ratio;
    c.height = height * ratio;
    ctx.scale(ratio, ratio);
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, '#9ca3af');
    g.addColorStop(0.5, '#e5e7eb');
    g.addColorStop(1, '#6b7280');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    // Grain et texte sur la feuille
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.25})`;
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
    }
    ctx.fillStyle = 'rgba(17,17,17,0.75)';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', width / 2, height / 2 + 5);
  }, [width, height]);

  const scratch = (e: React.PointerEvent) => {
    const c = canvas.current;
    if (!c || !drawing.current || done) return;
    const r = c.getBoundingClientRect();
    const ctx = c.getContext('2d')!;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(e.clientX - r.left, e.clientY - r.top, 22, 0, Math.PI * 2);
    ctx.fill();
  };

  // Au-delà de ~55 % gratté, la feuille disparaît d'elle-même.
  const check = () => {
    const c = canvas.current;
    if (!c || done) return;
    const data = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    for (let i = 3; i < data.length; i += 32) if (data[i] === 0) clear++;
    if (clear / (data.length / 32) > 0.55) {
      setDone(true);
      onRevealed();
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden select-none" style={{ width, height }}>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      <canvas
        ref={canvas}
        className={`absolute inset-0 touch-none cursor-grab transition-opacity duration-700 ${done ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ width, height }}
        onPointerDown={(e) => { drawing.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); scratch(e); }}
        onPointerMove={scratch}
        onPointerUp={() => { drawing.current = false; check(); }}
        onPointerCancel={() => { drawing.current = false; }}
      />
    </div>
  );
}
