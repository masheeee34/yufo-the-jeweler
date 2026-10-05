'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ShieldAlert } from 'lucide-react';
import { LoaderOne } from '../../../components/LoaderOne';

// Lien de confirmation reçu par e-mail.
export default function VerifyEmailPage() {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [claimed, setClaimed] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const token = new URLSearchParams(window.location.search).get('token');
    // Le jeton est retiré de la barre d'adresse (historique, captures d'écran).
    window.history.replaceState(null, '', '/account/verify');
    fetch('/api/auth/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMessage(data.error || 'This link is invalid or has expired.');
          setState('error');
          return;
        }
        setSignedIn(!!data.signedIn);
        setClaimed(Number(data.claimed) || 0);
        setState('ok');
      })
      .catch(() => {
        setMessage('Network error. Please try again.');
        setState('error');
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-8 text-center space-y-5">
        {state === 'loading' && (
          <div className="py-8 space-y-4">
            <LoaderOne className="mx-auto" />
            <p className="text-sm text-zinc-300">Confirming your email…</p>
          </div>
        )}
        {state === 'ok' && (
          <>
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight">Email confirmed</h1>
              <p className="text-sm text-zinc-400">
                {claimed > 0 ? `${claimed} past purchase${claimed > 1 ? 's were' : ' was'} added to your library. ` : ''}
                {signedIn ? 'One last step: choose your username.' : 'Sign in to finish setting up your account.'}
              </p>
            </div>
            <Link href="/account" className="inline-flex w-full h-11 items-center justify-center rounded-full bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200">
              {signedIn ? 'Continue' : 'Sign in'}
            </Link>
          </>
        )}
        {state === 'error' && (
          <>
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight">Link not valid</h1>
              <p className="text-sm text-zinc-400">{message}</p>
            </div>
            <Link href="/account" className="inline-flex w-full h-11 items-center justify-center rounded-full bg-zinc-900 border border-white/10 text-sm font-medium hover:bg-zinc-800">
              Go to my account
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
