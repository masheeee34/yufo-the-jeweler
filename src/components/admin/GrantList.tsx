'use client';

import React from 'react';
import { useAdmin } from './AdminContext';
import { Badge, Button, timeAgo } from './ui';

export interface GrantRow {
  id: string;
  fileId: string;
  fileName: string;
  fileVersion?: number;
  customer: string;
  source: 'order' | 'project' | 'manual';
  refId?: string;
  grantedAt: string;
  grantedBy: string;
  revokedAt?: string;
  downloads: number;
  lastDownloadAt?: string;
}

const SOURCE = { order: 'Achat', project: 'Projet custom', manual: 'Manuel' };

// Liste d'accès fichiers avec révocation / restauration (utilisée dans Files, Orders et Customers).
export function GrantList({ grants, show, onChanged }: { grants: GrantRow[]; show: 'file' | 'customer'; onChanged: () => Promise<void> }) {
  const { api, toast, confirm } = useAdmin();
  const toggle = async (g: GrantRow) => {
    if (!g.revokedAt && !(await confirm({ title: 'Révoquer cet accès ?', message: `${g.customer} ne pourra plus télécharger « ${g.fileName} ».`, danger: true, confirmLabel: 'Révoquer' }))) return;
    if (await api('/api/admin/files/grants', { method: 'PATCH', body: { id: g.id, revoke: !g.revokedAt } })) {
      toast(g.revokedAt ? 'Accès restauré' : 'Accès révoqué');
      await onChanged();
    }
  };
  if (grants.length === 0) return <p className="text-[12px] text-zinc-500">Aucun accès.</p>;
  return (
    <div className="divide-y divide-white/[0.05]">
      {grants.map((g) => (
        <div key={g.id} className="flex items-center gap-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className={`text-[13px] ${g.revokedAt ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{show === 'file' ? g.customer : g.fileName}</p>
            <p className="text-[11px] text-zinc-500">
              {SOURCE[g.source]}{g.refId ? ` · ${g.refId}` : ''} · {timeAgo(g.grantedAt)} · {g.downloads} téléchargement{g.downloads > 1 ? 's' : ''}
              {g.lastDownloadAt ? ` (dernier ${timeAgo(g.lastDownloadAt)})` : ''}
            </p>
          </div>
          {g.revokedAt ? <Badge tone="red">Révoqué</Badge> : <Badge tone="green">Actif</Badge>}
          <Button size="sm" variant={g.revokedAt ? 'secondary' : 'ghost'} onClick={() => toggle(g)}>{g.revokedAt ? 'Restaurer' : 'Révoquer'}</Button>
        </div>
      ))}
    </div>
  );
}
