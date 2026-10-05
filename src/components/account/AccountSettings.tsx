'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IconBrandDiscord, IconDeviceDesktop, IconLogout } from '@tabler/icons-react';
import { useAuth } from '../../lib/authContext';
import { UserAvatar } from '../UserMenu';
import { inputClass } from './AuthForms';

const card = 'p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl space-y-5';
const smallBtn = 'h-10 px-5 rounded-full text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50';
const whiteBtn = `${smallBtn} bg-white hover:bg-zinc-200 text-zinc-950`;
const ghostBtn = `${smallBtn} bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white`;

function Msg({ ok, text }: { ok: boolean; text: string }) {
  return <p className={`text-xs ${ok ? 'text-emerald-300' : 'text-rose-300'}`}>{text}</p>;
}

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

// Profil : photo (facultative), nom affiché, @nom d'utilisateur, identifiant FiveM.
function ProfileCard() {
  const { user, setUser } = useAuth();
  const [pseudo, setPseudo] = useState(user?.pseudo || '');
  const [username, setUsername] = useState(user?.username || '');
  const [fivem, setFivem] = useState(user?.fivemId || '');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!user) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (username.trim().toLowerCase() !== user.username) {
      const r = await call('/api/auth/username', 'POST', { username });
      if (!r.ok) {
        setBusy(false);
        return setMsg({ ok: false, text: r.data.error || 'This username is not available.' });
      }
    }
    const r = await call('/api/auth/me', 'PATCH', { pseudo, fivemId: fivem });
    setBusy(false);
    if (r.ok) {
      setUser(r.data.user);
      setMsg({ ok: true, text: 'Profile saved.' });
    } else setMsg({ ok: false, text: r.data.error || 'Your profile could not be saved.' });
  };

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    setBusy(true);
    const res = await fetch('/api/auth/avatar', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) setUser(data.user);
    else setMsg({ ok: false, text: data.error || 'The photo could not be uploaded.' });
  };

  const removePhoto = async () => {
    const r = await call('/api/auth/avatar', 'DELETE');
    if (r.ok) setUser(r.data.user);
  };

  return (
    <form onSubmit={save} className={card}>
      <h2 className="text-base font-semibold text-white">Profile</h2>
      <div className="flex items-center gap-4">
        <UserAvatar user={{ ...user, pseudo: pseudo || user.pseudo }} size={64} className="border border-white/10" />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className={ghostBtn} disabled={busy}>
            {user.avatarUrl ? 'Change photo' : 'Add a photo'}
          </button>
          {user.avatarUrl && (
            <button type="button" onClick={removePhoto} className="h-10 px-4 text-xs text-zinc-400 hover:text-white">
              Remove
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </div>
      </div>
      <p className="text-xs text-zinc-500 -mt-2">Optional. Without a photo, the first letter of your name is shown.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="set-pseudo" className="block text-xs font-medium text-zinc-300 mb-1.5">Display name</label>
          <input id="set-pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} maxLength={40} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="set-username" className="block text-xs font-medium text-zinc-300 mb-1.5">Username</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
            <input id="set-username" value={username} onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))} maxLength={20} required className={`${inputClass} pl-8`} />
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="set-fivem" className="block text-xs font-medium text-zinc-300 mb-1.5">CFX / FiveM identifier <span className="text-zinc-500 font-normal">(optional)</span></label>
        <input id="set-fivem" value={fivem} onChange={(e) => setFivem(e.target.value)} placeholder="e.g. fivem:1234567" className={inputClass} />
      </div>
      {msg && <Msg {...msg} />}
      <button type="submit" disabled={busy} className={whiteBtn}>
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

