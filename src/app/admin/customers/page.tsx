'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconSearch, IconUsers, IconX } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Avatar, Badge, Button, Card, Drawer, Empty, Field, fullDate, Input, Loading, money, NotesBox, PageHeader, Select, timeAgo } from '@/components/admin/ui';
import { ORDER, PAYMENT, STAGE, TICKET } from '@/components/admin/labels';
import { GrantList, GrantRow } from '@/components/admin/GrantList';

// Fichiers possédés : accès du File Manager (révocables) + anciens liens livrés dans les projets.
function CustomerFiles({ userId, links }: { userId: string; links: { label: string; url: string; projectId: string }[] }) {
  const { api, toast, can } = useAdmin();
  const [grants, setGrants] = useState<GrantRow[] | null>(null);
  const [files, setFiles] = useState<{ id: string; name: string; deletedAt?: string }[]>([]);
  const [sel, setSel] = useState('');
  const load = useCallback(async () => {
    const d = await api<{ grants: GrantRow[] }>(`/api/admin/files/grants?userId=${userId}`, { silent: true });
    setGrants(d ? d.grants : []);
  }, [api, userId]);
  useEffect(() => {
    load();
    if (can('store')) api<{ files: typeof files }>('/api/admin/files', { silent: true }).then((d) => d && setFiles(d.files.filter((f) => !f.deletedAt)));
  }, [load, api, can]);
  return (
    <section>
      <h3 className="text-[12px] uppercase tracking-wider text-zinc-500 mb-1.5">Fichiers possédés</h3>
      {grants === null ? <Loading /> : <GrantList grants={grants} show="customer" onChanged={load} />}
      {links.map((f, i) => <a key={i} href={f.url} target="_blank" rel="noreferrer" className="block py-1.5 text-[13px] text-sky-300 hover:underline">{f.label} <span className="text-zinc-500">· lien · {f.projectId}</span></a>)}
      {files.length > 0 && (
        <div className="mt-2 flex gap-2">
          <Select value={sel} onChange={(e) => setSel(e.target.value)} className="h-9">
            <option value="">Attribuer un fichier à ce client…</option>
            {files.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </Select>
          <Button size="sm" disabled={!sel} onClick={async () => {
            const r = await api<{ changed: boolean }>('/api/admin/files/grants', { method: 'POST', body: { fileId: sel, userId } });
            if (r) { toast(r.changed ? 'Fichier attribué' : 'Le client y a déjà accès'); setSel(''); await load(); }
          }}>Attribuer</Button>
        </div>
      )}
    </section>
  );
}

interface Customer {
  id: string; pseudo: string; email?: string; discordId?: string; discordTag?: string; avatar?: string; fivemId?: string;
  createdAt: string; vipTier: string; orders: number; projects: number; tickets: number; spent: number; lastActivity?: string;
  tags: string[]; discountPercent?: number;
}
interface Detail {
  customer: Customer;
  record: { notes: { id: string; by: string; at: string; text: string }[]; tags: string[]; discountPercent?: number };
  orders: { id: string; at: string; total: number; status: string; paymentStatus: string; items: { name: string }[] }[];
  projects: { id: string; at: string; piece?: string; stage: string; price?: number; paymentStatus?: string }[];
  tickets: { id: string; at: string; subject: string; status: string }[];
  reviews: { id: string; rating: number; message: string; createdAt: string }[];
  files: { label: string; url: string; at: string; projectId: string }[];
}

const SUGGESTED_TAGS = ['Returning', 'VIP', 'Server owner', 'Creator', 'Wholesale'];

export default function CustomersPage() {
  const { api } = useAdmin();
  const params = useSearchParams();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState<'recent' | 'spent' | 'orders'>('recent');
  const openId = params.get('id');

  const load = useCallback(async () => {
    const d = await api<{ customers: Customer[] }>('/api/admin/customers');
    if (d) setCustomers(d.customers);
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const allTags = useMemo(() => [...new Set((customers || []).flatMap((c) => c.tags))], [customers]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (customers || [])
      .filter((c) => !s || `${c.pseudo} ${c.email || ''} ${c.discordTag || ''} ${c.discordId || ''}`.toLowerCase().includes(s))
      .filter((c) => !tag || c.tags.includes(tag))
      .sort((a, b) => (sort === 'spent' ? b.spent - a.spent : sort === 'orders' ? b.orders + b.projects - (a.orders + a.projects) : (b.lastActivity || b.createdAt).localeCompare(a.lastActivity || a.createdAt)));
  }, [customers, q, tag, sort]);

  return (
    <>
      <PageHeader title="Customers" subtitle="Profils clients, historique et commandes." />
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch size={16} className="absolute left-3 top-3 text-zinc-500" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pseudo, Discord, email…" className="pl-9" />
        </div>
        <Select value={tag} onChange={(e) => setTag(e.target.value)} className="w-auto">
          <option value="">Tous les tags</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="w-auto">
          <option value="recent">Activité récente</option>
          <option value="spent">Total dépensé</option>
          <option value="orders">Nombre de commandes</option>
        </Select>
      </div>

      <Card className="overflow-hidden">
        {!customers ? <Loading /> : list.length === 0 ? <Empty icon={<IconUsers size={20} />} title="Aucun client" /> : (
          <div className="adm-stagger">
            {list.map((c) => (
              <button key={c.id} onClick={() => router.replace(`/admin/customers?id=${c.id}`, { scroll: false })} className="adm-row w-full text-left flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.04]">
                <Avatar user={c} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-medium text-white">{c.pseudo}</span>
                    {c.tags.map((t) => <Badge key={t} tone="violet">{t}</Badge>)}
                    {c.discountPercent ? <Badge tone="green">-{c.discountPercent}%</Badge> : null}
                  </span>
                  <span className="block text-[12px] text-zinc-500 truncate">{c.discordTag ? `@${c.discordTag}` : c.email || '—'} · actif {timeAgo(c.lastActivity || c.createdAt)}</span>
                </span>
                <span className="hidden sm:block text-right text-[12px] text-zinc-400 w-28">{c.orders} cmd · {c.projects} custom</span>
                <span className="w-20 text-right text-[13px] font-semibold tabular-nums">{money(c.spent)}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Drawer open={!!openId} onClose={() => router.replace('/admin/customers', { scroll: false })} width={720} title="Fiche client">
        {openId && <CustomerDetail id={openId} onChanged={load} />}
      </Drawer>
    </>
  );
}

function CustomerDetail({ id, onChanged }: { id: string; onChanged: () => Promise<void> }) {
  const { api, toast } = useAdmin();
  const [d, setD] = useState<Detail | null>(null);
  const [newTag, setNewTag] = useState('');

  const load = useCallback(async () => {
    const r = await api<Detail>(`/api/admin/customers?id=${encodeURIComponent(id)}`);
    if (r) setD(r);
  }, [api, id]);
  useEffect(() => { load(); }, [load]);

  const save = async (body: Record<string, unknown>, label: string) => {
    if (await api('/api/admin/customers', { method: 'PATCH', body: { id, ...body } })) { toast(label); await load(); await onChanged(); }
  };

  if (!d) return <Loading />;
  const c = d.customer;
  const tags = d.record.tags;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar user={c} size={56} />
        <div className="min-w-0">
          <p className="text-[18px] font-semibold text-white">{c.pseudo}</p>
          <p className="text-[12px] text-zinc-500">{c.discordTag ? `@${c.discordTag}` : ''}{c.discordId ? ` · ${c.discordId}` : ''}</p>
          <p className="text-[12px] text-zinc-500">{c.email || 'Pas d’email'}{c.fivemId ? ` · ${c.fivemId}` : ''} · client depuis {fullDate(c.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-[11px] text-zinc-500">Total dépensé</p><p className="text-[20px] font-semibold tabular-nums">{money(c.spent)}</p></Card>
        <Card className="p-4"><p className="text-[11px] text-zinc-500">Commandes</p><p className="text-[20px] font-semibold">{c.orders}</p></Card>
        <Card className="p-4"><p className="text-[11px] text-zinc-500">Projets custom</p><p className="text-[20px] font-semibold">{c.projects}</p></Card>
      </div>

      <section className="grid sm:grid-cols-2 gap-4">
        <Field label="Tags">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1 rounded-lg bg-violet-500/15 text-violet-200 text-[12px]">
                {t}
                <button onClick={() => save({ tags: tags.filter((x) => x !== t) }, 'Tag retiré')} className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center" aria-label={`Retirer ${t}`}><IconX size={12} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Ajouter un tag" list="tag-suggestions" className="h-9"
              onKeyDown={(e) => { if (e.key === 'Enter' && newTag.trim()) { save({ tags: [...tags, newTag.trim()] }, 'Tag ajouté'); setNewTag(''); } }} />
            <datalist id="tag-suggestions">{SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((t) => <option key={t} value={t} />)}</datalist>
            <Button size="sm" disabled={!newTag.trim()} onClick={() => { save({ tags: [...tags, newTag.trim()] }, 'Tag ajouté'); setNewTag(''); }}>Ajouter</Button>
          </div>
        </Field>
        <Field label="Remise personnelle (%)" hint="Appliquée automatiquement avec le module Discounts (prochaine étape).">
          <Input type="number" min={0} max={90} defaultValue={d.record.discountPercent ?? ''} key={d.record.discountPercent} onBlur={(e) => e.target.value !== String(d.record.discountPercent ?? '') && save({ discountPercent: e.target.value || 0 }, 'Remise enregistrée')} className="h-9" />
        </Field>
      </section>

      <Section title={`Commandes (${d.orders.length})`}>
        {d.orders.length === 0 ? <p className="text-[12px] text-zinc-500">Aucune.</p> : d.orders.map((o) => (
          <Link key={o.id} href={`/admin/orders?id=${o.id}`} className="flex items-center gap-2 py-2 text-[13px] hover:text-white">
            <span className="flex-1 text-zinc-300 truncate">{o.id} · {o.items.map((i) => i.name).join(', ')}</span>
            <Badge tone={PAYMENT[o.paymentStatus]?.tone}>{PAYMENT[o.paymentStatus]?.label}</Badge>
            <Badge tone={ORDER[o.status]?.tone}>{ORDER[o.status]?.label}</Badge>
            <span className="w-16 text-right tabular-nums">{money(o.total)}</span>
          </Link>
        ))}
      </Section>

      <Section title={`Projets custom (${d.projects.length})`}>
        {d.projects.length === 0 ? <p className="text-[12px] text-zinc-500">Aucun.</p> : d.projects.map((p) => (
          <Link key={p.id} href={`/admin/projects?id=${p.id}`} className="flex items-center gap-2 py-2 text-[13px] hover:text-white">
            <span className="flex-1 text-zinc-300 truncate">{p.piece || 'Custom piece'} · {timeAgo(p.at)}</span>
            <Badge tone={STAGE[p.stage]?.tone}>{STAGE[p.stage]?.label}</Badge>
            <span className="w-16 text-right tabular-nums">{p.price !== undefined ? money(p.price) : '—'}</span>
          </Link>
        ))}
      </Section>

      <CustomerFiles userId={c.id} links={d.files.filter((f) => /^https?:/.test(f.url))} />

      <Section title={`Tickets (${d.tickets.length})`}>
        {d.tickets.length === 0 ? <p className="text-[12px] text-zinc-500">Aucun.</p> : d.tickets.map((t) => (
          <Link key={t.id} href={`/admin/messages?id=${t.id}`} className="flex items-center gap-2 py-2 text-[13px] hover:text-white">
            <span className="flex-1 text-zinc-300 truncate">{t.subject}</span>
            <Badge tone={TICKET[t.status]?.tone}>{TICKET[t.status]?.label}</Badge>
          </Link>
        ))}
      </Section>

      <Section title={`Avis laissés (${d.reviews.length})`}>
        {d.reviews.length === 0 ? <p className="text-[12px] text-zinc-500">Aucun.</p> : d.reviews.map((r) => (
          <p key={r.id} className="py-1.5 text-[13px] text-zinc-300"><span className="text-amber-300">{'★'.repeat(r.rating)}</span> {r.message.slice(0, 140)}</p>
        ))}
      </Section>

      <NotesBox notes={d.record.notes} onAdd={async (text) => save({ note: text }, 'Note ajoutée')} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[12px] uppercase tracking-wider text-zinc-500 mb-1.5">{title}</h3>
      <div className="divide-y divide-white/[0.05]">{children}</div>
    </section>
  );
}
