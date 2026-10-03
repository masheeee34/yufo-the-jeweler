'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { IconCloudUpload, IconDownload, IconFile, IconFileZip, IconPencil, IconRefresh, IconRestore, IconSearch, IconTrash } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Badge, Button, Card, Drawer, Empty, Field, fileSize, Input, Loading, PageHeader, Select, Tabs, Textarea, timeAgo, uploadDeliverable } from '@/components/admin/ui';
import { GrantList, GrantRow } from '@/components/admin/GrantList';

interface Version { v: number; originalName: string; size: number; sha256: string; uploadedAt: string; uploadedBy: string; note?: string }
interface FileRow {
  id: string; name: string; description?: string; versions: Version[]; createdAt: string; updatedAt: string; deletedAt?: string;
  products: { id: string; name: string }[]; activeGrants: number; downloads: number;
}
interface Upload { key: string; name: string; progress: number; error?: string }

const ACCEPT = '.ydd,.ytd,.yft,.ymt,.ybn,.zip,.rar,.7z,.png,.jpg,.jpeg,.webp';
const ext = (n: string) => (n.split('.').pop() || '').toUpperCase();

export default function FilesPage() {
  const { api, toast, confirm } = useAdmin();
  const [files, setFiles] = useState<FileRow[] | null>(null);
  const [view, setView] = useState<'active' | 'trash'>('active');
  const [q, setQ] = useState('');
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [drag, setDrag] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const d = await api<{ files: FileRow[] }>('/api/admin/files');
    if (d) setFiles(d.files);
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const send = async (list: FileList | File[], fileId?: string) => {
    for (const f of Array.from(list)) {
      const key = `${Date.now()}-${Math.random()}`;
      setUploads((u) => [...u, { key, name: f.name, progress: 0 }]);
      const res = await uploadDeliverable(f, { fileId }, (p) => setUploads((u) => u.map((x) => (x.key === key ? { ...x, progress: p } : x))));
      if (res.ok) {
        toast(fileId ? `Nouvelle version de « ${res.data.file.name} »` : `« ${f.name} » ajouté`);
        setUploads((u) => u.filter((x) => x.key !== key));
      } else {
        setUploads((u) => u.map((x) => (x.key === key ? { ...x, error: res.data.error || 'Échec' } : x)));
      }
      await load();
    }
  };

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (files || [])
      .filter((f) => (view === 'trash' ? !!f.deletedAt : !f.deletedAt))
      .filter((f) => !s || `${f.name} ${f.versions.map((v) => v.originalName).join(' ')} ${f.products.map((p) => p.name).join(' ')}`.toLowerCase().includes(s));
  }, [files, view, q]);

  const open = files?.find((f) => f.id === openId) || null;

  return (
    <>
      <PageHeader title="Files" subtitle="Les fichiers livrés aux clients (.ydd, .ytd, .zip…), versionnés et reliés aux créations." actions={<Button variant="primary" icon={<IconCloudUpload size={16} />} onClick={() => input.current?.click()}>Ajouter des fichiers</Button>} />
      <input ref={input} type="file" multiple accept={ACCEPT} hidden onChange={(e) => { if (e.target.files) send(e.target.files); e.target.value = ''; }} />

      {/* Zone de dépôt */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); send(e.dataTransfer.files); }}
        onClick={() => input.current?.click()}
        className={`mb-5 rounded-2xl border-2 border-dashed cursor-pointer px-6 py-7 text-center transition-all ${drag ? 'border-white/50 bg-white/[0.06] scale-[1.01]' : 'border-white/10 hover:border-white/25'}`}
      >
        <IconCloudUpload size={26} className="mx-auto text-zinc-400" />
        <p className="mt-2 text-[13px] text-zinc-300">Glissez vos fichiers ici, ou cliquez pour choisir</p>
        <p className="text-[11px] text-zinc-600 mt-1">.ydd .ytd .yft .ymt .ybn .zip .rar .7z et images · 100 Mo maximum par fichier</p>
      </div>

      {uploads.length > 0 && (
        <Card className="p-4 mb-5 space-y-3">
          {uploads.map((u) => (
            <div key={u.key}>
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="text-zinc-200 truncate">{u.name}</span>
                <span className={u.error ? 'text-rose-300' : 'text-zinc-500'}>{u.error || `${Math.round(u.progress * 100)} %`}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full transition-[width] duration-200 ${u.error ? 'bg-rose-500' : 'bg-white'}`} style={{ width: `${Math.round(u.progress * 100)}%` }} />
              </div>
              {u.error && <button onClick={() => setUploads((x) => x.filter((y) => y.key !== u.key))} className="text-[11px] text-zinc-500 hover:text-white mt-1">Fermer</button>}
            </div>
          ))}
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
        <Tabs value={view} onChange={setView} tabs={[
          { id: 'active', label: 'Fichiers', count: files?.filter((f) => !f.deletedAt).length },
          { id: 'trash', label: 'Corbeille', count: files?.filter((f) => f.deletedAt).length },
        ]} />
        <div className="relative sm:w-72">
          <IconSearch size={16} className="absolute left-3 top-3 text-zinc-500" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, création…" className="pl-9" />
        </div>
      </div>

      <Card className="overflow-hidden">
        {!files ? <Loading /> : list.length === 0 ? <Empty icon={<IconFile size={20} />} title={view === 'trash' ? 'La corbeille est vide' : 'Aucun fichier'} text={view === 'trash' ? undefined : 'Ajoutez les fichiers de vos créations pour les livrer automatiquement après achat.'} /> : (
          <div className="adm-stagger">
            {list.map((f) => {
              const cur = f.versions[f.versions.length - 1];
              return (
                <div key={f.id} className="adm-row flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.03]">
                  <span className="w-10 h-10 rounded-xl bg-white/[0.06] flex flex-col items-center justify-center text-zinc-400 shrink-0">
                    <IconFileZip size={17} />
                    <span className="text-[8px] font-bold mt-0.5">{ext(cur.originalName)}</span>
                  </span>
                  <button onClick={() => setOpenId(f.id)} className="min-w-0 flex-1 text-left">
                    <span className="block text-[14px] font-medium text-white truncate">{f.name}</span>
                    <span className="block text-[12px] text-zinc-500 truncate">v{cur.v} · {fileSize(cur.size)} · {timeAgo(f.updatedAt)}{f.products.length ? ` · ${f.products.map((p) => p.name).join(', ')}` : ' · non relié'}</span>
                  </button>
                  <span className="hidden md:flex gap-1.5">
                    <Badge tone={f.products.length ? 'blue' : 'neutral'}>{f.products.length} création{f.products.length > 1 ? 's' : ''}</Badge>
                    <Badge tone={f.activeGrants ? 'green' : 'neutral'}>{f.activeGrants} client{f.activeGrants > 1 ? 's' : ''}</Badge>
                  </span>
                  {view === 'trash' ? (
                    <Button size="sm" icon={<IconRestore size={14} />} onClick={async () => { if (await api('/api/admin/files', { method: 'PATCH', body: { id: f.id, restore: true } })) { toast('Fichier restauré'); load(); } }}>Restaurer</Button>
                  ) : (
                    <div className="flex">
                      <a href={`/api/admin/files/download?id=${f.id}`} className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08]" title="Télécharger" aria-label="Télécharger"><IconDownload size={16} /></a>
                      <ReplaceButton onPick={(file) => send([file], f.id)} />
                      <button onClick={async () => {
                        if (!(await confirm({ title: `Mettre « ${f.name} » à la corbeille ?`, message: f.activeGrants ? `${f.activeGrants} client(s) y ont accès : ils le gardent. Le fichier ne sera plus proposé.` : 'Restaurable depuis la corbeille.', danger: true, confirmLabel: 'Corbeille' }))) return;
                        if (await api(`/api/admin/files?id=${f.id}`, { method: 'DELETE' })) { toast('Fichier mis à la corbeille'); load(); }
                      }} className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10" title="Corbeille" aria-label="Corbeille"><IconTrash size={16} /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Drawer open={!!open} onClose={() => setOpenId(null)} width={680} title={open?.name || ''}>
        {open && <FileDetail f={open} onChanged={load} onReplace={(file) => send([file], open.id)} />}
      </Drawer>
    </>
  );
}

function ReplaceButton({ onPick }: { onPick: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={ref} type="file" accept={ACCEPT} hidden onChange={(e) => { if (e.target.files?.[0]) onPick(e.target.files[0]); e.target.value = ''; }} />
      <button onClick={() => ref.current?.click()} className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08]" title="Remplacer (nouvelle version)" aria-label="Remplacer"><IconRefresh size={16} /></button>
    </>
  );
}

function FileDetail({ f, onChanged, onReplace }: { f: FileRow; onChanged: () => Promise<void>; onReplace: (file: File) => void }) {
  const { api, toast, can } = useAdmin();
  const [name, setName] = useState(f.name);
  const [description, setDescription] = useState(f.description || '');
  const [grants, setGrants] = useState<GrantRow[] | null>(null);
  const [customers, setCustomers] = useState<{ id: string; pseudo: string }[]>([]);
  const [grantTo, setGrantTo] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const loadGrants = useCallback(async () => {
    const d = await api<{ grants: GrantRow[] }>(`/api/admin/files/grants?fileId=${f.id}`);
    if (d) setGrants(d.grants);
  }, [api, f.id]);
  useEffect(() => {
    loadGrants();
    if (can('customers')) api<{ customers: { id: string; pseudo: string }[] }>('/api/admin/customers', { silent: true }).then((d) => d && setCustomers(d.customers));
  }, [loadGrants, api, can]);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <Field label="Nom affiché au client"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Description (facultative)"><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <div className="flex justify-end">
          <Button size="sm" icon={<IconPencil size={14} />} disabled={name === f.name && description === (f.description || '')} onClick={async () => { if (await api('/api/admin/files', { method: 'PATCH', body: { id: f.id, name, description } })) { toast('Saved successfully'); onChanged(); } }}>Enregistrer</Button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[12px] uppercase tracking-wider text-zinc-500">Versions</h3>
          <input ref={ref} type="file" accept={ACCEPT} hidden onChange={(e) => { if (e.target.files?.[0]) onReplace(e.target.files[0]); e.target.value = ''; }} />
          <Button size="sm" icon={<IconRefresh size={14} />} onClick={() => ref.current?.click()}>Remplacer le fichier</Button>
        </div>
        <p className="text-[11px] text-zinc-600 mb-2">Remplacer crée une nouvelle version : les créations restent reliées et les clients téléchargent toujours la dernière.</p>
        <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.05]">
          {[...f.versions].reverse().map((v, i) => (
            <div key={v.v} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
              <Badge tone={i === 0 ? 'green' : 'neutral'}>v{v.v}</Badge>
              <span className="min-w-0 flex-1">
                <span className="block text-zinc-200 truncate">{v.originalName}</span>
                <span className="block text-[11px] text-zinc-500">{fileSize(v.size)} · {v.uploadedBy} · {timeAgo(v.uploadedAt)} · sha256 {v.sha256.slice(0, 10)}…</span>
              </span>
              <a href={`/api/admin/files/download?id=${f.id}&v=${v.v}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08]" aria-label="Télécharger cette version"><IconDownload size={15} /></a>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-[12px] uppercase tracking-wider text-zinc-500 mb-2">Créations qui utilisent ce fichier</h3>
        {f.products.length === 0 ? <p className="text-[12px] text-zinc-500">Aucune. Reliez-le depuis Creations › modifier une création.</p> : (
          <div className="flex flex-wrap gap-2">{f.products.map((p) => <Link key={p.id} href={`/admin/creations?id=${p.id}`}><Badge tone="blue">{p.name}</Badge></Link>)}</div>
        )}
      </section>

      <section>
        <h3 className="text-[12px] uppercase tracking-wider text-zinc-500 mb-2">Clients qui y ont accès</h3>
        {grants === null ? <Loading /> : <GrantList grants={grants} show="file" onChanged={async () => { await loadGrants(); await onChanged(); }} />}
        {can('customers') && (
          <div className="mt-3 flex gap-2">
            <Select value={grantTo} onChange={(e) => setGrantTo(e.target.value)}>
              <option value="">Donner l’accès à un client…</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.pseudo}</option>)}
            </Select>
            <Button variant="primary" disabled={!grantTo} onClick={async () => {
              const d = await api<{ changed: boolean }>('/api/admin/files/grants', { method: 'POST', body: { fileId: f.id, userId: grantTo } });
              if (d) { toast(d.changed ? 'Accès donné' : 'Ce client a déjà accès'); setGrantTo(''); await loadGrants(); await onChanged(); }
            }}>Donner</Button>
          </div>
        )}
      </section>
    </div>
  );
}
