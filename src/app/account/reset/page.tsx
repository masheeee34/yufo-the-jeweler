'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

// Choix d'un nouveau mot de passe depuis le lien reçu par e-mail.
export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '');
    window.history.replaceState(null, '', '/account/reset');
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError('The two passwords are different.');
    setBusy(true);
    setError('');
    const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) setError(data.error || 'Please try again.');
    else setDone(true);
  };

  const input = 'w-full h-11 px-4 bg-zinc-900/60 border border-white/10 focus:border-white/30 rounded-xl text-sm text-white placeholder:text-zinc-500 outline-none';

  return (
    <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-8 space-y-5">
        {done ? (
          <div className="text-center space-y-5">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Password changed</h1>
            <p className="text-sm text-zinc-400">You are signed in. Every other device was signed out.</p>
            <Link href="/account" className="inline-flex w-full h-11 items-center justify-center rounded-full bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200">Go to my account</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <h1 className="text-xl font-semibold tracking-tight">Choose a new password</h1>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (8+ characters)" autoComplete="new-password" className={input} />
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm the new password" autoComplete="new-password" className={input} />
            {error && <p className="text-xs text-rose-300">{error}</p>}
            <button type="submit" disabled={busy || !token} className="w-full h-11 rounded-full bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 disabled:opacity-50">
              {busy ? 'Saving…' : 'Save my new password'}
            </button>
            {!token && <p className="text-xs text-zinc-500">This page must be opened from the link in your email.</p>}
          </form>
        )}
      </div>
    </div>
  );
}
