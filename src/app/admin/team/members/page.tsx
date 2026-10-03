'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { IconCheck, IconMailForward, IconTrash, IconUsers } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Avatar, Badge, Button, Card, CardTitle, Empty, Loading, PageHeader, Select, timeAgo } from '@/components/admin/ui';
import { ROLE_LABEL } from '@/components/admin/labels';

interface Member { discordId: string; role: string; addedAt: string; addedBy?: string; pseudo: string; avatar?: string; lastSeenAt?: string; manageable: boolean }

const PERM_LABEL: Record<string, string> = {
  dashboard: 'Dashboard', orders: 'Orders', projects: 'Custom projects', messages: 'Messages', store: 'Creations & categories',
  reviews: 'Reviews', customers: 'Customers', team: 'Team', settings: 'Settings', payments: 'Payments', security: 'Security', logs: 'Activity logs',
};
const ROLES = ['founder', 'admin', 'jeweler', 'support', 'moderator'];

export default function MembersPage() {
  const { api, toast, confirm } = useAdmin();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [me, setMe] = useState('');
  const [myRole, setMyRole] = useState('');
  const [perms, setPerms] = useState<Record<string, string[]>>({});

  const load = useCallback(async () => {
    const d = await api<{ members: Member[]; me: string; myRole: string; rolePermissions: Record<string, string[]> }>('/api/admin/team');
    if (d) { setMembers(d.members); setMe(d.me); setMyRole(d.myRole); setPerms(d.rolePermissions); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const assignable = myRole === 'founder' ? ROLES : ROLES.filter((r) => r !== 'founder' && r !== 'admin');

  const changeRole = async (m: Member, role: string) => {
    if (role === 'founder' && !(await confirm({ title: `Passer ${m.pseudo} en Founder ?`, message: 'Un Founder a tous les droits, y compris paiements, sécurité et gestion des autres Founders.', confirmLabel: 'Confirmer' }))) return;
    if (await api('/api/admin/team', { method: 'PATCH', body: { discordId: m.discordId, role } })) { toast('Rôle mis à jour'); await load(); }
  };
  const remove = async (m: Member) => {
    if (!(await confirm({ title: `Retirer ${m.pseudo} de l’équipe ?`, message: 'Son accès au back-office est coupé immédiatement.', danger: true, confirmLabel: 'Retirer' }))) return;
    if (await api(`/api/admin/team?discordId=${m.discordId}`, { method: 'DELETE' })) { toast('Membre retiré'); await load(); }
  };

  return (
    <>
      <PageHeader title="Members" subtitle="Les personnes qui ont accès au back-office." actions={<Link href="/admin/team/invitations"><Button variant="primary" icon={<IconMailForward size={16} />}>Inviter</Button></Link>} />
      <Card className="overflow-hidden mb-6">
        {!members ? <Loading /> : members.length === 0 ? <Empty icon={<IconUsers size={20} />} title="Aucun membre" /> : (
          <div className="adm-stagger">
            {members.map((m) => (
              <div key={m.discordId} className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/[0.04]">
                <Avatar user={m} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-white flex items-center gap-2">{m.pseudo} {m.discordId === me && <Badge>Vous</Badge>}</p>
                  <p className="text-[12px] text-zinc-500 truncate">{m.discordId} · {m.lastSeenAt ? `vu ${timeAgo(m.lastSeenAt)}` : 'jamais connecté'}{m.addedBy ? ` · invité par ${m.addedBy}` : ''}</p>
                </div>
                {m.manageable ? (
                  <Select value={m.role} onChange={(e) => changeRole(m, e.target.value)} className="w-36 h-9">
                    {ROLES.filter((r) => assignable.includes(r) || r === m.role).map((r) => <option key={r} value={r} disabled={!assignable.includes(r)}>{ROLE_LABEL[r]}</option>)}
                  </Select>
                ) : (
                  <Badge tone={m.role === 'founder' ? 'amber' : 'neutral'}>{ROLE_LABEL[m.role]}</Badge>
                )}
                {m.manageable && (
                  <button onClick={() => remove(m)} aria-label="Retirer" title="Retirer" className="w-9 h-9 rounded-lg text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center"><IconTrash size={16} /></button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="overflow-x-auto">
        <CardTitle>Permissions par rôle</CardTitle>
        <table className="w-full min-w-[620px] text-[12px]">
          <thead>
            <tr className="text-zinc-500 border-y border-white/[0.06]">
              <th className="text-left font-medium px-5 py-2.5">Section</th>
              {ROLES.map((r) => <th key={r} className="font-medium px-3 py-2.5">{ROLE_LABEL[r]}</th>)}
            </tr>
          </thead>
          <tbody>
            {Object.keys(PERM_LABEL).map((p) => (
              <tr key={p} className="border-b border-white/[0.04]">
                <td className="px-5 py-2 text-zinc-300">{PERM_LABEL[p]}</td>
                {ROLES.map((r) => <td key={r} className="text-center px-3 py-2">{perms[r]?.includes(p) ? <IconCheck size={15} className="inline text-emerald-400" /> : <span className="text-zinc-700">—</span>}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
