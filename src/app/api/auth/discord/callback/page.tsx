'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, ArrowRight, ExternalLink, CheckCircle } from 'lucide-react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'not_in_guild' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [inviteUrl, setInviteUrl] = useState('https://discord.gg/yufothejeweler');

  useEffect(() => {
    async function processAuth() {
      try {
        // 1. Check hash for implicit grant: #access_token=...
        let accessToken: string | null = null;
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          accessToken = hashParams.get('access_token');
        }

        // 2. Check query for code grant: ?code=...
        const code = searchParams.get('code');

        if (!accessToken && !code) {
          setStatus('error');
          setErrorMessage('No authentication parameters returned by Discord.');
          return;
        }

        const res = await fetch('/api/auth/discord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken,
            code,
            redirectUri: window.location.origin + '/api/auth/discord/callback',
          }),
        });

        const data = await res.json();

        if (res.status === 403 && data.error === 'NOT_IN_GUILD') {
          setStatus('not_in_guild');
          if (data.inviteUrl) setInviteUrl(data.inviteUrl);
          return;
        }

        if (!res.ok || !data.success) {
          setStatus('error');
          setErrorMessage(data.error || 'Authentication failed.');
          return;
        }

        // Success!
        localStorage.setItem('yufo_collector_user', JSON.stringify(data.user));
        setStatus('success');

        // Redirect after brief delay
        setTimeout(() => {
          window.location.href = '/account';
        }, 1200);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Network error during Discord verification.');
      }
    }

    processAuth();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-6 selection:bg-white selection:text-black font-sans">
      <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-8 text-center shadow-[0_25px_80px_rgba(0,0,0,0.95)]">
        {status === 'loading' && (
          <div className="space-y-4 py-8">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-white">
              Authenticating with Yufo The Jeweler atelier...
            </p>
            <p className="text-xs text-zinc-400">
              Verifying Discord membership and permissions
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-8 animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Authentication successful
            </h1>
            <p className="text-xs text-zinc-400">
              Your Discord profile is certified. Redirecting to your atelier space...
            </p>
          </div>
        )}

        {status === 'not_in_guild' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-white tracking-tight">
                Discord membership required
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Access to custom allocations, 3D commissions, and private concierge is reserved for members of the official Yufo The Jeweler Discord community.
              </p>
            </div>

            <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Target server:</span>
                <span className="text-zinc-200 font-medium">Yufo The Jeweler</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Guild ID:</span>
                <span className="text-zinc-400 font-mono text-[11px]">1449069547876516106</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <a
                href={inviteUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span>Join Yufo The Jeweler Discord</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>I have joined, try again</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-white tracking-tight">
                Authentication failed
              </h1>
              <p className="text-xs text-rose-300/80 leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full h-11 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs rounded-full transition-colors"
              >
                Return to home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiscordCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
