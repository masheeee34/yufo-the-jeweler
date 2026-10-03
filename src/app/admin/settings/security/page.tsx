'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { IconDeviceDesktop, IconDeviceMobile, IconLogout } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Badge, Button, Card, CardTitle, Empty, Field, Input, Loading, PageHeader, Tabs, timeAgo } from '@/components/admin/ui';
import { useSettings } from '@/components/admin/useSettings';

interface Sess { id: string; pseudo: string; team: boolean; createdAt: string; lastSeenAt: string; expiresAt: string; ip?: string; userAgent?: string; current: boolean }

const device = (ua = '') => {
  const mobile = /iphone|android|mobile/i.test(ua);
  const browser = /edg\//i.test(ua) ? 'Edge' : /chrome/i.test(ua) ? 'Chrome' : /firefox/i.test(ua) ? 'Firefox' : /safari/i.test(ua) ? 'Safari' : 'Navigateur';
  const os = /windows/i.test(ua) ? 'Windows' : /mac os/i.test(ua) ? 'macOS' : /android/i.test(ua) ? 'Android' : /iphone|ipad/i.test(ua) ? 'iOS' : /linux/i.test(ua) ? 'Linux' : '';
  return { mobile, label: `${browser}${os ? ` · ${os}` : ''}` };
};

export default function SecuritySettingsPage() {
  const { api, toast, confirm } = useAdmin();
  const { values, setValues, save, saving } = useSettings('security');
  const [sessions, setSessions] = useState<Sess[] | null>(null);
  const [who, setWho] = useState<'team' | 'customers'>('team');

  const load = useCallback(async () => {
    const d = await api<{ sessions: Sess[] }>('/api/admin/security');
    if (d) setSessions(d.sessions);
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const revoke = async (query: string, title: string, message: string) => {
    if (!(await confirm({ title, message, danger: true, confirmLabel: 'Déconnecter' }))) return;
    const d = await api<{ revoked: number }>(`/api/admin/security?${query}`, { method: 'DELETE' });
    if (d) { toast(`${d.revoked} session(s) déconnectée(s)`); await load(); }
  };

  const list = (sessions || []).filter((s) => (who === 'team' ? s.team : !s.team));

  return (
    <>
      <PageHeader title="Security" subtitle="Sessions et accès." />
      <div className="adm-stagger space-y-4">
        <Card>
          <CardTitle>Règles</CardTitle>
          <div className="px-5 pb-5 space-y-4">
            <ul className="text-[13px] text-zinc-300 space-y-1.5 list-disc pl-5">
              <li>Connexion au back-office uniquement avec un compte Discord membre de l’équipe.</li>
              <li>Sessions stockées sur le serveur : un cookie volé ou forgé ne suffit plus, et une session peut être coupée à distance.</li>
              <li>Rôles et permissions dans Team › Members ; toutes les actions sensibles sont dans Activity logs.</li>
            </ul>
            {values ? (
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <Field label="Durée d’une session (jours)" hint="S’applique aux prochaines connexions (1 à 90).">
                  <Input type="number" min={1} max={90} value={values.sessionDays} onChange={(e) => setValues({ sessionDays: Number(e.target.value) })} className="sm:w-40" />
                </Field>
                <Button variant="primary" disabled={saving} onClick={() => save()}>Enregistrer</Button>
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-4 pb-3">
            <Tabs value={who} onChange={setWho} tabs={[
              { id: 'team', label: 'Équipe', count: sessions?.filter((s) => s.team).length },
              { id: 'customers', label: 'Clients', count: sessions?.filter((s) => !s.team).length },
            ]} />
            <div className="flex gap-2">
              <Button size="sm" variant="danger" icon={<IconLogout size={14} />} onClick={() => revoke('scope=team', 'Déconnecter toute l’équipe ?', 'Tous les membres (sauf vous) devront se reconnecter avec Discord.')}>Déconnecter l’équipe</Button>
              <Button size="sm" variant="danger" onClick={() => revoke('scope=all', 'Déconnecter tout le monde ?', 'Tous les clients et membres (sauf vous) seront déconnectés. À utiliser en cas de doute sur une fuite.')}>Tout le monde</Button>
            </div>
          </div>
          {!sessions ? <Loading /> : list.length === 0 ? <Empty title="Aucune session ouverte" /> : list.map((s) => {
            const d = device(s.userAgent);
            return (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3 border-t border-white/[0.04]">
                <span className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 shrink-0">{d.mobile ? <IconDeviceMobile size={17} /> : <IconDeviceDesktop size={17} />}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-white flex items-center gap-2">{s.pseudo} {s.current && <Badge tone="green">Cette session</Badge>}</p>
                  <p className="text-[12px] text-zinc-500 truncate">{d.label}{s.ip ? ` · ${s.ip}` : ''} · active {timeAgo(s.lastSeenAt)} · ouverte {timeAgo(s.createdAt)}</p>
                </div>
                {!s.current && <Button size="sm" variant="ghost" onClick={() => revoke(`id=${s.id}`, `Déconnecter ${s.pseudo} ?`, 'Cette session sera fermée immédiatement.')}>Déconnecter</Button>}
              </div>
            );
          })}
        </Card>
      </div>
    </>
  );
}
