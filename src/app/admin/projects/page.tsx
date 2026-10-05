'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconBolt, IconCheck, IconLink, IconPhotoPlus, IconSend, IconSparkles, IconTarget, IconTrash } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Badge, Button, Card, Drawer, Empty, Field, fullDate, Input, Loading, money, NotesBox, PageHeader, Select, Tabs, Textarea, timeAgo, Toggle, uploadImages } from '@/components/admin/ui';
import { PAYMENT, STAGE, STAGE_ORDER } from '@/components/admin/labels';
import { MessageAttachments } from '@/components/MessageAttachments';

interface Msg { id: string; sender: 'client' | 'admin'; text: string; createdAt: string; attachments?: string[] }
interface ProjectRow {
  id: string;
  customer: string;
  discordId?: string;
  createdAt: string;
  status: string;
  project: {
    stage: string; price?: number; paymentStatus?: string; amountPaid?: number; priority?: boolean; strictOptimization?: boolean;
    previews: { file: string; at: string; by: string }[]; finalFiles: { label: string; url: string; at: string }[]; approvedAt?: string;
    piece?: string; budget?: string; duration?: string; wornBy?: string; vision?: string;
  };
  references: string[];
  messages: Msg[];
  changeRequests: Msg[];
  notes: { id: string; by: string; at: string; text: string }[];
}

type View = 'active' | 'brief' | 'preview' | 'done' | 'all';

