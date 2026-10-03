'use client';

import React, { useRef, useState } from 'react';
import { IconPhotoPlus, IconX } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Button, Card, CardTitle, Field, Input, Loading, PageHeader, Textarea, Toggle, uploadImages } from '@/components/admin/ui';
import { useSettings } from '@/components/admin/useSettings';
import { AvatarCircles } from '@/components/AvatarCircles';

// Bouton d'envoi d'une image (icône d'onglet, avatars) vers /api/uploads.
function ImagePick({ onPicked, multiple, label }: { onPicked: (urls: string[]) => void; multiple?: boolean; label: string }) {
  const { toast } = useAdmin();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple={multiple} hidden onChange={async (e) => {
        if (!e.target.files?.length) return;
        setBusy(true);
        const names = await uploadImages(e.target.files);
        setBusy(false);
        if (names.length) onPicked(names.map((n) => `/api/uploads/${n}`));
        else toast('Image refusée', 'error');
        e.target.value = '';
      }} />
      <Button size="sm" icon={<IconPhotoPlus size={14} />} disabled={busy} onClick={() => ref.current?.click()}>{busy ? 'Envoi…' : label}</Button>
    </>
  );
}

export default function WebsiteSettingsPage() {
  const site = useSettings('site');
  const home = useSettings('home');
  const proof = useSettings('socialProof');
  const [saving, setSaving] = useState(false);

  if (!site.values || !home.values || !proof.values) return <Loading />;
  const s = site.values;
  const h = home.values;
  const p = proof.values;
  const setS = (k: keyof typeof s, v: string) => site.setValues({ ...s, [k]: v });
  const setH = (k: keyof typeof h, v: string) => home.setValues({ ...h, [k]: v });
  const setP = (patch: Partial<typeof p>) => proof.setValues({ ...p, ...patch });

  const saveAll = async () => {
    setSaving(true);
    await site.save();
    await home.save();
    await proof.save();
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Website" subtitle="Titre et icône du site, textes de l’accueil, bloc d’avatars au-dessus des avis." actions={<Button variant="primary" disabled={saving} onClick={saveAll}>Enregistrer</Button>} />
      <div className="adm-stagger grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardTitle>Identité du site</CardTitle>
          <div className="px-5 pb-5 space-y-4">
            <Field label="Titre (onglet du navigateur, Google)"><Input value={s.title} onChange={(e) => setS('title', e.target.value)} /></Field>
            <Field label="Description (Google, partages)"><Textarea rows={3} value={s.description} onChange={(e) => setS('description', e.target.value)} /></Field>
            <Field label="Icône d’onglet (favicon)" hint="Image carrée, idéalement 64 × 64 ou plus. Visible en moins d’une minute.">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.favicon} alt="" className="w-10 h-10 rounded-lg bg-black border border-white/10 object-contain" />
                <ImagePick label="Changer" onPicked={(u) => setS('favicon', u[0])} />
              </div>
            </Field>
          </div>
        </Card>

        <Card>
          <CardTitle>Page d’accueil</CardTitle>
          <div className="px-5 pb-5 space-y-4">
            <Field label="Petit titre au-dessus"><Input value={h.eyebrow} onChange={(e) => setH('eyebrow', e.target.value)} /></Field>
            <Field label="Grand titre"><Input value={h.title} onChange={(e) => setH('title', e.target.value)} /></Field>
            <Field label="Sous-titre"><Textarea rows={2} value={h.subtitle} onChange={(e) => setH('subtitle', e.target.value)} /></Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Carte « sur mesure » : titre"><Input value={h.customTitle} onChange={(e) => setH('customTitle', e.target.value)} /></Field>
              <Field label="Carte « prêt » : titre"><Input value={h.premadeTitle} onChange={(e) => setH('premadeTitle', e.target.value)} /></Field>
              <Field label="Carte « sur mesure » : texte"><Textarea rows={2} value={h.customText} onChange={(e) => setH('customText', e.target.value)} /></Field>
              <Field label="Carte « prêt » : texte"><Textarea rows={2} value={h.premadeText} onChange={(e) => setH('premadeText', e.target.value)} /></Field>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardTitle action={<Toggle checked={p.enabled} onChange={(v) => setP({ enabled: v })} label="Afficher" />}>Avatars au-dessus des avis</CardTitle>
          <div className="px-5 pb-5 grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Field label="Nombre affiché"><Input value={p.count} onChange={(e) => setP({ count: e.target.value })} placeholder="99" /></Field>
                <Field label="Avatars montrés"><Input type="number" min={0} max={12} value={p.show} onChange={(e) => setP({ show: Number(e.target.value) })} /></Field>
                <div />
              </div>
              <Field label="Texte à côté"><Input value={p.label} onChange={(e) => setP({ label: e.target.value })} placeholder="collectors trust YUFO" /></Field>
              <Field label={`Photos (${p.avatars.length}/12)`}>
                <div className="flex flex-wrap items-center gap-2">
                  {p.avatars.map((src, i) => (
                    <span key={src + i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-11 h-11 rounded-full object-cover border border-white/15" />
                      <button onClick={() => setP({ avatars: p.avatars.filter((_, n) => n !== i) })} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black border border-white/20 text-white flex items-center justify-center" aria-label="Retirer"><IconX size={11} /></button>
                    </span>
                  ))}
                  {p.avatars.length < 12 && <ImagePick multiple label="Ajouter" onPicked={(u) => setP({ avatars: [...p.avatars, ...u].slice(0, 12) })} />}
                </div>
              </Field>
            </div>
            <div className="rounded-2xl bg-[#070709] border border-white/[0.06] flex items-center justify-center p-8 min-h-[140px]">
              <AvatarCircles avatars={p.avatars} count={p.count} label={p.label} show={p.show} />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
