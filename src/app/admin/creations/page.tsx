'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  IconArrowDown, IconArrowUp, IconCopy, IconDiamond, IconExternalLink, IconEye, IconEyeOff, IconPencil, IconPhotoPlus,
  IconPlus, IconRestore, IconSearch, IconStar, IconStarFilled, IconTrash,
} from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Badge, Button, Card, Drawer, Empty, Field, Input, Loading, money, PageHeader, Select, Tabs, Textarea, timeAgo, Toggle, uploadImages } from '@/components/admin/ui';
import { PRODUCT_STATUS } from '@/components/admin/labels';

interface Product {
  id: string; name: string; category: string; collection?: string; brand: string; reference: string; price: number;
  image: string; hoverImage?: string; shortDescription: string; fullDescription: string;
  specs: { material: string; stones: string; compatibility: string; delivery: string };
  inStock: boolean; featured?: boolean; status: 'draft' | 'published' | 'hidden'; tags?: string[]; sortOrder: number;
  allowSimilarProject?: boolean; deletedAt?: string; updatedAt?: string; fileIds?: string[];
}
interface TaxItem { id: string; label: string; deletedAt?: string }

const EMPTY: Partial<Product> = {
  name: '', price: 0, status: 'draft', category: 'pendants', collection: '', brand: 'YUFO The Jeweler', reference: '',
  image: '', hoverImage: '', shortDescription: '', fullDescription: '', tags: [], inStock: true, featured: false, allowSimilarProject: true,
  specs: { material: 'Solid 18K Precious Alloy', stones: 'Hand-Set VVS Lab Diamond Pavé', compatibility: 'Universal FiveM MP Male & Female Ped Skeletons', delivery: 'Instant Asset Allocation (.ydd / .ytd ready)' },
};

