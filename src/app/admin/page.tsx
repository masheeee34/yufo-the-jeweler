'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconCash, IconDiamond, IconFolderPlus, IconMail, IconPackage, IconPercentage, IconSparkles } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Badge, Button, Card, CardTitle, Empty, Loading, money, PageHeader, timeAgo } from '@/components/admin/ui';
import { ORDER, PAYMENT, STAGE } from '@/components/admin/labels';

interface Overview {
  stats: { revenueMonth: number; ordersMonth: number; activeProjects: number; unreadMessages: number };
  recentOrders: { id: string; customer: string; total: number; items: string; paymentStatus: string; status: string; at: string }[];
  activeProjects: { id: string; customer: string; piece?: string; stage: string; priority: boolean; budget?: string; at: string }[];
  unreadMessages: { id: string; customer: string; kind: string; text?: string; at: string }[];
  recentPayments: { id: string; customer: string; amount: number; paymentStatus: string; at: string; kind: string }[];
}

function Stat({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-zinc-500">
        <span className="text-[12px] font-medium">{label}</span>
        {icon}
      </div>
      <p className="mt-3 text-[26px] font-semibold tracking-tight text-white tabular-nums">{value}</p>
    </Card>
  );
}

function Row({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="adm-row flex items-center gap-3 px-5 py-3 hover:bg-white/[0.04] border-t border-white/[0.04]">
      {children}
    </Link>
  );
}

// Dashboard : vue rapide de l'activité, sans graphiques.
export default function DashboardPage() {
  const { api, me, can } = useAdmin();
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    api<Overview>('/api/admin/overview').then(setData);
  }, [api]);

  return (
    <>
      <PageHeader
        title={`Bonjour ${me.user.pseudo}`}
        subtitle="Vue rapide de l’activité de l’atelier."
        actions={
          <>
            {can('store') && (
              <Link href="/admin/creations?new=1"><Button variant="primary" icon={<IconDiamond size={16} />}>Add premade</Button></Link>
            )}
            {can('store') && (
              <Link href="/admin/categories?tab=collections&new=1"><Button icon={<IconFolderPlus size={16} />}>Add collection</Button></Link>
            )}
            <Button icon={<IconPercentage size={16} />} disabled title="Arrive avec le module Discounts">Create discount</Button>
          </>
        }
      />

      {!data ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          <div className="adm-stagger grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Stat label="Encaissé ce mois" value={money(data.stats.revenueMonth)} icon={<IconCash size={18} />} />
            <Stat label="Commandes ce mois" value={data.stats.ordersMonth} icon={<IconPackage size={18} />} />
            <Stat label="Projets custom actifs" value={data.stats.activeProjects} icon={<IconSparkles size={18} />} />
            <Stat label="Messages non lus" value={data.stats.unreadMessages} icon={<IconMail size={18} />} />
          </div>

          <div className="adm-stagger grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card>
              <CardTitle action={<Link href="/admin/orders" className="text-[12px] text-zinc-400 hover:text-white">Tout voir</Link>}>Commandes récentes</CardTitle>
              {data.recentOrders.length === 0 ? <Empty title="Aucune commande" /> : data.recentOrders.map((o) => (
                <Row key={o.id} href={`/admin/orders?id=${o.id}`}>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] text-white truncate">{o.customer} · {o.items || o.id}</span>
                    <span className="block text-[11px] text-zinc-500">{o.id} · {timeAgo(o.at)}</span>
                  </span>
                  <Badge tone={PAYMENT[o.paymentStatus]?.tone}>{PAYMENT[o.paymentStatus]?.label}</Badge>
                  <Badge tone={ORDER[o.status]?.tone}>{ORDER[o.status]?.label}</Badge>
                  <span className="w-16 text-right text-[13px] font-semibold tabular-nums">{money(o.total)}</span>
                </Row>
              ))}
            </Card>

            <Card>
              <CardTitle action={<Link href="/admin/projects" className="text-[12px] text-zinc-400 hover:text-white">Tout voir</Link>}>Projets custom actifs</CardTitle>
              {data.activeProjects.length === 0 ? <Empty title="Aucun projet en cours" /> : data.activeProjects.map((p) => (
                <Row key={p.id} href={`/admin/projects?id=${p.id}`}>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] text-white truncate">{p.customer} · {p.piece || 'Custom piece'}</span>
                    <span className="block text-[11px] text-zinc-500">{p.budget || '—'} · {timeAgo(p.at)}</span>
                  </span>
                  {p.priority && <Badge tone="red">Priority</Badge>}
                  <Badge tone={STAGE[p.stage]?.tone}>{STAGE[p.stage]?.label}</Badge>
                </Row>
              ))}
            </Card>

            <Card>
              <CardTitle action={<Link href="/admin/messages" className="text-[12px] text-zinc-400 hover:text-white">Tout voir</Link>}>Messages non lus</CardTitle>
              {data.unreadMessages.length === 0 ? <Empty title="Tout est à jour" /> : data.unreadMessages.map((m) => (
                <Row key={m.id} href={m.kind === 'project' ? `/admin/projects?id=${m.id}` : `/admin/messages?id=${m.id}`}>
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] text-white truncate">{m.customer}</span>
                    <span className="block text-[12px] text-zinc-500 truncate">{m.text}</span>
                  </span>
                  <span className="text-[11px] text-zinc-500 shrink-0">{timeAgo(m.at)}</span>
                </Row>
              ))}
            </Card>

            <Card>
              <CardTitle>Paiements récents</CardTitle>
              {data.recentPayments.length === 0 ? <Empty title="Aucun paiement enregistré" /> : data.recentPayments.map((p) => (
                <Row key={p.id + p.at} href={p.kind === 'custom' ? `/admin/projects?id=${p.id}` : `/admin/orders?id=${p.id}`}>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] text-white truncate">{p.customer}</span>
                    <span className="block text-[11px] text-zinc-500">{p.kind === 'custom' ? 'Custom' : 'Premade'} · {p.id} · {timeAgo(p.at)}</span>
                  </span>
                  <Badge tone={PAYMENT[p.paymentStatus]?.tone}>{PAYMENT[p.paymentStatus]?.label}</Badge>
                  <span className="w-16 text-right text-[13px] font-semibold tabular-nums">{money(p.amount)}</span>
                </Row>
              ))}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
