'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { IconAlertTriangle, IconCheck, IconX } from '@tabler/icons-react';

export type Role = 'founder' | 'admin' | 'jeweler' | 'support' | 'moderator';
export type Permission =
  | 'dashboard' | 'orders' | 'projects' | 'messages' | 'store' | 'reviews'
  | 'customers' | 'team' | 'settings' | 'payments' | 'security' | 'logs';

export interface AdminMe {
  user: { id: string; pseudo: string; discordId?: string; avatar?: string };
  role: Role;
  permissions: Permission[];
  counts: { orders: number; projects: number; messages: number; notifications: number };
}

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface Toast {
  id: number;
  text: string;
  tone: 'success' | 'error';
}

interface AdminCtx {
  me: AdminMe;
  can: (p: Permission) => boolean;
  refresh: () => Promise<void>;
  toast: (text: string, tone?: 'success' | 'error') => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  api: <T = any>(url: string, init?: { method?: string; body?: unknown; silent?: boolean }) => Promise<T | null>;
}

const Ctx = createContext<AdminCtx | null>(null);

export const useAdmin = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAdmin outside AdminProvider');
  return c;
};

export function AdminProvider({ initial, children }: { initial: AdminMe; children: React.ReactNode }) {
  const [me, setMe] = useState(initial);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const seq = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/session', { cache: 'no-store' });
      if (res.ok) setMe(await res.json());
    } catch {}
  }, []);

  // Compteurs de la barre latérale tenus à jour toutes les 30 secondes.
  useEffect(() => {
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, [refresh]);

  const toast = useCallback((text: string, tone: 'success' | 'error' = 'success') => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const confirm = useCallback((opts: ConfirmOptions) => new Promise<boolean>((resolve) => setDialog({ ...opts, resolve })), []);

  const api = useCallback(
    async <T,>(url: string, init: { method?: string; body?: unknown; silent?: boolean } = {}): Promise<T | null> => {
      try {
        const res = await fetch(url, {
          method: init.method || 'GET',
          headers: init.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
          body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
          cache: 'no-store',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!init.silent) toast(data.error || `Erreur ${res.status}`, 'error');
          return null;
        }
        return data as T;
      } catch {
        if (!init.silent) toast('Connexion au serveur impossible.', 'error');
        return null;
      }
    },
    [toast]
  );

  const close = (v: boolean) => {
    dialog?.resolve(v);
    setDialog(null);
  };

  return (
    <Ctx.Provider value={{ me, can: (p) => me.permissions.includes(p), refresh, toast, confirm, api }}>
      {children}

      {/* Toasts */}
      <div className="fixed z-[80] bottom-4 right-4 left-4 sm:left-auto flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`adm-toast pointer-events-auto flex items-center gap-2.5 pl-3 pr-4 h-11 rounded-xl border shadow-2xl text-[13px] font-medium ${
              t.tone === 'success' ? 'bg-[#1d1d1f] border-white/10 text-white' : 'bg-rose-950 border-rose-800/60 text-rose-100'
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${t.tone === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
              {t.tone === 'success' ? <IconCheck size={14} /> : <IconX size={14} />}
            </span>
            {t.text}
          </div>
        ))}
      </div>

      {/* Confirmation avant action sensible */}
      {dialog && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="adm-fade absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => close(false)} />
          <div role="alertdialog" aria-modal="true" className="adm-pop relative w-full max-w-sm rounded-2xl bg-[#1a1a1b] border border-white/10 p-6 shadow-2xl">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${dialog.danger ? 'bg-rose-500/15 text-rose-300' : 'bg-white/10 text-white'}`}>
              <IconAlertTriangle size={20} />
            </div>
            <h3 className="text-[16px] font-semibold text-white">{dialog.title}</h3>
            {dialog.message && <p className="mt-1.5 text-[13px] text-zinc-400 leading-relaxed">{dialog.message}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button autoFocus onClick={() => close(false)} className="h-10 px-4 rounded-lg text-[13px] text-zinc-300 hover:bg-white/10 transition-colors">
                Annuler
              </button>
              <button
                onClick={() => close(true)}
                className={`h-10 px-4 rounded-lg text-[13px] font-semibold transition-colors ${dialog.danger ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-950'}`}
              >
                {dialog.confirmLabel || 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
