'use client';

import React, { useState, useEffect } from 'react';
import { ReviewItem } from '@/lib/reviewsDb';
import defaultReviewsData from '../../data/reviews.json';

// SVG Officiel Avis Vérifié Tabler (#05b4ff)
function VerifiedCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#05b4ff"
      className="inline-block flex-shrink-0"
      aria-label="Verified review"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />
    </svg>
  );
}

// Logo Discord Vectoriel pour le coin supérieur droit
function DiscordBadge() {
  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/25 text-[#9ba9eb]"
      title="Verified Discord review"
    >
      <svg className="w-3.5 h-3.5 fill-[#5865F2]" viewBox="0 0 127.14 96.36">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
      </svg>
      <span className="text-[10px] font-semibold tracking-wide text-white/80">Discord</span>
    </div>
  );
}

// Etoiles dorées
function StarRating({ rating = 5 }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-zinc-700 fill-zinc-700'
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ rev }: { rev: ReviewItem }) {
  return (
    <article className="w-[300px] sm:w-[360px] p-5 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between shrink-0 shadow-xl backdrop-blur-md group">
      {/* Ligne Superieure : Pseudo + Certification + Discord Badge */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-semibold text-white truncate">
            {rev.pseudo}
          </span>
          {rev.isVerified && <VerifiedCheckIcon size={17} />}
        </div>
        <DiscordBadge />
      </div>

      {/* Etoiles et Date */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <StarRating rating={rev.rating} />
        <span className="text-[11px] font-medium text-zinc-500">
          {rev.date}
        </span>
      </div>

      {/* Message de l'avis */}
      <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-normal line-clamp-4">
        &ldquo;{rev.message}&rdquo;
      </p>
    </article>
  );
}

interface ReviewsMarqueeProps {
  initialReviews?: ReviewItem[];
  above?: React.ReactNode; // affiché entre le titre et les avis (ex. avatars des clients)
}

export default function ReviewsMarquee({ initialReviews, above }: ReviewsMarqueeProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(
    initialReviews && initialReviews.length > 0
      ? initialReviews
      : (defaultReviewsData as unknown as ReviewItem[])
  );

  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => console.error('Erreur chargement avis:', err));
  }, []);

  if (reviews.length === 0) return null;

  // Repartition sur deux rangées superposées
  const row1 = reviews.length > 1 ? reviews.filter((_, idx) => idx % 2 === 0) : reviews;
  const row2 = reviews.length > 1 ? reviews.filter((_, idx) => idx % 2 === 1) : reviews;

  // Duplication de chaque liste pour un défilement infini fluide à 100%
  const displayRow1 = [...row1, ...row1, ...row1];
  const displayRow2 = [...row2, ...row2, ...row2];

  return (
    <section className="relative w-full border-t border-white/5 bg-[#070709] py-16 sm:py-24 overflow-hidden" aria-label="Client reviews">
      {/* Header section */}
      <div className="max-w-[1720px] mx-auto px-5 sm:px-10 lg:px-14 mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
          <StarRating rating={5} />
          <span className="text-[11px] font-medium tracking-wide text-zinc-300">
            5.0 / 5 · 31 reviews
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Their pieces. Their words.
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-lg mx-auto leading-relaxed">
          Their experience says more than we ever could.
        </p>
        {above && <div className="mt-8">{above}</div>}
      </div>

      {/* Masques de dégradé sur les côtés pour une transition luxueuse */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#070709] via-[#070709]/80 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#070709] via-[#070709]/80 to-transparent z-10" />

      {/* Deux rangées superposées en défilement continu */}
      <div className="flex flex-col gap-4 sm:gap-6 overflow-hidden select-none">
        {/* Rangée 1 : défilement droite vers gauche */}
        <div className="flex overflow-hidden">
          <div className="flex animate-marquee gap-4 sm:gap-5 shrink-0 items-stretch py-1">
            {displayRow1.map((rev, index) => (
              <ReviewCard key={`r1-${rev.id}-${index}`} rev={rev} />
            ))}
          </div>
        </div>

        {/* Rangée 2 : défilement gauche vers droite */}
        <div className="flex overflow-hidden">
          <div className="flex animate-marquee-reverse gap-4 sm:gap-5 shrink-0 items-stretch py-1">
            {displayRow2.map((rev, index) => (
              <ReviewCard key={`r2-${rev.id}-${index}`} rev={rev} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
