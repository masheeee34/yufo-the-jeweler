'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

// Un élément (ou un de ses parents) qui défile lui-même : la molette doit lui revenir, pas à la page.
function insideScrollable(node: HTMLElement): boolean {
  let el: HTMLElement | null = node;
  while (el && el !== document.body && el !== document.documentElement) {
    if (el.hasAttribute('data-lenis-prevent')) return true;
    const style = getComputedStyle(el);
    const canScroll = /(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
    if (canScroll) return true;
    el = el.parentElement;
  }
  return false;
}

// Défilement fluide de la page publique. Désactivé dans le back-office (Management),
// où chaque panneau défile indépendamment.
export const SmoothScroll = () => {
  const pathname = usePathname() || '';
  const disabled = pathname.startsWith('/admin');

  useEffect(() => {
    if (disabled) return;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      prevent: (node: HTMLElement) => insideScrollable(node),
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [disabled]);

  return null;
};
