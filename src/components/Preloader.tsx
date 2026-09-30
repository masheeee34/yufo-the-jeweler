'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [stage, setStage] = useState<'loading' | 'exit' | 'done'>('loading');

  useEffect(() => {
    // Check if already viewed in session
    if (typeof window !== 'undefined' && sessionStorage.getItem('yufo_loaded')) {
      setStage('done');
      if (onComplete) onComplete();
      return;
    }

    const exitTimer = setTimeout(() => {
      setStage('exit');
    }, 2200);

    const doneTimer = setTimeout(() => {
      setStage('done');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('yufo_loaded', 'true');
      }
      if (onComplete) onComplete();
    }, 2800);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (stage === 'done') return null;

  return (
    <div
      onClick={() => {
        setStage('exit');
        setTimeout(() => {
          setStage('done');
          if (onComplete) onComplete();
        }, 400);
      }}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#141515] text-[#E3E3E3] transition-all duration-700 ease-out cursor-pointer ${
        stage === 'exit' ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
    >
      {/* Shockwave expanding ring */}
      {stage === 'exit' && (
        <div className="absolute w-32 h-32 rounded-full border-2 border-[#E3E3E3] animate-ping opacity-75 pointer-events-none" />
      )}

      {/* Center loader emblem */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-[#E3E3E3]/10 blur-2xl animate-pulse" />

        {/* Rotating SVG Ring */}
        <svg className="absolute inset-0 w-full h-full animate-[spin_6s_linear_infinite]" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#E3E3E3"
            strokeWidth="1.2"
            strokeDasharray="140 140"
            strokeLinecap="round"
            className="opacity-70"
          />
        </svg>

        {/* Secondary counter-rotating dashed ring */}
        <svg className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] animate-[spin_10s_linear_infinite_reverse]" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#E3E3E3"
            strokeWidth="0.8"
            strokeDasharray="20 40"
            strokeLinecap="round"
            className="opacity-30"
          />
        </svg>

        {/* YUFO Logo Center */}
        <div className="relative w-16 h-16 transition-transform duration-700 hover:scale-105">
          <Image
            src="/assets/brand/yufo_icon_black.png"
            alt="YUFO The Jewelry"
            fill
            className="object-contain filter drop-shadow-[0_0_15px_rgba(227,227,227,0.3)]"
            priority
          />
        </div>
      </div>

      {/* Brand Typography */}
      <div className="mt-8 flex flex-col items-center space-y-2 select-none">
        <h1 className="flex items-center gap-3 tracking-[0.45em] text-sm md:text-base font-light uppercase text-[#E3E3E3]">
          <span className="animate-fade-in [animation-delay:200ms]">Y</span>
          <span className="animate-fade-in [animation-delay:400ms]">U</span>
          <span className="animate-fade-in [animation-delay:600ms]">F</span>
          <span className="animate-fade-in [animation-delay:800ms]">O</span>
        </h1>
        <span className="text-[10px] tracking-[0.6em] font-extralight text-[#9A9B9E] uppercase pl-1 animate-fade-in [animation-delay:1100ms]">
          THE JEWELRY · NEW YORK
        </span>
      </div>

      <p className="absolute bottom-8 text-[9px] uppercase tracking-[0.3em] text-[#707174]">
        Cliquer pour passer
      </p>
    </div>
  );
}
