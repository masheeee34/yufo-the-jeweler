'use client';

import React from 'react';
import { Badge, Button, Card, CardTitle, Field, Input, Loading, PageHeader, Select, Toggle } from '@/components/admin/ui';
import { useSettings } from '@/components/admin/useSettings';

export default function PaymentsSettingsPage() {
  const { values: v, setValues, save, saving, meta } = useSettings('payments');
  if (!v) return <Loading />;
  const set = (k: keyof typeof v, val: unknown) => setValues({ ...v, [k]: val });

  return (
    <>
      <PageHeader title="Payments" subtitle="Stripe, devises et options de paiement." actions={<Button variant="primary" disabled={saving} onClick={() => save()}>Enregistrer</Button>} />
      <div className="adm-stagger grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardTitle action={meta.stripeSecretConfigured ? <Badge tone="green">Clé secrète configurée</Badge> : <Badge tone="amber">Non connecté</Badge>}>Stripe</CardTitle>
          <div className="px-5 pb-5 space-y-4">
            <Field label="Clé publique Stripe" hint="Commence par pk_live_ ou pk_test_.">
              <Input value={v.stripePublishableKey} onChange={(e) => set('stripePublishableKey', e.target.value.trim())} placeholder="pk_live_…" />
            </Field>
            <Toggle checked={v.stripeEnabled} disabled={!meta.stripeSecretConfigured} onChange={(val) => set('stripeEnabled', val)} label="Activer le paiement par carte (Stripe)" />
            <p className="text-[12px] text-zinc-500 leading-relaxed">
              Par sécurité, la <b className="text-zinc-300">clé secrète</b> ne se saisit jamais ici : elle est installée directement sur le serveur.
              Une fois installée, le paiement Stripe et les remboursements depuis l’admin pourront être branchés.
            </p>
          </div>
        </Card>
        <Card>
          <CardTitle>Devise et moyens de paiement</CardTitle>
          <div className="px-5 pb-5 space-y-4">
            <Field label="Devise">
              <Select value={v.currency} onChange={(e) => set('currency', e.target.value)}>
                <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option>
              </Select>
            </Field>
            <Field label="Moyens de paiement acceptés" hint="Séparés par des virgules, affichés aux clients.">
              <Input value={v.methods.join(', ')} onChange={(e) => set('methods', e.target.value.split(','))} />
            </Field>
          </div>
        </Card>
      </div>
    </>
  );
}
