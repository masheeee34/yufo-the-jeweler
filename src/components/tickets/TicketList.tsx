'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { IconLock, IconMessageCircle, IconSearch } from '@tabler/icons-react';
import { LoaderOne } from '../LoaderOne';
import { Flag, StatusPill } from './TicketBits';
import type { TicketSummary } from './types';
import { ago } from './types';

type View = 'active' | 'closed' | 'archived' | 'all';

// Liste des tickets : ceux du client, ou tous pour l'équipe (filtres et recherche).
export function TicketList({ compact = false }: { compact?: boolean }) {
  const [tickets, setTickets] = useState<TicketSummary[] | null>(null);
  const [staff, setStaff] = useState(false);
  const [view, setView] = useState<View>(compact ? 'all' : 'active');
  const [scope, setScope] = useState<'all' | 'mine'>(compact ? 'mine' : 'all');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    const p = new URLSearchParams({ view, scope });
    if (q.trim()) p.set('q', q.trim());
    const res = await fetch(`/api/tickets?${p}`, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    setTickets(data.tickets || []);
    setStaff(!!data.staff);
  }, [view, scope, q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  return (
    <div className="space-y-4 max-w-4xl">
      {!compact && (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex p-1 bg-zinc-950 border border-white/10 rounded-xl overflow-x-auto">
            {(['active', 'closed', 'archived', 'all'] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap ${view === v ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}>
                {v}
              </button>
            ))}
          </div>
          {staff && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a ticket or client" className="h-9 w-56 pl-9 pr-3 rounded-lg bg-zinc-950 border border-white/10 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-white/30" />
              </div>
              <button onClick={() => setScope(scope === 'all' ? 'mine' : 'all')} className="h-9 px-3 rounded-lg border border-white/10 text-xs text-zinc-300 hover:text-white whitespace-nowrap">
                {scope === 'all' ? 'All tickets' : 'Only mine'}
              </button>
            </div>
          )}
        </div>
      )}

      {tickets === null ? (
        <div className="py-16 flex justify-center"><LoaderOne /></div>
      ) : tickets.length === 0 ? (
        <div className="p-10 bg-zinc-950 border border-white/10 rounded-2xl text-center">
          <IconMessageCircle size={30} className="mx-auto text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-200 font-semibold">No tickets here</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">Send a custom request: a private ticket opens automatically to talk with the atelier and follow your project.</p>
          <Link href="/custom-orders" className="inline-block mt-5 text-xs text-white font-medium hover:underline">Start a custom request</Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link href={`/tickets/${t.id}`} className="block p-5 bg-zinc-950 border border-white/10 rounded-2xl hover:border-white/25 transition-colors">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-white truncate">{t.title}</span>
                    {t.locked && <IconLock size={14} className="text-zinc-400 shrink-0" aria-label="Locked" />}
                  </div>
                  <div className="flex items-center gap-2">
                    {t.archived && <Flag>Archived</Flag>}
                    {staff && (t.priority === 'high' || t.priority === 'urgent') && <Flag tone={t.priority === 'urgent' ? 'rose' : 'amber'}>{t.priority === 'urgent' ? 'Urgent' : 'High'}</Flag>}
                    <StatusPill status={t.status} />
                  </div>
                </div>
                {t.lastMessage && (
                  <p className="mt-2 text-xs text-zinc-400 line-clamp-1">
                    <span className="text-zinc-500">{t.lastMessage.fromStaff ? 'YUFO: ' : ''}</span>
                    {t.lastMessage.text || 'Attachment'}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="font-mono">{t.id}{staff ? ` · ${t.client}` : ''}</span>
                  <span>Updated {ago(t.updatedAt)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
