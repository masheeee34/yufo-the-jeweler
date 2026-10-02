'use strict';
'use client';

import React, { useState } from 'react';
import { SiteFooter } from '../../components/SiteFooter';
import Image from 'next/image';
import Link from 'next/link';
import { CartProvider, useCart } from '../../lib/cartContext';
import { AuthProvider } from '../../lib/authContext';
import { CartDrawer } from '../../components/CartDrawer';
import { VaultCatalogModal } from '../../components/VaultCatalogModal';
import { InquiryModal } from '../../components/InquiryModal';
import { ProductCategory } from '../../lib/products';

function BespokePageContent() {
  const { totalItems, setIsCartOpen } = useCart();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogCategory, setCatalogCategory] = useState<ProductCategory>('all');
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquirySubject, setInquirySubject] = useState('');

  // 7-Step Guided Moses NYC-Style Configurator
  const [currentStep, setCurrentStep] = useState(1);
  const [timeline, setTimeline] = useState('4-6 Weeks');
  const [jewelryStyle, setJewelryStyle] = useState('Custom Medallion & 3D Pendant');
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

  const openInquiry = (subject: string) => {
    setInquirySubject(subject);
    setIsInquiryOpen(true);
  };

  const openCatalog = (category: ProductCategory = 'all') => {
    setCatalogCategory(category);
    setIsCatalogOpen(true);
  };

  const DIAMOND_SHAPES = [
    {
      id: 'Round',
      name: 'Round Brilliant',
      desc: 'Max light dispersion',
      svg: (
        <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 48 48" strokeWidth={1.2}>
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
      desc: 'Art Deco step-cut',
      svg: (
        <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 48 48" strokeWidth={1.2}>
          <rect x="12" y="8" width="24" height="32" rx="2" />
          <rect x="16" y="12" width="16" height="24" rx="1" strokeWidth={1} />
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
        <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 48 48" strokeWidth={1.2}>
          <rect x="15" y="6" width="18" height="36" />
          <line x1="15" y1="12" x2="33" y2="12" strokeWidth={1} />
          <line x1="15" y1="36" x2="33" y2="36" strokeWidth={1} />
        </svg>
      ),
    },
    {
      id: 'Princess',
      name: 'Princess Cut',
      desc: 'Square geometric brilliance',
      svg: (
        <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 48 48" strokeWidth={1.2}>
          <rect x="10" y="10" width="28" height="28" />
          <line x1="10" y1="10" x2="38" y2="38" strokeWidth={1} />
          <line x1="38" y1="10" x2="10" y2="38" strokeWidth={1} />
        </svg>
      ),
    },
    {
      id: 'Oval',
      name: 'Oval Cut',
      desc: 'Elongated symmetry',
      svg: (
        <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 48 48" strokeWidth={1.2}>
          <ellipse cx="24" cy="24" rx="14" ry="19" />
          <ellipse cx="24" cy="24" rx="7" ry="10" strokeDasharray="2 2" strokeWidth={1} />
        </svg>
      ),
    },
    {
      id: 'Cushion',
      name: 'Cushion Cut',
      desc: 'Rounded pillow facets',
      svg: (
        <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 48 48" strokeWidth={1.2}>
          <rect x="10" y="10" width="28" height="28" rx="6" />
          <rect x="16" y="16" width="16" height="16" rx="3" strokeWidth={1} />
        </svg>
      ),
    },
    {
      id: 'Pear',
      name: 'Pear / Teardrop',
      desc: 'Contour statement cut',
      svg: (
        <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 48 48" strokeWidth={1.2}>
          <path d="M24 7 C34 18 36 29 24 41 C12 29 14 18 24 7 Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#151515] text-[#E3E3E3] selection:bg-white selection:text-black">
      
      {/* 1. LUXURY ARCHITECTURAL NAVBAR */}
      <header className="sticky top-0 z-50 h-20 bg-[#151515]/95 backdrop-blur-md border-b border-white/10 px-6 sm:px-12 md:px-16 flex items-center justify-between">
        
        {/* Left Links: Direct Return to Runway */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#E3E3E3]/70 hover:text-white transition-colors group"
          >
            <span className="text-sm transition-transform group-hover:-translate-x-1">←</span>
            <span>YUFO Runway</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] text-[#E3E3E3]/60 font-light pl-8 border-l border-white/10">
            <button onClick={() => openCatalog('all')} className="hover:text-white transition-colors">
              The Vault
            </button>
            <a href="#pipeline" className="hover:text-white transition-colors">
              The Pipeline
            </a>
            <a href="#lookbook" className="hover:text-white transition-colors">
              Archive
            </a>
          </div>
        </div>

        {/* Center Emblem */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-6 h-6 sm:w-7 sm:h-7 opacity-90 group-hover:opacity-100 transition-opacity">
            <Image
              src="/assets/brand/yufo_clean_white.png"
              alt="Yufo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-sm sm:text-base font-serif font-light tracking-[0.35em] text-[#E3E3E3] uppercase group-hover:text-white transition-colors">
            YUFO ATELIER
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-block text-[11px] uppercase tracking-[0.2em] text-[#E3E3E3]/70 hover:text-white transition-colors font-light"
          >
            Discord VIP
          </a>
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 text-[#E3E3E3] hover:text-white transition-colors px-4 py-2 border border-white/20 hover:border-white/50"
          >
            <svg className="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="font-sans text-[10px] tracking-[0.15em] uppercase">Cart ({totalItems})</span>
          </button>
          <button
            onClick={() => openInquiry('Bespoke Atelier Direct Inquiry')}
            className="hidden md:inline-block h-10 px-6 bg-[#E3E3E3] text-[#151515] text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-white transition-all"
          >
            Consultation
          </button>
        </div>
      </header>


      {/* 2. HERO: PURE HAUTE JOAILLERIE IN NOIR #151515 */}
      <section className="relative pt-24 pb-20 px-6 sm:px-12 md:px-16 border-b border-white/10 bg-[#151515]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Eyebrow: Raw luxury tracking, zero pill bubble */}
          <div className="text-[11px] uppercase tracking-[0.4em] text-[#c9aa6c] font-medium">
            Virtual High Jewelry · 1-of-1 Commissions
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light text-[#E3E3E3] tracking-tight leading-none uppercase">
            Bespoke Atelier
          </h1>

          <p className="text-sm sm:text-base text-[#E3E3E3]/70 font-light max-w-2xl mx-auto leading-relaxed">
            A calm, guided engineering process inspired by Manhattan and Place Vendôme. Every medallion, iced collar, and timepiece is sculpted in high-polygon 3D and weighted to FiveM ped skeletons.
          </p>

          {/* Key Specs: Pure hairline dividers, no floating bubbles */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 max-w-3xl mx-auto text-left">
            <div>
              <span className="block text-[10px] uppercase tracking-[0.25em] text-[#c9aa6c]">Geometry</span>
              <span className="text-xs text-[#E3E3E3]/80 font-light">3D Micro-Pavé CAD</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.25em] text-[#c9aa6c]">Rigging</span>
              <span className="text-xs text-[#E3E3E3]/80 font-light">Zero Bone Clipping</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.25em] text-[#c9aa6c]">Lighting</span>
              <span className="text-xs text-[#E3E3E3]/80 font-light">Custom GTA V Shaders</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.25em] text-[#c9aa6c]">Delivery</span>
              <span className="text-xs text-[#E3E3E3]/80 font-light">Stream-Ready .YDR / .YTD</span>
            </div>
          </div>

        </div>
      </section>


      {/* 3. THE GUIDED CONFIGURATOR (GROUNDED ON #151515, STRAIGHT LINES) */}
      <section id="configurator" className="py-24 px-6 sm:px-12 md:px-16 bg-[#151515]">
        <div className="max-w-4xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/15 pb-6 mb-12 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#c9aa6c] font-medium block mb-1">
                A CALM, GUIDED PROCESS
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-light text-[#E3E3E3] uppercase tracking-tight">
                Commission Architecture
              </h2>
            </div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#E3E3E3]/60 font-serif">
              Step 0{currentStep} / 0{totalSteps}
            </div>
          </div>

          {/* Minimal Razor-Thin Progress Line */}
          <div className="w-full h-[1px] bg-white/10 mb-12 relative">
            <div
              className="h-[1px] bg-[#c9aa6c] transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Form Content: Flat, architectural, razor-sharp */}
          <div>
            {isSubmitted ? (
              <div className="py-16 text-center space-y-6 border border-white/15 p-8 sm:p-12">
                <div className="w-12 h-12 border border-[#c9aa6c] flex items-center justify-center text-xl mx-auto text-[#c9aa6c]">
                  ✓
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif text-[#E3E3E3] uppercase">
                  Bespoke Commission Received
                </h3>
                <p className="text-sm text-[#E3E3E3]/70 max-w-md mx-auto font-light leading-relaxed">
                  Thank you, <span className="text-white font-medium">{clientName || 'Collector'}</span>. Your custom 1-of-1 commission specifications have been forwarded to the atelier queue.
                </p>

                <div className="border border-white/15 max-w-md mx-auto text-left text-xs p-6 space-y-3 text-[#E3E3E3]/80">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-[#E3E3E3]/40 uppercase tracking-widest text-[10px]">Jewelry Style</span>
                    <span className="text-white font-medium">{jewelryStyle}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-[#E3E3E3]/40 uppercase tracking-widest text-[10px]">Diamond Cut</span>
                    <span className="text-white font-medium">{diamondShape}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-[#E3E3E3]/40 uppercase tracking-widest text-[10px]">Metal & Fire</span>
                    <span className="text-white font-medium">{metal} · {stoneOrigin}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-[#E3E3E3]/40 uppercase tracking-widest text-[10px]">FiveM Skeleton</span>
                    <span className="text-white font-medium">{skeletonRig}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-[#E3E3E3]/40 uppercase tracking-widest text-[10px]">Investment</span>
                    <span className="text-[#c9aa6c] font-medium">{budget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#E3E3E3]/40 uppercase tracking-widest text-[10px]">Discord Handle</span>
                    <span className="text-white font-medium">{discordHandle || 'Provided'}</span>
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="https://discord.gg"
                    target="_blank"
                    rel="noreferrer"
                    className="h-12 px-8 bg-[#E3E3E3] text-[#151515] text-xs font-medium uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center"
                  >
                    Open Discord VIP Ticket
                  </a>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setCurrentStep(1);
                    }}
                    className="h-12 px-8 border border-white/30 text-[#E3E3E3] text-xs font-medium uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                  >
                    Configure Another Piece
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* STEP 1: TIMELINE */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-serif text-[#E3E3E3] uppercase">
                        When do you require delivery?
                      </h3>
                      <p className="text-xs text-[#E3E3E3]/50 mt-1 font-light tracking-wide">
                        Calibrates 3D sculpting hours and bone weighting priority in the atelier schedule.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { id: 'No Rush', label: 'Flexible Timeline', sub: 'Standard atelier queue' },
                        { id: '4-6 Weeks', label: '4 - 6 Weeks', sub: 'Standard sculpting and weighting' },
                        { id: 'Soon', label: 'Expedited (2 - 3 Weeks)', sub: 'VIP priority slot with express rig' },
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => setTimeline(opt.id)}
                          className={`p-6 border cursor-pointer transition-all ${
                            timeline === opt.id
                              ? 'border-white bg-white/[0.08] text-white'
                              : 'border-white/15 text-[#E3E3E3]/70 hover:border-white/40 bg-transparent'
                          }`}
                        >
                          <div className="text-sm font-medium text-[#E3E3E3] mb-1 uppercase tracking-wider">{opt.label}</div>
                          <div className="text-xs text-[#E3E3E3]/50 font-light leading-relaxed">{opt.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: JEWELRY STYLE */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-serif text-[#E3E3E3] uppercase">
                        Which category defines your vision?
                      </h3>
                      <p className="text-xs text-[#E3E3E3]/50 mt-1 font-light tracking-wide">
                        Every geometry will be custom engineered from scratch to your exact aesthetic references.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          id: 'Custom Medallion & 3D Pendant',
                          title: 'Medallion & 3D Pendant',
                          sub: 'Crew heraldry, rotating enamel portraits, kinetic spinning bearings, micro-pavé lettering.',
                        },
                        {
                          id: 'Diamond Tennis & Cuban Collar',
                          title: 'Diamond Tennis & Heavy Cuban',
                          sub: 'Miami Cubans, 5mm baguette collars, layered chains engineered to drape naturally on torsos.',
                        },
                        {
                          id: 'Sovereign Ring & Signet',
                          title: 'Ring & Sovereign Signet',
                          sub: 'Full perimeter eternity bands, pavé signet face, pinky rings weighted to ped finger joints.',
                        },
                        {
                          id: 'Bustdown Watch Rig',
                          title: 'Bustdown Horology & Bezel',
                          sub: 'Custom pavé timepieces (Datejust, Day-Date, AP, Patek) rigged for FiveM wrist bones.',
                        },
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => setJewelryStyle(opt.id)}
                          className={`p-6 border cursor-pointer transition-all ${
                            jewelryStyle === opt.id
                              ? 'border-white bg-white/[0.08] text-white'
                              : 'border-white/15 text-[#E3E3E3]/70 hover:border-white/40 bg-transparent'
                          }`}
                        >
                          <div className="text-sm font-medium text-[#E3E3E3] mb-1 uppercase tracking-wider">{opt.title}</div>
                          <div className="text-xs text-[#E3E3E3]/50 font-light leading-relaxed">{opt.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: DIAMOND CUTS */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-serif text-[#E3E3E3] uppercase">
                        Which diamond facet cut do you prefer?
                      </h3>
                      <p className="text-xs text-[#E3E3E3]/50 mt-1 font-light tracking-wide">
                        Facet angles determine how specular highlights bounce inside the GTA V lighting engine.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {DIAMOND_SHAPES.map((shape) => (
                        <div
                          key={shape.id}
                          onClick={() => setDiamondShape(shape.id)}
                          className={`p-5 border flex flex-col items-center text-center cursor-pointer transition-all ${
                            diamondShape === shape.id
                              ? 'border-white bg-white/[0.08] text-white'
                              : 'border-white/15 text-[#E3E3E3]/70 hover:border-white/40 bg-transparent'
                          }`}
                        >
                          <div className="mb-3 opacity-90">{shape.svg}</div>
                          <div className="text-xs font-medium text-[#E3E3E3] uppercase tracking-wider">{shape.name}</div>
                          <div className="text-[10px] text-[#E3E3E3]/50 mt-1 font-light">{shape.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: METALS & STONES */}
                {currentStep === 4 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-serif text-[#E3E3E3] uppercase">
                        Precious Metal & Gemstone Fire
                      </h3>
                      <p className="text-xs text-[#E3E3E3]/50 mt-1 font-light tracking-wide">
                        Choose the precious alloy finish and gemstone shader brilliance.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.25em] text-[#E3E3E3]/60 mb-3 font-light">
                        Precious Metal Alloy
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['18K White Gold', '18K Yellow Gold', '18K Rose Gold', 'Solid Platinum 950'].map((m) => (
                          <div
                            key={m}
                            onClick={() => setMetal(m)}
                            className={`p-4 border text-center text-xs font-medium cursor-pointer transition-all uppercase tracking-wider ${
                              metal === m
                                ? 'border-white bg-white/[0.08] text-white'
                                : 'border-white/15 text-[#E3E3E3]/60 hover:border-white/40 bg-transparent'
                            }`}
                          >
                            {m}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.25em] text-[#E3E3E3]/60 mb-3 font-light">
                        Gemstone Fire Quality
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'Natural VVS Diamonds', title: 'Natural VVS Diamonds', sub: 'Maximum prestige and authentic luxury facet dispersion' },
                          { id: 'Moissanite Fire', title: 'Moissanite Super-Fire', sub: 'Intense prismatic fire and hyper-bright night glow' },
                          { id: 'Open to Guidance', title: 'Atelier Guidance', sub: 'Let our master gemologist recommend the finest shader match' },
                        ].map((s) => (
                          <div
                            key={s.id}
                            onClick={() => setStoneOrigin(s.id)}
                            className={`p-5 border cursor-pointer transition-all ${
                              stoneOrigin === s.id
                                ? 'border-white bg-white/[0.08] text-white'
                                : 'border-white/15 text-[#E3E3E3]/60 hover:border-white/40 bg-transparent'
                            }`}
                          >
                            <div className="text-xs font-medium text-[#E3E3E3] uppercase tracking-wider">{s.title}</div>
                            <div className="text-[10px] text-[#E3E3E3]/40 mt-1 font-light leading-relaxed">{s.sub}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: SKELETAL RIGGING */}
                {currentStep === 5 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-serif text-[#E3E3E3] uppercase">
                        FiveM Skeletal Calibration
                      </h3>
                      <p className="text-xs text-[#E3E3E3]/50 mt-1 font-light tracking-wide">
                        Weighted directly to character bone hierarchies to eliminate mesh clipping during animations.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'MP Male Ped Skeleton', title: 'MP Male Ped Skeleton', desc: 'Calibrated for mp_m_freemode_01 models and clothing packs.' },
                        { id: 'MP Female Ped Skeleton', title: 'MP Female Ped Skeleton', desc: 'Calibrated for mp_f_freemode_01 models with tailored contours.' },
                        { id: 'Dual Rigged (Both)', title: 'Dual Gender Package', desc: 'Includes separate male and female .ydr assets calibrated individually.' },
                        { id: 'Custom Ped / Server Specific', title: 'Custom Server Skeletal Fit', desc: 'Bespoke bone weights calibrated for custom server bodies or armor.' },
                      ].map((rig) => (
                        <div
                          key={rig.id}
                          onClick={() => setSkeletonRig(rig.id)}
                          className={`p-6 border cursor-pointer transition-all ${
                            skeletonRig === rig.id
                              ? 'border-white bg-white/[0.08] text-white'
                              : 'border-white/15 text-[#E3E3E3]/70 hover:border-white/40 bg-transparent'
                          }`}
                        >
                          <div className="text-sm font-medium text-[#E3E3E3] mb-1 uppercase tracking-wider">{rig.title}</div>
                          <div className="text-xs text-[#E3E3E3]/50 font-light leading-relaxed">{rig.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 6: BUDGET */}
                {currentStep === 6 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-serif text-[#E3E3E3] uppercase">
                        Starting Investment
                      </h3>
                      <p className="text-xs text-[#E3E3E3]/50 mt-1 font-light tracking-wide">
                        Calibrates mesh complexity, kinetic bearing mechanisms, and stone count.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: '$500 - $1,000', label: 'Under $1,000', sub: 'Essential Atelier' },
                        { id: '$1,000 - $2,500', label: '$1,000 - $2,500', sub: 'High Jewelry 1-of-1' },
                        { id: '$2,500 - $5,000+', label: '$2,500 - $5,000+', sub: 'Heavy Bustdown / Crew' },
                        { id: 'Open to guidance', label: 'Guidance', sub: 'Consultation quote' },
                      ].map((b) => (
                        <div
                          key={b.id}
                          onClick={() => setBudget(b.id)}
                          className={`p-5 border text-center cursor-pointer transition-all ${
                            budget === b.id
                              ? 'border-white bg-white/[0.08] text-white'
                              : 'border-white/15 text-[#E3E3E3]/70 hover:border-white/40 bg-transparent'
                          }`}
                        >
                          <div className="text-sm font-semibold text-[#E3E3E3] mb-1 uppercase tracking-wider">{b.label}</div>
                          <div className="text-[10px] text-[#E3E3E3]/50 font-light">{b.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 7: CONTACT & UPLOAD */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-serif text-[#E3E3E3] uppercase">
                        Client Coordinates
                      </h3>
                      <p className="text-xs text-[#E3E3E3]/50 mt-1 font-light tracking-wide">
                        The private concierge will reach your Discord directly to begin 3D modeling drafts.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.2em] text-[#E3E3E3]/70 mb-2 font-light">
                          Discord Handle <span className="text-[#c9aa6c]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={discordHandle}
                          onChange={(e) => setDiscordHandle(e.target.value)}
                          placeholder="e.g. username or Discord ID"
                          className="w-full px-4 py-3 bg-transparent border border-white/20 text-xs text-[#E3E3E3] placeholder:text-[#E3E3E3]/30 focus:outline-none focus:border-white transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.2em] text-[#E3E3E3]/70 mb-2 font-light">
                          Collector Name / FiveM Server
                        </label>
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Character Name or Server Name"
                          className="w-full px-4 py-3 bg-transparent border border-white/20 text-xs text-[#E3E3E3] placeholder:text-[#E3E3E3]/30 focus:outline-none focus:border-white transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.2em] text-[#E3E3E3]/70 mb-2 font-light">
                          Inspiration Sketch / Crew Logo (Optional)
                        </label>
                        <div className="border border-dashed border-white/25 hover:border-white/50 p-6 text-center cursor-pointer bg-transparent transition-colors relative">
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
                          <div className="text-xs text-[#E3E3E3]/60">
                            {fileName ? (
                              <span className="text-white font-medium">Selected: {fileName}</span>
                            ) : (
                              <span>Drop image references, crew emblem, or portrait photo here</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.2em] text-[#E3E3E3]/70 mb-2 font-light">
                          Bespoke Specifications & Notes
                        </label>
                        <textarea
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Chain length, custom engravings on back, spinning bearings, specific carats..."
                          className="w-full px-4 py-3 bg-transparent border border-white/20 text-xs text-[#E3E3E3] placeholder:text-[#E3E3E3]/30 focus:outline-none focus:border-white resize-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Controls: Sharp, crisp rectangles */}
                <div className="border-t border-white/15 pt-8 mt-12 flex items-center justify-between">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className={`h-12 px-8 border text-xs font-medium uppercase tracking-[0.2em] transition-colors ${
                      currentStep === 1
                        ? 'opacity-0 pointer-events-none'
                        : 'border-white/20 text-[#E3E3E3] hover:border-white'
                    }`}
                  >
                    Back
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentStep === 7 && !discordHandle.trim()}
                    className="h-12 px-10 bg-[#E3E3E3] text-[#151515] text-xs font-medium uppercase tracking-[0.2em] hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {currentStep === totalSteps ? 'Submit Commission' : 'Continue →'}
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </section>


      {/* 4. ARCHIVE LOOKBOOK: PURE SHARP FRAMES */}
      <section id="lookbook" className="py-24 px-6 sm:px-12 md:px-16 border-t border-white/10 bg-[#151515]">
        <div className="max-w-[1920px] mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/15 pb-6 mb-12 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#c9aa6c] font-medium block mb-1">
                ATELIER ARCHIVE · 1-OF-1 CREATIONS
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-light text-[#E3E3E3] uppercase tracking-tight">
                Recent Bespoke Commissions
              </h2>
            </div>
            <button
              onClick={() => openCatalog('all')}
              className="text-xs uppercase tracking-[0.2em] text-[#E3E3E3]/70 hover:text-white transition-colors self-start md:self-auto font-light"
            >
              Browse The Vault →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="group border border-white/15 overflow-hidden flex flex-col justify-between hover:border-white/50 transition-colors bg-[#151515]">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src="/assets/media/campaign_solo_medallion.jpg"
                  alt="The Sovereign 1-of-1 Medallion"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-transparent opacity-80" />
                <span className="absolute top-4 left-4 px-3 py-1 bg-[#151515]/90 border border-white/20 text-[9px] uppercase tracking-widest text-[#E3E3E3]">
                  1-of-1 Commission
                </span>
              </div>
              <div className="p-6 space-y-2 border-t border-white/10">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9aa6c]">Yellow Gold & Baguettes</span>
                <h3 className="text-base font-serif text-[#E3E3E3] uppercase">The Sovereign Medallion</h3>
                <p className="text-xs text-[#E3E3E3]/50 font-light leading-relaxed">
                  Sculpted with raised Roman relief and double-row baguette bezel. Weighted to the MP male clavicle bone hierarchy.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group border border-white/15 overflow-hidden flex flex-col justify-between hover:border-white/50 transition-colors bg-[#151515]">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src="/assets/media/campaign_portrait_medallion.jpg"
                  alt="Memory Medallion & Rope Chain"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-transparent opacity-80" />
                <span className="absolute top-4 left-4 px-3 py-1 bg-[#151515]/90 border border-white/20 text-[9px] uppercase tracking-widest text-[#E3E3E3]">
                  Kinetic 1-of-1
                </span>
              </div>
              <div className="p-6 space-y-2 border-t border-white/10">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9aa6c]">Enamel & Micro-Pavé</span>
                <h3 className="text-base font-serif text-[#E3E3E3] uppercase">Memory Medallion & Rope</h3>
                <p className="text-xs text-[#E3E3E3]/50 font-light leading-relaxed">
                  Dual-sided spinning memorial pendant featuring high-resolution enamel framing and a heavyweight twisted gold rope chain.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group border border-white/15 overflow-hidden flex flex-col justify-between hover:border-white/50 transition-colors bg-[#151515]">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src="/assets/media/campaign_crew_simulation.jpg"
                  alt="The Syndicate Trio Collar System"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-transparent opacity-80" />
                <span className="absolute top-4 left-4 px-3 py-1 bg-[#151515]/90 border border-white/20 text-[9px] uppercase tracking-widest text-[#E3E3E3]">
                  Syndicate Set
                </span>
              </div>
              <div className="p-6 space-y-2 border-t border-white/10">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9aa6c]">Layered Necklaces</span>
                <h3 className="text-base font-serif text-[#E3E3E3] uppercase">Syndicate Signature Trio</h3>
                <p className="text-xs text-[#E3E3E3]/50 font-light leading-relaxed">
                  Layered 12mm Cuban choker and dual diamond tennis necklaces engineered to drape simultaneously without clipping.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="group border border-white/15 overflow-hidden flex flex-col justify-between hover:border-white/50 transition-colors bg-[#151515]">
              <div className="relative aspect-[4/5] w-full overflow-hidden flex items-center justify-center p-8 bg-[#151515]">
                <Image
                  src="/assets/products/rolex_datejust_41.png"
                  alt="Rolex Datejust 41 Mint Green Ref. 126334"
                  fill
                  className="object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-transparent opacity-70" />
                <span className="absolute top-4 left-4 px-3 py-1 bg-[#151515]/90 border border-white/20 text-[9px] uppercase tracking-widest text-[#E3E3E3]">
                  Horology Rig
                </span>
              </div>
              <div className="p-6 space-y-2 border-t border-white/10">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9aa6c]">Rolex · Ref. 126334</span>
                <h3 className="text-base font-serif text-[#E3E3E3] uppercase">Datejust 41 Mint Green</h3>
                <p className="text-xs text-[#E3E3E3]/50 font-light leading-relaxed">
                  Fluted white gold bezel with soleil mint green dial and Jubilee bracelet rigged to GTA V wrist bones.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* 5. THE PIPELINE: MINIMALIST ARCHITECTURAL GRID */}
      <section id="pipeline" className="py-24 px-6 sm:px-12 md:px-16 bg-[#151515] border-t border-white/10">
        <div className="max-w-[1920px] mx-auto">
          
          <div className="max-w-2xl space-y-3 mb-16">
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#c9aa6c] font-medium">
              THE YUFO STANDARD
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#E3E3E3] uppercase tracking-tight">
              The 1-of-1 Atelier Pipeline
            </h2>
            <p className="text-sm text-[#E3E3E3]/60 font-light leading-relaxed">
              From concept vectorization to in-game Los Santos shader calibration. Every step is executed with precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            
            <div className="border-t border-white/15 pt-8 space-y-3">
              <span className="text-4xl font-serif font-light text-[#E3E3E3]/20 block">01</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9aa6c] font-medium block">
                PHASE I · CAD BLUEPRINTING
              </span>
              <h3 className="text-lg font-serif text-[#E3E3E3] uppercase">Volumetry & Gemological Architecture</h3>
              <p className="text-xs text-[#E3E3E3]/50 font-light leading-relaxed">
                Your logo, 2D sketch, or concept is vectorized into sub-millimeter 3D geometries. Carat weight, prong thickness, and metal alloys are mathematically calculated before sculpting begins.
              </p>
            </div>

            <div className="border-t border-white/15 pt-8 space-y-3">
              <span className="text-4xl font-serif font-light text-[#E3E3E3]/20 block">02</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9aa6c] font-medium block">
                PHASE II · 3D PAVÉ SCULPTING
              </span>
              <h3 className="text-lg font-serif text-[#E3E3E3] uppercase">Grain-by-Grain Setting & Fire Shaders</h3>
              <p className="text-xs text-[#E3E3E3]/50 font-light leading-relaxed">
                Every gemstone is hand-placed in digital space with individual prongs. Normal and specular reflection channels are specifically balanced so sunlight and streetlights create authentic diamond scintillation.
              </p>
            </div>

            <div className="border-t border-white/15 pt-8 space-y-3">
              <span className="text-4xl font-serif font-light text-[#E3E3E3]/20 block">03</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9aa6c] font-medium block">
                PHASE III · SKELETAL RIGGING
              </span>
              <h3 className="text-lg font-serif text-[#E3E3E3] uppercase">Zero-Clipping FiveM Stream Export</h3>
              <p className="text-xs text-[#E3E3E3]/50 font-light leading-relaxed">
                Pieces are bound to MP Male and Female ped hierarchies. Exported into optimized `.ydr` and `.ytd` dictionaries under 25k polygons, guaranteeing zero client FPS drops and seamless server streaming.
              </p>
            </div>

          </div>

        </div>
      </section>


      <SiteFooter />


      {/* UNIVERSAL MODALS & DRAWERS */}
      <VaultCatalogModal
        isOpen={isCatalogOpen}
        initialCategory={catalogCategory}
        onClose={() => setIsCatalogOpen(false)}
        onOpenBespoke={() => {
          setIsCatalogOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <InquiryModal
        isOpen={isInquiryOpen}
        initialSubject={inquirySubject}
        onClose={() => setIsInquiryOpen(false)}
      />

      <CartDrawer />

    </div>
  );
}

export default function BespokePage() {
  return (
    <AuthProvider>
      <CartProvider>
        <BespokePageContent />
      </CartProvider>
    </AuthProvider>
  );
}
