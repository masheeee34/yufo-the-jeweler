'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { IconBrandDiscord } from '@tabler/icons-react';

export const inputClass =
  'w-full h-11 px-4 bg-zinc-900/60 border border-white/10 focus:border-white/30 rounded-xl text-sm text-white placeholder:text-zinc-500 outline-none transition-colors';
export const primaryBtn =
  'w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50';
export const secondaryBtn =
  'w-full h-11 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-sm rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50';

function Alert({ tone, children }: { tone: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const cls =
    tone === 'error'
      ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
      : tone === 'success'
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
        : 'bg-white/[0.04] border-white/10 text-zinc-300';
  return <div className={`p-3 border rounded-xl text-xs leading-relaxed ${cls}`}>{children}</div>;
}

function PasswordInput({ id, value, onChange, placeholder, autoComplete }: { id: string; value: string; onChange: (v: string) => void; placeholder: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={show ? 'text' : 'password'} required value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} className={`${inputClass} pr-11`} />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer" aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// Connexion, création de compte et mot de passe oublié. Discord reste proposé, mais facultatif.
export function AuthCard({ initialMode = 'signin' }: { initialMode?: 'signin' | 'signup' }) {
  const { login, register, startDiscordAuth, mailReady } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Achat invité → « Create an account » : l'adresse de la commande est déjà remplie.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('yufo_signup_email');
      if (saved) {
        setEmail(saved);
        setMode('signup');
      }
    } catch {}
  }, []);

  const switchMode = (m: typeof mode) => {
    setMode(m);
    setError('');
    setNotice('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    if (mode === 'signin') {
      const r = await login(identifier, password, remember);
      if (!r.success) setError(r.error || 'Invalid email or password.');
    } else if (mode === 'signup') {
      const r = await register(email, password, remember);
      if (!r.success) setError(r.error || 'Your account could not be created.');
      else {
        try {
          sessionStorage.removeItem('yufo_signup_email');
        } catch {}
      }
    } else {
      const res = await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || 'Please try again.');
      else setNotice('If an account exists with this email, a link to choose a new password is on its way.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 sm:p-10 bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] space-y-6">
      <div>
        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-black mb-4">
          <Image src="/assets/brand/yufo_icon_black.png" alt="YUFO" fill className="object-cover" />
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          {mode === 'signin' ? 'Sign in to your account' : mode === 'signup' ? 'Create your account' : 'Forgot your password?'}
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
          {mode === 'signin'
            ? 'Find your purchases, your library and your custom projects.'
            : mode === 'signup'
              ? 'Keep every purchase in your library and follow your custom projects.'
              : 'Enter your email and we will send you a link to choose a new one.'}
        </p>
      </div>

      {mode !== 'forgot' && (
        <div className="flex p-1.5 bg-zinc-900/60 rounded-xl border border-white/5">
          {(['signin', 'signup'] as const).map((m) => (
            <button key={m} type="button" onClick={() => switchMode(m)} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${mode === m ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}>
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>
      )}

      {error && <Alert tone="error">{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}
      {mode === 'signup' && !mailReady && (
        <Alert tone="info">Email sign-up opens very soon. Meanwhile you can continue with Discord, or buy as a guest without an account.</Alert>
      )}

      <form onSubmit={submit} className="space-y-4">
        {mode === 'signin' ? (
          <div>
            <label htmlFor="auth-identifier" className="block text-xs font-medium text-zinc-300 mb-1.5">Email or username</label>
            <input id="auth-identifier" type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="name@domain.com" autoComplete="username" className={inputClass} />
          </div>
        ) : (
          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-zinc-300 mb-1.5">Email address</label>
            <input id="auth-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" autoComplete="email" className={inputClass} />
          </div>
        )}

        {mode !== 'forgot' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="auth-password" className="block text-xs font-medium text-zinc-300">
                Password {mode === 'signup' && <span className="text-zinc-500 font-normal">(8 characters minimum)</span>}
              </label>
              {mode === 'signin' && (
                <button type="button" onClick={() => switchMode('forgot')} className="text-[11px] text-zinc-400 hover:text-white">
                  Forgot password?
                </button>
              )}
            </div>
            <PasswordInput id="auth-password" value={password} onChange={setPassword} placeholder={mode === 'signup' ? 'Create a password' : 'Your password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
          </div>
        )}

        {mode !== 'forgot' && (
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-3.5 h-3.5 accent-white cursor-pointer" />
            <span className="text-zinc-400">Keep me signed in on this device</span>
          </label>
        )}

        <button type="submit" disabled={loading || (mode === 'signup' && !mailReady)} className={primaryBtn}>
          <span>{loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send me a link'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {mode === 'forgot' ? (
        <button type="button" onClick={() => switchMode('signin')} className="w-full text-xs text-zinc-400 hover:text-white">
          Back to sign in
        </button>
      ) : (
        <>
          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
            <span className="h-px flex-1 bg-white/10" />
            or
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <button type="button" onClick={() => startDiscordAuth()} className={secondaryBtn}>
            <IconBrandDiscord size={17} />
            <span>Continue with Discord</span>
          </button>
          <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
            No account needed to buy: you can check out as a guest. By continuing you agree to our{' '}
            <Link href="/legal#terms" className="underline hover:text-white">Terms of sale</Link> and{' '}
            <Link href="/legal#privacy" className="underline hover:text-white">Privacy policy</Link>.
          </p>
        </>
      )}
    </div>
  );
}

// Étape 1 après l'inscription : confirmer l'adresse e-mail.
export function VerifyEmailStep() {
  const { user, logout, refreshUser } = useAuth();
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  // La page se met à jour toute seule si l'adresse est confirmée dans un autre onglet.
  useEffect(() => {
    const t = setInterval(refreshUser, 8000);
    return () => clearInterval(t);
  }, [refreshUser]);

  const resend = async () => {
    setState('sending');
    setError('');
    const res = await fetch('/api/auth/resend', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Please try again.');
      setState('idle');
    } else setState('sent');
  };

  return (
    <div className="max-w-md mx-auto p-6 sm:p-10 bg-zinc-950 border border-white/10 rounded-2xl space-y-5 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto">
        <Mail className="w-6 h-6 text-white" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Check your inbox</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          We sent a confirmation link to <span className="text-white font-medium break-all">{user?.email}</span>. Open it to activate your account.
        </p>
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      {state === 'sent' && <Alert tone="success">A new link is on its way. Check your spam folder too.</Alert>}
      <div className="space-y-2.5">
        <button type="button" onClick={resend} disabled={state === 'sending'} className={secondaryBtn}>
          {state === 'sending' ? 'Sending…' : 'Send the link again'}
        </button>
        <button type="button" onClick={logout} className="w-full text-xs text-zinc-500 hover:text-white">
          Wrong address? Sign out
        </button>
      </div>
    </div>
  );
}

// Étape 2 : choisir son @nom d'utilisateur (obligatoire, unique).
export function UsernameStep() {
  const { user, setUser } = useAuth();
  const [value, setValue] = useState('');
  const [check, setCheck] = useState<{ available: boolean; error?: string | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const base = (user?.pseudo || '').toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20);
    if (base.length >= 3) setValue(base);
  }, [user?.pseudo]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const v = value.trim().replace(/^@/, '').toLowerCase();
    if (v.length < 3) {
      setCheck(null);
      return;
    }
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/auth/username?u=${encodeURIComponent(v)}`);
      setCheck(await res.json().catch(() => null));
    }, 300);
  }, [value]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/auth/username', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: value }) });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) setError(data.error || 'Please choose another username.');
    else setUser(data.user);
  };

  return (
    <form onSubmit={save} className="max-w-md mx-auto p-6 sm:p-10 bg-zinc-950 border border-white/10 rounded-2xl space-y-5">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-300">
          <Check className="w-3.5 h-3.5" /> Email confirmed
        </span>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Choose your username</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">This is how you appear on YUFO, and how the atelier can add you to a project. You can change it later.</p>
      </div>
      <div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
          <input autoFocus value={value} onChange={(e) => setValue(e.target.value.replace(/\s/g, ''))} maxLength={20} placeholder="yourname" className={`${inputClass} pl-8`} aria-label="Username" />
        </div>
        <p className={`mt-2 text-xs ${check?.available ? 'text-emerald-300' : check ? 'text-rose-300' : 'text-zinc-500'}`}>
          {check ? (check.available ? 'Available' : check.error) : '3 to 20 characters: letters, numbers, dots and underscores.'}
        </p>
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      <button type="submit" disabled={saving || !check?.available} className={primaryBtn}>
        {saving ? 'Saving…' : 'Continue'}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}
