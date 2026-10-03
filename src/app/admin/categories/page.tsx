'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { IconArrowDown, IconArrowUp, IconCategory, IconEye, IconEyeOff, IconListCheck, IconPencil, IconPlus, IconRestore, IconTrash } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Badge, Button, Card, Drawer, Empty, Field, Input, Loading, PageHeader, Tabs, Textarea } from '@/components/admin/ui';

interface Item { id: string; label: string; description?: string; visible: boolean; order: number; deletedAt?: string; products: number }
interface Product { id: string; name: string; category: string; collection?: string; image: string; deletedAt?: string }
type Kind = 'categories' | 'collections';

export default function CategoriesPage() {
  const { api, toast, confirm } = useAdmin();
  const params = useSearchParams();
  const [kind, setKind] = useState<Kind>(params.get('tab') === 'collections' ? 'collections' : 'categories');
  const [data, setData] = useState<Record<Kind, Item[]> | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Item> | null>(params.get('new') === '1' ? {} : null);
  const [assigning, setAssigning] = useState<Item | null>(null);

  const load = useCallback(async () => {
    const [t, p] = await Promise.all([api<Record<Kind, Item[]>>('/api/admin/taxonomy'), api<{ products: Product[] }>('/api/admin/products', { silent: true })]);
    if (t) setData(t);
    if (p) setProducts(p.products.filter((x) => !x.deletedAt));
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const items = (data?.[kind] || []).filter((i) => !i.deletedAt);
  const trashed = (data?.[kind] || []).filter((i) => i.deletedAt);
  const noun = kind === 'categories' ? 'catégorie' : 'collection';

  const patch = async (body: Record<string, unknown>, label: string) => {
    if (await api('/api/admin/taxonomy', { method: 'PATCH', body: { kind, ...body } })) { toast(label); await load(); }
  };
  const move = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const ids = items.map((x) => x.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    setData((d) => d && { ...d, [kind]: [...ids.map((id) => d[kind].find((x) => x.id === id)!), ...trashed] });
    await api('/api/admin/taxonomy', { method: 'PATCH', body: { kind, order: ids }, silent: true });
  };
  const trash = async (it: Item) => {
    if (!(await confirm({ title: `Supprimer « ${it.label} » ?`, message: `La ${noun} disparaît du site et part à la corbeille. Les créations ne sont pas supprimées.`, danger: true, confirmLabel: 'Supprimer' }))) return;
    if (await api(`/api/admin/taxonomy?kind=${kind}&id=${encodeURIComponent(it.id)}`, { method: 'DELETE' })) { toast(`${noun[0].toUpperCase() + noun.slice(1)} supprimée`); await load(); }
  };

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Organisez les créations par type de bijou et par collection (drops, thèmes, collaborations)."
        actions={<Button variant="primary" icon={<IconPlus size={16} />} onClick={() => setEditing({})}>{kind === 'categories' ? 'Créer une catégorie' : 'Créer une collection'}</Button>}
      />
      <div className="mb-4">
        <Tabs value={kind} onChange={setKind} tabs={[
          { id: 'categories', label: 'Catégories', count: data?.categories.filter((i) => !i.deletedAt).length },
          { id: 'collections', label: 'Collections', count: data?.collections.filter((i) => !i.deletedAt).length },
        ]} />
      </div>

      <Card className="overflow-hidden">
        {!data ? <Loading /> : items.length === 0 ? <Empty icon={<IconCategory size={20} />} title={`Aucune ${noun}`} /> : (
          <div className="adm-stagger">
            {items.map((it, i) => (
              <div key={it.id} className="adm-row flex items-center gap-3 px-3 sm:px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.03]">
                <div className="flex flex-col">
                  <button onClick={() => move(i, -1)} className="p-0.5 text-zinc-600 hover:text-white" aria-label="Monter"><IconArrowUp size={14} /></button>
                  <button onClick={() => move(i, 1)} className="p-0.5 text-zinc-600 hover:text-white" aria-label="Descendre"><IconArrowDown size={14} /></button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-[14px] font-medium ${it.visible ? 'text-white' : 'text-zinc-500'}`}>{it.label}</p>
                  <p className="text-[12px] text-zinc-500 truncate">{it.description || it.id}</p>
                </div>
                {!it.visible && <Badge tone="amber">Masquée</Badge>}
                <Badge>{it.products} création{it.products > 1 ? 's' : ''}</Badge>
                <div className="flex items-center gap-0.5">
                  <Btn label="Créations" onClick={() => setAssigning(it)}><IconListCheck size={16} /></Btn>
                  <Btn label={it.visible ? 'Masquer' : 'Afficher'} onClick={() => patch({ id: it.id, visible: !it.visible }, it.visible ? 'Masquée sur le site' : 'Visible sur le site')}>
                    {it.visible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </Btn>
                  <Btn label="Modifier" onClick={() => setEditing(it)}><IconPencil size={16} /></Btn>
                  <Btn label="Supprimer" danger onClick={() => trash(it)}><IconTrash size={16} /></Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {trashed.length > 0 && (
        <div className="mt-6">
          <p className="text-[12px] uppercase tracking-wider text-zinc-500 mb-2">Corbeille</p>
          <Card>
            {trashed.map((it) => (
              <div key={it.id} className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] last:border-0">
                <span className="flex-1 text-[13px] text-zinc-400">{it.label}</span>
                <Button size="sm" icon={<IconRestore size={14} />} onClick={() => patch({ id: it.id, restore: true }, 'Restaurée')}>Restaurer</Button>
              </div>
            ))}
          </Card>
        </div>
      )}

      <Drawer open={!!editing} onClose={() => setEditing(null)} width={520} title={editing?.id ? `Modifier · ${editing.label}` : kind === 'categories' ? 'Nouvelle catégorie' : 'Nouvelle collection'}>
        {editing && (
          <EditForm
            initial={editing}
            onSave={async (label, description) => {
              const ok = editing.id
                ? await api('/api/admin/taxonomy', { method: 'PATCH', body: { kind, id: editing.id, label, description } })
                : await api('/api/admin/taxonomy', { method: 'POST', body: { kind, label, description } });
              if (ok) { toast(editing.id ? 'Saved successfully' : `${noun[0].toUpperCase() + noun.slice(1)} créée`); setEditing(null); await load(); }
            }}
          />
        )}
      </Drawer>

      <Drawer open={!!assigning} onClose={() => setAssigning(null)} width={560} title={assigning ? `Créations · ${assigning.label}` : ''}>
        {assigning && (
          <Assign
            item={assigning}
            kind={kind}
            products={products}
            onSave={async (ids) => {
              if (await api('/api/admin/taxonomy', { method: 'PATCH', body: { kind, id: assigning.id, productIds: ids } })) { toast('Saved successfully'); setAssigning(null); await load(); }
            }}
          />
        )}
      </Drawer>
    </>
  );
}

function Btn({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className={`adm-press w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${danger ? 'text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10' : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'}`}>
      {children}
    </button>
  );
}

function EditForm({ initial, onSave }: { initial: Partial<Item>; onSave: (label: string, description: string) => Promise<void> }) {
  const [label, setLabel] = useState(initial.label || '');
  const [description, setDescription] = useState(initial.description || '');
  return (
    <div className="space-y-4">
      <Field label="Nom"><Input autoFocus value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex. Chains, Summer drop, Collab Aztk…" /></Field>
      <Field label="Description (facultative)"><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
      <div className="flex justify-end"><Button variant="primary" disabled={!label.trim()} onClick={() => onSave(label, description)}>{initial.id ? 'Enregistrer' : 'Créer'}</Button></div>
    </div>
  );
}

function Assign({ item, kind, products, onSave }: { item: Item; kind: Kind; products: Product[]; onSave: (ids: string[]) => Promise<void> }) {
  const field = kind === 'categories' ? 'category' : 'collection';
  const [sel, setSel] = useState<Set<string>>(new Set(products.filter((p) => (p as any)[field] === item.id).map((p) => p.id)));
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <div>
      <p className="text-[12px] text-zinc-500 mb-3">
        {kind === 'categories' ? 'Une création appartient à une seule catégorie : la cocher ici la déplace dans celle-ci.' : 'Cochez les créations de cette collection. Une création décochée sort de la collection.'}
      </p>
      <div className="space-y-1 mb-5">
        {products.map((p) => (
          <label key={p.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04] cursor-pointer">
            <input type="checkbox" checked={sel.has(p.id)} onChange={() => toggle(p.id)} className="w-4 h-4 accent-white" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-black/40" />
            <span className="text-[13px] text-zinc-200 truncate">{p.name}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end sticky bottom-0 py-3 bg-[#151516]"><Button variant="primary" onClick={() => onSave([...sel])}>Enregistrer ({sel.size})</Button></div>
    </div>
  );
}
