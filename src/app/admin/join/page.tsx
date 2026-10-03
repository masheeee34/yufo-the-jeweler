'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { IconBrandDiscord } from '@tabler/icons-react';
import { LoaderOne } from '@/components/LoaderOne';
import { startDiscordLogin } from '@/components/admin/discordLogin';

// Rejoindre l'équipe avec un lien d'invitation.
export default function JoinPage() {
  const params = useSearchParams();
  const code = params.get('code') || '';
  const [state, setState] = useState<'idle' | 'busy' | 'signin' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!code) { setState('error'); setMessage('Lien d’invitation incomplet.'); return; }
    (async () => {
      setState('busy');
      const res = await fetch('/api/admin/invitations/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setState('done'); setTimeout(() => (window.location.href = '/admin'), 1200); }
      else if (res.status === 401) setState('signin');
      else { setState('error'); setMessage(data.error || 'Invitation invalide.'); }
    })();
  }, [code]);

  return (
    <main className="min-h-dvh bg-[#0c0c0d] flex items-center justify-center p-5 text-white font-sans">
      <div className="adm-pop w-full max-w-sm rounded-3xl bg-[#171717] border border-white/[0.07] p-8 text-center shadow-2xl">
        <span className="mx-auto w-12 h-12 rounded-xl bg-black border border-white/15 flex items-center justify-center">
          <Image src="/assets/brand/yufo_clean_white.png" alt="YUFO" width={30} height={32} className="object-contain" />
        </span>
        <h1 className="mt-5 text-[20px] font-semibold">Rejoindre YUFO Atelier</h1>
        {(state === 'idle' || state === 'busy') && <div className="mt-8 flex justify-center"><LoaderOne /></div>}
        {state === 'signin' && (
          <>
            <p className="mt-2 text-[13px] text-zinc-400">Connectez-vous avec Discord pour accepter l’invitation.</p>
            <button onClick={() => startDiscordLogin(`/admin/join?code=${encodeURIComponent(code)}`)} className="adm-press mt-7 w-full h-12 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-[14px] font-semibold flex items-center justify-center gap-2">
              <IconBrandDiscord size={20} /> Continuer avec Discord
            </button>
          </>
        )}
        {state === 'done' && <p className="mt-3 text-[14px] text-emerald-300">Bienvenue dans l’équipe ! Ouverture du back-office…</p>}
        {state === 'error' && (
          <>
            <p className="mt-3 text-[13px] text-rose-300">{message}</p>
            <a href="/admin" className="mt-6 inline-block text-[13px] text-zinc-400 hover:text-white">Aller au back-office</a>
          </>
        )}
      </div>
    </main>
  );
}