// Moyens de connexion : e-mail + mot de passe, Discord (facultatif).
function SignInCard() {
  const { user, setUser, startDiscordAuth, mailReady } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  const realEmail = user.email && !user.email.endsWith('@discord.user');
  const hasEmailLogin = !!user.hasPassword && realEmail;

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await call('/api/auth/password', 'POST', { current, next });
    setBusy(false);
    if (r.ok) {
      setCurrent('');
      setNext('');
      setMsg({ ok: true, text: r.data.closed ? `Password changed. ${r.data.closed} other device(s) were signed out.` : 'Password changed.' });
    } else setMsg({ ok: false, text: r.data.error || 'The password could not be changed.' });
  };

  const addEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await call('/api/auth/add-email', 'POST', { email, password: pwd });
    setBusy(false);
    if (r.ok) {
      setUser(r.data.user);
      setMsg({ ok: true, text: 'Check your inbox to confirm this email.' });
    } else setMsg({ ok: false, text: r.data.error || 'Please try again.' });
  };

  const unlink = async () => {
    const r = await call('/api/auth/discord', 'DELETE');
    if (r.ok) setUser(r.data.user);
    else setMsg({ ok: false, text: r.data.error || 'Discord could not be removed.' });
  };

  return (
    <div className={card}>
      <h2 className="text-base font-semibold text-white">Sign-in methods</h2>

      <div className="rounded-xl border border-white/10 p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">Email and password</p>
            <p className="text-xs text-zinc-500 truncate">
              {hasEmailLogin ? `${user.email}${user.emailVerified ? ' · confirmed' : ' · waiting for confirmation'}` : 'Not set up'}
            </p>
          </div>
        </div>
        {hasEmailLogin ? (
          <form onSubmit={changePassword} className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" autoComplete="current-password" required className={inputClass} />
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password" autoComplete="new-password" required className={inputClass} />
            <button type="submit" disabled={busy} className={whiteBtn}>Change</button>
          </form>
        ) : mailReady ? (
          <form onSubmit={addEmail} className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required className={inputClass} />
            <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Password (8+ characters)" autoComplete="new-password" required className={inputClass} />
            <button type="submit" disabled={busy} className={whiteBtn}>Add</button>
          </form>
        ) : (
          <p className="text-xs text-zinc-500">Adding an email login will be available very soon.</p>
        )}
      </div>

      <div className="rounded-xl border border-white/10 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-full bg-[#5865F2]/15 text-[#aab1ff] flex items-center justify-center shrink-0">
            <IconBrandDiscord size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">Discord</p>
            <p className="text-xs text-zinc-500 truncate">{user.discordId ? `Linked · @${user.discordTag}` : 'Optional · not linked'}</p>
          </div>
        </div>
        {user.discordId ? (
          <button type="button" onClick={unlink} className={ghostBtn} disabled={!hasEmailLogin || !user.emailVerified} title={!hasEmailLogin ? 'Add a confirmed email first' : undefined}>
            Unlink
          </button>
        ) : (
          <button type="button" onClick={() => startDiscordAuth({ link: true })} className={ghostBtn}>
            Link Discord
          </button>
        )}
      </div>
      {msg && <Msg {...msg} />}
    </div>
  );
}

interface DeviceSession {
  id: string;
  device: string;
  ip: string;
  lastSeenAt: string;
  current: boolean;
}

// Appareils connectés et déconnexion partout (compte compromis).
function DevicesCard() {
  const { setUser } = useAuth();
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    const r = await call('/api/auth/sessions', 'GET');
    if (r.ok) setSessions(r.data.sessions || []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const signOutOne = async (id: string) => {
    await call('/api/auth/sessions', 'DELETE', { id });
    if (sessions.find((s) => s.id === id)?.current) {
      setUser(null);
      window.location.href = '/account';
    } else load();
  };

  const signOutAll = async () => {
    await call('/api/auth/logout-all', 'POST');
    setUser(null);
    window.location.href = '/account';
  };

  return (
    <div className={card}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">Devices</h2>
        {!confirming ? (
          <button type="button" onClick={() => setConfirming(true)} className={`${ghostBtn} inline-flex items-center gap-2`}>
            <IconLogout size={15} /> Sign out everywhere
          </button>
        ) : (
          <span className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 hidden sm:inline">Sign out of every device?</span>
            <button type="button" onClick={signOutAll} className={`${smallBtn} bg-rose-500 hover:bg-rose-400 text-white`}>Yes, sign out</button>
            <button type="button" onClick={() => setConfirming(false)} className="text-xs text-zinc-400 hover:text-white px-2">Cancel</button>
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-500 -mt-2">You stay signed in on your devices. If you think someone else used your account, sign out everywhere and change your password.</p>
      <ul className="divide-y divide-white/5">
        {sessions.map((s) => (
          <li key={s.id} className="py-3 flex items-center gap-3">
            <IconDeviceDesktop size={20} className="text-zinc-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white">
                {s.device} {s.current && <span className="ml-1 text-[11px] text-emerald-300">· this device</span>}
              </p>
              <p className="text-xs text-zinc-500">
                {s.ip ? `${s.ip} · ` : ''}active {new Date(s.lastSeenAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <button type="button" onClick={() => signOutOne(s.id)} className="text-xs text-zinc-400 hover:text-white">
              Sign out
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AccountSettings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <ProfileCard />
      <SignInCard />
      <DevicesCard />
    </div>
  );
}
