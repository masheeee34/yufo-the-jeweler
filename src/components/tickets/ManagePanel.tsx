'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  IconArchive,
  IconArchiveOff,
  IconBell,
  IconBellOff,
  IconCheck,
  IconLock,
  IconLockOpen,
  IconMicrophoneOff,
  IconMicrophone,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
  IconTrash,
  IconUserMinus,
  IconUserOff,
  IconUserCheck,
  IconX,
} from '@tabler/icons-react';
import { PERMISSION_LABELS, PRIORITIES, TicketPermissions } from '../../lib/ticketDefaults';
import { ConfirmDialog, PersonAvatar, RoleBadge } from './TicketBits';
import type { Ticket, TMember, TRole } from './types';
import { ROLE_LABEL } from './types';

type Act = (action: string, extra?: Record<string, unknown>) => Promise<boolean>;

interface Confirm {
  title: string;
  text: string;
  label: string;
  run: () => void;
}

const sectionTitle = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 mb-3';
const btn = 'inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-medium text-white transition-colors disabled:opacity-40';

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="w-full flex items-center justify-between gap-3 py-2.5 text-left">
      <span className="text-sm text-white">{label}</span>
      <span className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-emerald-500' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
    </button>
  );
}

interface FoundUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string;
  discordId: string;
  avatar: string;
  isTeam: boolean;
}

