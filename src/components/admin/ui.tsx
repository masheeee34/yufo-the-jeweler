'use client';

import React, { useEffect } from 'react';
import { IconX } from '@tabler/icons-react';
import { LoaderOne } from '../LoaderOne';
import { UserAvatar } from '../UserMenu';

// Petits composants partagés par toutes les pages du back-office.

export const money = (n: number | undefined, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: n !== undefined && n % 1 ? 2 : 0 }).format(n || 0);

export function timeAgo(iso?: string) {
  if (!iso) return '—';
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 86400 * 7) return `il y a ${Math.floor(s / 86400)} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const fullDate = (iso?: string) => (iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
      <div>
        <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="text-[13px] text-zinc-400 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '', ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-2xl bg-[#1a1a1b] border border-white/[0.06] ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-3">
      <h2 className="text-[14px] font-semibold text-white">{children}</h2>
      {action}
    </div>
  );
}

const TONES = {
  neutral: 'bg-white/[0.08] text-zinc-300',
  green: 'bg-emerald-500/15 text-emerald-300',
  amber: 'bg-amber-400/15 text-amber-300',
  red: 'bg-rose-500/15 text-rose-300',
  blue: 'bg-sky-500/15 text-sky-300',
  violet: 'bg-violet-500/15 text-violet-300',
};
export type Tone = keyof typeof TONES;

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center h-[22px] px-2 rounded-md text-[11px] font-semibold whitespace-nowrap ${TONES[tone]}`}>{children}</span>;
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md'; icon?: React.ReactNode };

export function Button({ variant = 'secondary', size = 'md', icon, children, className = '', ...rest }: BtnProps) {
  const v = {
    primary: 'bg-white text-zinc-950 hover:bg-zinc-200 font-semibold',
    secondary: 'bg-white/[0.07] text-white hover:bg-white/[0.12] border border-white/[0.08]',
    ghost: 'text-zinc-300 hover:text-white hover:bg-white/[0.07]',
    danger: 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20',
  }[variant];
  const s = size === 'sm' ? 'h-8 px-3 text-[12px] gap-1.5 rounded-lg' : 'h-10 px-4 text-[13px] gap-2 rounded-xl';
  return (
    <button className={`adm-press inline-flex items-center justify-center font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${v} ${s} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
}

const field = 'w-full rounded-xl bg-black/30 border border-white/10 focus:border-white/30 focus:outline-none text-[13px] text-white placeholder-zinc-600 transition-colors';

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium text-zinc-400 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-zinc-600 mt-1">{hint}</span>}
    </label>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className = '', ...p }, ref) {
  return <input ref={ref} className={`${field} h-10 px-3 ${className}`} {...p} />;
});

export function Textarea({ className = '', ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${field} px-3 py-2.5 leading-relaxed resize-y min-h-[90px] ${className}`} {...p} />;
}

export function Select({ className = '', children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${field} h-10 px-3 bg-[#141414] ${className}`} {...p}>
      {children}
    </select>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 text-[13px] text-zinc-300 disabled:opacity-40"
    >
      <span className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : ''}`} />
      </span>
      {label}
    </button>
  );
}

export function Tabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (v: T) => void; tabs: { id: T; label: string; count?: number }[] }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-black/30 border border-white/[0.06] overflow-x-auto max-w-full">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`h-8 px-3 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all ${value === t.id ? 'bg-white/[0.12] text-white shadow' : 'text-zinc-400 hover:text-white'}`}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 text-zinc-500">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Empty({ icon, title, text }: { icon?: React.ReactNode; title: string; text?: string }) {
  return (
    <div className="py-14 px-6 text-center">
      {icon && <div className="mx-auto mb-3 w-11 h-11 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400">{icon}</div>}
      <p className="text-[14px] font-medium text-zinc-200">{title}</p>
      {text && <p className="text-[12px] text-zinc-500 mt-1">{text}</p>}
    </div>
  );
}

export function Loading() {
  return (
    <div className="py-24 flex justify-center">
      <LoaderOne />
    </div>
  );
}

// Photo Discord avec repli sur l'initiale si l'image ne charge pas.
export function Avatar({ user, size = 32 }: { user: { pseudo: string; discordId?: string; avatar?: string }; size?: number }) {
  return <UserAvatar user={user as any} size={size} className="shrink-0" />;
}

// Panneau latéral de détail (plein écran sur mobile).
export function Drawer({ open, onClose, title, children, width = 640 }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; width?: number }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="adm-fade absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="adm-drawer absolute inset-y-0 right-0 w-full bg-[#151516] sm:border-l border-white/[0.08] shadow-2xl flex flex-col" style={{ maxWidth: width }}>
        <div className="h-16 shrink-0 px-5 flex items-center justify-between border-b border-white/[0.06]">
          <div className="min-w-0 text-[15px] font-semibold text-white truncate">{title}</div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center" aria-label="Fermer">
            <IconX size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-5">{children}</div>
      </aside>
    </div>
  );
}

// Liste de notes internes + ajout.
export function NotesBox({ notes, onAdd }: { notes: { id: string; by: string; at: string; text: string }[]; onAdd: (text: string) => Promise<void> }) {
  const [text, setText] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  return (
    <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] p-4">
      <p className="text-[12px] font-semibold text-amber-200/90 mb-3">Notes internes · invisibles pour le client</p>
      <div className="space-y-2.5 mb-3">
        {notes.length === 0 && <p className="text-[12px] text-zinc-500">Aucune note.</p>}
        {notes.map((n) => (
          <div key={n.id} className="text-[13px] text-zinc-200">
            <span className="text-zinc-500 text-[11px]">{n.by} · {timeAgo(n.at)}</span>
            <p className="whitespace-pre-line">{n.text}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ajouter une note…" onKeyDown={async (e) => {
          if (e.key === 'Enter' && text.trim() && !busy) {
            setBusy(true);
            await onAdd(text.trim());
            setText('');
            setBusy(false);
          }
        }} />
        <Button disabled={!text.trim() || busy} onClick={async () => { setBusy(true); await onAdd(text.trim()); setText(''); setBusy(false); }}>Ajouter</Button>
      </div>
    </div>
  );
}

// Envoi d'images vers /api/uploads, renvoie les noms de fichiers.
export async function uploadImages(files: FileList | File[]): Promise<string[]> {
  const names: string[] = [];
  for (const f of Array.from(files).slice(0, 6)) {
    const fd = new FormData();
    fd.append('file', f, f.name);
    const res = await fetch('/api/uploads', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.name) names.push(data.name);
  }
  return names;
}
