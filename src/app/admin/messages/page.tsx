'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconArrowLeft, IconMail, IconPhotoPlus, IconSearch, IconSend } from '@tabler/icons-react';
import { useAdmin } from '@/components/admin/AdminContext';
import { Badge, Button, Card, Empty, Field, Input, Loading, NotesBox, PageHeader, Select, Tabs, Textarea, timeAgo, uploadImages } from '@/components/admin/ui';
import { TICKET, TICKET_TYPE } from '@/components/admin/labels';
import { MessageAttachments } from '@/components/MessageAttachments';

interface Msg { id: string; sender: 'client' | 'admin'; text: string; createdAt: string; attachments?: string[] }
interface Req {
  id: string;
  pseudo: string;
  subject: string;
  createdAt: string;
  status: 'pending' | 'answered' | 'closed';
  messages: Msg[];
  ticketType?: 'custom' | 'order' | 'general';
  linkedId?: string;
  internalNotes?: { id: string; by: string; at: string; text: string }[];
}

const typeOf = (r: Req) => r.ticketType || (r.id.startsWith('YUF-INQ') ? 'custom' : r.id.startsWith('YUF-ORD') ? 'order' : 'general');
const lastAt = (r: Req) => r.messages[r.messages.length - 1]?.createdAt || r.createdAt;