// Ajout d'un membre : recherche par @nom d'utilisateur du site.
function AddMember({ act, existing }: { act: Act; existing: string[] }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<FoundUser[]>([]);
  const [picked, setPicked] = useState<FoundUser | null>(null);
  const [role, setRole] = useState<TRole>('member');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const v = q.trim().replace(/^@/, '');
    if (!v || picked) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/tickets/users?q=${encodeURIComponent(v)}`);
      const data = await res.json().catch(() => ({}));
      setResults(data.users || []);
    }, 200);
  }, [q, picked]);

  const add = async () => {
    const username = picked?.username || q.trim().replace(/^@/, '');
    if (!username) return;
    if (await act('add_member', { username, role })) {
      setQ('');
      setPicked(null);
      setRole('member');
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
        <input
          value={picked ? picked.username : q}
          onChange={(e) => {
            setPicked(null);
            setQ(e.target.value.replace(/\s/g, ''));
          }}
          placeholder="username"
          aria-label="Search a member by username"
          className="w-full h-10 pl-7 pr-3 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-white/30"
        />
        {results.length > 0 && (
          <ul className="absolute z-10 left-0 right-0 top-[calc(100%+4px)] rounded-xl bg-[#1c1c1e] border border-white/10 shadow-xl overflow-hidden">
            {results.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  disabled={existing.includes(u.id)}
                  onClick={() => {
                    setPicked(u);
                    setResults([]);
                    if (u.isTeam) setRole('staff');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/[0.06] disabled:opacity-40"
                >
                  <PersonAvatar person={u} size={26} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-white truncate">{u.name}</span>
                    <span className="block text-[11px] text-zinc-500">@{u.username}{u.isTeam ? ' · YUFO team' : ''}{existing.includes(u.id) ? ' · already in' : ''}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex gap-2">
        <select value={role} onChange={(e) => setRole(e.target.value as TRole)} aria-label="Role" className="h-9 px-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white">
          <option value="member">Member</option>
          <option value="client">Client</option>
          <option value="staff" disabled={!!picked && !picked.isTeam}>Staff</option>
        </select>
        <button type="button" onClick={add} disabled={!(picked || q.trim())} className="flex-1 inline-flex items-center justify-center h-9 px-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition-colors disabled:opacity-40">
          Add member
        </button>
      </div>
      <p className="text-[11px] text-zinc-500">The client cannot invite people: they give you a @username and you add it here.</p>
    </div>
  );
}

function MemberRow({ m, act, ask }: { m: TMember; act: Act; ask: (c: Confirm) => void }) {
  const at = m.addedAt ? new Date(m.addedAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <li className={`py-3 ${m.revoked ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2.5">
        <PersonAvatar person={m} size={32} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm text-white truncate">{m.name}</span>
            <RoleBadge role={m.role} />
            {m.muted && <span className="text-[10px] text-amber-300">muted</span>}
            {m.revoked && <span className="text-[10px] text-rose-300">no access</span>}
          </div>
          <p className="text-[11px] text-zinc-500 truncate">
            @{m.username || '—'}{m.addedBy ? ` · added by ${m.addedBy}` : ''}{at ? ` · ${at}` : ''}
          </p>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 pl-[42px]">
        <select value={m.role} onChange={(e) => act('set_role', { userId: m.userId, role: e.target.value })} aria-label={`Role of ${m.name}`} className="h-8 px-2 rounded-lg bg-zinc-900 border border-white/10 text-[11px] text-white">
          {(['client', 'member', 'staff'] as TRole[]).map((r) => (
            <option key={r} value={r} disabled={r === 'staff' && !m.isTeam}>{ROLE_LABEL[r]}</option>
          ))}
        </select>
        <button type="button" title={m.notify === false ? 'Turn notifications on' : 'Turn notifications off'} aria-label="Notifications" onClick={() => act('set_notify', { userId: m.userId, notify: m.notify === false })} className="h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white">
          {m.notify === false ? <IconBellOff size={15} /> : <IconBell size={15} />}
        </button>
        <button type="button" title={m.muted ? 'Unmute' : 'Mute'} aria-label={m.muted ? 'Unmute' : 'Mute'} onClick={() => act(m.muted ? 'unmute' : 'mute', { userId: m.userId })} className="h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white">
          {m.muted ? <IconMicrophone size={15} /> : <IconMicrophoneOff size={15} />}
        </button>
        {m.revoked ? (
          <button type="button" onClick={() => act('restore_access', { userId: m.userId })} className="h-8 px-2.5 rounded-lg border border-white/10 text-[11px] text-zinc-300 hover:text-white inline-flex items-center gap-1">
            <IconUserCheck size={14} /> Give access back
          </button>
        ) : (
          <button
            type="button"
            onClick={() => ask({ title: `Revoke access of ${m.name}?`, text: 'They will no longer see this ticket. Their messages stay in the conversation.', label: 'Revoke access', run: () => act('revoke_access', { userId: m.userId }) })}
            className="h-8 px-2.5 rounded-lg border border-white/10 text-[11px] text-zinc-300 hover:text-white inline-flex items-center gap-1"
          >
            <IconUserOff size={14} /> Revoke access
          </button>
        )}
        <button
          type="button"
          onClick={() => ask({ title: `Remove ${m.name} from the ticket?`, text: 'They are removed from the members list and lose access.', label: 'Remove member', run: () => act('remove_member', { userId: m.userId }) })}
          className="h-8 px-2.5 rounded-lg border border-rose-500/30 text-[11px] text-rose-300 hover:bg-rose-500/10 inline-flex items-center gap-1"
        >
          <IconUserMinus size={14} /> Remove
        </button>
      </div>
    </li>
  );
}

