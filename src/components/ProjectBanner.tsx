'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ProjectBannerProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  className?: string;
}

export const ProjectBanner: React.FC<ProjectBannerProps> = ({
  eyebrow = 'YOUR DESTINATION FOR HIGH-QUALITY JEWELRY',
  title = 'Built for you. Built different.',
  description = 'Explore ready-made pieces or bring your own idea to life with a custom creation designed around your vision.',
  buttonText = 'Start your project',
  buttonHref = '/custom-orders',
  secondaryButtonText = 'Explore creations',
  secondaryButtonHref = '/collections/shop-all',
  className = '',
}) => {
  return (
    <section className={`max-w-[1720px] mx-auto px-5 sm:px-10 lg:px-14 py-12 sm:py-16 ${className}`} aria-label="Project Invitation Banner">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-r from-zinc-950 via-[#0e0e13] to-zinc-950 p-8 sm:p-12 lg:p-14 shadow-2xl">
        {/* Subtle Ambient Light Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-14">
          {/* Left Text Block */}
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <span className="inline-block text-xs uppercase tracking-[0.25em] text-zinc-400 font-medium">
              {eyebrow}
            </span>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight">
              {title}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              {description}
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href={buttonHref}
              className="px-8 h-12 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs sm:text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-[1.02]"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {secondaryButtonText && secondaryButtonHref && (
              <Link
                href={secondaryButtonHref}
                className="px-7 h-12 bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs sm:text-sm rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{secondaryButtonText}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectBanner;
