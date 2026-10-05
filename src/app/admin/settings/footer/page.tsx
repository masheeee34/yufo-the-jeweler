'use client';

import React, { useRef, useState } from 'react';
import { IconArrowDown, IconArrowUp, IconPhoto, IconPlus, IconRefresh, IconX } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Button, Card, CardTitle, Field, Input, Loading, PageHeader, Textarea, Toggle, uploadImages } from '@/components/admin/ui';
import { useSettings } from '@/components/admin/useSettings';
import { FooterView } from '@/components/Footer';
import { DEFAULT_FOOTER, FOOTER_LIMITS, FooterColumn, FooterSettings } from '@/lib/footerDefaults';

function move<T>(list: T[], i: number, d: -1 | 1): T[] {
  const n = [...list];
  [n[i], n[i + d]] = [n[i + d], n[i]];
  return n;
}

const iconBtn = 'w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30';

// Une catégorie du pied de page et ses liens.
function ColumnEditor({ col, index, total, onChange, onMove, onRemove }: {
  col: FooterColumn;
  index: number;
  total: number;
  onChange: (c: FooterColumn) => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
}) {
  const setLink = (j: number, patch: Partial<FooterColumn['links'][number]>) =>
    onChange({ ...col, links: col.links.map((l, k) => (k === j ? { ...l, ...patch } : l)) });
  return (
    <div className="rounded-xl border border-white/[0.08] p-3.5 space-y-3">
      <div className="flex gap-2 items-center">
        <Input value={col.title} onChange={(e) => onChange({ ...col, title: e.target.value })} placeholder="Nom de la catégorie (ex. Pages)" className="h-9 font-semibold" aria-label="Nom de la catégorie" />
        <button type="button" className={iconBtn} disabled={index === 0} onClick={() => onMove(-1)} aria-label="Monter la catégorie"><IconArrowUp size={14} /></button>
        <button type="button" className={iconBtn} disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Descendre la catégorie"><IconArrowDown size={14} /></button>
        <button type="button" className={iconBtn} onClick={onRemove} aria-label="Supprimer la catégorie"><IconX size={14} /></button>
      </div>
      <div className="space-y-2 pl-2 border-l border-white/[0.06]">
        {col.links.map((l, j) => (
          <div key={j} className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Input value={l.label} onChange={(e) => setLink(j, { label: e.target.value })} placeholder="Texte (ex. Chains)" className="h-9 sm:w-52" aria-label="Texte du lien" />
            <Input value={l.href} onChange={(e) => setLink(j, { href: e.target.value })} placeholder="/page, https://… ou mailto:…" className="h-9 font-mono text-[12px]" aria-label="Adresse du lien" />
            <div className="flex gap-1 shrink-0">
              <button type="button" className={iconBtn} disabled={j === 0} onClick={() => onChange({ ...col, links: move(col.links, j, -1) })} aria-label="Monter le lien"><IconArrowUp size={13} /></button>
              <button type="button" className={iconBtn} disabled={j === col.links.length - 1} onClick={() => onChange({ ...col, links: move(col.links, j, 1) })} aria-label="Descendre le lien"><IconArrowDown size={13} /></button>
              <button type="button" className={iconBtn} onClick={() => onChange({ ...col, links: col.links.filter((_, k) => k !== j) })} aria-label="Retirer le lien"><IconX size={13} /></button>
            </div>
          </div>
        ))}
        <Button size="sm" disabled={col.links.length >= FOOTER_LIMITS.links} onClick={() => onChange({ ...col, links: [...col.links, { label: '', href: '/' }] })} icon={<IconPlus size={14} />}>
          Ajouter un sujet
        </Button>
      </div>
    </div>
  );
}