export default function MessagesPage() {
  const { api, toast, refresh } = useAdmin();
  const params = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<Req[] | null>(null);
  const [status, setStatus] = useState<'all' | 'pending' | 'answered' | 'closed'>('pending');
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const openId = params.get('id');

  const load = useCallback(async () => {
    const data = await api<{ requests: Req[] }>('/api/admin/requests');
    if (data) setItems(data.requests);
  }, [api]);
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  const list = useMemo(() => {
    if (!items) return [];
    const s = q.trim().toLowerCase();
    return items
      .filter((r) => status === 'all' || r.status === status)
      .filter((r) => !type || typeOf(r) === type)
      .filter((r) => !s || `${r.pseudo} ${r.subject} ${r.id}`.toLowerCase().includes(s))
      .sort((a, b) => lastAt(b).localeCompare(lastAt(a)));
  }, [items, status, type, q]);

  const open = items?.find((r) => r.id === openId) || null;
  const select = (id: string | null) => router.replace(id ? `/admin/messages?id=${id}` : '/admin/messages', { scroll: false });

  return (
    <>
      <PageHeader title="Messages" subtitle="Tickets et conversations clients, au même endroit." />
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 min-h-[60vh]">
        {/* Liste */}
        <Card className={`flex flex-col overflow-hidden ${open ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-3 space-y-2 border-b border-white/[0.06]">
            <Tabs value={status} onChange={setStatus} tabs={[
              { id: 'pending', label: 'Open', count: items?.filter((r) => r.status === 'pending').length },
              { id: 'answered', label: 'Waiting', count: items?.filter((r) => r.status === 'answered').length },
              { id: 'closed', label: 'Resolved' },
              { id: 'all', label: 'Tous' },
            ]} />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <IconSearch size={15} className="absolute left-3 top-3 text-zinc-500" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="pl-8 h-9" />
              </div>
              <Select value={type} onChange={(e) => setType(e.target.value)} className="h-9 w-auto text-[12px]">
                <option value="">Tous types</option>
                {Object.entries(TICKET_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!items ? <Loading /> : list.length === 0 ? <Empty icon={<IconMail size={20} />} title="Rien ici" /> : list.map((r) => {
              const last = r.messages[r.messages.length - 1];
              const unread = last?.sender === 'client' && r.status !== 'closed';
              return (
                <button key={r.id} onClick={() => select(r.id)} className={`adm-row w-full text-left px-4 py-3 border-b border-white/[0.04] ${r.id === openId ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'}`}>
                  <div className="flex items-center gap-2">
                    {unread && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />}
                    <span className="text-[13px] font-medium text-white truncate flex-1">{r.pseudo}</span>
                    <span className="text-[11px] text-zinc-500 shrink-0">{timeAgo(lastAt(r))}</span>
                  </div>
                  <p className="text-[12px] text-zinc-400 truncate mt-0.5">{r.subject}</p>
                  <div className="mt-1.5 flex gap-1.5">
                    <Badge>{TICKET_TYPE[typeOf(r)]}</Badge>
                    <Badge tone={TICKET[r.status]?.tone}>{TICKET[r.status]?.label}</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Conversation */}
        <Card className={`flex-col overflow-hidden ${open ? 'flex' : 'hidden lg:flex'}`}>
          {!open ? <div className="flex-1 flex items-center justify-center"><Empty icon={<IconMail size={20} />} title="Sélectionnez une conversation" /></div> : (
            <Thread key={open.id} r={open} all={items || []} onBack={() => select(null)} reload={async () => { await load(); refresh(); }} />
          )}
        </Card>
      </div>
    </>
  );
}

function Thread({ r, all, onBack, reload }: { r: Req; all: Req[]; onBack: () => void; reload: () => Promise<void> }) {
  const { api, toast } = useAdmin();
  const [text, setText] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const isProject = r.id.startsWith('YUF-INQ');
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }); }, [r.messages.length]);

  const patch = async (body: Record<string, unknown>, label: string) => {
    if (await api('/api/admin/requests', { method: 'PATCH', body: { requestId: r.id, ...body } })) { toast(label); await reload(); }
  };
  const send = async () => {
    setBusy(true);
    const ok = await api('/api/admin/requests', { method: 'POST', body: { requestId: r.id, replyText: text, attachments: files } });
    setBusy(false);
    if (ok) { setText(''); setFiles([]); toast('Message envoyé'); await reload(); }
  };

  return (
    <>
      <div className="px-4 sm:px-5 py-3 border-b border-white/[0.06] flex items-center gap-3">
        <button onClick={onBack} className="lg:hidden w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center" aria-label="Retour"><IconArrowLeft size={18} /></button>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-white truncate">{r.pseudo}</p>
          <p className="text-[11px] text-zinc-500 truncate">{r.id} · {r.subject}</p>
        </div>
        {isProject && <Link href={`/admin/projects?id=${r.id}`}><Button size="sm">Ouvrir le projet</Button></Link>}
      </div>

      <div className="px-4 sm:px-5 py-3 grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-white/[0.06]">
        <Field label="Statut">
          <Select value={r.status} onChange={(e) => patch({ status: e.target.value }, 'Statut mis à jour')} className="h-9">
            {Object.entries(TICKET).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </Field>
        <Field label="Type">
          <Select value={typeOf(r)} onChange={(e) => patch({ ticketType: e.target.value }, 'Type mis à jour')} className="h-9">
            {Object.entries(TICKET_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
        <Field label="Relié à">
          <Select value={r.linkedId || ''} onChange={(e) => patch({ linkedId: e.target.value }, 'Lien enregistré')} className="h-9">
            <option value="">— Aucun —</option>
            {all.filter((x) => x.id !== r.id && (x.id.startsWith('YUF-ORD') || x.id.startsWith('YUF-INQ'))).map((x) => <option key={x.id} value={x.id}>{x.id} · {x.pseudo}</option>)}
          </Select>
        </Field>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3 min-h-[260px] max-h-[55vh]">
        {r.messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender === 'admin' ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-zinc-500 mb-1 px-1">{m.sender === 'admin' ? 'YUFO' : r.pseudo} · {timeAgo(m.createdAt)}</span>
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${m.sender === 'admin' ? 'bg-white text-zinc-950' : 'bg-white/[0.06] border border-white/10 text-zinc-200'}`}>
              {m.text}
              <MessageAttachments names={m.attachments} />
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="px-4 sm:px-5 py-3 border-t border-white/[0.06] space-y-3">
        {files.length > 0 && <MessageAttachments names={files} />}
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={async (e) => { if (e.target.files?.length) { setBusy(true); const n = await uploadImages(e.target.files); setFiles((f) => [...f, ...n].slice(0, 6)); setBusy(false); } e.target.value = ''; }} />
          <Button onClick={() => fileRef.current?.click()} disabled={busy} aria-label="Joindre des images" icon={<IconPhotoPlus size={16} />} />
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder="Répondre…" className="min-h-[44px] h-11"
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && (text.trim() || files.length)) send(); }} />
          <Button variant="primary" disabled={busy || (!text.trim() && !files.length)} onClick={send} icon={<IconSend size={15} />}>Envoyer</Button>
        </div>
        <NotesBox notes={r.internalNotes || []} onAdd={async (t) => { if (await api('/api/admin/notes', { method: 'POST', body: { requestId: r.id, text: t } })) { toast('Note ajoutée'); await reload(); } }} />
      </div>
    </>
  );
}
