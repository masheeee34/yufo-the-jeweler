'use strict';
'use client';

import React, { useState } from 'react';

export const MosesBespokeSection: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [timeline, setTimeline] = useState('4-6 Weeks');
  const [jewelryStyle, setJewelryStyle] = useState('Custom Medallion & Pendant');
  const [diamondShape, setDiamondShape] = useState('Emerald');
  const [stoneOrigin, setStoneOrigin] = useState('Natural VVS Diamonds');
  const [metal, setMetal] = useState('18K White Gold');
  const [skeletonRig, setSkeletonRig] = useState('MP Male Ped Skeleton');
  const [budget, setBudget] = useState('$1,000 - $2,500');
  const [discordHandle, setDiscordHandle] = useState('');
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 7;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const DIAMOND_SHAPES = [
    {
      id: 'Round',
      name: 'Round Brilliant',
      desc: 'Maximum light dispersion',
      svg: (
        <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 48 48" strokeWidth={1.5}>
          <circle cx="24" cy="24" r="18" />
          <circle cx="24" cy="24" r="8" strokeDasharray="2 2" />
          <line x1="24" y1="6" x2="24" y2="42" strokeWidth={1} />
          <line x1="6" y1="24" x2="42" y2="24" strokeWidth={1} />
        </svg>
      ),
    },
    {
      id: 'Emerald',
      name: 'Emerald Cut',
      desc: 'Art Deco step-cut elegance',
      svg: (
        <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 48 48" strokeWidth={1.5}>
          <rect x="12" y="8" width="24" height="32" rx="4" />
          <rect x="16" y="12" width="16" height="24" rx="2" strokeWidth={1} />
          <line x1="12" y1="8" x2="16" y2="12" />
          <line x1="36" y1="8" x2="32" y2="12" />
          <line x1="12" y1="40" x2="16" y2="36" />
          <line x1="36" y1="40" x2="32" y2="36" />
        </svg>
      ),
    },
    {
      id: 'Baguette',
      name: 'Baguette',
      desc: 'Slender architectural facets',
      svg: (
        <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 48 48" strokeWidth={1.5}>
          <rect x="15" y="6" width="18" height="36" />
          <line x1="15" y1="12" x2="33" y2="12" strokeWidth={1} />
          <line x1="15" y1="36" x2="33" y2="36" strokeWidth={1} />
        </svg>
      ),
    },
    {
      id: 'Princess',
      name: 'Princess Cut',
      desc: 'Contemporary square brilliance',
      svg: (
        <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 48 48" strokeWidth={1.5}>
          <rect x="10" y="10" width="28" height="28" />
          <line x1="10" y1="10" x2="38" y2="38" strokeWidth={1} />
          <line x1="38" y1="10" x2="10" y2="38" strokeWidth={1} />
        </svg>
      ),
    },
    {
      id: 'Oval',
      name: 'Oval Cut',
      desc: 'Elongated feminine symmetry',
      svg: (
        <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 48 48" strokeWidth={1.5}>
          <ellipse cx="24" cy="24" rx="14" ry="19" />
          <ellipse cx="24" cy="24" rx="7" ry="10" strokeDasharray="2 2" strokeWidth={1} />
        </svg>
      ),
    },
    {
      id: 'Cushion',
      name: 'Cushion Cut',
      desc: 'Romantic rounded pillow angles',
      svg: (
        <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 48 48" strokeWidth={1.5}>
          <rect x="10" y="10" width="28" height="28" rx="8" />
          <rect x="16" y="16" width="16" height="16" rx="4" strokeWidth={1} />
        </svg>
      ),
    },
    {
      id: 'Pear',
      name: 'Pear / Teardrop',
      desc: 'Dramatic statement contour',
      svg: (
        <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 48 48" strokeWidth={1.5}>
          <path d="M24 7 C34 18 36 29 24 41 C12 29 14 18 24 7 Z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="bespoke-builder" className="py-24 px-6 sm:px-12 md:px-16 bg-[#050505] border-t border-white/10 select-none">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Title (Moses NYC Inspiration) */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-[11px] uppercase tracking-[0.35em] text-[#c9aa6c] font-medium">
            A CALM, GUIDED PROCESS
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-light text-white">
            Bespoke 1-of-1 Atelier
          </h2>
          <p className="text-xs sm:text-sm text-white/60 font-light max-w-xl mx-auto leading-relaxed">
            Step-by-step bespoke jewelry engineering for FiveM characters. Every detail will be sculpted and weighted to your character model.
          </p>
        </div>

        {/* Guided Wizard Card (Direct in page flow) */}
        <div className="bg-[#0b0b0e] border border-white/15 rounded-3xl p-6 sm:p-12 shadow-2xl">
          
          {/* Progress Header */}
          <div className="border-b border-white/10 pb-6 mb-8">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50 uppercase tracking-[0.25em] text-[11px] font-light">
                Atelier Configuration
              </span>
              <span className="text-white/80 font-serif tracking-widest text-xs">
                Step {currentStep} / {totalSteps}
              </span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#c9aa6c] to-white transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Content */}
          <div>
            {isSubmitted ? (
              <div className="py-12 text-center space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-[#c9aa6c]/20 border border-[#c9aa6c]/40 flex items-center justify-center text-3xl mx-auto text-[#c9aa6c]">
                  ✓
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif text-white">
                  Bespoke Commission Received
                </h3>
                <p className="text-sm text-white/70 max-w-md mx-auto font-light leading-relaxed">
                  Thank you, <span className="text-white font-medium">{clientName || 'Collector'}</span>. Your custom 1-of-1 request has been forwarded to the Yufo atelier queue.
                </p>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 max-w-md mx-auto text-left text-xs space-y-2 text-white/80">
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span className="text-white/50">Style:</span>
                    <span className="text-white font-medium">{jewelryStyle}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span className="text-white/50">Diamond Cut:</span>
                    <span className="text-white font-medium">{diamondShape}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span className="text-white/50">Materials:</span>
                    <span className="text-white font-medium">{metal} · {stoneOrigin}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span className="text-white/50">Discord Handle:</span>
                    <span className="text-[#c9aa6c] font-medium">{discordHandle || 'Provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Target Pacing:</span>
                    <span className="text-white font-medium">{timeline}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="https://discord.gg"
                    target="_blank"
                    rel="noreferrer"
                    className="h-12 px-8 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-lg flex items-center justify-center"
                  >
                    Open Discord VIP Ticket
                  </a>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setCurrentStep(1);
                    }}
                    className="h-12 px-8 rounded-full border border-white/30 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/10 transition-all"
                  >
                    Configure Another Piece
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* STEP 1: TIMELINE */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif text-white">
                        When do you need the piece?
                      </h3>
                      <p className="text-xs text-white/50 mt-1 font-light">
                        This helps us schedule 3D sculpting hours and bone weighting priority.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { id: 'No Rush', label: 'No Rush', sub: "I'm flexible with timeline" },
                        { id: '4-6 Weeks', label: '4-6 Weeks', sub: 'Standard atelier pacing' },
                        { id: 'Soon', label: 'Soon (2-3 Weeks)', sub: 'Expedited VIP priority slot' },
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => setTimeline(opt.id)}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                            timeline === opt.id
                              ? 'bg-white/10 border-white text-white shadow-lg'
                              : 'bg-white/[0.03] border-white/15 text-white/80 hover:border-white/40'
                          }`}
                        >
                          <div className="text-sm font-medium text-white mb-1">{opt.label}</div>
                          <div className="text-xs text-white/50 font-light">{opt.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: JEWELRY STYLE */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif text-white">
                        Which style feels like the right starting point?
                      </h3>
                      <p className="text-xs text-white/50 mt-1 font-light">
                        Every detail will be sculpted to your exact server and aesthetic specifications.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'Custom Medallion & Pendant', title: 'Medallion & 3D Pendant', sub: 'Crew insignia, portrait medallions, kinetic spinning pieces' },
                        { id: 'Diamond Tennis & Cuban Chain', title: 'Diamond Chain & Choker', sub: 'Heavyweight Miami Cubans, 5mm tennis collars, baguette chains' },
                        { id: 'Ring & Eternity Band', title: 'Ring & Sovereign Signet', sub: 'Full perimeter baguettes, pavé signet face, pinky rings' },
                        { id: 'Watch Bustdown Rig', title: 'Timepiece Bustdown & Bezel', sub: 'Custom pavé watches rigged for FiveM wrist positions' },
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => setJewelryStyle(opt.id)}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                            jewelryStyle === opt.id
                              ? 'bg-white/10 border-white text-white shadow-lg'
                              : 'bg-white/[0.03] border-white/15 text-white/80 hover:border-white/40'
                          }`}
                        >
                          <div className="text-sm font-medium text-white mb-1">{opt.title}</div>
                          <div className="text-xs text-white/50 font-light leading-relaxed">{opt.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: DIAMOND CUTS */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif text-white">
                        Which diamond cut do you prefer?
                      </h3>
                      <p className="text-xs text-white/50 mt-1 font-light">
                        Facet geometry determines how light bounces inside the GTA V rendering engine.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {DIAMOND_SHAPES.map((shape) => (
                        <div
                          key={shape.id}
                          onClick={() => setDiamondShape(shape.id)}
                          className={`p-4 rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                            diamondShape === shape.id
                              ? 'bg-white/10 border-white text-white shadow-lg'
                              : 'bg-white/[0.03] border-white/15 text-white/70 hover:border-white/40'
                          }`}
                        >
                          <div className="mb-2.5 opacity-90">{shape.svg}</div>
                          <div className="text-xs font-semibold text-white">{shape.name}</div>
                          <div className="text-[10px] text-white/50 mt-1 font-light">{shape.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: METALS & STONES */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif text-white">
                        Select metals & stone specifications
                      </h3>
                      <p className="text-xs text-white/50 mt-1 font-light">
                        Choose your precious metal finish and gemstone reflection quality.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Precious Metal</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['18K White Gold', '18K Yellow Gold', '18K Rose Gold', 'Solid Platinum 950'].map((m) => (
                          <div
                            key={m}
                            onClick={() => setMetal(m)}
                            className={`p-3.5 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                              metal === m
                                ? 'bg-white/15 border-white text-white'
                                : 'bg-white/[0.03] border-white/15 text-white/60 hover:border-white/30'
                            }`}
                          >
                            {m}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Stone Fire Quality</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'Natural VVS Diamonds', title: 'Natural VVS Diamonds', sub: 'Maximum luxury prestige' },
                          { id: 'Moissanite Fire', title: 'Moissanite Super-Fire', sub: 'Extreme dispersion & glow' },
                          { id: 'Open to Guidance', title: 'Open to Guidance', sub: 'Let Yufo recommend best fit' },
                        ].map((s) => (
                          <div
                            key={s.id}
                            onClick={() => setStoneOrigin(s.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              stoneOrigin === s.id
                                ? 'bg-white/15 border-white text-white'
                                : 'bg-white/[0.03] border-white/15 text-white/60 hover:border-white/30'
                            }`}
                          >
                            <div className="text-xs font-medium text-white">{s.title}</div>
                            <div className="text-[10px] text-white/40 mt-0.5">{s.sub}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: SKELETAL RIGGING */}
                {currentStep === 5 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif text-white">
                        FiveM Skeletal Rigging Calibration
                      </h3>
                      <p className="text-xs text-white/50 mt-1 font-light">
                        Yufo pieces are weighted to character bones to eliminate body clipping during animations.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'MP Male Ped Skeleton', title: 'MP Male Skeleton', desc: 'Calibrated for mp_m_freemode_01 models' },
                        { id: 'MP Female Ped Skeleton', title: 'MP Female Skeleton', desc: 'Calibrated for mp_f_freemode_01 models' },
                        { id: 'Dual Rigged (Both)', title: 'Dual Gender Package', desc: 'Includes separate male and female .ydr assets' },
                        { id: 'Custom Ped / Server Specific', title: 'Custom Server Skeletal Fit', desc: 'Tailored for custom clothes or specific body shapes' },
                      ].map((rig) => (
                        <div
                          key={rig.id}
                          onClick={() => setSkeletonRig(rig.id)}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                            skeletonRig === rig.id
                              ? 'bg-white/10 border-white text-white'
                              : 'bg-white/[0.03] border-white/15 text-white/70 hover:border-white/30'
                          }`}
                        >
                          <div className="text-sm font-medium text-white mb-1">{rig.title}</div>
                          <div className="text-xs text-white/50 font-light">{rig.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 6: BUDGET */}
                {currentStep === 6 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif text-white">
                        Choose a starting point
                      </h3>
                      <p className="text-xs text-white/50 mt-1 font-light">
                        Everything can be refined during private consultation.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'Under $1,000', label: 'Under $1,000', sub: 'Entry Atelier' },
                        { id: '$1,000 - $2,500', label: '$1,000 - $2,500', sub: 'High Jewelry' },
                        { id: '$2,500 - $5,000+', label: '$2,500 - $5,000+', sub: 'Heavy Bustdown' },
                        { id: 'Open to guidance', label: 'Guidance', sub: 'Let us recommend' },
                      ].map((b) => (
                        <div
                          key={b.id}
                          onClick={() => setBudget(b.id)}
                          className={`p-5 rounded-2xl border text-center cursor-pointer transition-all ${
                            budget === b.id
                              ? 'bg-white/10 border-white text-white shadow-lg'
                              : 'bg-white/[0.03] border-white/15 text-white/70 hover:border-white/30'
                          }`}
                        >
                          <div className="text-sm font-semibold text-white mb-1">{b.label}</div>
                          <div className="text-[10px] text-white/50 font-light">{b.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 7: CONTACT & UPLOAD */}
                {currentStep === 7 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif text-white">
                        How can we reach you?
                      </h3>
                      <p className="text-xs text-white/50 mt-1 font-light">
                        The Yufo concierge will contact you directly to begin your private commission.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-medium tracking-wide text-white/70 mb-1.5">
                          Discord Handle <span className="text-[#c9aa6c]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={discordHandle}
                          onChange={(e) => setDiscordHandle(e.target.value)}
                          placeholder="e.g. username#0000 or Discord ID"
                          className="w-full px-4 py-3 bg-white/[0.04] border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 focus:bg-white/[0.07] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium tracking-wide text-white/70 mb-1.5">
                          Your Name / FiveM Alias
                        </label>
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="In-Game Name or Server"
                          className="w-full px-4 py-3 bg-white/[0.04] border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 focus:bg-white/[0.07] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium tracking-wide text-white/70 mb-1.5">
                          Upload Inspiration / Crew Logo / Photo (Optional)
                        </label>
                        <div className="border border-dashed border-white/20 hover:border-white/40 rounded-xl p-4 text-center cursor-pointer bg-white/[0.02] transition-colors relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setFileName(e.target.files[0].name);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <div className="text-xs text-white/60">
                            {fileName ? (
                              <span className="text-white font-medium">Selected: {fileName}</span>
                            ) : (
                              <span>Tap or drag & drop images (Crew logo, reference sketch, portrait)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium tracking-wide text-white/70 mb-1.5">
                          Custom Design Notes
                        </label>
                        <textarea
                          rows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Specific engravings, chain length, spinning bearing requests..."
                          className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 focus:bg-white/[0.07] resize-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="border-t border-white/10 pt-6 mt-8 flex items-center justify-between">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className={`h-11 px-6 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all ${
                      currentStep === 1
                        ? 'opacity-0 pointer-events-none'
                        : 'border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    Back
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentStep === 7 && !discordHandle.trim()}
                    className="h-11 px-8 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-lg hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {currentStep === totalSteps ? 'Submit Commission' : 'Continue →'}
                  </button>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