export default function FooterSettingsPage() {
  const { confirm, toast } = useAdmin();
  const { values, setValues, save, saving } = useSettings('footer');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!values) return <Loading />;
  const f = values as FooterSettings;
  const set = (patch: Partial<FooterSettings>) => setValues({ ...f, ...patch });

  const uploadLogo = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const [name] = await uploadImages(files);
    setUploading(false);
    if (name) set({ logo: `/api/uploads/${name}` });
    else toast('Le logo n’a pas pu être envoyé.', 'error');
  };

  const reset = async () => {
    if (!(await confirm({ title: 'Rétablir le pied de page d’origine ?', message: 'Vos catégories, liens et textes actuels seront remplacés. Pensez à enregistrer ensuite.', confirmLabel: 'Rétablir' }))) return;
    setValues(JSON.parse(JSON.stringify(DEFAULT_FOOTER)));
  };

  return (
    <>
      <PageHeader
        title="Footer"
        subtitle="Catégories, liens, textes et logo du pied de page. L’aperçu se met à jour pendant que vous écrivez."
        actions={
          <div className="flex gap-2">
            <Button icon={<IconRefresh size={14} />} onClick={reset}>Rétablir</Button>
            <Button variant="primary" disabled={saving} onClick={() => save()}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
          </div>
        }
      />
      <div className="adm-stagger space-y-4">
        <Card className="overflow-hidden">
          <CardTitle>Aperçu en direct</CardTitle>
          <div className="border-t border-white/[0.06] max-h-[620px] overflow-y-auto">
            <FooterView footer={f} preview />
          </div>
        </Card>

        <Card>
          <CardTitle>Marque et textes</CardTitle>
          <div className="px-5 pb-5 grid gap-4 lg:grid-cols-2">
            <Field label="Nom affiché à côté du logo">
              <Input value={f.brandName} onChange={(e) => set({ brandName: e.target.value })} maxLength={60} />
            </Field>
            <Field label="Logo" hint="Image carrée. Laissez vide pour ne pas afficher de logo.">
              <div className="flex items-center gap-2">
                {f.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.logo} alt="" className="w-9 h-9 rounded-lg border border-white/15 object-cover bg-black" />
                ) : (
                  <span className="w-9 h-9 rounded-lg border border-dashed border-white/15 flex items-center justify-center text-zinc-600"><IconPhoto size={16} /></span>
                )}
                <Button size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>{uploading ? 'Envoi…' : 'Changer'}</Button>
                {f.logo && <Button size="sm" onClick={() => set({ logo: '' })}>Retirer</Button>}
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => uploadLogo(e.target.files)} />
              </div>
            </Field>
            <Field label="Texte de copyright" hint="{year} est remplacé par l’année en cours.">
              <Input value={f.copyright} onChange={(e) => set({ copyright: e.target.value })} maxLength={160} />
            </Field>
            <Field label="Mention sous le copyright">
              <Textarea value={f.disclaimer} onChange={(e) => set({ disclaimer: e.target.value })} rows={2} maxLength={400} />
            </Field>
          </div>
        </Card>

        <Card>
          <CardTitle>Catégories et sujets</CardTitle>
          <div className="px-5 pb-5 space-y-3">
            {f.columns.map((col, i) => (
              <ColumnEditor
                key={i}
                col={col}
                index={i}
                total={f.columns.length}
                onChange={(c) => set({ columns: f.columns.map((x, k) => (k === i ? c : x)) })}
                onMove={(d) => set({ columns: move(f.columns, i, d) })}
                onRemove={async () => {
                  if (await confirm({ title: `Supprimer « ${col.title || 'cette catégorie'} » ?`, message: 'La catégorie et tous ses liens disparaissent du pied de page.', danger: true, confirmLabel: 'Supprimer' })) {
                    set({ columns: f.columns.filter((_, k) => k !== i) });
                  }
                }}
              />
            ))}
            <Button disabled={f.columns.length >= FOOTER_LIMITS.columns} onClick={() => set({ columns: [...f.columns, { title: 'Nouvelle catégorie', links: [] }] })} icon={<IconPlus size={14} />}>
              Ajouter une catégorie
            </Button>
          </div>
        </Card>

        <Card>
          <CardTitle>Grand texte tout en bas</CardTitle>
          <div className="px-5 pb-5 space-y-4">
            <Toggle checked={f.showBigText} onChange={(v) => set({ showBigText: v })} label="Afficher le grand texte" />
            <Field label="Texte" hint="Court de préférence (ex. YUFO).">
              <Input value={f.bigText} onChange={(e) => set({ bigText: e.target.value })} maxLength={16} className="sm:w-60" />
            </Field>
          </div>
        </Card>
      </div>
    </>
  );
}
