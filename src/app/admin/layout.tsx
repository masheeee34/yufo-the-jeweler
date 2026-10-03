'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { IconBrandDiscord, IconMenu2, IconSearch } from '@tabler/icons-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminMe, AdminProvider, useAdmin } from '@/components/admin/AdminContext';
import { LoaderOne } from '@/components/LoaderOne';
import { startDiscordLogin } from '@/components/admin/discordLogin';

function Gate({ state, pseudo }: { state: 'signin' | 'forbidden'; pseudo?: string }) {
  const pathname = usePathname() || '/admin';
  return (
    <main className="min-h-dvh bg-[#0c0c0d] flex items-center justify-center p-5 text-white font-sans">
      <div className="adm-pop w-full max-w-sm rounded-3xl bg-[#171717] border border-white/[0.07] p-8 text-center shadow-2xl">
        <span className="mx-auto w-12 h-12 rounded-xl bg-black border border-white/15 flex items-center justify-center">
          <Image src="/assets/brand/yufo_clean_white.png" alt="YUFO" width={30} height={32} className="object-contain" />
        </span>
        <h1 className="mt-5 text-[20px] font-semibold">YUFO Management</h1>
        {state === 'signin' ? (
          <>
            <p className="mt-2 text-[13px] text-zinc-400">Espace Management réservé à l’équipe. Connectez-vous avec votre compte Discord.</p>
            <button
              onClick={() => startDiscordLogin(pathname + window.location.search)}
              className="adm-press mt-7 w-full h-12 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <IconBrandDiscord size={20} /> Continuer avec Discord
            </button>
          </>
        ) : (
          <>
            <p className="mt-2 text-[13px] text-zinc-400">
              {pseudo ? <>Connecté en tant que <b className="text-white">{pseudo}</b>. </> : null}
              Ce compte ne fait pas partie de l’équipe. Demandez une invitation à un Founder.
            </p>
            <div className="mt-7 flex flex-col gap-2">
              <a href="/" className="h-11 rounded-xl bg-white/[0.08] hover:bg-white/[0.13] text-[13px] font-medium flex items-center justify-center transition-colors">Retour au site</a>
              <button
                onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); try { localStorage.removeItem('yufo_collector_user'); } catch {} startDiscordLogin(pathname); }}
                className="h-11 rounded-xl text-[13px] text-zinc-400 hover:text-white transition-colors"
              >
                Utiliser un autre compte Discord
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// Recherche globale (Ctrl K).
function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { api } = useAdmin();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ type: string; label: string; sub?: string; href: string }[]>([]);
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      const data = await api<{ results: typeof results }>(`/api/admin/search?q=${encodeURIComponent(q.trim())}`, { silent: true });
      setResults(data?.results || []);
      setIdx(0);
    }, 180);
    return () => clearTimeout(t);
  }, [q, api]);

  if (!open) return null;
  const go = (href: string) => { onClose(); router.push(href); };
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]">
      <div className="adm-fade absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="adm-pop relative w-full max-w-xl rounded-2xl bg-[#1a1a1b] border border-white/10 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.07]">
          <IconSearch size={18} className="text-zinc-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
              if (e.key === 'Enter' && results[idx]) go(results[idx].href);
            }}
            placeholder="Commande, projet, client, création…"
            className="flex-1 bg-transparent text-[15px] text-white placeholder-zinc-600 focus:outline-none"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-zinc-500">Esc</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {q.trim().length < 2 && <p className="px-3 py-6 text-center text-[12px] text-zinc-500">Tapez au moins 2 caractères.</p>}
          {q.trim().length >= 2 && results.length === 0 && <p className="px-3 py-6 text-center text-[12px] text-zinc-500">Aucun résultat.</p>}
          {results.map((r, i) => (
            <button
              key={r.href + i}
              onMouseEnter={() => setIdx(i)}
              onClick={() => go(r.href)}
              className={`w-full flex items-center gap-3 px-3 h-12 rounded-xl text-left transition-colors ${i === idx ? 'bg-white/[0.08]' : ''}`}
            >
              <span className="w-24 shrink-0 text-[11px] text-zinc-500">{r.type}</span>
              <span className="min-w-0">
                <span className="block text-[13px] text-white truncate">{r.label}</span>
                {r.sub && <span className="block text-[11px] text-zinc-500 truncate">{r.sub}</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const { me } = useAdmin();
  const pathname = usePathname();
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState(false);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearch((s) => !s);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    try { localStorage.removeItem('yufo_collector_user'); } catch {}
    window.location.href = '/';
  };

  return (
    <div className="h-dvh w-full bg-[#0c0c0d] text-white flex lg:gap-3 lg:p-3 font-sans selection:bg-white selection:text-black">
      <AdminSidebar mobileOpen={mobileNav} onCloseMobile={() => setMobileNav(false)} onSearch={() => setSearch(true)} onLogout={logout} />
      <section className="flex-1 min-w-0 flex flex-col bg-[#141414] lg:rounded-[20px] lg:border border-white/[0.05] overflow-hidden">
        <div className="lg:hidden h-14 shrink-0 px-3 flex items-center gap-2 border-b border-white/[0.06]">
          <button onClick={() => setMobileNav(true)} className="w-10 h-10 rounded-[10px] hover:bg-white/10 flex items-center justify-center text-zinc-300 relative" aria-label="Ouvrir le menu">
            <IconMenu2 size={20} />
            {me.counts.messages + me.counts.projects > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />}
          </button>
          <span className="text-[15px] font-semibold flex-1">YUFO Management</span>
          <button onClick={() => setSearch(true)} className="w-10 h-10 rounded-[10px] hover:bg-white/10 flex items-center justify-center text-zinc-300" aria-label="Rechercher">
            <IconSearch size={19} />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto overscroll-contain">
          <div key={pathname} className="adm-page max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-9">
            <Suspense fallback={<div className="py-24 flex justify-center"><LoaderOne /></div>}>{children}</Suspense>
          </div>
        </main>
      </section>
      <SearchPalette open={search} onClose={() => setSearch(false)} />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'signin' | 'forbidden' | 'ok'>('loading');
  const [me, setMe] = useState<AdminMe | null>(null);
  const [pseudo, setPseudo] = useState<string>();

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/session', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) { setMe(data); setState('ok'); }
      else { setPseudo(data.user?.pseudo); setState(res.status === 403 ? 'forbidden' : 'signin'); }
    } catch {
      setState('signin');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (state === 'loading') {
    return <div className="min-h-dvh bg-[#0c0c0d] flex items-center justify-center"><LoaderOne /></div>;
  }
  if (state !== 'ok' || !me) {
    // La page d'invitation reste accessible à un compte qui n'est pas encore dans l'équipe.
    return <JoinOrGate state={state === 'forbidden' ? 'forbidden' : 'signin'} pseudo={pseudo}>{children}</JoinOrGate>;
  }
  return (
    <AdminProvider initial={me}>
      <Shell>{children}</Shell>
    </AdminProvider>
  );
}

function JoinOrGate({ state, pseudo, children }: { state: 'signin' | 'forbidden'; pseudo?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin/join') return <Suspense fallback={null}>{children}</Suspense>;
  return <Gate state={state} pseudo={pseudo} />;
}
