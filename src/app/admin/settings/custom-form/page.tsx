'use client';

import React, { useState } from 'react';
import { IconArrowDown, IconArrowUp, IconExternalLink, IconPlus, IconX } from '@tabler/icons-react';
import { Button, Card, CardTitle, Field, Input, Loading, PageHeader, Textarea, Toggle } from '@/components/admin/ui';
import { useSettings } from '@/components/admin/useSettings';
import { DEFAULT_WIZARD_TEXTS, WIZARD_TEXT_GROUPS, WizardSettings, WizardTextKey } from '@/lib/wizardDefaults';

// Réponses à la question du ped (boutons du formulaire).
function PedOptions({ value, onChange }: { value: string[]; onChange: (o: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    if (!draft.trim() || value.length >= 8 || value.includes(draft.trim())) return;
    onChange([...value, draft.trim()]);
    setDraft('');
  };
  return (
    <Field label="Réponses proposées" hint="Boutons affichés au client, dans cet ordre. 8 maximum.">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((o, i) => (
          <span key={o + i} className="inline-flex items-center gap-1 h-8 pl-3 pr-1 rounded-lg bg-white/[0.08] text-[12px] text-white">
            {o}
            <button onClick={() => onChange(value.filter((_, n) => n !== i))} className="w-6 h-6 rounded hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center" aria-label={`Retirer ${o}`}>
              <IconX size={13} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nouvelle réponse (ex. Lamar)" className="h-9" onKeyDown={(e) => e.key === 'Enter' && add()} />
        <Button size="sm" disabled={!draft.trim() || value.length >= 8} onClick={add}>Ajouter</Button>
      </div>
    </Field>
  );
}

// Types de pièce proposés à la première étape.
function Pieces({ value, onChange }: { value: WizardSettings['pieces']; onChange: (p: WizardSettings['pieces']) => void }) {
  const move = (i: number, d: -1 | 1) => {
    const n = [...value];
    [n[i], n[i + d]] = [n[i + d], n[i]];
    onChange(n);
  };
  return (
    <div className="space-y-2">
      {value.map((p, i) => (
        <div key={i} className="flex flex-col sm:flex-row gap-2 sm:items-center rounded-xl border border-white/[0.07] p-2.5">
          <Input value={p.label} onChange={(e) => onChange(value.map((x, n) => (n === i ? { ...x, label: e.target.value } : x)))} placeholder="Nom (ex. Ring)" className="h-9 sm:w-60" />
          <Input value={p.hint} onChange={(e) => onChange(value.map((x, n) => (n === i ? { ...x, hint: e.target.value } : x)))} placeholder="Précision (ex. Signets, eternity bands)" className="h-9" />
          <div className="flex gap-1 shrink-0">
            <Button size="sm" aria-label="Monter" disabled={i === 0} onClick={() => move(i, -1)} icon={<IconArrowUp size={14} />} />
            <Button size="sm" aria-label="Descendre" disabled={i === value.length - 1} onClick={() => move(i, 1)} icon={<IconArrowDown size={14} />} />
            <Button size="sm" aria-label="Retirer" disabled={value.length <= 1} onClick={() => onChange(value.filter((_, n) => n !== i))} icon={<IconX size={14} />} />
          </div>
        </div>
      ))}
      <Button size="sm" disabled={value.length >= 12} onClick={() => onChange([...value, { label: '', hint: '' }])} icon={<IconPlus size={14} />}>Ajouter un type de pièce</Button>
    </div>
  );
}

export default function CustomFormSettingsPage() {
  const { values: v, setValues, save, saving } = useSettings('wizard');
  if (!v) return <Loading />;
  const set = <K extends keyof WizardSettings>(k: K, val: WizardSettings[K]) => setValues({ ...v, [k]: val });
  const setText = (k: WizardTextKey, val: string) => setValues({ ...v, texts: { ...v.texts, [k]: val } });

  return (
    <>
      <PageHeader
        title="Custom form"
        subtitle="Questions, réponses et textes du formulaire sur mesure, sans toucher au code."
        actions={
          <>
            <a href="/custom-orders" target="_blank" rel="noreferrer" className="h-9 px-3 rounded-lg text-[13px] text-zinc-300 hover:bg-white/10 inline-flex items-center gap-1.5 transition-colors">
              <IconExternalLink size={15} /> Voir le formulaire
            </a>
            <Button variant="primary" disabled={saving} onClick={() => save()}>Enregistrer</Button>
          </>
        }
      />
      <div className="adm-stagger space-y-4">
        <Card>
          <CardTitle>Questions affichées</CardTitle>
          <div className="px-5 pb-5 grid sm:grid-cols-2 gap-x-8 gap-y-4">
            <Toggle checked={v.showDiscordButton} onChange={(x) => set('showDiscordButton', x)} label="Bouton « Join our Discord »" />
            <Toggle checked={v.askPed} onChange={(x) => set('askPed', x)} label="Demander le ped (« Who will wear it? »)" />
            <Toggle checked={v.pedMultiple} disabled={!v.askPed} onChange={(x) => set('pedMultiple', x)} label="Plusieurs peds possibles, avec la mention en dessous" />
            <Toggle checked={v.askImages} onChange={(x) => set('askImages', x)} label="Images de référence" />
            <Toggle checked={v.askDuration} onChange={(x) => set('askDuration', x)} label="Demander le délai" />
            <Toggle checked={v.askBudget} onChange={(x) => set('askBudget', x)} label="Demander le budget" />
            <Field label="Nombre d’images maximum" hint="De 1 à 6.">
              <Input type="number" min={1} max={6} value={v.maxImages} disabled={!v.askImages} onChange={(e) => set('maxImages', Number(e.target.value))} />
            </Field>
            <Field label="Longueur minimale du brief (caractères)" hint="0 = le brief devient facultatif.">
              <Input type="number" min={0} max={200} value={v.minBriefLength} onChange={(e) => set('minBriefLength', Number(e.target.value))} />
            </Field>
          </div>
          {!v.askDuration && !v.askBudget && <p className="px-5 pb-5 -mt-1 text-[12px] text-zinc-500">Sans délai ni budget, l’étape 3 disparaît : le formulaire passe à 3 étapes.</p>}
        </Card>

        <Card>
          <CardTitle>Types de pièce</CardTitle>
          <div className="px-5 pb-5">
            <Pieces value={v.pieces} onChange={(p) => set('pieces', p)} />
          </div>
        </Card>

        {v.askPed && (
          <Card>
            <CardTitle>Ped</CardTitle>
            <div className="px-5 pb-5">
              <PedOptions value={v.pedOptions} onChange={(o) => set('pedOptions', o)} />
            </div>
          </Card>
        )}

        {WIZARD_TEXT_GROUPS.map((g) => (
          <Card key={g.title}>
            <CardTitle>Textes · {g.title}</CardTitle>
            <div className="px-5 pb-5 grid sm:grid-cols-2 gap-4">
              {g.fields.map((f) => {
                const long = 'long' in f && f.long;
                const props = {
                  value: v.texts[f.key] ?? '',
                  placeholder: DEFAULT_WIZARD_TEXTS[f.key],
                  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setText(f.key, e.target.value),
                };
                return (
                  <div key={f.key} className={long ? 'sm:col-span-2' : ''}>
                    <Field label={f.label} hint={'hint' in f ? f.hint : undefined}>
                      {long ? <Textarea rows={2} {...props} /> : <Input {...props} />}
                    </Field>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
        <p className="text-[12px] text-zinc-500 px-1">Un champ laissé vide reprend le texte d’origine (affiché en gris).</p>
      </div>
    </>
  );
}