export default function ProjectsPage() {
  const { api, toast, refresh } = useAdmin();
  const params = useSearchParams();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);
  const [view, setView] = useState<View>('active');
  const openId = params.get('id');

  const load = useCallback(async () => {
    const data = await api<{ projects: ProjectRow[] }>('/api/admin/projects');
    if (data) setProjects(data.projects);
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const list = useMemo(() => {
    if (!projects) return [];
    const done = ['delivered', 'cancelled'];
    return projects
      .filter((p) => view === 'all'
        || (view === 'active' && !done.includes(p.project.stage))
        || (view === 'brief' && p.project.stage === 'brief')
        || (view === 'preview' && ['preview', 'approved'].includes(p.project.stage))
        || (view === 'done' && done.includes(p.project.stage)))
      .sort((a, b) => Number(!!b.project.priority) - Number(!!a.project.priority) || b.createdAt.localeCompare(a.createdAt));
  }, [projects, view]);

  const open = projects?.find((p) => p.id === openId) || null;
  const setOpen = (id: string | null) => router.replace(id ? `/admin/projects?id=${id}` : '/admin/projects', { scroll: false });

  const patch = async (body: Record<string, unknown>, label = 'Projet mis à jour') => {
    if (!open) return;
    if (await api('/api/admin/projects', { method: 'PATCH', body: { id: open.id, ...body } })) { toast(label); await load(); refresh(); }
  };
  const action = async (body: Record<string, unknown>, label: string) => {
    if (!open) return false;
    const ok = await api('/api/admin/projects', { method: 'POST', body: { id: open.id, ...body } });
    if (ok) { toast(label); await load(); refresh(); }
    return !!ok;
  };

  const count = (v: View) => projects?.filter((p) => {
    const s = p.project.stage;
    return v === 'all' || (v === 'active' && !['delivered', 'cancelled'].includes(s)) || (v === 'brief' && s === 'brief') || (v === 'preview' && ['preview', 'approved'].includes(s)) || (v === 'done' && ['delivered', 'cancelled'].includes(s));
  }).length;

  return (
    <>
      <PageHeader title="Custom projects" subtitle="Brief, devis, previews, validation 3D et fichiers finaux." />
      <div className="mb-4">
        <Tabs value={view} onChange={setView} tabs={[
          { id: 'active', label: 'En cours', count: count('active') },
          { id: 'brief', label: 'Nouveaux briefs', count: count('brief') },
          { id: 'preview', label: 'Preview / validation', count: count('preview') },
          { id: 'done', label: 'Terminés', count: count('done') },
          { id: 'all', label: 'Tous', count: count('all') },
        ]} />
      </div>

      {!projects ? <Loading /> : list.length === 0 ? (
        <Card><Empty icon={<IconSparkles size={20} />} title="Aucun projet ici" text="Les demandes du formulaire sur mesure arrivent dans « Nouveaux briefs »." /></Card>
      ) : (
        <div className="adm-stagger grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
          {list.map((p) => (
            <button key={p.id} onClick={() => setOpen(p.id)} className="adm-press text-left rounded-2xl bg-[#1a1a1b] border border-white/[0.06] hover:border-white/15 p-5 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-white truncate">{p.project.piece || 'Custom piece'}</p>
                  <p className="text-[12px] text-zinc-500 mt-0.5">{p.customer} · {timeAgo(p.createdAt)}</p>
                </div>
                <Badge tone={STAGE[p.project.stage]?.tone}>{STAGE[p.project.stage]?.label}</Badge>
              </div>
              <p className="mt-3 text-[12px] text-zinc-400 line-clamp-2 min-h-[32px]">{p.project.vision}</p>
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {p.project.priority && <Badge tone="red">Priority</Badge>}
                {p.project.strictOptimization && <Badge tone="violet">Strict optimization</Badge>}
                {p.project.price !== undefined ? <Badge tone="neutral">{money(p.project.price)}</Badge> : <Badge>{p.project.budget || 'No budget'}</Badge>}
                {p.project.paymentStatus && <Badge tone={PAYMENT[p.project.paymentStatus]?.tone}>{PAYMENT[p.project.paymentStatus]?.label}</Badge>}
                {p.status === 'pending' && p.messages.length > 1 && <Badge tone="amber">New message</Badge>}
              </div>
            </button>
          ))}
        </div>
      )}

      <Drawer open={!!open} onClose={() => setOpen(null)} width={760} title={open ? <>{open.project.piece || 'Custom piece'} <span className="text-zinc-500 font-normal">· {open.customer}</span></> : ''}>
        {open && <ProjectDetail p={open} patch={patch} action={action} reloadNotes={load} onDeleted={async () => { setOpen(null); await load(); refresh(); }} />}
      </Drawer>
    </>
  );
}

// Livrer un fichier du File Manager : le client le retrouve dans « My files ».
function DeliverFromFiles({ projectId, onDone }: { projectId: string; onDone: () => Promise<void> }) {
  const { api, toast, can } = useAdmin();
  const [files, setFiles] = useState<{ id: string; name: string; deletedAt?: string }[]>([]);
  const [sel, setSel] = useState('');
  useEffect(() => { if (can('store')) api<{ files: typeof files }>('/api/admin/files', { silent: true }).then((d) => d && setFiles(d.files.filter((f) => !f.deletedAt))); }, [api, can]);
  if (!can('store')) return null;
  return (
    <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row gap-2">
      <Select value={sel} onChange={(e) => setSel(e.target.value)}>
        <option value="">Ou livrer un fichier du File Manager…</option>
        {files.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
      </Select>
      <Button variant="primary" disabled={!sel} onClick={async () => {
        if (await api('/api/admin/files/grants', { method: 'POST', body: { fileId: sel, projectId } })) { toast('Fichier livré au client'); setSel(''); await onDone(); }
      }}>Livrer le fichier</Button>
    </div>
  );
}

// Suppression définitive : réservée aux Founders et Admins, confirmée deux fois.
function DeleteProject({ p, onDeleted }: { p: ProjectRow; onDeleted: () => Promise<void> }) {
  const { api, toast, confirm, me } = useAdmin();
  const [typed, setTyped] = useState('');
  if (me.role !== 'founder' && me.role !== 'admin') return null;
  return (
    <section className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-4">
      <h3 className="text-[13px] font-semibold text-rose-200">Supprimer définitivement</h3>
      <p className="text-[12px] text-zinc-400 mt-1 leading-relaxed">
        Efface le projet, la conversation, les notes internes, les images de référence et les previews, les accès aux fichiers livrés,
        les notifications du client et l’historique du projet dans Activity logs. Irréversible : il n’y a pas de corbeille.
      </p>
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={`Tapez ${p.id} pour confirmer`} className="sm:w-72" />
        <Button
          variant="danger"
          disabled={typed.trim() !== p.id}
          icon={<IconTrash size={15} />}
          onClick={async () => {
            if (!(await confirm({ title: `Supprimer ${p.id} pour de bon ?`, message: 'Toutes les traces du projet seront effacées. Cette action est irréversible.', danger: true, confirmLabel: 'Supprimer définitivement' }))) return;
            const d = await api<{ removedImages: number }>(`/api/admin/projects?id=${encodeURIComponent(p.id)}`, { method: 'DELETE' });
            if (d) {
              toast(`Projet supprimé (${d.removedImages} image${d.removedImages > 1 ? 's' : ''} effacée${d.removedImages > 1 ? 's' : ''})`);
              await onDeleted();
            }
          }}
        >
          Supprimer définitivement
        </Button>
      </div>
    </section>
  );
}

function ProjectDetail({ p, patch, action, reloadNotes, onDeleted }: {
  p: ProjectRow;
  patch: (b: Record<string, unknown>, label?: string) => Promise<void>;
  action: (b: Record<string, unknown>, label: string) => Promise<boolean>;
  reloadNotes: () => Promise<void>;
  onDeleted: () => Promise<void>;
}) {
  const { api, toast } = useAdmin();
  const [reply, setReply] = useState('');
  const [replyFiles, setReplyFiles] = useState<string[]>([]);
  const [previewFiles, setPreviewFiles] = useState<string[]>([]);
  const [previewText, setPreviewText] = useState('');
  const [final, setFinal] = useState({ label: 'Final files (.ydd / .ytd)', url: '' });
  const [busy, setBusy] = useState(false);
  const previewInput = useRef<HTMLInputElement>(null);
  const replyInput = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const pr = p.project;

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }); }, [p.messages.length]);

  const pick = async (files: FileList | null, set: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (!files?.length) return;
    setBusy(true);
    const names = await uploadImages(files);
    set((x) => [...x, ...names].slice(0, 6));
    setBusy(false);
    if (names.length < files.length) toast('Certaines images n’ont pas pu être envoyées.', 'error');
  };

  return (
    <div className="space-y-6">
      {/* Brief */}
      <section>
        <h3 className="text-[12px] uppercase tracking-wider text-zinc-500 mb-3">Brief du client</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px] mb-3">
          <div><p className="text-zinc-500 text-[11px]">Pièce</p><p className="text-white">{pr.piece || '—'}</p></div>
          <div><p className="text-zinc-500 text-[11px]">Porté par</p><p className="text-white">{pr.wornBy || '—'}</p></div>
          <div><p className="text-zinc-500 text-[11px]">Budget</p><p className="text-white">{pr.budget || '—'}</p></div>
          <div><p className="text-zinc-500 text-[11px]">Délai</p><p className="text-white">{pr.duration || '—'}</p></div>
        </div>
        <p className="text-[13px] text-zinc-200 whitespace-pre-line rounded-xl bg-black/25 border border-white/[0.06] p-4">{pr.vision || '—'}</p>
        {p.references.length > 0 && (
          <div className="mt-3"><p className="text-[11px] text-zinc-500 mb-1">Références ({p.references.length})</p><MessageAttachments names={p.references} className="max-w-[420px] grid-cols-4" /></div>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-zinc-600">{p.id} · reçu le {fullDate(p.createdAt)}</p>
          {/* Conversation, membres, statut et permissions se gèrent dans le ticket (bouton Manage). */}
          <a href={`/tickets/${p.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white text-zinc-950 text-[12px] font-semibold hover:bg-zinc-200">
            Ouvrir le ticket
          </a>
        </div>
      </section>

      {/* Suivi */}
      <section className="grid sm:grid-cols-2 gap-4">
        <Field label="Statut du projet">
          <Select value={pr.stage} onChange={(e) => patch({ stage: e.target.value }, 'Statut mis à jour')}>
            {STAGE_ORDER.map((s) => <option key={s} value={s}>{STAGE[s].label}</option>)}
          </Select>
        </Field>
        <Field label="Prix / devis convenu ($)" hint="Le projet passe en « Quoted » dès qu’un prix est saisi.">
          <Input type="number" min={0} step="0.01" defaultValue={pr.price ?? ''} key={`price-${pr.price}`} onBlur={(e) => e.target.value !== String(pr.price ?? '') && patch({ price: e.target.value }, 'Devis enregistré')} />
        </Field>
        <Field label="Paiement">
          <Select value={pr.paymentStatus || 'unpaid'} onChange={(e) => patch({ paymentStatus: e.target.value }, 'Paiement mis à jour')}>
            {Object.entries(PAYMENT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </Field>
        <Field label="Montant déjà payé ($)">
          <Input type="number" min={0} step="0.01" defaultValue={pr.amountPaid ?? ''} key={`paid-${pr.amountPaid}`} onBlur={(e) => e.target.value !== String(pr.amountPaid ?? '') && e.target.value !== '' && patch({ amountPaid: e.target.value }, 'Montant enregistré')} />
        </Field>
        <div className="sm:col-span-2 flex flex-wrap gap-6 pt-1">
          <Toggle checked={!!pr.priority} onChange={(v) => patch({ priority: v })} label={<span className="inline-flex items-center gap-1.5"><IconBolt size={15} /> Priority delivery</span>} />
          <Toggle checked={!!pr.strictOptimization} onChange={(v) => patch({ strictOptimization: v })} label={<span className="inline-flex items-center gap-1.5"><IconTarget size={15} /> Strict optimization</span>} />
        </div>
      </section>

      {/* Previews & validation */}
      <section className="rounded-xl border border-white/[0.07] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold text-white">Previews & validation 3D</h3>
          {pr.approvedAt ? <Badge tone="green"><IconCheck size={12} className="mr-1" /> Validée {timeAgo(pr.approvedAt)}</Badge> : pr.stage === 'preview' ? <Badge tone="blue">En attente du client</Badge> : null}
        </div>
        {pr.previews.length > 0 ? (
          <MessageAttachments names={pr.previews.map((x) => x.file)} className="max-w-full grid-cols-4 sm:grid-cols-6 mb-3" />
        ) : <p className="text-[12px] text-zinc-500 mb-3">Aucune preview envoyée.</p>}
        {p.changeRequests.length > 0 && (
          <div className="mb-3 rounded-lg bg-amber-400/[0.06] border border-amber-400/15 p-3">
            <p className="text-[12px] font-semibold text-amber-200 mb-1.5">Changements demandés ({p.changeRequests.length})</p>
            {p.changeRequests.map((m) => <p key={m.id} className="text-[12px] text-zinc-300 whitespace-pre-line">• {m.text} <span className="text-zinc-500">({timeAgo(m.createdAt)})</span></p>)}
          </div>
        )}
        {previewFiles.length > 0 && <MessageAttachments names={previewFiles} className="mb-2" />}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input value={previewText} onChange={(e) => setPreviewText(e.target.value)} placeholder="Message avec la preview (facultatif)" />
          <input ref={previewInput} type="file" accept="image/*" multiple hidden onChange={(e) => { pick(e.target.files, setPreviewFiles); e.target.value = ''; }} />
          <Button onClick={() => previewInput.current?.click()} disabled={busy} icon={<IconPhotoPlus size={16} />}>Images</Button>
          <Button variant="primary" disabled={!previewFiles.length || busy} onClick={async () => { if (await action({ action: 'preview', files: previewFiles, text: previewText }, 'Preview envoyée au client')) { setPreviewFiles([]); setPreviewText(''); } }}>Envoyer la preview</Button>
        </div>
      </section>

      {/* Fichiers finaux */}
      <section className="rounded-xl border border-white/[0.07] p-4">
        <h3 className="text-[13px] font-semibold text-white mb-3">Fichiers finaux</h3>
        {pr.finalFiles.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {pr.finalFiles.map((f, i) => (
              <a key={i} href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-sky-300 hover:underline"><IconLink size={14} /> {f.label} <span className="text-zinc-500">· {timeAgo(f.at)}</span></a>
            ))}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input value={final.label} onChange={(e) => setFinal({ ...final, label: e.target.value })} placeholder="Nom" className="sm:w-56" />
          <Input value={final.url} onChange={(e) => setFinal({ ...final, url: e.target.value })} placeholder="Lien de téléchargement (https://…)" />
          <Button variant="primary" disabled={!/^https?:\/\//.test(final.url)} onClick={async () => { if (await action({ action: 'final', label: final.label, url: final.url }, 'Fichiers livrés au client')) setFinal({ ...final, url: '' }); }}>Livrer</Button>
        </div>
        <p className="text-[11px] text-zinc-600 mt-2">Le lien est envoyé au client dans la conversation et le projet passe en « Delivered ».</p>
        <DeliverFromFiles projectId={p.id} onDone={reloadNotes} />
      </section>

      {/* Conversation */}
      <section>
        <h3 className="text-[12px] uppercase tracking-wider text-zinc-500 mb-3">Conversation</h3>
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {p.messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'admin' ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-zinc-500 mb-1 px-1">{m.sender === 'admin' ? 'YUFO' : p.customer} · {timeAgo(m.createdAt)}</span>
              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${m.sender === 'admin' ? 'bg-white text-zinc-950' : 'bg-white/[0.06] border border-white/10 text-zinc-200'}`}>
                {m.text}
                <MessageAttachments names={m.attachments} />
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        {replyFiles.length > 0 && <MessageAttachments names={replyFiles} className="mt-3" />}
        <div className="mt-3 flex gap-2">
          <input ref={replyInput} type="file" accept="image/*" multiple hidden onChange={(e) => { pick(e.target.files, setReplyFiles); e.target.value = ''; }} />
          <Button onClick={() => replyInput.current?.click()} disabled={busy} aria-label="Joindre des images" icon={<IconPhotoPlus size={16} />} />
          <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Répondre au client…" className="min-h-[44px] h-11" rows={1} />
          <Button variant="primary" disabled={(!reply.trim() && !replyFiles.length) || busy} icon={<IconSend size={15} />} onClick={async () => { if (await action({ action: 'reply', text: reply, files: replyFiles }, 'Message envoyé')) { setReply(''); setReplyFiles([]); } }}>Envoyer</Button>
        </div>
      </section>

      <NotesBox notes={p.notes} onAdd={async (text) => { if (await api('/api/admin/notes', { method: 'POST', body: { requestId: p.id, text } })) { toast('Note ajoutée'); await reloadNotes(); } }} />

      <DeleteProject p={p} onDeleted={onDeleted} />
    </div>
  );
}
