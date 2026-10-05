'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../lib/authContext';
import { ScratchCard } from './ScratchCard';
import { playSound } from './tickets/TicketBits';

interface Notif {
  id: string;
  type: 'discount' | 'order' | 'project' | 'files' | 'ticket';
  title: string;
  text: string;
  href?: string;
  percent?: number;
  at: string;
  read?: boolean;
  revealed?: boolean;
}

const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h`;
  return `${Math.floor(m / 1440)}d`;
};

// Cloche animée (balancement quand il y a du nouveau).
function BellIcon({ ringing }: { ringing: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={ringing ? 'bell-ring' : ''} aria-hidden="true">
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
    </svg>
  );
}

// Ligne qu'on balaie vers la gauche pour la retirer (façon iOS).
function SwipeRow({ onDismiss, onOpen, children }: { onDismiss: () => void; onOpen: () => void; children: React.ReactNode }) {
  const [dx, setDx] = useState(0);
  const [gone, setGone] = useState(false);
  const start = useRef<number | null>(null);
  const moved = useRef(false);
  const end = () => {
    if (start.current === null) return;
    start.current = null;
    if (dx < -110) {
      setGone(true);
      setTimeout(onDismiss, 220);
    } else {
      setDx(0);
    }
  };
  return (
    <div className={`relative overflow-hidden transition-[max-height,opacity] duration-200 ${gone ? 'max-h-0 opacity-0' : 'max-h-40'}`}>
      <div className="absolute inset-0 flex items-center justify-end pr-5 bg-rose-600 text-white text-xs font-semibold">Remove</div>
      <div
        className="relative bg-[#1c1c1e] touch-pan-y"
        style={{ transform: `translateX(${gone ? -400 : dx}px)`, transition: start.current === null ? 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)' : 'none' }}
        onPointerDown={(e) => { start.current = e.clientX; moved.current = false; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => {
          if (start.current === null) return;
          const d = Math.min(0, e.clientX - start.current);
          if (Math.abs(d) > 6) moved.current = true;
          setDx(d);
        }}
        onPointerUp={() => { const wasMoved = moved.current; end(); if (!wasMoved) onOpen(); }}
        onPointerCancel={end}
      >
        {children}
      </div>
    </div>
  );
}

// Cloche de l'en-tête : notifications du client (réductions, commandes, projets).
export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [scratch, setScratch] = useState<Notif | null>(null);
  const [revealed, setRevealed] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const known = useRef<Set<string> | null>(null);
  const sound = useRef<{ url: string; volume: number }>({ url: '', volume: 0.6 });

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => d.tickets && (sound.current = { url: d.tickets.sound || '', volume: Number(d.tickets.soundVolume) || 0.6 }))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    try {
      const d = await fetch('/api/me/notifications', { cache: 'no-store' }).then((r) => r.json());
      const list: Notif[] = d.notifications || [];
      // Son à l'arrivée d'une nouvelle notification (pas au premier chargement de la page).
      // Le ticket ouvert à l'écran joue déjà son propre son : pas de double alerte.
      const here = window.location.pathname;
      if (known.current && list.some((n) => !n.read && !known.current!.has(n.id) && n.href !== here)) playSound(sound.current.url, sound.current.volume);
      known.current = new Set(list.map((n) => n.id));
      setItems(list);
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    load();
    const t = setInterval(() => document.visibilityState === 'visible' && load(), 20000);
    return () => clearInterval(t);
  }, [user, load]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => root.current && !root.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const act = (id: string, action: 'read' | 'dismiss' | 'reveal') =>
    fetch('/api/me/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) }).then((r) => r.json());

  if (!user) return null;
  const unread = items.filter((n) => !n.read).length;

  const openItem = (n: Notif) => {
    if (n.type === 'discount' && !n.revealed) {
      setScratch(n);
      setRevealed(null);
      setOpen(false);
      return;
    }
    if (!n.read) act(n.id, 'read').then(load);
    if (n.href) window.location.href = n.href;
  };

  return (
    <div ref={root} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative hover:text-white transition-all p-1 cursor-pointer" aria-label={`Notifications${unread ? ` (${unread} new)` : ''}`}>
        <BellIcon ringing={unread > 0} />
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center">{unread}</span>}
      </button>

      {open && (
        <div className="user-menu-panel absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[20px] bg-[#1c1c1e]/80 backdrop-blur-xl backdrop-saturate-150 border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.5)] normal-case tracking-normal font-sans">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <p className="text-[14px] font-semibold text-white">Notifications</p>
            {unread > 0 && <button onClick={() => act('all', 'read').then(load)} className="text-[11px] text-zinc-400 hover:text-white">Mark all read</button>}
          </div>
          <div className="max-h-[60vh] overflow-y-auto overscroll-contain pb-2">
            {items.length === 0 ? (
              <p className="px-5 py-8 text-center text-[12px] text-zinc-500">You are all caught up.</p>
            ) : (
              items.map((n) => (
                <SwipeRow key={n.id} onOpen={() => openItem(n)} onDismiss={() => { setItems((x) => x.filter((y) => y.id !== n.id)); act(n.id, 'dismiss'); }}>
                  <div className="flex gap-3 px-5 py-3 cursor-pointer hover:bg-white/[0.04]">
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : n.type === 'discount' ? 'bg-amber-300' : 'bg-white'}`} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-[13px] font-medium text-white truncate">{n.title}</span>
                        <span className="text-[10px] text-zinc-500 shrink-0">{ago(n.at)}</span>
                      </span>
                      <span className="block text-[12px] text-zinc-400 mt-0.5">
                        {n.type === 'discount' && n.revealed ? `-${n.percent}% on your orders, applied automatically.` : n.text}
                      </span>
                    </span>
                  </div>
                </SwipeRow>
              ))
            )}
          </div>
          {items.length > 0 && <p className="px-5 pb-3 text-[10px] text-zinc-600">Swipe left to remove.</p>}
        </div>
      )}

      {scratch && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 normal-case tracking-normal font-sans" onClick={() => setScratch(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm rounded-3xl bg-[#121214] border border-white/10 p-7 text-center shadow-2xl user-menu-panel">
            <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300">A gift from YUFO</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Scratch to reveal</h3>
            <div className="mt-5 flex justify-center">
              <ScratchCard
                onRevealed={async () => {
                  const d = await act(scratch.id, 'reveal');
                  setRevealed(d.notification?.percent ?? null);
                  load();
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 flex flex-col items-center justify-center text-black">
                  <span className="text-5xl font-black tracking-tight">{revealed !== null ? `-${revealed}%` : '•••'}</span>
                  <span className="text-[12px] font-semibold mt-1">on all your orders</span>
                </div>
              </ScratchCard>
            </div>
            <p className="mt-5 text-[12px] text-zinc-400">{revealed !== null ? 'Applied automatically at checkout. Enjoy!' : 'Use your finger or mouse.'}</p>
            <button onClick={() => setScratch(null)} className="mt-5 h-10 px-6 rounded-full bg-white text-black text-sm font-semibold">{revealed !== null ? 'Nice!' : 'Later'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
