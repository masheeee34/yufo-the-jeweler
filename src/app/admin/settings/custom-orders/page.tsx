'use client';

import React from 'react';
import { Button, Card, CardTitle, Field, Input, Loading, PageHeader, Textarea } from '@/components/admin/ui';
import { useSettings } from '@/components/admin/useSettings';

const MODES = [
  { id: 'open', label: 'Open', text: 'Le formulaire sur mesure accepte les demandes.' },
  { id: 'limited', label: 'Limited', text: 'Ouvert, avec un message « places limitées ».' },
  { id: 'closed', label: 'Closed', text: 'Plus aucune nouvelle demande : le formulaire invite à rejoindre le Discord.' },
] as const;

export default function CustomOrdersSettingsPage() {
  const { values: v, setValues, save, saving } = useSettings('customOrders');
  if (!v) return <Loading />;
  const set = (k: keyof typeof v, val: unknown) => setValues({ ...v, [k]: val });

  return (
    <>
      <PageHeader title="Custom orders" subtitle="Disponibilité, prix de départ, délais et paramètres du sur mesure." actions={<Button variant="primary" disabled={saving} onClick={() => save()}>Enregistrer</Button>} />
      <div className="adm-stagger space-y-4">
        <Card>
          <CardTitle>Disponibilité</CardTitle>
          <div className="px-5 pb-5 grid sm:grid-cols-3 gap-3">
            {MODES.map((m) => (
              <button key={m.id} onClick={() => set('mode', m.id)} className={`adm-press text-left rounded-xl border p-4 transition-colors ${v.mode === m.id ? 'border-white/40 bg-white/[0.07]' : 'border-white/[0.08] hover:border-white/20'}`}>
                <span className="flex items-center gap-2 text-[14px] font-semibold text-white">
                  <span className={`w-2.5 h-2.5 rounded-full ${m.id === 'open' ? 'bg-emerald-400' : m.id === 'limited' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                  {m.label}
                </span>
                <span className="block text-[12px] text-zinc-500 mt-1.5">{m.text}</span>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Prix et délais</CardTitle>
          <div className="px-5 pb-5 grid sm:grid-cols-2 gap-4">
            <Field label="Prix de départ affiché ($)"><Input type="number" min={0} step="0.01" value={v.startingPrice} onChange={(e) => set('startingPrice', e.target.value)} /></Field>
            <Field label="Délai habituel"><Input value={v.defaultLeadTime} onChange={(e) => set('defaultLeadTime', e.target.value)} placeholder="Ex. 2 to 4 weeks" /></Field>
            <Field label="Budget minimum ($)" hint="Point de départ du compteur de budget du formulaire."><Input type="number" min={0} step="0.01" value={v.budgetMin} onChange={(e) => set('budgetMin', e.target.value)} /></Field>
            <Field label="Palier du budget ($)" hint="Ex. 5 : 24.99 → 29.99 → 34.99…, sans limite."><Input type="number" min={1} step="0.5" value={v.budgetStep} onChange={(e) => set('budgetStep', e.target.value)} /></Field>
            <Field label="Délais proposés" hint="Séparés par des virgules (curseur)."><Input value={v.durations.join(', ')} onChange={(e) => set('durations', e.target.value.split(','))} /></Field>
            <p className="sm:col-span-2 text-[12px] text-zinc-500">Les questions, les réponses du ped et tous les textes du formulaire se règlent dans <a href="/admin/settings/custom-form" className="text-white underline underline-offset-2">Settings › Custom form</a>.</p>
            <div className="sm:col-span-2">
              <Field label="Message affiché sur le formulaire (facultatif)" hint="Ex. « 3 slots left this month »."><Textarea rows={2} value={v.note} onChange={(e) => set('note', e.target.value)} /></Field>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
