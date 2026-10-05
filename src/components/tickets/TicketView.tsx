'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconDots,
  IconDownload,
  IconEyeOff,
  IconFile,
  IconLock,
  IconPaperclip,
  IconPhoto,
  IconPin,
  IconSend,
  IconSettings,
  IconX,
} from '@tabler/icons-react';
import { LoaderOne } from '../LoaderOne';
import { ConfirmDialog, Flag, PersonAvatar, RoleBadge, StatusPill, playSound } from './TicketBits';
import { ManagePanel } from './ManagePanel';
import type { Ticket, TMessage } from './types';
import { ago, fileSize, ROLE_LABEL } from './types';

type Tab = 'conversation' | 'project' | 'members';

interface Pending {
  key: string;
  kind: 'image' | 'file';
  name: string;
  status: 'uploading' | 'done' | 'error';
  ref?: string; // nom de l'image envoyée, ou identifiant du fichier
}

// Menu des actions de l'équipe sur un message.
function MessageMenu({ m, onAction }: { m: TMessage; onAction: (action: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  const item = 'w-full text-left px-3.5 py-2 text-[13px] text-white hover:bg-white/[0.07]';
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="w-7 h-7 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 flex items-center justify-center" aria-label="Message actions">
        <IconDots size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-44 py-1.5 rounded-xl bg-[#1c1c1e] border border-white/10 shadow-xl">
          <button type="button" className={item} onClick={() => { setOpen(false); onAction(m.pinned ? 'unpin' : 'pin'); }}>{m.pinned ? 'Unpin' : 'Pin'}</button>
          <button type="button" className={item} onClick={() => { setOpen(false); onAction(m.hidden ? 'unhide' : 'hide'); }}>{m.hidden ? 'Show to client' : 'Hide from client'}</button>
          {m.mine && m.role === 'staff' && (
            <button type="button" className={item} onClick={() => { setOpen(false); onAction('edit'); }}>Edit</button>
          )}
          <button type="button" className={`${item} text-rose-300`} onClick={() => { setOpen(false); onAction('delete'); }}>Delete</button>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ m, t, staff, onAction, editing, onSaveEdit, onCancelEdit }: {
  m: TMessage;
  t: Ticket;
  staff: boolean;
  onAction: (m: TMessage, action: string) => void;
  editing: boolean;
  onSaveEdit: (text: string) => void;
  onCancelEdit: () => void;
}) {
  const [draft, setDraft] = useState(m.text);
  useEffect(() => setDraft(m.text), [m.text, editing]);
  if (m.deleted) {
    return <p className="text-xs italic text-zinc-600 py-2 pl-12">Message deleted</p>;
  }
  return (
    <div id={`msg-${m.id}`} className={`group flex gap-3 py-3 ${m.hidden ? 'opacity-60' : ''}`}>
      <PersonAvatar person={m.author} size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-white">{m.author.name}</span>
          <RoleBadge role={m.role} />
          <span className="text-[11px] text-zinc-500">{ago(m.createdAt)}</span>
          {m.editedAt && <span className="text-[11px] text-zinc-600">(edited)</span>}
          {m.pinned && <IconPin size={13} className="text-amber-300" aria-label="Pinned" />}
          {m.hidden && <span className="inline-flex items-center gap-1 text-[11px] text-amber-300"><IconEyeOff size={13} /> hidden from client</span>}
          {staff && <span className="ml-auto opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"><MessageMenu m={m} onAction={(a) => onAction(m, a)} /></span>}
        </div>
        {editing ? (
          <div className="mt-2 space-y-2">
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} className="w-full rounded-xl bg-zinc-900 border border-white/15 p-3 text-sm text-white outline-none focus:border-white/30" />
            <div className="flex gap-2">
              <button type="button" onClick={() => onSaveEdit(draft)} className="h-8 px-4 rounded-full bg-white text-zinc-950 text-xs font-semibold">Save</button>
              <button type="button" onClick={onCancelEdit} className="h-8 px-3 text-xs text-zinc-400 hover:text-white">Cancel</button>
            </div>
          </div>
        ) : (
          m.text && <p className="mt-1 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap break-words">{m.text}</p>
        )}
        {m.images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {m.images.map((src) => (
              <a key={src} href={src} target="_blank" rel="noreferrer" className="block w-32 h-32 rounded-xl overflow-hidden border border-white/10 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Attached" className="w-full h-full object-cover" loading="lazy" />
              </a>
            ))}
          </div>
        )}
        {m.files.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {m.files.map((f) => (
              <div key={f.id} className="flex items-center gap-3 max-w-sm p-2.5 rounded-xl border border-white/10 bg-white/[0.03]">
                <IconFile size={18} className="text-zinc-400 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-white truncate">{f.name}</span>
                  <span className="block text-[11px] text-zinc-500">{fileSize(f.size)}</span>
                </span>
                {t.viewer.canDownload ? (
                  <a href={`/api/tickets/${t.id}/files/${f.id}`} className="w-8 h-8 rounded-lg bg-white text-zinc-950 flex items-center justify-center shrink-0" aria-label={`Download ${f.name}`}>
                    <IconDownload size={15} />
                  </a>
                ) : (
                  <span className="text-[10px] text-zinc-500 shrink-0">Downloads off</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Zone d'écriture : texte, images et fichiers selon les permissions du ticket.
function Composer({ t, onSent }: { t: Ticket; onSent: (ticket: Ticket) => void }) {
  const [text, setText] = useState('');
  const [pending, setPending] = useState<Pending[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const imageRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!t.viewer.canPost) {
    return (
      <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center gap-2 text-sm text-zinc-400">
        <IconLock size={16} className="shrink-0" />
        {t.viewer.postBlock || 'You cannot reply in this ticket.'}
      </div>
    );
  }

  const upload = async (file: File, kind: 'image' | 'file') => {
    const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setPending((p) => [...p, { key, kind, name: file.name, status: 'uploading' }]);
    const fd = new FormData();
    fd.append('file', file, file.name);
    const res = await fetch(kind === 'image' ? '/api/uploads' : `/api/tickets/${t.id}/files`, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Upload failed.');
      setPending((p) => p.map((x) => (x.key === key ? { ...x, status: 'error' } : x)));
      return;
    }
    setPending((p) => p.map((x) => (x.key === key ? { ...x, status: 'done', ref: kind === 'image' ? data.name : data.file.id } : x)));
  };

  const send = async () => {
    const done = pending.filter((p) => p.status === 'done');
    if (!text.trim() && !done.length) return;
    setBusy(true);
    setError('');
    const res = await fetch(`/api/tickets/${t.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        images: done.filter((p) => p.kind === 'image').map((p) => p.ref),
        files: done.filter((p) => p.kind === 'file').map((p) => p.ref),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || 'Your message could not be sent.');
    setText('');
    setPending([]);
    onSent(data.ticket);
  };

  const uploading = pending.some((p) => p.status === 'uploading');

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 focus-within:border-white/25 transition-colors">
      {pending.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 pt-3">
          {pending.map((p) => (
            <span key={p.key} className={`inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-lg text-[11px] ${p.status === 'error' ? 'bg-rose-500/10 text-rose-300' : 'bg-white/[0.06] text-zinc-200'}`}>
              {p.kind === 'image' ? <IconPhoto size={13} /> : <IconFile size={13} />}
              <span className="max-w-[140px] truncate">{p.name}</span>
              {p.status === 'uploading' && <span className="text-zinc-500">…</span>}
              <button type="button" onClick={() => setPending((x) => x.filter((y) => y.key !== p.key))} className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center" aria-label={`Remove ${p.name}`}>
                <IconX size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send();
        }}
        rows={3}
        maxLength={4000}
        placeholder="Write a message…"
        aria-label="Message"
        className="w-full bg-transparent px-4 pt-3 pb-1 text-sm text-white placeholder:text-zinc-500 outline-none resize-none"
      />
      <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5">
        <div className="flex items-center gap-1">
          {t.viewer.canImages && (
            <>
              <button type="button" onClick={() => imageRef.current?.click()} className="w-9 h-9 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center" aria-label="Add an image" title="Add an image">
                <IconPhoto size={18} />
              </button>
              <input ref={imageRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple className="hidden" onChange={(e) => { Array.from(e.target.files || []).slice(0, 6).forEach((f) => upload(f, 'image')); e.target.value = ''; }} />
            </>
          )}
          {t.viewer.canFiles && (
            <>
              <button type="button" onClick={() => fileRef.current?.click()} className="w-9 h-9 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center" aria-label="Add a file" title={`Add a file (${t.maxFileMb} MB max)`}>
                <IconPaperclip size={18} />
              </button>
              <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => { Array.from(e.target.files || []).slice(0, 6).forEach((f) => upload(f, 'file')); e.target.value = ''; }} />
            </>
          )}
          {error && <span className="text-xs text-rose-300 ml-1">{error}</span>}
        </div>
        <button type="button" onClick={send} disabled={busy || uploading || (!text.trim() && !pending.some((p) => p.status === 'done'))} className="h-9 px-4 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-40">
          <IconSend size={14} /> Send
        </button>
      </div>
    </div>
  );
}

function ProjectDetails({ t }: { t: Ticket }) {
  const p = t.project;
  const rows: [string, string | undefined][] = [
    ['Piece', p.piece],
    ['Worn by', p.wornBy],
    ['Budget', p.budget],
    ['Timing', p.duration],
    ['Price', typeof p.price === 'number' ? `$${p.price.toLocaleString()}` : undefined],
    ['Status', t.status.label],
  ];
  return (
    <div className="space-y-6">
      <dl className="grid sm:grid-cols-2 gap-3">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="p-4 rounded-2xl border border-white/10 bg-zinc-950">
            <dt className="text-[11px] text-zinc-500">{k}</dt>
            <dd className="mt-1 text-sm text-white">{v}</dd>
          </div>
        ))}
      </dl>
      {p.vision && (
        <div className="p-5 rounded-2xl border border-white/10 bg-zinc-950">
          <p className="text-[11px] text-zinc-500 mb-2">Your idea</p>
          <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{p.vision}</p>
        </div>
      )}
      {p.references.length > 0 && (
        <div>
          <p className="text-[11px] text-zinc-500 mb-2">Reference images</p>
          <div className="flex flex-wrap gap-2">
            {p.references.map((src) => (
              <a key={src} href={src} target="_blank" rel="noreferrer" className="block w-28 h-28 rounded-xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Reference" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}
      {p.previews.length > 0 && (
        <div>
          <p className="text-[11px] text-zinc-500 mb-2">3D previews</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {p.previews.map((x) => (
              <a key={x.url} href={x.url} target="_blank" rel="noreferrer" className="block aspect-square rounded-xl overflow-hidden border border-white/10 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={x.url} alt="Preview" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}
      {p.finalFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-zinc-500">Final files</p>
          {p.finalFiles.map((f) => (
            <a key={f.url} href={f.url} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/10 bg-zinc-950 text-sm text-white hover:border-white/25">
              {f.label}
              <IconDownload size={16} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function Members({ t }: { t: Ticket }) {
  const list = t.members.filter((m) => !m.revoked);
  return (
    <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-zinc-950 px-4">
      {list.length === 0 && <li className="py-6 text-center text-sm text-zinc-500">No members yet.</li>}
      {list.map((m) => (
        <li key={m.userId} className="py-3 flex items-center gap-3">
          <PersonAvatar person={m} size={36} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white truncate">{m.name}</p>
            <p className="text-[11px] text-zinc-500">@{m.username || '—'}</p>
          </div>
          <RoleBadge role={m.role} />
          {m.muted && <span className="text-[10px] text-amber-300">muted</span>}
        </li>
      ))}
      <li className="py-3 text-[11px] text-zinc-500">Want to add someone? Send their @username to the atelier in the conversation.</li>
    </ul>
  );
}

export function TicketView({ id }: { id: string }) {
  const [t, setT] = useState<Ticket | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<Tab>('conversation');
  const [manage, setManage] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TMessage | null>(null);
  const [toast, setToast] = useState('');
  const etagRef = useRef('');
  const seen = useRef<Set<string> | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const apply = useCallback((next: Ticket, fromPoll = false) => {
    // Son pour chaque nouveau message écrit par quelqu'un d'autre.
    if (fromPoll && seen.current) {
      const fresh = next.messages.filter((m) => !seen.current!.has(m.id) && !m.mine && !m.deleted);
      if (fresh.length) playSound(next.sound, next.soundVolume);
    }
    seen.current = new Set(next.messages.map((m) => m.id));
    etagRef.current = next.etag || '';
    setT(next);
  }, []);

  const load = useCallback(async (fromPoll = false) => {
    const res = await fetch(`/api/tickets/${id}${fromPoll && etagRef.current ? `?etag=${etagRef.current}` : ''}`, { cache: 'no-store' });
    if (res.status === 404 || res.status === 401) {
      setNotFound(true);
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (data.ticket) apply(data.ticket, fromPoll);
  }, [id, apply]);

  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load(true);
    }, 4000);
    return () => clearInterval(timer);
  }, [load]);

  // Défilement vers le dernier message : à l'arrivée d'un nouveau message, ou dès l'ouverture d'une longue conversation.
  const count = t?.messages.length || 0;
  const firstCount = useRef<number | null>(null);
  useEffect(() => {
    if (!count || tab !== 'conversation') return;
    if (firstCount.current === null) {
      firstCount.current = count;
      if (count > 8) bottom.current?.scrollIntoView({ block: 'end' });
      return;
    }
    bottom.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [count, tab]);

  const flash = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(''), 3500);
  };

  const act = async (action: string, extra: Record<string, unknown> = {}) => {
    const res = await fetch(`/api/tickets/${id}/manage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...extra }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      flash(data.error || 'This action failed.');
      return false;
    }
    if (data.deleted) {
      window.location.href = '/tickets';
      return true;
    }
    if (data.ticket) apply(data.ticket);
    return true;
  };

  const messageAction = async (m: TMessage, action: string, text?: string) => {
    if (action === 'edit' && text === undefined) return setEditing(m.id);
    if (action === 'delete' && !confirmDelete) return setConfirmDelete(m);
    const res = await fetch(`/api/tickets/${id}/messages/${m.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, text }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return flash(data.error || 'This action failed.');
    setEditing(null);
    if (data.ticket) apply(data.ticket);
  };

  if (notFound) {
    return (
      <div className="max-w-md mx-auto p-10 bg-zinc-950 border border-white/10 rounded-2xl text-center space-y-3">
        <p className="text-base font-semibold text-white">Ticket not available</p>
        <p className="text-sm text-zinc-400">This ticket does not exist, or you no longer have access to it.</p>
        <Link href="/tickets" className="inline-block text-sm text-white hover:underline">See my tickets</Link>
      </div>
    );
  }
  if (!t) return <div className="py-24 flex justify-center"><LoaderOne /></div>;

  const staff = t.viewer.canManage;
  const pinned = t.messages.filter((m) => m.pinned && !m.deleted);
  const memberCount = t.members.filter((m) => !m.revoked).length;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/tickets" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-5">
        <IconArrowLeft size={14} /> All tickets
      </Link>

      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusPill status={t.status} />
            {t.locked && <Flag><IconLock size={12} className="mr-1" /> Locked</Flag>}
            {t.paused && <Flag tone="amber">Paused</Flag>}
            {t.closed && <Flag>Closed</Flag>}
            {t.archived && <Flag>Archived</Flag>}
            {staff && t.priority !== 'normal' && <Flag tone={t.priority === 'urgent' ? 'rose' : t.priority === 'high' ? 'amber' : 'zinc'}>{t.priorityLabel} priority</Flag>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight break-words">{t.title}</h1>
          <p className="mt-1 text-xs text-zinc-500 font-mono">{t.id} · opened {new Date(t.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        {staff && (
          <button type="button" onClick={() => setManage(true)} className="self-start h-10 px-4 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-sm font-semibold inline-flex items-center gap-2 shrink-0">
            <IconSettings size={16} /> Manage
          </button>
        )}
      </header>

      <div className="flex gap-1 mt-4 mb-5 border-b border-white/10 overflow-x-auto" role="tablist">
        {([
          ['conversation', 'Conversation'],
          ['project', 'Project details'],
          ['members', `Members (${memberCount})`],
        ] as [Tab, string][]).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`px-3.5 py-2.5 -mb-px text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab === k ? 'border-white text-white' : 'border-transparent text-zinc-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'conversation' && (
        <div className="space-y-4">
          {pinned.length > 0 && (
            <div className="p-3.5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] space-y-1.5">
              {pinned.map((m) => (
                <button key={m.id} type="button" onClick={() => document.getElementById(`msg-${m.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="w-full flex items-start gap-2 text-left">
                  <IconPin size={14} className="text-amber-300 mt-0.5 shrink-0" />
                  <span className="text-xs text-zinc-300 line-clamp-2"><span className="text-white font-medium">{m.author.name}:</span> {m.text || 'Attachment'}</span>
                </button>
              ))}
            </div>
          )}
          <div className="divide-y divide-white/[0.04]">
            {t.messages.map((m) => (
              <MessageBubble
                key={m.id}
                m={m}
                t={t}
                staff={staff}
                editing={editing === m.id}
                onAction={(msg, a) => messageAction(msg, a)}
                onSaveEdit={(text) => messageAction(m, 'edit', text)}
                onCancelEdit={() => setEditing(null)}
              />
            ))}
          </div>
          <div ref={bottom} />
          <Composer t={t} onSent={(next) => apply(next)} />
          {staff && <p className="text-[11px] text-zinc-500">You are writing as the YUFO team ({ROLE_LABEL.staff}). Ctrl + Enter to send.</p>}
        </div>
      )}
      {tab === 'project' && <ProjectDetails t={t} />}
      {tab === 'members' && <Members t={t} />}

      {manage && <ManagePanel ticket={t} act={act} onClose={() => setManage(false)} />}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete this message?"
        text="It disappears for everyone. This cannot be undone."
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          const m = confirmDelete!;
          setConfirmDelete(null);
          fetch(`/api/tickets/${id}/messages/${m.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete' }) })
            .then((r) => r.json())
            .then((d) => d.ticket && apply(d.ticket));
        }}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] px-4 py-2.5 rounded-full bg-[#1c1c1e] border border-white/10 text-sm text-white shadow-xl" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
