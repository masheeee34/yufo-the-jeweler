'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { IconBell, IconCash, IconChecks, IconMail, IconPackage, IconSparkles, IconStar, IconUser, IconUsersGroup } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Badge, Button, Card, Empty, Loading, PageHeader, Tabs, timeAgo } from '@/components/admin/ui';

interface Ev { id: string; at: string; type: string; title: string; detail?: string; href: string; needsAction: boolean }

const ICONS: Record<string, React.ReactNode> = {
  order: <IconPackage size={17} />,
  payment: <IconCash size={17} />,
  project: <IconSparkles size={17} />,
  message: <IconMail size={17} />,
  review: <IconStar size={17} />,
  customer: <IconUser size={17} />,
  team: <IconUsersGroup size={17} />,
};

export default function NotificationsPage() {
  const { api, toast, refresh } = useAdmin();
  const [events, setEvents] = useState<Ev[] | null>(null);
  const [seenAt, setSeenAt] = useState<string | null>(null);
  const [filter, setFilter] = useState<'action' | 'all'>('action');

  const load = useCallback(async () => {
    const d = await api<{ events: Ev[]; seenAt: string | null }>('/api/admin/notifications');
    if (d) { setEvents(d.events); setSeenAt(d.seenAt); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const markRead = async () => {
    if (await api('/api/admin/notifications', { method: 'POST' })) { toast('Tout est marqué comme lu'); await load(); refresh(); }
  };

  const list = (events || []).filter((e) => filter === 'all' || e.needsAction);

  return (
    <>
      <PageHeader title="Notifications" subtitle="Les événements importants à traiter." actions={<Button icon={<IconChecks size={16} />} onClick={markRead}>Tout marquer comme lu</Button>} />
      <div className="mb-4">
        <Tabs value={filter} onChange={setFilter} tabs={[
          { id: 'action', label: 'À traiter', count: events?.filter((e) => e.needsAction).length },
          { id: 'all', label: 'Tout', count: events?.length },
        ]} />
      </div>
      <Card className="overflow-hidden">
        {!events ? <Loading /> : list.length === 0 ? <Empty icon={<IconBell size={20} />} title="Rien à traiter" text="Vous êtes à jour." /> : (
          <div className="adm-stagger">
            {list.map((e) => {
              const unread = !seenAt || e.at > seenAt;
              return (
                <Link key={e.id} href={e.href} className="adm-row flex items-start gap-3 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.04]">
                  <span className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${unread ? 'bg-white/[0.12] text-white' : 'bg-white/[0.05] text-zinc-500'}`}>{ICONS[e.type]}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[13px] ${unread ? 'text-white font-medium' : 'text-zinc-300'}`}>{e.title}</span>
                    {e.detail && <span className="block text-[12px] text-zinc-500 truncate">{e.detail}</span>}
                  </span>
                  <span className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] text-zinc-500">{timeAgo(e.at)}</span>
                    {e.needsAction && <Badge tone="amber">À traiter</Badge>}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}