export default function CreationsPage() {
  const { api, toast, confirm, me } = useAdmin();
  const params = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [tax, setTax] = useState<{ categories: TaxItem[]; collections: TaxItem[] }>({ categories: [], collections: [] });
  const [view, setView] = useState<'all' | 'published' | 'draft' | 'hidden' | 'trash'>('all');
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const load = useCallback(async () => {
    const [p, t] = await Promise.all([api<{ products: Product[] }>('/api/admin/products'), api<typeof tax>('/api/admin/taxonomy')]);
    if (p) setProducts(p.products);
    if (t) setTax(t);
  }, [api]);
  useEffect(() => { load(); }, [load]);

  // Ouverture directe : ?new=1 (bouton Add premade) ou ?id=… (recherche globale).
  useEffect(() => {
    if (!products) return;
    if (params.get('new') === '1') setEditing({ ...EMPTY });
    const id = params.get('id');
    if (id) { const p = products.find((x) => x.id === id); if (p) setEditing(p); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products === null, params]);

  const catLabel = (id: string) => tax.categories.find((c) => c.id === id)?.label || id;
  const colLabel = (id?: string) => (id ? tax.collections.find((c) => c.id === id)?.label || id : '—');

  const list = useMemo(() => {
    if (!products) return [];
    const s = q.trim().toLowerCase();
    return products
      .filter((p) => (view === 'trash' ? !!p.deletedAt : !p.deletedAt && (view === 'all' || p.status === view)))
      .filter((p) => !cat || p.category === cat)
      .filter((p) => !s || `${p.name} ${p.reference} ${(p.tags || []).join(' ')}`.toLowerCase().includes(s));
  }, [products, view, cat, q]);

  const patch = async (p: Product, body: Partial<Product>, label: string) => {
    if (await api('/api/admin/products', { method: 'PATCH', body: { id: p.id, ...body } })) { toast(label); await load(); }
  };
  const post = async (body: Record<string, unknown>, label: string) => {
    if (await api('/api/admin/products', { method: 'POST', body })) { toast(label); await load(); }
  };

  const move = async (p: Product, dir: -1 | 1) => {
    const visible = products!.filter((x) => !x.deletedAt);
    const i = visible.findIndex((x) => x.id === p.id);
    const j = i + dir;
    if (j < 0 || j >= visible.length) return;
    const ids = visible.map((x) => x.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    setProducts((all) => all && [...ids.map((id) => all.find((x) => x.id === id)!), ...all.filter((x) => x.deletedAt)]);
    await api('/api/admin/products', { method: 'POST', body: { action: 'reorder', ids }, silent: true });
  };

  const trash = async (p: Product) => {
    if (!(await confirm({ title: `Mettre « ${p.name} » à la corbeille ?`, message: 'La création disparaît du site. Vous pourrez la restaurer depuis la corbeille.', danger: true, confirmLabel: 'Mettre à la corbeille' }))) return;
    if (await api(`/api/admin/products?id=${encodeURIComponent(p.id)}`, { method: 'DELETE' })) { toast('Création mise à la corbeille'); await load(); }
  };
  const destroy = async (p: Product) => {
    if (!(await confirm({ title: 'Supprimer définitivement ?', message: `« ${p.name} » sera supprimée pour de bon. Cette action est irréversible.`, danger: true, confirmLabel: 'Supprimer définitivement' }))) return;
    if (await api(`/api/admin/products?id=${encodeURIComponent(p.id)}&permanent=1`, { method: 'DELETE' })) { toast('Création supprimée'); await load(); }
  };

  const closeEditor = () => { setEditing(null); if (params.get('new') || params.get('id')) router.replace('/admin/creations', { scroll: false }); };
  const counts = (v: string) => products?.filter((p) => (v === 'trash' ? !!p.deletedAt : !p.deletedAt && (v === 'all' || p.status === v))).length;

  return (
    <>
      <PageHeader
        title="Creations"
        subtitle="Les bijoux du catalogue et du portfolio."
        actions={<Button variant="primary" icon={<IconPlus size={16} />} onClick={() => setEditing({ ...EMPTY })}>Add premade</Button>}
      />

      <div className="flex flex-col xl:flex-row gap-3 xl:items-center justify-between mb-4">
        <Tabs value={view} onChange={setView} tabs={[
          { id: 'all', label: 'Toutes', count: counts('all') },
          { id: 'published', label: 'Published', count: counts('published') },
          { id: 'draft', label: 'Draft', count: counts('draft') },
          { id: 'hidden', label: 'Hidden', count: counts('hidden') },
          { id: 'trash', label: 'Corbeille', count: counts('trash') },
        ]} />
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <IconSearch size={16} className="absolute left-3 top-3 text-zinc-500" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, référence, tag…" className="pl-9" />
          </div>
          <Select value={cat} onChange={(e) => setCat(e.target.value)} className="w-auto">
            <option value="">Toutes catégories</option>
            {tax.categories.filter((c) => !c.deletedAt).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden">
        {!products ? <Loading /> : list.length === 0 ? <Empty icon={<IconDiamond size={20} />} title={view === 'trash' ? 'La corbeille est vide' : 'Aucune création'} /> : (
          <div className="adm-stagger">
            {list.map((p) => (
              <div key={p.id} className="adm-row flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.03]">
                {view !== 'trash' && !q && !cat && view === 'all' && (
                  <div className="hidden sm:flex flex-col">
                    <button onClick={() => move(p, -1)} className="p-0.5 text-zinc-600 hover:text-white" aria-label="Monter"><IconArrowUp size={14} /></button>
                    <button onClick={() => move(p, 1)} className="p-0.5 text-zinc-600 hover:text-white" aria-label="Descendre"><IconArrowDown size={14} /></button>
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-black/40 border border-white/[0.06] shrink-0" />
                <button onClick={() => setEditing(p)} className="min-w-0 flex-1 text-left">
                  <span className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-white truncate">{p.name}</span>
                    {p.featured && <IconStarFilled size={13} className="text-amber-300 shrink-0" />}
                  </span>
                  <span className="block text-[12px] text-zinc-500 truncate">{p.reference} · {catLabel(p.category)} · {colLabel(p.collection)}{p.tags?.length ? ` · #${p.tags.join(' #')}` : ''}</span>
                </button>
                <Badge tone={PRODUCT_STATUS[p.status]?.tone}>{PRODUCT_STATUS[p.status]?.label}</Badge>
                <span className="hidden sm:block w-20 text-right text-[13px] font-semibold tabular-nums">{money(p.price)}</span>
                <div className="flex items-center gap-0.5">
                  {view === 'trash' ? (
                    <>
                      <IconBtn label="Restaurer" onClick={() => post({ action: 'restore', id: p.id }, 'Création restaurée')}><IconRestore size={16} /></IconBtn>
                      {['founder', 'admin'].includes(me.role) && <IconBtn label="Supprimer définitivement" danger onClick={() => destroy(p)}><IconTrash size={16} /></IconBtn>}
                    </>
                  ) : (
                    <>
                      <IconBtn label="Modifier" onClick={() => setEditing(p)}><IconPencil size={16} /></IconBtn>
                      <IconBtn label={p.status === 'published' ? 'Masquer' : 'Publier'} onClick={() => patch(p, { status: p.status === 'published' ? 'hidden' : 'published' }, p.status === 'published' ? 'Création masquée' : 'Création publiée')}>
                        {p.status === 'published' ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </IconBtn>
                      <IconBtn label={p.featured ? 'Retirer de la une' : 'Mettre en avant'} onClick={() => patch(p, { featured: !p.featured }, p.featured ? 'Retirée des mises en avant' : 'Mise en avant')}>
                        {p.featured ? <IconStarFilled size={16} className="text-amber-300" /> : <IconStar size={16} />}
                      </IconBtn>
                      <span className="hidden md:contents">
                        <IconBtn label="Dupliquer" onClick={() => post({ action: 'duplicate', id: p.id }, 'Copie créée en brouillon')}><IconCopy size={16} /></IconBtn>
                        <IconBtn label="Voir sur le site" onClick={() => window.open(`/collections/shop-all?category=${encodeURIComponent(p.category)}`, '_blank')}><IconExternalLink size={16} /></IconBtn>
                      </span>
                      <IconBtn label="Corbeille" danger onClick={() => trash(p)}><IconTrash size={16} /></IconBtn>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Drawer open={!!editing} onClose={closeEditor} width={720} title={editing?.id ? `Modifier · ${editing.name}` : 'Nouvelle création'}>
        {editing && <Editor initial={editing} tax={tax} onSaved={async () => { closeEditor(); await load(); }} />}
      </Drawer>
    </>
  );
}

// Fichiers livrés automatiquement au client après achat de cette création.
function FilePicker({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const { api } = useAdmin();
  const [files, setFiles] = useState<{ id: string; name: string; deletedAt?: string; versions: { v: number; originalName: string }[] }[] | null>(null);
  useEffect(() => { api<{ files: NonNullable<typeof files> }>('/api/admin/files', { silent: true }).then((d) => setFiles(d ? d.files.filter((x) => !x.deletedAt) : [])); }, [api]);
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <div className="rounded-xl border border-white/[0.07] p-4">
      <p className="text-[13px] font-semibold text-white">Fichiers téléchargeables</p>
      <p className="text-[11px] text-zinc-500 mb-3">Livrés automatiquement au client quand sa commande passe en « Paid ».</p>
      {files === null ? <p className="text-[12px] text-zinc-500">Chargement…</p> : files.length === 0 ? (
        <p className="text-[12px] text-zinc-500">Aucun fichier. <a href="/admin/files" className="underline hover:text-white">Ajoutez-en dans Files</a>.</p>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-1">
          {files.map((x) => (
            <label key={x.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer text-[13px]">
              <input type="checkbox" checked={value.includes(x.id)} onChange={() => toggle(x.id)} className="w-4 h-4 accent-white" />
              <span className="text-zinc-200 truncate flex-1">{x.name}</span>
              <span className="text-[11px] text-zinc-500">v{x.versions[x.versions.length - 1].v}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function IconBtn({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className={`adm-press w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${danger ? 'text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10' : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'}`}>
      {children}
    </button>
  );
}

function Editor({ initial, tax, onSaved }: { initial: Partial<Product>; tax: { categories: TaxItem[]; collections: TaxItem[] }; onSaved: () => Promise<void> }) {
  const { api, toast } = useAdmin();
  const [f, setF] = useState<Partial<Product>>({ ...EMPTY, ...initial, specs: { ...EMPTY.specs!, ...initial.specs } });
  const [tags, setTags] = useState((initial.tags || []).join(', '));
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof Product, v: unknown) => setF((x) => ({ ...x, [k]: v }));
  const setSpec = (k: keyof Product['specs'], v: string) => setF((x) => ({ ...x, specs: { ...x.specs!, [k]: v } }));

  const save = async () => {
    setBusy(true);
    const body = { ...f, tags: tags.split(',').map((t) => t.trim()).filter(Boolean) };
    const res = f.id
      ? await api('/api/admin/products', { method: 'PATCH', body })
      : await api('/api/admin/products', { method: 'POST', body });
    setBusy(false);
    if (res) { toast(f.id ? 'Saved successfully' : 'Création ajoutée'); await onSaved(); }
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-4 items-start">
        <button onClick={() => imgRef.current?.click()} className="relative w-28 h-28 rounded-2xl border border-dashed border-white/15 hover:border-white/40 bg-black/30 overflow-hidden shrink-0 flex items-center justify-center text-zinc-500" aria-label="Changer l'image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {f.image ? <img src={f.image} alt="" className="w-full h-full object-cover" /> : <IconPhotoPlus size={22} />}
        </button>
        <input ref={imgRef} type="file" accept="image/*" hidden onChange={async (e) => {
          if (!e.target.files?.length) return;
          setBusy(true);
          const [name] = await uploadImages(e.target.files);
          setBusy(false);
          if (name) { set('image', `/api/uploads/${name}`); if (!f.hoverImage) set('hoverImage', `/api/uploads/${name}`); } else toast('Image refusée', 'error');
          e.target.value = '';
        }} />
        <div className="flex-1 space-y-3">
          <Field label="Nom"><Input value={f.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prix ($)"><Input type="number" min={0} step="0.01" value={f.price} onChange={(e) => set('price', e.target.value)} /></Field>
            <Field label="Statut">
              <Select value={f.status} onChange={(e) => set('status', e.target.value)}>
                <option value="draft">Draft</option><option value="published">Published</option><option value="hidden">Hidden</option>
              </Select>
            </Field>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Catégorie">
          <Select value={f.category} onChange={(e) => set('category', e.target.value)}>
            {tax.categories.filter((c) => !c.deletedAt).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        </Field>
        <Field label="Collection">
          <Select value={f.collection || ''} onChange={(e) => set('collection', e.target.value)}>
            <option value="">— Aucune —</option>
            {tax.collections.filter((c) => !c.deletedAt).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        </Field>
        <Field label="Tags" hint="Séparés par des virgules : iced, cuban, logo…"><Input value={tags} onChange={(e) => setTags(e.target.value)} /></Field>
        <Field label="Référence" hint="Laisser vide pour en générer une."><Input value={f.reference} onChange={(e) => set('reference', e.target.value)} /></Field>
      </div>

      <Field label="Description courte"><Input value={f.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} /></Field>
      <Field label="Description complète"><Textarea rows={5} value={f.fullDescription} onChange={(e) => set('fullDescription', e.target.value)} /></Field>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Image (URL)"><Input value={f.image} onChange={(e) => set('image', e.target.value)} /></Field>
        <Field label="Image au survol (URL)"><Input value={f.hoverImage} onChange={(e) => set('hoverImage', e.target.value)} /></Field>
        <Field label="Matière"><Input value={f.specs?.material} onChange={(e) => setSpec('material', e.target.value)} /></Field>
        <Field label="Pierres"><Input value={f.specs?.stones} onChange={(e) => setSpec('stones', e.target.value)} /></Field>
        <Field label="Compatibilité"><Input value={f.specs?.compatibility} onChange={(e) => setSpec('compatibility', e.target.value)} /></Field>
        <Field label="Livraison"><Input value={f.specs?.delivery} onChange={(e) => setSpec('delivery', e.target.value)} /></Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <Toggle checked={!!f.featured} onChange={(v) => set('featured', v)} label="Featured" />
        <Toggle checked={!!f.inStock} onChange={(v) => set('inStock', v)} label="Disponible" />
        <Toggle checked={f.allowSimilarProject !== false} onChange={(v) => set('allowSimilarProject', v)} label="Start a similar project" />
      </div>

      <FilePicker value={f.fileIds || []} onChange={(ids) => set('fileIds', ids)} />

      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-zinc-600">{f.updatedAt ? `Modifiée ${timeAgo(f.updatedAt)}` : ''}</span>
        <Button variant="primary" disabled={busy || !f.name || !f.fullDescription} onClick={save}>{f.id ? 'Enregistrer' : 'Créer'}</Button>
      </div>
    </div>
  );
}
