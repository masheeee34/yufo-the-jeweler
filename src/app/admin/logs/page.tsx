'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { IconHistory, IconSearch } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Badge, Card, Empty, fullDate, Input, Loading, PageHeader, Select, timeAgo } from '@/components/admin/ui';
import { ROLE_LABEL } from '@/components/admin/labels';

interface Entry { id: string; at: string; by: string; role?: string; action: string; target?: string; detail?: string; before?: unknown; after?: unknown }

const AREAS: Record<string, string> = {
  product: 'Creations', category: 'Categories', collection: 'Collections', review: 'Reviews', order: 'Orders', project: 'Custom projects',
  ticket: 'Messages', note: 'Notes', file: 'Files', customer: 'Customers', team: 'Team', invitation: 'Invitations', settings: 'Settings', security: 'Security',
};

const ACTION_LABEL: Record<string, string> = {
  create: 'a créé', update: 'a modifié', trash: 'a mis à la corbeille', restore: 'a restauré', delete_permanent: 'a supprimé définitivement',
  duplicate: 'a dupliqué', reorder: 'a réordonné', products: 'a changé les créations de', preview: 'a envoyé une preview pour',
  final_files: 'a livré les fichiers de', add: 'a ajouté une note sur', note: 'a ajouté une note sur', role: 'a changé le rôle de',
  remove: 'a retiré', join: 'a rejoint l’équipe', revoke: 'a révoqué', revoke_sessions: 'a déconnecté des sessions',
  verified_status: 'a changé le statut vérifié de', general: 'a modifié les réglages généraux', customOrders: 'a modifié les réglages custom',
  payments: 'a modifié les paiements', security: 'a modifié la sécurité',
  upload: 'a ajouté le fichier', version: 'a remplacé (nouvelle version)', grant: 'a donné l’accès à', restore_access: 'a restauré l’accès à',
  resend_access: 'a renvoyé l’accès de', deliver: 'a livré un fichier pour',
};

function Value({ v }: { v: unknown }) {
  if (v === undefined || v === null || v === '') return <span className="text-zinc-600">—</span>;
  if (typeof v === 'object') return <span className="break-all">{JSON.stringify(v)}</span>;
  return <span className="break-all">{String(v)}</span>;
}

export default function LogsPage() {
  const { api } = useAdmin();
  const [logs, setLogs] = useState<Entry[] | null>(null);
  const [q, setQ] = useState('');
  const [area, setArea] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const d = await api<{ logs: Entry[] }>(`/api/admin/logs?q=${encodeURIComponent(q)}&area=${area}`);
    if (d) setLogs(d.logs);
  }, [api, q, area]);
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);

  return (
    <>
      <PageHeader title="Activity logs" subtitle="Qui a fait quoi, et quand. Le journal ne peut pas être modifié depuis l’admin." />
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch size={16} className="absolute left-3 top-3 text-zinc-500" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Membre, élément, détail…" className="pl-9" />
        </div>
        <Select value={area} onChange={(e) => setArea(e.target.value)} className="w-auto">
          <option value="">Toutes les sections</option>
          {Object.entries(AREAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </div>
      <Card className="overflow-hidden">
        {!logs ? <Loading /> : logs.length === 0 ? <Empty icon={<IconHistory size={20} />} title="Aucune action enregistrée" /> : logs.map((e) => {
          const [section, verb] = e.action.split('.');
          const hasDiff = e.before !== undefined || e.after !== undefined;
          const expanded = open === e.id;
          return (
            <div key={e.id} className="border-b border-white/[0.04]">
              <button onClick={() => hasDiff && setOpen(expanded ? null : e.id)} className={`adm-row w-full text-left flex items-start gap-3 px-5 py-3 ${hasDiff ? 'hover:bg-white/[0.03] cursor-pointer' : 'cursor-default'}`}>
                <span className="w-24 shrink-0 text-[11px] text-zinc-500 pt-0.5" title={fullDate(e.at)}>{timeAgo(e.at)}</span>
                <span className="min-w-0 flex-1 text-[13px] text-zinc-300">
                  <b className="text-white font-medium">{e.by}</b>{e.role ? <span className="text-zinc-500"> ({ROLE_LABEL[e.role] || e.role})</span> : null} {ACTION_LABEL[verb] || verb}
                  {e.target ? <> <b className="text-white font-medium">{e.target}</b></> : null}
                  {e.detail ? <span className="text-zinc-500"> · {e.detail}</span> : null}
                </span>
                <Badge>{AREAS[section] || section}</Badge>
              </button>
              {expanded && (
                <div className="adm-fade px-5 pb-4 pl-[8.25rem] grid sm:grid-cols-2 gap-3 text-[12px]">
                  <div className="rounded-lg bg-rose-500/[0.06] border border-rose-500/15 p-3">
                    <p className="text-rose-300 font-semibold mb-1.5">Avant</p>
                    {e.before && typeof e.before === 'object' ? Object.entries(e.before as Record<string, unknown>).map(([k, v]) => <p key={k} className="text-zinc-300"><span className="text-zinc-500">{k} :</span> <Value v={v} /></p>) : <Value v={e.before} />}
                  </div>
                  <div className="rounded-lg bg-emerald-500/[0.06] border border-emerald-500/15 p-3">
                    <p className="text-emerald-300 font-semibold mb-1.5">Après</p>
                    {e.after && typeof e.after === 'object' ? Object.entries(e.after as Record<string, unknown>).map(([k, v]) => <p key={k} className="text-zinc-300"><span className="text-zinc-500">{k} :</span> <Value v={v} /></p>) : <Value v={e.after} />}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card>
    </>
  );
}
