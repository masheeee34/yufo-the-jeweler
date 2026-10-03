'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconPackage, IconSearch } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Badge, Button, Card, Drawer, Empty, Field, fullDate, Input, Loading, money, NotesBox, PageHeader, Select, Tabs, timeAgo } from '@/components/admin/ui';
import { ORDER, PAYMENT, STAGE } from '@/components/admin/labels';

interface OrderRow {
  id: string;
  kind: 'premade' | 'custom';
  customer: string;
  discordId?: string;
  email?: string;
  amount: number;
  amountPaid?: number;
  items: { name: string; reference?: string; price: number; quantity: number }[];
  paymentMethod?: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  notes: { id: string; by: string; at: string; text: string }[];
}

export default function OrdersPage() {
  const { api, toast, confirm, refresh } = useAdmin();
  const params = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [kind, setKind] = useState<'all' | 'premade' | 'custom'>('all');
  const [payment, setPayment] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'date' | 'amount'>('date');
  const openId = params.get('id');

  const load = useCallback(async () => {
    const data = await api<{ orders: OrderRow[] }>('/api/admin/orders');
    if (data) setOrders(data.orders);
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const list = useMemo(() => {
    if (!orders) return [];
    const s = q.trim().toLowerCase();
    return orders
      .filter((o) => kind === 'all' || o.kind === kind)
      .filter((o) => !payment || o.paymentStatus === payment)
      .filter((o) => !s || `${o.id} ${o.customer} ${o.email || ''} ${o.items.map((i) => i.name).join(' ')}`.toLowerCase().includes(s))
      .sort((a, b) => (sort === 'amount' ? b.amount - a.amount : b.createdAt.localeCompare(a.createdAt)));
  }, [orders, kind, payment, q, sort]);

  const open = orders?.find((o) => o.id === openId) || null;
  const setOpen = (id: string | null) => router.replace(id ? `/admin/orders?id=${id}` : '/admin/orders', { scroll: false });

  const update = async (patch: Record<string, unknown>, label: string) => {
    if (!open) return;
    if (patch.paymentStatus === 'refunded' && !(await confirm({ title: 'Marquer comme remboursée ?', message: 'Le remboursement Stripe n’est pas encore automatique : faites-le d’abord depuis Stripe ou PayPal.', danger: true, confirmLabel: 'Marquer remboursée' }))) return;
    const res = await api('/api/admin/orders', { method: 'PATCH', body: { id: open.id, ...patch } });
    if (res) { toast(label); await load(); refresh(); }
  };

  return (
    <>
      <PageHeader title="Orders" subtitle="Toutes les commandes premade et custom." />

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between mb-4">
        <Tabs
          value={kind}
          onChange={setKind}
          tabs={[
            { id: 'all', label: 'Toutes', count: orders?.length },
            { id: 'premade', label: 'Premade', count: orders?.filter((o) => o.kind === 'premade').length },
            { id: 'custom', label: 'Custom', count: orders?.filter((o) => o.kind === 'custom').length },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <IconSearch size={16} className="absolute left-3 top-3 text-zinc-500" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Client, n°, produit…" className="pl-9" />
          </div>
          <Select value={payment} onChange={(e) => setPayment(e.target.value)} className="w-auto">
            <option value="">Tous paiements</option>
            {Object.entries(PAYMENT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value as 'date' | 'amount')} className="w-auto">
            <option value="date">Plus récentes</option>
            <option value="amount">Montant</option>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden">
        {!orders ? <Loading /> : list.length === 0 ? <Empty icon={<IconPackage size={20} />} title="Aucune commande" text="Les commandes premade et les projets custom avec devis apparaissent ici." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] md:min-w-[760px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-500 border-b border-white/[0.06]">
                  <th className="font-medium px-3 sm:px-5 py-3">Commande</th>
                  <th className="font-medium px-3 py-3 hidden sm:table-cell">Client</th>
                  <th className="font-medium px-3 py-3 hidden md:table-cell">Produits</th>
                  <th className="font-medium px-3 py-3">Paiement</th>
                  <th className="font-medium px-3 py-3">Statut</th>
                  <th className="font-medium px-5 py-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="adm-stagger">
                {list.map((o) => (
                  <tr key={o.id} onClick={() => setOpen(o.id)} className="adm-row cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.04]">
                    <td className="px-3 sm:px-5 py-3">
                      <span className="block text-white font-medium">{o.id}</span>
                      <span className="text-[11px] text-zinc-500"><span className="sm:hidden">{o.customer} · </span>{o.kind === 'custom' ? 'Custom' : 'Premade'} · {timeAgo(o.createdAt)}</span>
                    </td>
                    <td className="px-3 py-3 text-zinc-200 hidden sm:table-cell">{o.customer}</td>
                    <td className="px-3 py-3 text-zinc-400 max-w-[260px] truncate hidden md:table-cell">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</td>
                    <td className="px-3 py-3"><Badge tone={PAYMENT[o.paymentStatus]?.tone}>{PAYMENT[o.paymentStatus]?.label}</Badge></td>
                    <td className="px-3 py-3"><Badge tone={(o.kind === 'custom' ? STAGE : ORDER)[o.status]?.tone}>{(o.kind === 'custom' ? STAGE : ORDER)[o.status]?.label}</Badge></td>
                    <td className="px-3 sm:px-5 py-3 text-right font-semibold tabular-nums">{money(o.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? `${open.id} · ${open.customer}` : ''}>
        {open && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div><p className="text-zinc-500 text-[11px]">Date</p><p className="text-white">{fullDate(open.createdAt)}</p></div>
              <div><p className="text-zinc-500 text-[11px]">Type</p><p className="text-white">{open.kind === 'custom' ? 'Custom project' : 'Premade'}</p></div>
              <div><p className="text-zinc-500 text-[11px]">Client</p><p className="text-white">{open.customer}{open.discordId ? ` · ${open.discordId}` : ''}</p></div>
              <div><p className="text-zinc-500 text-[11px]">Email</p><p className="text-white break-all">{open.email || '—'}</p></div>
              <div><p className="text-zinc-500 text-[11px]">Moyen de paiement</p><p className="text-white">{open.paymentMethod || '—'}</p></div>
              <div><p className="text-zinc-500 text-[11px]">Montant</p><p className="text-white font-semibold">{money(open.amount)}{open.amountPaid !== undefined ? ` · payé ${money(open.amountPaid)}` : ''}</p></div>
            </div>

            <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.05]">
              {open.items.map((i, n) => (
                <div key={n} className="flex justify-between gap-3 px-4 py-3 text-[13px]">
                  <span className="text-zinc-200">{i.quantity}× {i.name}{i.reference ? <span className="text-zinc-500"> · {i.reference}</span> : null}</span>
                  <span className="tabular-nums text-white">{money(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>

            {open.kind === 'premade' ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Statut de la commande">
                  <Select value={open.status} onChange={(e) => update({ status: e.target.value }, 'Statut mis à jour')}>
                    {Object.entries(ORDER).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </Select>
                </Field>
                <Field label="Statut du paiement">
                  <Select value={open.paymentStatus} onChange={(e) => update({ paymentStatus: e.target.value }, 'Paiement mis à jour')}>
                    {Object.entries(PAYMENT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </Select>
                </Field>
                {open.paymentStatus === 'partial' && (
                  <Field label="Montant déjà payé ($)">
                    <Input type="number" min={0} step="0.01" defaultValue={open.amountPaid ?? ''} onBlur={(e) => e.target.value !== String(open.amountPaid ?? '') && update({ amountPaid: e.target.value }, 'Montant enregistré')} />
                  </Field>
                )}
              </div>
            ) : (
              <Card className="p-4 text-[13px] text-zinc-300 flex items-center justify-between gap-3">
                Statut, devis et paiement du projet se gèrent dans Custom projects.
                <Link href={`/admin/projects?id=${open.id}`}><Button size="sm">Ouvrir le projet</Button></Link>
              </Card>
            )}

            <Card className="p-4">
              <p className="text-[13px] font-semibold text-white">Fichiers et accès au téléchargement</p>
              <p className="text-[12px] text-zinc-500 mt-1">L’accès automatique aux fichiers après achat, le renvoi du lien et la révocation arrivent avec le File Manager (prochaine étape).</p>
            </Card>

            <NotesBox
              notes={open.notes}
              onAdd={async (text) => { if (await api('/api/admin/notes', { method: 'POST', body: { requestId: open.id, text } })) { toast('Note ajoutée'); await load(); } }}
            />
          </div>
        )}
      </Drawer>
    </>
  );
}
