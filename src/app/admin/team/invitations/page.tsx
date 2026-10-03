'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { IconCopy, IconMailForward, IconPlus } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Badge, Button, Card, Empty, Field, Loading, PageHeader, Select, timeAgo } from '@/components/admin/ui';
import { ROLE_LABEL } from '@/components/admin/labels';

interface Inv { code: string; role: string; createdAt: string; expiresAt: string; createdBy: string; usedBy?: string; usedAt?: string; state: 'pending' | 'used' | 'expired' | 'revoked' }

const STATE = { pending: { label: 'En attente', tone: 'amber' as const }, used: { label: 'Acceptée', tone: 'green' as const }, expired: { label: 'Expirée', tone: 'neutral' as const }, revoked: { label: 'Révoquée', tone: 'red' as const } };

export default function InvitationsPage() {
  const { api, toast, confirm } = useAdmin();
  const [list, setList] = useState<Inv[] | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [role, setRole] = useState('support');

  const load = useCallback(async () => {
    const d = await api<{ invitations: Inv[]; assignableRoles: string[] }>('/api/admin/invitations');
    if (d) { setList(d.invitations); setRoles(d.assignableRoles); if (!d.assignableRoles.includes(role)) setRole(d.assignableRoles[d.assignableRoles.length - 1]); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const link = (code: string) => `${window.location.origin}/admin/join?code=${code}`;
  const copy = async (code: string) => {
    try { await navigator.clipboard.writeText(link(code)); toast('Lien copié'); } catch { toast('Copie impossible : sélectionnez le lien à la main.', 'error'); }
  };
  const create = async () => {
    const d = await api<{ invitation: Inv }>('/api/admin/invitations', { method: 'POST', body: { role } });
    if (d) { await load(); copy(d.invitation.code); }
  };
  const revoke = async (inv: Inv) => {
    if (!(await confirm({ title: 'Révoquer cette invitation ?', message: 'Le lien ne fonctionnera plus.', danger: true, confirmLabel: 'Révoquer' }))) return;
    if (await api(`/api/admin/invitations?code=${inv.code}`, { method: 'DELETE' })) { toast('Invitation révoquée'); await load(); }
  };

  return (
    <>
      <PageHeader title="Invitations" subtitle="Invitez de nouveaux membres : ils rejoignent l’équipe en se connectant avec Discord." />
      <Card className="p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <Field label="Rôle du nouveau membre">
            <Select value={role} onChange={(e) => setRole(e.target.value)} className="sm:w-56">
              {roles.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </Select>
          </Field>
          <Button variant="primary" icon={<IconPlus size={16} />} onClick={create} disabled={!roles.length}>Créer le lien d’invitation</Button>
        </div>
        <p className="text-[12px] text-zinc-500 mt-3">Le lien est copié automatiquement. Il est valable 7 jours et ne sert qu’une fois. Envoyez-le en privé sur Discord.</p>
      </Card>

      <Card className="overflow-hidden">
        {!list ? <Loading /> : list.length === 0 ? <Empty icon={<IconMailForward size={20} />} title="Aucune invitation" /> : (
          <div className="adm-stagger">
            {list.map((inv) => (
              <div key={inv.code} className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-white/[0.04]">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-white">{ROLE_LABEL[inv.role]} <span className="text-zinc-500">· créée par {inv.createdBy} {timeAgo(inv.createdAt)}</span></p>
                  <p className="text-[12px] text-zinc-500">
                    {inv.state === 'used' ? `Acceptée par ${inv.usedBy} ${timeAgo(inv.usedAt)}` : inv.state === 'pending' ? `Expire ${new Date(inv.expiresAt).toLocaleDateString('fr-FR')}` : ''}
                  </p>
                </div>
                <Badge tone={STATE[inv.state].tone}>{STATE[inv.state].label}</Badge>
                {inv.state === 'pending' && (
                  <>
                    <Button size="sm" icon={<IconCopy size={14} />} onClick={() => copy(inv.code)}>Copier le lien</Button>
                    <Button size="sm" variant="danger" onClick={() => revoke(inv)}>Révoquer</Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
