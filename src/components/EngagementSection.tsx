'use strict';
'use client';

import React from 'react';

interface EngagementSectionProps {
  onInquire: (subject?: string) => void;
}

const PIPELINE_PHASES = [
  {
    phase: '01',
    title: '2D BLUEPRINT & VOLUMETRY',
    subtitle: 'Concept Vectorization & Gemological Mapping',
    description: 'We translate your 2D logo, sketch, or concept into precise jewelry CAD engineering. Carat weight, metal thickness (14K/18K/Platinum), and prong geometries are calculated before sculpting.',
  },
  {
    phase: '02',
    title: '3D HIGH-POLY SCULPT & PAVÉ',
    subtitle: 'Organic ZBrush Modeling & Grain-by-Grain Setting',
    description: 'Every diamond is placed by hand in 3D with microscopic pavé prongs. Facet angles are aligned to catch in-game GTA V sunlight, creating authentic diamond fire and sparkle reflections.',
  },
  {
    phase: '03',
    title: 'SKELETAL RIGGING & FIVEM STREAM',
    subtitle: 'Bone Hierarchy Weighting & Zero-Clipping Assurance',
    description: 'The piece is weighted directly to the MP Ped skeleton (clavicles, spine, neck, or fingers). Exported with custom normal maps, specular shaders, and LOD0-LOD2 levels ready for server streaming.',
  },
];

export const EngagementSection: React.FC<EngagementSectionProps> = ({ onInquire }) => {
  return (
    <section id="bespoke" className="py-24 px-6 sm:px-12 md:px-16 bg-[#050505] border-t border-white/[0.06]">
      <div className="max-w-[1920px] mx-auto">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <span className="text-xs uppercase tracking-[0.2em] text-white/60 font-medium">
                The Atelier · Commission Pipeline
              </span>
            </div>
            <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] uppercase">
              The 1-of-1 Bespoke Pipeline
            </h2>
            <p className="text-white/60 text-sm sm:text-base font-serif italic mt-2">
              A private bespoke commission process sculpted from your concept to flawless in-game FiveM rigging.
            </p>
          </div>

          <button
            onClick={() => onInquire('Bespoke 1-of-1 Commission')}
            className="inline-flex items-center justify-center h-12 px-8 text-xs font-semibold uppercase tracking-wider bg-white text-black rounded-full hover:bg-neutral-200 transition-all shadow-lg hover:scale-[1.02] whitespace-nowrap self-start md:self-auto"
          >
            Start Commission
          </button>
        </div>

        {/* 3-Column Architectural Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          {PIPELINE_PHASES.map((item, idx) => (
            <div
              key={item.phase}
              className="flex flex-col justify-between border-t border-white/10 pt-8 group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl sm:text-4xl font-light text-white/25 group-hover:text-white/60 transition-colors">
                    {item.phase}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                    Phase 0{idx + 1}
                  </span>
                </div>

                <h3 className="text-white text-lg sm:text-xl font-normal tracking-tight uppercase">
                  {item.title}
                </h3>

                <p className="text-white/70 text-xs sm:text-sm font-serif italic mt-2">
                  {item.subtitle}
                </p>

                <p className="text-white/50 text-xs sm:text-sm font-light leading-relaxed mt-4">
                  {item.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.04]">
                <span className="text-xs font-medium text-white/40 tracking-wider">
                  Yufo Standard · Certified
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
