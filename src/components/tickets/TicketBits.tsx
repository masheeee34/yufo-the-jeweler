'use client';

import React from 'react';
import { TONE_CLASSES } from '../../lib/ticketDefaults';
import { UserAvatar } from '../UserMenu';
import type { TPerson, TRole, TStatus } from './types';
import { ROLE_LABEL } from './types';

export function StatusPill({ status, className = '' }: { status: TStatus; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-semibold ring-1 ring-inset ${TONE_CLASSES[status.tone] || TONE_CLASSES.zinc} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status.label}
    </span>
  );
}

export function RoleBadge({ role }: { role: TRole }) {
  const cls = role === 'staff' ? 'bg-white text-zinc-950' : role === 'client' ? 'bg-white/10 text-zinc-200' : 'bg-white/[0.05] text-zinc-400';
  return <span className={`px-1.5 py-px rounded text-[10px] font-semibold uppercase tracking-wide ${cls}`}>{ROLE_LABEL[role]}</span>;
}

export function Flag({ children, tone = 'zinc' }: { children: React.ReactNode; tone?: 'zinc' | 'amber' | 'rose' }) {
  const cls = tone === 'amber' ? 'bg-amber-500/10 text-amber-300' : tone === 'rose' ? 'bg-rose-500/10 text-rose-300' : 'bg-white/[0.06] text-zinc-300';
  return <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-medium ${cls}`}>{children}</span>;
}

export function PersonAvatar({ person, size = 36 }: { person: Pick<TPerson, 'name' | 'avatarUrl' | 'discordId' | 'avatar'>; size?: number }) {
  return (
    <UserAvatar
      user={{ pseudo: person.name || '?', avatarUrl: person.avatarUrl || undefined, discordId: person.discordId || undefined, avatar: person.avatar || undefined }}
      size={size}
      className="shrink-0"
    />
  );
}

// Fenêtre de confirmation pour les actions sensibles (supprimer, retirer, révoquer, clôturer).
export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  text?: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-[#121214] border border-white/10 p-6 shadow-2xl">
        <h3 id="confirm-title" className="text-base font-semibold text-white">{title}</h3>
        {text && <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{text}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="h-10 px-4 rounded-full text-sm text-zinc-300 hover:text-white">Cancel</button>
          <button type="button" onClick={onConfirm} autoFocus className={`h-10 px-5 rounded-full text-sm font-semibold ${danger ? 'bg-rose-500 hover:bg-rose-400 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-950'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Son joué à l'arrivée d'un nouveau message (réglé dans Management › Tickets).
export function playSound(url: string, volume: number) {
  if (!url) return;
  try {
    const a = new Audio(url);
    a.volume = Math.min(1, Math.max(0, volume));
    a.play().catch(() => {});
  } catch {}
}
