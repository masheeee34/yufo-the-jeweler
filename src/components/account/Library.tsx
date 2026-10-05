'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconDownload, IconPackage } from '@tabler/icons-react';
import { useAuth } from '../../lib/authContext';
import { LoaderOne } from '../LoaderOne';

interface LibraryFile {
  id: string;
  name: string;
  description?: string;
  version: number;
  fileName: string;
  size: number;
  updatedAt: string;
}

const size = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

const PAYMENT: Record<string, { label: string; cls: string }> = {
  paid: { label: 'Paid', cls: 'bg-emerald-500/10 text-emerald-300' },
  partial: { label: 'Partly paid', cls: 'bg-amber-500/10 text-amber-300' },
  refunded: { label: 'Refunded', cls: 'bg-zinc-500/15 text-zinc-300' },
  unpaid: { label: 'Awaiting payment', cls: 'bg-amber-500/10 text-amber-300' },
};

// Bibliothèque : achats (y compris ceux faits en invité puis rattachés) et fichiers téléchargeables.
export function Library() {
  const { inquiries } = useAuth();
  const [files, setFiles] = useState<LibraryFile[] | null>(null);
  useEffect(() => {
    fetch('/api/files')
      .then((r) => r.json())
      .then((d) => setFiles(d.files || []))
      .catch(() => setFiles([]));
  }, []);
  const orders = inquiries.filter((i) => i.id.startsWith('YUF-ORD'));

  return (
    <div className="space-y-10 max-w-4xl">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Files</h2>
        {files === null ? (
          <div className="py-10 flex justify-center"><LoaderOne /></div>
        ) : files.length === 0 ? (
          <div className="p-8 bg-zinc-950 border border-white/10 rounded-2xl text-center">
            <p className="text-sm text-zinc-200 font-semibold">No files yet</p>
            <p className="text-xs text-zinc-500 mt-1">Your .ydd / .ytd files appear here as soon as your order is confirmed.</p>
          </div>
        ) : (
          files.map((f) => (
            <div key={f.id} className="p-5 bg-zinc-950 border border-white/10 rounded-2xl flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{f.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5 truncate">{f.fileName} · {size(f.size)} · v{f.version} · updated {new Date(f.updatedAt).toLocaleDateString()}</p>
                {f.description && <p className="text-xs text-zinc-400 mt-1">{f.description}</p>}
              </div>
              <a href={`/api/files/${f.id}`} className="shrink-0 h-10 px-5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold flex items-center gap-2 transition-colors">
                <IconDownload size={15} /> Download
              </a>
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Purchases</h2>
        {orders.length === 0 ? (
          <div className="p-8 bg-zinc-950 border border-white/10 rounded-2xl text-center">
            <IconPackage size={28} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-200 font-semibold">No purchases yet</p>
            <p className="text-xs text-zinc-500 mt-1">Bought as a guest with this email? Your purchases appear here once your email is confirmed.</p>
            <Link href="/collections/shop-all" className="inline-block mt-4 text-xs text-white hover:underline">Browse creations</Link>
          </div>
        ) : (
          orders.map((o) => {
            const pay = PAYMENT[o.order?.paymentStatus || 'unpaid'] || PAYMENT.unpaid;
            return (
              <div key={o.id} className="p-5 bg-zinc-950 border border-white/10 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-zinc-400">{o.id}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${pay.cls}`}>{pay.label}</span>
                </div>
                <ul className="text-sm text-white space-y-1">
                  {(o.order?.items || []).map((it, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span className="truncate">{it.quantity}× {it.name}</span>
                      <span className="text-zinc-400 shrink-0">${(it.price * it.quantity).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-500">
                  <span>{new Date(o.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {typeof o.order?.total === 'number' && <span className="text-white font-semibold">Total ${o.order.total.toLocaleString()}</span>}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
