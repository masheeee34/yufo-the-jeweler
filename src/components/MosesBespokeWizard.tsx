'use client';

import React, { useState } from 'react';
import { IconX, IconCheck, IconArrowRight, IconArrowLeft, IconSparkles } from '@tabler/icons-react';

interface MosesBespokeWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MosesBespokeWizard: React.FC<MosesBespokeWizardProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [timeline, setTimeline] = useState('Standard (3-4 Weeks)');
  const [jewelryStyle, setJewelryStyle] = useState('Custom 3D Medallion & Pendant');
  const [diamondCut, setDiamondCut] = useState('Emerald Cut');
  const [metal, setMetal] = useState('18K White Gold');
  const [skeletonRig, setSkeletonRig] = useState('MP Male Skeleton (mp_m_freemode_01)');
  const [budget, setBudget] = useState('$1,500 - $3,500');
  const [discordHandle, setDiscordHandle] = useState('');
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

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

  const STYLES = [
    { id: 'Custom 3D Medallion & Pendant', desc: 'Bespoke sculpted bust or logo medallion' },
    { id: 'Cuban Link Chain & Choker', desc: 'Micro-pave iced Cuban, Tennis or Hermes link' },
    { id: 'Iced-Out Timepiece', desc: 'Fluted bezel, custom dial & full iced casing' },
    { id: 'Championship Ring', desc: 'High-relief 3D crew crest with side stones' },
    { id: 'Bespoke Grillz & Teeth Caps', desc: 'Custom diamond cuts rigged to ped jaw bones' },
  ];

  const DIAMOND_CUTS = [
    { id: 'Emerald Cut', desc: 'Step-cut rectangular facets with mirror reflections' },
    { id: 'Round Brilliant', desc: '57-facet algorithmic pavé setting' },
    { id: 'Baguette Cut', desc: 'Linear channel settings with clean edges' },
    { id: 'Cushion Cut', desc: 'Pillow geometry with deep fire dispersion' },
    { id: 'Princess Cut', desc: 'Pyramidal profile with maximum specular flash' },
  ];

  const METALS = [
    { id: '18K White Gold', desc: 'Rhodium electroplated lustrous finish' },
    { id: '18K Yellow Gold', desc: 'Classic sovereign rich gold tone' },
    { id: '18K Rose Gold', desc: 'Copper alloy high-fashion rose tint' },
    { id: 'Platinum 950', desc: 'Ultra-dense pure cold platinum' },
    { id: 'Two-Tone Combination', desc: 'Dual metal contrast settings' },
  ];

  const RIGS = [
    { id: 'MP Male Skeleton (mp_m_freemode_01)', desc: 'Primary male multiplayer ped skeleton' },
    { id: 'MP Female Skeleton (mp_f_freemode_01)', desc: 'Weighted specifically for female collars & necks' },
    { id: 'Universal Dual-Rig (Both)', desc: 'Fitted drawable assets for both male & female' },
    { id: 'Static World Prop (.YDR)', desc: 'Interactable display piece for MLO interiors' },
  ];

  const BUDGETS = [
    { id: '$1,500 - $3,500', desc: 'Private collector tier · Single piece release' },
    { id: '$3,500 - $7,500', desc: 'Masterpiece tier · Complex multi-tier bust' },
    { id: '$7,500 - $15,000', desc: 'Faction package · Full crew collection with multiple variants' },
    { id: '$15,000+', desc: 'Executive atelier retainer · Unlimited custom iterations' },
  ];

  const TIMELINES = [
    { id: 'Express Atelier (72 Hours)', desc: 'Priority queue · Immediate 3D sculpt & bone rig' },
    { id: 'Standard (1-2 Weeks)', desc: 'Full custom iteration, in-game preview & testing' },
    { id: 'Extended Project (3-4 Weeks)', desc: 'Full server brand rollout with multiple items' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md select-none font-sans">
      <div className="relative w-full max-w-3xl bg-[#070709] border border-white/20 p-6 sm:p-10 shadow-[0_25px_100px_rgba(0,0,0,0.95)] flex flex-col min-h-[560px] max-h-[92vh] justify-between overflow-hidden text-white">
        
        {/* Header Bar */}
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#c9aa6c]">
                  [ 1-OF-1 BESPOKE ATELIER ]
                </span>
                <span className="text-zinc-600 font-mono text-[10px]">·</span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                  STEP 0{currentStep} / 0{totalSteps}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif uppercase tracking-wide text-white">
                Bespoke Commission Dossier
              </h2>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 border border-white/10 hover:border-white/40 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Wizard"
            >
              <IconX size={15} />
            </button>
          </div>

          {/* Hairline Step Progress Bar */}
          <div className="w-full h-[2px] bg-white/[0.08] mt-4 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="py-6 flex-1 overflow-y-auto">
          {isSubmitted ? (
            /* Success State */
            <div className="py-12 text-center space-y-4 font-mono">
              <div className="w-14 h-14 border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
                <IconCheck size={24} />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wider text-white">
                Bespoke Dossier Logged
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed font-light">
                Your specifications for <span className="text-white font-medium">{clientName || discordHandle}</span> have been delivered to our master 3D jewelers. Connect to our VIP Discord channel to review initial 3D renders.
              </p>

              <div className="p-4 bg-[#0a0a0d] border border-white/10 max-w-md mx-auto text-left text-xs space-y-1.5 font-mono">
                <div className="text-[9px] uppercase tracking-widest text-zinc-500">Dossier Summary:</div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Style:</span>
                  <span>{jewelryStyle}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Metal:</span>
                  <span>{metal}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Skeleton:</span>
                  <span className="truncate max-w-[200px]">{skeletonRig}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Budget:</span>
                  <span>{budget}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noreferrer"
                  className="h-11 px-8 bg-white text-black text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
                >
                  <span>Open Discord Channel</span>
                  <IconArrowRight size={13} />
                </a>
                <button
                  onClick={onClose}
                  className="h-11 px-6 border border-white/20 text-white text-[10px] font-mono uppercase tracking-[0.2em] hover:border-white transition-all cursor-pointer"
                >
                  Return to Atelier
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* STEP 1: STYLE */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500">
                      Phase 01 // Categorization
                    </span>
                    <h3 className="text-lg font-serif uppercase tracking-wide text-white">
                      Select Jewelry Architecture
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    {STYLES.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setJewelryStyle(item.id)}
                        className={`p-4 border cursor-pointer transition-all ${
                          jewelryStyle === item.id
                            ? 'border-white bg-white/[0.05] text-white'
                            : 'border-white/10 bg-transparent text-zinc-400 hover:border-white/30'
                        }`}
                      >
                        <div className="text-xs font-semibold uppercase tracking-wider text-white">
                          {item.id}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1 font-light leading-relaxed">
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: DIAMOND CUT */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500">
                      Phase 02 // Lapidary Faceting
                    </span>
                    <h3 className="text-lg font-serif uppercase tracking-wide text-white">
                      Choose Diamond Cut &amp; Pavé Setting
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    {DIAMOND_CUTS.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setDiamondCut(item.id)}
                        className={`p-4 border cursor-pointer transition-all ${
                          diamondCut === item.id
                            ? 'border-white bg-white/[0.05] text-white'
                            : 'border-white/10 bg-transparent text-zinc-400 hover:border-white/30'
                        }`}
                      >
                        <div className="text-xs font-semibold uppercase tracking-wider text-white">
                          {item.id}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1 font-light leading-relaxed">
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: METAL */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500">
                      Phase 03 // Metallurgy
                    </span>
                    <h3 className="text-lg font-serif uppercase tracking-wide text-white">
                      Select Precious Metal &amp; Alloy
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    {METALS.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setMetal(item.id)}
                        className={`p-4 border cursor-pointer transition-all ${
                          metal === item.id
                            ? 'border-white bg-white/[0.05] text-white'
                            : 'border-white/10 bg-transparent text-zinc-400 hover:border-white/30'
                        }`}
                      >
                        <div className="text-xs font-semibold uppercase tracking-wider text-white">
                          {item.id}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1 font-light leading-relaxed">
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: SKELETON RIGGING */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500">
                      Phase 04 // 3D Bone Rigging
                    </span>
                    <h3 className="text-lg font-serif uppercase tracking-wide text-white">
                      Target Ped Bone Weighting
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    {RIGS.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSkeletonRig(item.id)}
                        className={`p-4 border cursor-pointer transition-all ${
                          skeletonRig === item.id
                            ? 'border-white bg-white/[0.05] text-white'
                            : 'border-white/10 bg-transparent text-zinc-400 hover:border-white/30'
                        }`}
                      >
                        <div className="text-xs font-semibold uppercase tracking-wider text-white">
                          {item.id}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1 font-light leading-relaxed">
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: BUDGET */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500">
                      Phase 05 // Scope &amp; Scale
                    </span>
                    <h3 className="text-lg font-serif uppercase tracking-wide text-white">
                      Target Project Allocation
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    {BUDGETS.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setBudget(item.id)}
                        className={`p-4 border cursor-pointer transition-all ${
                          budget === item.id
                            ? 'border-white bg-white/[0.05] text-white'
                            : 'border-white/10 bg-transparent text-zinc-400 hover:border-white/30'
                        }`}
                      >
                        <div className="text-xs font-semibold uppercase tracking-wider text-white">
                          {item.id}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1 font-light leading-relaxed">
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: TIMELINE */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500">
                      Phase 06 // Production Velocity
                    </span>
                    <h3 className="text-lg font-serif uppercase tracking-wide text-white">
                      Desired Production Window
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3 font-mono">
                    {TIMELINES.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setTimeline(item.id)}
                        className={`p-4 border cursor-pointer transition-all ${
                          timeline === item.id
                            ? 'border-white bg-white/[0.05] text-white'
                            : 'border-white/10 bg-transparent text-zinc-400 hover:border-white/30'
                        }`}
                      >
                        <div className="text-xs font-semibold uppercase tracking-wider text-white">
                          {item.id}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1 font-light leading-relaxed">
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7: CLIENT DOSSIER */}
              {currentStep === 7 && (
                <div className="space-y-4 font-mono">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500">
                      Phase 07 // Final Identification
                    </span>
                    <h3 className="text-lg font-serif uppercase tracking-wide text-white">
                      Client Contact &amp; Reference Assets
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.25em] text-zinc-400 mb-1">
                        Client Handle or Alias *
                      </label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Character name or Steam alias"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.25em] text-zinc-400 mb-1">
                        Discord Handle or CFX ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={discordHandle}
                        onChange={(e) => setDiscordHandle(e.target.value)}
                        placeholder="username#0000"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.25em] text-zinc-400 mb-1">
                        Reference Image Links or Conceptual Notes
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Imgur/Discord links, real jewelry inspirations, gang insignias, target server..."
                        className="w-full p-3 bg-black/60 border border-white/15 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        {!isSubmitted && (
          <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="h-10 px-5 border border-white/20 text-zinc-400 hover:text-white hover:border-white text-[9px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer"
              >
                <IconArrowLeft size={12} />
                <span>Back</span>
              </button>
            ) : <div />}

            <button
              onClick={handleNext}
              disabled={currentStep === 7 && (!discordHandle.trim() || !clientName.trim())}
              className="h-10 px-7 bg-white text-black hover:bg-neutral-200 text-[10px] font-bold uppercase tracking-[0.25em] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{currentStep === totalSteps ? 'SUBMIT DOSSIER' : 'CONTINUE'}</span>
              <IconArrowRight size={13} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
