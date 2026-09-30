'use strict';
'use client';

import React from 'react';
import { YUFO_BRAND } from '../lib/catalog';

interface CustomJewelrySectionProps {
  onInquire: (subject?: string) => void;
}

export const CustomJewelrySection: React.FC<CustomJewelrySectionProps> = ({ onInquire }) => {
  const steps = [
    {
      number: '01',
      title: '3D CAD & Digital Architecture',
      description:
        'Transform your vision into high-precision 3D computer-aided models and photorealistic renders, calibrated to exact millimeter dimensions before wax printing.',
    },
    {
      number: '02',
      title: 'Stone Sourcing & Precious Metal Casting',
      description:
        'Private allocation of VVS/VS diamonds or fancy colored gemstones, cast into pure 14K, 18K solid gold, or 950 platinum in our Manhattan workshop.',
    },
    {
      number: '03',
      title: 'Master Microscope Setting & Hallmarking',
      description:
        'Each stone is micro-paved by senior master setters under Leica magnification, followed by high-mirror polishing and official Yufo hallmark engraving.',
    },
  ];

  return (
    <section id="custom" className="py-28 bg-[#141515] border-t border-[#2A2C2E] relative overflow-hidden">
      {/* Background Video Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="relative rounded-2xl overflow-hidden border border-[#2A2C2E] bg-[#1A1C1D] shadow-2xl">
          {/* Cinematic Background Video */}
          <div className="relative h-[380px] md:h-[480px] w-full overflow-hidden">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-45 scale-105"
              src="/assets/media/custom_loop.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C1D] via-[#141515]/60 to-[#141515]/30" />

            {/* Floating content on video */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-14">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-[1px] bg-[#E3E3E3]" />
                <span className="text-xs uppercase tracking-[0.2em] text-[#E3E3E3] font-medium">
                  BESPOKE COMMISSION STUDIO
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif text-[#E3E3E3] font-light max-w-2xl leading-tight">
                Crafted to Your Exact Imagination
              </h2>
              <p className="mt-4 text-[#8E9093] text-sm md:text-base max-w-xl font-light leading-relaxed">
                From monumental custom pendants and diamond chains to one-of-one horological bezel customizations. If you can envision it, Yufo constructs it.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => onInquire('Custom Jewelry Commission - Bespoke Project')}
                  className="px-8 py-4 bg-[#E3E3E3] text-[#141515] hover:bg-white text-xs font-semibold tracking-wider uppercase rounded-full transition-all shadow-xl hover:scale-[1.02]"
                >
                  Start A Custom Project
                </button>
                <a
                  href={`https://wa.me/${YUFO_BRAND.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-8 py-4 bg-transparent border border-[#2A2C2E] hover:border-[#E3E3E3] text-[#E3E3E3] text-xs font-medium tracking-wider uppercase rounded-full transition-all"
                >
                  WhatsApp Atelier
                </a>
              </div>
            </div>
          </div>

          {/* 3 Step Workflow Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#2A2C2E] bg-[#1A1C1D] border-t border-[#2A2C2E]">
            {steps.map((step) => (
              <div key={step.number} className="p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <span className="text-2xl font-serif text-[#8E9093]/40 tracking-wider font-light block mb-4">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-serif text-[#E3E3E3] font-normal mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#8E9093] font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#2A2C2E]/60 flex items-center gap-2 text-[10px] text-[#8E9093] font-medium tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E3E3E3]/60" />
                  <span>NYC MASTER BENCH</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
