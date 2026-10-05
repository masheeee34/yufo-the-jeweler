'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { IconArrowDown, IconArrowUp, IconExternalLink, IconPlayerPlay, IconPlus, IconUpload, IconX } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Button, Card, CardTitle, Field, Input, Loading, PageHeader, Select, Toggle } from '@/components/admin/ui';
import { useSettings } from '@/components/admin/useSettings';
import { BUILTIN_SOUNDS, PERMISSION_LABELS, STATUS_TONES, StatusTone, TicketPermissions, TicketSettings, TONE_CLASSES } from '@/lib/ticketDefaults';

const TONE_NAMES: Record<StatusTone, string> = { zinc: 'Gris', sky: 'Ciel', blue: 'Bleu', violet: 'Violet', amber: 'Ambre', emerald: 'Vert', rose: 'Rose' };
const iconBtn = 'w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30';

function play(url: string, volume: number) {
  if (!url) return;
  const a = new Audio(url);
  a.volume = volume;
  a.play().catch(() => {});
}

export default function TicketSettingsPage() {
  const { toast } = useAdmin();
  const { values, setValues, save, saving } = useSettings('tickets');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!values) return <Loading />;
  const s = values as TicketSettings;
  const set = (patch: Partial<TicketSettings>) => setValues({ ...s, ...patch });
  const setStatus = (i: number, patch: Partial<TicketSettings['statuses'][number]>) => set({ statuses: s.statuses.map((x, k) => (k === i ? { ...x, ...patch } : x)) });
  const moveStatus = (i: number, d: -1 | 1) => {
    const n = [...s.statuses];
    [n[i], n[i + d]] = [n[i + d], n[i]];
    set({ statuses: n });
  };
  const custom = s.sound && !BUILTIN_SOUNDS.some((b) => b.url === s.sound) ? s.sound : '';

  const uploadSound = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/sounds', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) return toast(data.error || 'Le son n’a pas pu être envoyé.', 'error');
    set({ sound: data.url });
    toast('Son ajouté : pensez à enregistrer.');
  };

  return (
    <>
      <PageHeader
        title="Tickets"
        subtitle="Statuts, permissions par défaut et son des notifications. Chaque ticket se gère ensuite directement depuis le ticket (bouton Manage)."
        actions={
          <div className="flex gap-2">
            <Link href="/tickets" className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/10 text-[13px] text-zinc-300 hover:text-white">
              Ouvrir les tickets <IconExternalLink size={14} />
            </Link>
            <Button variant="primary" disabled={saving} onClick={() => save()}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
          </div>
        }
      />
      <div className="adm-stagger space-y-4">
        <Card>
          <CardTitle>Statuts</CardTitle>
          <div className="px-5 pb-5 space-y-2">
            <p className="text-[12px] text-zinc-500 mb-2">« Prévenir » : les membres du ticket reçoivent une notification quand le ticket passe à ce statut. L’identifiant d’un statut ne change pas quand vous le renommez.</p>
            {s.statuses.map((st, i) => (
              <div key={st.id + i} className="flex flex-col lg:flex-row gap-2 lg:items-center rounded-xl border border-white/[0.07] p-2.5">
                <span className={`inline-flex items-center h-7 px-2.5 rounded-full text-[11px] font-semibold ring-1 ring-inset ${TONE_CLASSES[st.tone]} w-fit`}>{st.label || '—'}</span>
                <Input value={st.label} onChange={(e) => setStatus(i, { label: e.target.value })} placeholder="Nom (ex. In progress)" className="h-9 lg:w-56" aria-label="Nom du statut" />
                <Select value={st.tone} onChange={(e) => setStatus(i, { tone: e.target.value as StatusTone })} className="h-9 lg:w-32" aria-label="Couleur">
                  {STATUS_TONES.map((t) => <option key={t} value={t}>{TONE_NAMES[t]}</option>)}
                </Select>
                <div className="lg:w-36"><Toggle checked={st.important} onChange={(v) => setStatus(i, { important: v })} label="Prévenir" /></div>
                <label className="flex items-center gap-2 text-[12px] text-zinc-400 lg:ml-auto">
                  <input type="radio" name="defaultStatus" checked={s.defaultStatus === st.id} onChange={() => set({ defaultStatus: st.id })} className="accent-white" />
                  Statut de départ
                </label>
                <div className="flex gap-1">
                  <button type="button" className={iconBtn} disabled={i === 0} onClick={() => moveStatus(i, -1)} aria-label="Monter"><IconArrowUp size={14} /></button>
                  <button type="button" className={iconBtn} disabled={i === s.statuses.length - 1} onClick={() => moveStatus(i, 1)} aria-label="Descendre"><IconArrowDown size={14} /></button>
                  <button type="button" className={iconBtn} disabled={s.statuses.length <= 1} onClick={() => set({ statuses: s.statuses.filter((_, k) => k !== i) })} aria-label="Supprimer"><IconX size={14} /></button>
                </div>
              </div>
            ))}
            <Button size="sm" disabled={s.statuses.length >= 15} onClick={() => set({ statuses: [...s.statuses, { id: '', label: 'New status', tone: 'zinc', important: false }] })} icon={<IconPlus size={14} />}>
              Ajouter un statut
            </Button>
          </div>
        </Card>

        <Card>
          <CardTitle>Permissions des nouveaux tickets</CardTitle>
          <div className="px-5 pb-5 grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {(Object.keys(PERMISSION_LABELS) as (keyof TicketPermissions)[]).map((k) => (
              <Toggle key={k} checked={s.defaultPerms[k]} onChange={(v) => set({ defaultPerms: { ...s.defaultPerms, [k]: v } })} label={PERMISSION_LABELS[k]} />
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Son des notifications</CardTitle>
          <div className="px-5 pb-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {[{ id: 'none', label: 'Aucun son', url: '' }, ...BUILTIN_SOUNDS, ...(custom ? [{ id: 'custom', label: 'Son personnalisé', url: custom }] : [])].map((b) => (
                <span key={b.id} className={`inline-flex items-center rounded-xl border ${s.sound === b.url ? 'border-white bg-white/[0.08]' : 'border-white/10'}`}>
                  <button type="button" onClick={() => set({ sound: b.url })} className="h-9 pl-3.5 pr-2 text-[13px] text-white">{b.label}</button>
                  {b.url && (
                    <button type="button" onClick={() => play(b.url, s.soundVolume)} className="h-9 w-9 flex items-center justify-center text-zinc-400 hover:text-white" aria-label={`Écouter ${b.label}`}>
                      <IconPlayerPlay size={14} />
                    </button>
                  )}
                </span>
              ))}
              <Button size="sm" disabled={uploading} onClick={() => fileRef.current?.click()} icon={<IconUpload size={14} />}>{uploading ? 'Envoi…' : 'Envoyer un son'}</Button>
              <input ref={fileRef} type="file" accept="audio/mpeg,audio/wav,audio/ogg,.mp3,.wav,.ogg" className="hidden" onChange={(e) => uploadSound(e.target.files)} />
            </div>
            <Field label={`Volume : ${Math.round(s.soundVolume * 100)} %`}>
              <input type="range" min={0} max={1} step={0.05} value={s.soundVolume} onChange={(e) => set({ soundVolume: Number(e.target.value) })} className="w-full sm:w-72 accent-white" />
            </Field>
            <p className="text-[12px] text-zinc-500">Joué pour chaque nouveau message, sur la page du ticket et avec la cloche de notifications. MP3, WAV ou OGG, 1 Mo maximum.</p>
          </div>
        </Card>

        <Card>
          <CardTitle>Fichiers</CardTitle>
          <div className="px-5 pb-5">
            <Field label="Taille maximale d’un fichier envoyé dans un ticket (Mo)" hint="1 à 90 Mo.">
              <Input type="number" min={1} max={90} value={s.maxFileMb} onChange={(e) => set({ maxFileMb: Number(e.target.value) })} className="sm:w-40" />
            </Field>
          </div>
        </Card>
      </div>
    </>
  );
}