// Le « cockpit » de l'équipe, directement dans le ticket.
export function ManagePanel({ ticket, act, onClose }: { ticket: Ticket; act: Act; onClose: () => void }) {
  const [title, setTitle] = useState(ticket.title);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  useEffect(() => setTitle(ticket.title), [ticket.title]);

  const setPerm = (key: keyof TicketPermissions, value: boolean) => act('set_perm', { key, value });

  return (
    <div className="fixed inset-0 z-[70] flex justify-end" role="dialog" aria-modal="true" aria-label="Manage ticket">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="relative w-full max-w-md h-full overflow-y-auto overscroll-contain bg-[#0e0e10] border-l border-white/10 shadow-2xl" data-lenis-prevent>
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0e0e10]/95 backdrop-blur border-b border-white/10">
          <p className="text-base font-semibold text-white">Manage</p>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400" aria-label="Close">
            <IconX size={18} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <p className={sectionTitle}>Ticket</p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} aria-label="Ticket name" className="flex-1 h-10 px-3 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white outline-none focus:border-white/30" />
                <button type="button" disabled={!title.trim() || title === ticket.title} onClick={() => act('rename', { title })} className={btn}>
                  <IconCheck size={15} /> Rename
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] text-zinc-500 space-y-1">
                  <span>Status</span>
                  <select value={ticket.status.id} onChange={(e) => act('set_status', { statusId: e.target.value })} className="w-full h-10 px-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white">
                    {(ticket.statuses || []).map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[11px] text-zinc-500 space-y-1">
                  <span>Priority</span>
                  <select value={ticket.priority} onChange={(e) => act('set_priority', { priority: e.target.value })} className="w-full h-10 px-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white">
                    {PRIORITIES.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section>
            <p className={sectionTitle}>Controls</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => act(ticket.locked ? 'unlock' : 'lock')} className={btn}>
                {ticket.locked ? <><IconLockOpen size={15} /> Unlock</> : <><IconLock size={15} /> Lock</>}
              </button>
              <button type="button" onClick={() => act(ticket.paused ? 'resume' : 'pause')} className={btn}>
                {ticket.paused ? <><IconPlayerPlay size={15} /> Resume</> : <><IconPlayerPause size={15} /> Pause</>}
              </button>
              {ticket.closed ? (
                <button type="button" onClick={() => act('reopen')} className={btn}>
                  <IconRefresh size={15} /> Reopen
                </button>
              ) : (
                <button type="button" onClick={() => setConfirm({ title: 'Close this ticket?', text: 'The project is marked as finished and the client can no longer reply. You can reopen it later.', label: 'Close ticket', run: () => act('close') })} className={btn}>
                  <IconCheck size={15} /> Close
                </button>
              )}
              <button type="button" onClick={() => act(ticket.archived ? 'unarchive' : 'archive')} className={btn}>
                {ticket.archived ? <><IconArchiveOff size={15} /> Unarchive</> : <><IconArchive size={15} /> Archive</>}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed">Lock: clients still see the ticket but cannot reply. Close: project finished. Archive: kept, but out of active tickets.</p>
          </section>

          <section>
            <p className={sectionTitle}>Permissions</p>
            <div className="divide-y divide-white/5">
              {(Object.keys(PERMISSION_LABELS) as (keyof TicketPermissions)[]).map((k) => (
                <Switch key={k} checked={ticket.perms[k]} onChange={(v) => setPerm(k, v)} label={PERMISSION_LABELS[k]} />
              ))}
            </div>
          </section>

          <section>
            <p className={sectionTitle}>Members ({ticket.members.filter((m) => !m.revoked).length})</p>
            <AddMember act={act} existing={ticket.members.filter((m) => !m.revoked).map((m) => m.userId)} />
            <ul className="mt-3 divide-y divide-white/5">
              {ticket.members.map((m) => (
                <MemberRow key={m.userId} m={m} act={act} ask={setConfirm} />
              ))}
            </ul>
          </section>

          {ticket.events && ticket.events.length > 0 && (
            <section>
              <p className={sectionTitle}>Activity</p>
              <ul className="space-y-2">
                {ticket.events.slice(0, 25).map((e) => (
                  <li key={e.id} className="text-xs text-zinc-400">
                    <span className="text-zinc-200">{e.by}</span> · {e.text}
                    <span className="block text-[10px] text-zinc-600">{new Date(e.at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {ticket.viewer.canDelete && (
            <section>
              <p className={sectionTitle}>Danger zone</p>
              <button
                type="button"
                onClick={() => setConfirm({ title: 'Delete this ticket forever?', text: 'The conversation, images and files are erased for everyone. This cannot be undone.', label: 'Delete ticket', run: () => act('delete') })}
                className="w-full h-10 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-semibold inline-flex items-center justify-center gap-2"
              >
                <IconTrash size={15} /> Delete ticket
              </button>
            </section>
          )}
        </div>
      </aside>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title || ''}
        text={confirm?.text}
        confirmLabel={confirm?.label || 'Confirm'}
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.run();
          setConfirm(null);
        }}
      />
    </div>
  );
}
