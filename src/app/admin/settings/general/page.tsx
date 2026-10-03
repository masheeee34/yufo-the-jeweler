'use client';

import React from 'react';
import { Button, Card, CardTitle, Field, Input, Loading, PageHeader, Textarea } from '@/components/admin/ui';
import { useSettings } from '@/components/admin/useSettings';

export default function GeneralSettingsPage() {
  const { values: v, setValues, save, saving } = useSettings('general');
  if (!v) return <Loading />;
  const set = (k: keyof typeof v, val: unknown) => setValues({ ...v, [k]: val });
  const setSocial = (k: keyof typeof v.socials, val: string) => setValues({ ...v, socials: { ...v.socials, [k]: val } });

  return (
    <>
      <PageHeader title="General" subtitle="Informations de la marque et textes importants du site." actions={<Button variant="primary" disabled={saving} onClick={() => save()}>Enregistrer</Button>} />
      <div className="adm-stagger grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardTitle>Marque</CardTitle>
          <div className="px-5 pb-5 space-y-4">
            <Field label="Nom de la marque"><Input value={v.brandName} onChange={(e) => set('brandName', e.target.value)} /></Field>
            <Field label="Slogan"><Input value={v.tagline} onChange={(e) => set('tagline', e.target.value)} /></Field>
            <Field label="Email de contact"><Input type="email" value={v.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} /></Field>
          </div>
        </Card>
        <Card>
          <CardTitle>Announcement bar</CardTitle>
          <div className="px-5 pb-5 space-y-4">
            <Field label="Texte du bandeau" hint="Affiché tout en haut du site. Laisser vide pour le masquer.">
              <Input value={v.announcement} onChange={(e) => set('announcement', e.target.value)} placeholder="Ex. New drop this Friday — custom slots limited" />
            </Field>
            <Field label="Lien du bandeau (facultatif)"><Input value={v.announcementLink} onChange={(e) => set('announcementLink', e.target.value)} placeholder="https://…" /></Field>
            {v.announcement && <div className="rounded-lg bg-white text-zinc-950 text-[12px] font-medium text-center py-2 px-3">{v.announcement}</div>}
          </div>
        </Card>
        <Card>
          <CardTitle>Liens sociaux</CardTitle>
          <div className="px-5 pb-5 grid sm:grid-cols-2 gap-4">
            <Field label="Discord"><Input value={v.discordInvite} onChange={(e) => set('discordInvite', e.target.value)} /></Field>
            <Field label="Instagram"><Input value={v.socials.instagram} onChange={(e) => setSocial('instagram', e.target.value)} placeholder="https://instagram.com/…" /></Field>
            <Field label="TikTok"><Input value={v.socials.tiktok} onChange={(e) => setSocial('tiktok', e.target.value)} placeholder="https://tiktok.com/@…" /></Field>
            <Field label="YouTube"><Input value={v.socials.youtube} onChange={(e) => setSocial('youtube', e.target.value)} placeholder="https://youtube.com/@…" /></Field>
            <Field label="X / Twitter"><Input value={v.socials.x} onChange={(e) => setSocial('x', e.target.value)} placeholder="https://x.com/…" /></Field>
          </div>
        </Card>
        <Card>
          <CardTitle>Textes</CardTitle>
          <div className="px-5 pb-5 space-y-4">
            <Field label="Introduction de la page sur mesure" hint="Court texte au-dessus du formulaire de commande custom.">
              <Textarea rows={4} value={v.customPageIntro} onChange={(e) => set('customPageIntro', e.target.value)} />
            </Field>
            <p className="text-[12px] text-zinc-500">Les créations et avis mis en avant se choisissent avec l’étoile, dans Creations et Reviews.</p>
          </div>
        </Card>
      </div>
    </>
  );
}
