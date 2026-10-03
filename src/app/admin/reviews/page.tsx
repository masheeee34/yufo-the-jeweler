'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IconEye, IconEyeOff, IconMessageReply, IconPencil, IconPlus, IconRestore, IconStar, IconStarFilled, IconTrash } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Badge, Button, Card, Drawer, Empty, Field, Input, Loading, PageHeader, Select, Tabs, Textarea, timeAgo, Toggle } from '@/components/admin/ui';

interface Review {
  id: string; pseudo: string; date: string; message: string; rating: number; isVerified: boolean; createdAt: string;
  source: 'verified' | 'imported' | 'manual'; hidden?: boolean; featured?: boolean; productId?: string; orderId?: string;
  reply?: { text: string; by: string; at: string }; deletedAt?: string; updatedAt?: string;
}

const SOURCE = { verified: { label: 'Verified purchase', tone: 'green' as const }, imported: { label: 'Imported review', tone: 'neutral' as const }, manual: { label: 'Added manually', tone: 'blue' as const } };

function Stars({ n }: { n: number }) {
  return <span className="inline-flex text-amber-300">{[1, 2, 3, 4, 5].map((i) => (i <= n ? <IconStarFilled key={i} size={13} /> : <IconStar key={i} size={13} className="text-zinc-600" />))}</span>;
}

export default function ReviewsPage() {
  const { api, toast, confirm } = useAdmin();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [canVerify, setCanVerify] = useState(false);
  const [view, setView] = useState<'visible' | 'hidden' | 'trash'>('visible');
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [orders, setOrders] = useState<{ id: string; customer: string }[]>([]);
  const [editing, setEditing] = useState<Partial<Review> | null>(null);

  const load = useCallback(async () => {
    const d = await api<{ reviews: Review[]; canEditVerified: boolean }>('/api/admin/reviews');
    if (d) { setReviews(d.reviews); setCanVerify(d.canEditVerified); }
  }, [api]);
  useEffect(() => {
    load();
    api<{ products: { id: string; name: string; deletedAt?: string }[] }>('/api/admin/products', { silent: true }).then((d) => d && setProducts(d.products.filter((p) => !p.deletedAt)));
    api<{ orders: { id: string; customer: string }[] }>('/api/admin/orders', { silent: true }).then((d) => d && setOrders(d.orders));
  }, [api, load]);

  const list = useMemo(() => (reviews || []).filter((r) => (view === 'trash' ? !!r.deletedAt : !r.deletedAt && (view === 'hidden' ? !!r.hidden : !r.hidden))), [reviews, view]);

  const patch = async (r: Review, body: Record<string, unknown>, label: string) => {
    if (await api('/api/admin/reviews', { method: 'PATCH', body: { id: r.id, ...body } })) { toast(label); await load(); }
  };
  const trash = async (r: Review) => {
    if (!(await confirm({ title: 'Mettre cet avis à la corbeille ?', message: `L’avis de ${r.pseudo} disparaît du site. Restaurable depuis la corbeille.`, danger: true, confirmLabel: 'Corbeille' }))) return;
    if (await api(`/api/admin/reviews?id=${r.id}`, { method: 'DELETE' })) { toast('Avis mis à la corbeille'); await load(); }
  };
  const destroy = async (r: Review) => {
    if (!(await confirm({ title: 'Supprimer définitivement ?', message: 'Cette action est irréversible (elle reste tracée dans les logs).', danger: true, confirmLabel: 'Supprimer' }))) return;
    if (await api(`/api/admin/reviews?id=${r.id}&permanent=1`, { method: 'DELETE' })) { toast('Avis supprimé'); await load(); }
  };

  return (
    <>
      <PageHeader title="Reviews" subtitle="Les avis clients affichés sur le site. Chaque modification est enregistrée dans les logs." actions={<Button variant="primary" icon={<IconPlus size={16} />} onClick={() => setEditing({ rating: 5, source: 'manual' })}>Ajouter un avis</Button>} />
      <div className="mb-4">
        <Tabs value={view} onChange={setView} tabs={[
          { id: 'visible', label: 'Visibles', count: reviews?.filter((r) => !r.deletedAt && !r.hidden).length },
          { id: 'hidden', label: 'Masqués', count: reviews?.filter((r) => !r.deletedAt && r.hidden).length },
          { id: 'trash', label: 'Corbeille', count: reviews?.filter((r) => r.deletedAt).length },
        ]} />
      </div>

      {!reviews ? <Loading /> : list.length === 0 ? <Card><Empty icon={<IconStar size={20} />} title="Aucun avis ici" /></Card> : (
        <div className="adm-stagger grid grid-cols-1 lg:grid-cols-2 gap-3">
          {list.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-white flex items-center gap-2">{r.pseudo} {r.featured && <Badge tone="amber">Featured</Badge>}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-2"><Stars n={r.rating} /> {r.date || timeAgo(r.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={SOURCE[r.source].tone}>{SOURCE[r.source].label}</Badge>
                  {r.isVerified && r.source !== 'verified' && <Badge tone="blue">Badge vérifié</Badge>}
                </div>
              </div>
              <p className="mt-3 text-[13px] text-zinc-300 leading-relaxed line-clamp-4">“{r.message}”</p>
              {r.reply && <p className="mt-3 pl-3 border-l-2 border-white/15 text-[12px] text-zinc-400"><b className="text-zinc-300">Réponse de YUFO :</b> {r.reply.text}</p>}
              {(r.productId || r.orderId) && <p className="mt-2 text-[11px] text-zinc-500">{r.productId && `Produit : ${products.find((p) => p.id === r.productId)?.name || r.productId}`}{r.productId && r.orderId ? ' · ' : ''}{r.orderId && `Commande : ${r.orderId}`}</p>}
              <div className="mt-4 flex items-center gap-1 border-t border-white/[0.05] pt-3">
                {view === 'trash' ? (
                  <>
                    <Button size="sm" icon={<IconRestore size={14} />} onClick={async () => { if (await api('/api/admin/reviews', { method: 'POST', body: { action: 'restore', id: r.id } })) { toast('Avis restauré'); await load(); } }}>Restaurer</Button>
                    <Button size="sm" variant="danger" onClick={() => destroy(r)}>Supprimer définitivement</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="ghost" icon={<IconPencil size={14} />} onClick={() => setEditing(r)}>Modifier</Button>
                    <Button size="sm" variant="ghost" icon={<IconMessageReply size={14} />} onClick={() => setEditing({ ...r, _focusReply: true } as any)}>Répondre</Button>
                    <Button size="sm" variant="ghost" icon={r.hidden ? <IconEye size={14} /> : <IconEyeOff size={14} />} onClick={() => patch(r, { hidden: !r.hidden }, r.hidden ? 'Avis affiché' : 'Avis masqué')}>{r.hidden ? 'Afficher' : 'Masquer'}</Button>
                    <Button size="sm" variant="ghost" icon={r.featured ? <IconStarFilled size={14} /> : <IconStar size={14} />} onClick={() => patch(r, { featured: !r.featured }, r.featured ? 'Retiré de la une' : 'Mis en avant')}>Featured</Button>
                    <span className="flex-1" />
                    <button onClick={() => trash(r)} aria-label="Corbeille" className="w-8 h-8 rounded-lg text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center"><IconTrash size={15} /></button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer open={!!editing} onClose={() => setEditing(null)} width={560} title={editing?.id ? `Avis de ${editing.pseudo}` : 'Nouvel avis'}>
        {editing && <ReviewForm initial={editing} products={products} orders={orders} canVerify={canVerify} onDone={async () => { setEditing(null); await load(); }} />}
      </Drawer>
    </>
  );
}

function ReviewForm({ initial, products, orders, canVerify, onDone }: {
  initial: Partial<Review> & { _focusReply?: boolean };
  products: { id: string; name: string }[];
  orders: { id: string; customer: string }[];
  canVerify: boolean;
  onDone: () => Promise<void>;
}) {
  const { api, toast } = useAdmin();
  const [f, setF] = useState({
    pseudo: initial.pseudo || '', rating: initial.rating || 5, date: initial.date || '', message: initial.message || '',
    productId: initial.productId || '', orderId: initial.orderId || '', reply: initial.reply?.text || '',
    isVerified: !!initial.isVerified, source: initial.source || 'manual',
  });
  const set = (k: keyof typeof f, v: unknown) => setF((x) => ({ ...x, [k]: v }));

  const save = async () => {
    const body: Record<string, unknown> = { pseudo: f.pseudo, rating: f.rating, date: f.date, message: f.message, productId: f.productId, orderId: f.orderId };
    let ok;
    if (initial.id) {
      body.id = initial.id;
      body.reply = f.reply;
      if (canVerify) body.isVerified = f.isVerified;
      ok = await api('/api/admin/reviews', { method: 'PATCH', body });
    } else {
      body.source = f.source;
      ok = await api('/api/admin/reviews', { method: 'POST', body });
    }
    if (ok) { toast('Saved successfully'); await onDone(); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Auteur"><Input value={f.pseudo} onChange={(e) => set('pseudo', e.target.value)} /></Field>
        <Field label="Étoiles">
          <Select value={f.rating} onChange={(e) => set('rating', Number(e.target.value))}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}</Select>
        </Field>
      </div>
      <Field label="Date affichée" hint="Ex. « 2 days ago » ou « 18 Sept 2026 »"><Input value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
      <Field label="Texte de l’avis"><Textarea rows={4} value={f.message} onChange={(e) => set('message', e.target.value)} /></Field>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Produit concerné">
          <Select value={f.productId} onChange={(e) => set('productId', e.target.value)}>
            <option value="">— Aucun —</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Commande / projet" hint="Payé(e) = « Verified purchase » automatique">
          <Select value={f.orderId} onChange={(e) => set('orderId', e.target.value)}>
            <option value="">— Aucune —</option>
            {orders.map((o) => <option key={o.id} value={o.id}>{o.id} · {o.customer}</option>)}
          </Select>
        </Field>
      </div>
      {!initial.id && (
        <Field label="Origine">
          <Select value={f.source} onChange={(e) => set('source', e.target.value)}>
            <option value="manual">Ajouté à la main</option>
            <option value="imported">Importé (Discord, ancien site…)</option>
          </Select>
        </Field>
      )}
      {initial.id && (
        <>
          <Field label="Réponse publique de YUFO" hint="Laisser vide pour retirer la réponse."><Textarea autoFocus={initial._focusReply} rows={3} value={f.reply} onChange={(e) => set('reply', e.target.value)} /></Field>
          <div className="rounded-xl border border-white/[0.07] p-4">
            <Toggle checked={f.isVerified} onChange={(v) => set('isVerified', v)} disabled={!canVerify} label="Badge vérifié affiché sur le site" />
            <p className="text-[11px] text-zinc-500 mt-2">{canVerify ? 'Modification manuelle réservée aux Founders, enregistrée dans les logs (pour les anciens avis importés).' : 'Seul un Founder peut modifier ce statut à la main. Reliez l’avis à une commande payée pour le vérifier automatiquement.'}</p>
          </div>
        </>
      )}
      <div className="flex justify-end"><Button variant="primary" disabled={!f.pseudo.trim() || !f.message.trim()} onClick={save}>{initial.id ? 'Enregistrer' : 'Ajouter'}</Button></div>
    </div>
  );
}
