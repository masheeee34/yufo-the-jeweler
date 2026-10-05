'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { CartProvider } from '../../lib/cartContext';
import { AuthProvider } from '../../lib/authContext';
import { AlexMossHeader } from '../../components/AlexMossHeader';
import { AlexMossChat } from '../../components/AlexMossChat';
import { UserAvatar } from '../../components/UserMenu';
import { LoaderOne } from '../../components/LoaderOne';
import { AuthCard, UsernameStep, VerifyEmailStep } from '../../components/account/AuthForms';
import { AccountSettings } from '../../components/account/AccountSettings';
import { Library } from '../../components/account/Library';
import { TicketList } from '../../components/tickets/TicketList';

type Tab = 'overview' | 'requests' | 'library' | 'settings';
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'requests', label: 'Tickets' },
  { id: 'library', label: 'Library' },
  { id: 'settings', label: 'Settings' },
];
// Anciens liens du menu (?tab=commissions, ?tab=files).
const ALIASES: Record<string, Tab> = { commissions: 'requests', files: 'library' };

function AccountPageContent() {
  const { user, loading, active, logout, inquiries } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [signup, setSignup] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get('tab') || '';
    const wanted = (ALIASES[t] || t) as Tab;
    if (TABS.some((x) => x.id === wanted)) setTab(wanted);
    if (p.get('signup') === '1') setSignup(true);
  }, []);

  // Après connexion depuis une autre page (ex. demande sur mesure), retour à cette page.
  useEffect(() => {
    if (!user || !active) return;
    const next = new URLSearchParams(window.location.search).get('next');
    if (next && next.startsWith('/') && !next.startsWith('//')) window.location.href = next;
  }, [user, active]);

  const realEmail = !!user?.email && !user.email.endsWith('@discord.user');
  const orders = inquiries.filter((i) => i.id.startsWith('YUF-ORD')).length;

  let body: React.ReactNode;
  if (loading) body = <div className="py-24 flex justify-center"><LoaderOne /></div>;
  else if (!user) body = <AuthCard initialMode={signup ? 'signup' : 'signin'} />;
  else if (!user.emailVerified && !user.discordId) body = <VerifyEmailStep />;
  else if (!user.username) body = <UsernameStep />;
  else
    body = (
      <div className="space-y-8 max-w-5xl">
        <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <UserAvatar user={user} size={64} className="border border-white/10 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight truncate">{user.pseudo}</h1>
              <p className="text-sm text-zinc-400 mt-1 truncate">
                @{user.username}
                {realEmail ? ` · ${user.email}` : ''}
              </p>
            </div>
          </div>
          <button onClick={logout} className="self-start sm:self-center flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-zinc-300 hover:text-white hover:border-white/30 text-xs transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>

        <div className="flex p-1.5 bg-zinc-950 border border-white/10 rounded-2xl max-w-lg overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${tab === t.id ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={() => setTab('requests')} className="p-6 bg-zinc-950 border border-white/10 rounded-2xl text-left hover:border-white/20 transition-colors">
                <span className="text-xs text-zinc-400 block mb-2">Custom projects</span>
                <span className="text-sm font-medium text-white">Open your tickets</span>
              </button>
              <button onClick={() => setTab('library')} className="p-6 bg-zinc-950 border border-white/10 rounded-2xl text-left hover:border-white/20 transition-colors">
                <span className="text-xs text-zinc-400 block mb-2">Purchases</span>
                <span className="text-3xl font-semibold text-white">{orders}</span>
              </button>
              <button onClick={() => setTab('settings')} className="p-6 bg-zinc-950 border border-white/10 rounded-2xl text-left hover:border-white/20 transition-colors">
                <span className="text-xs text-zinc-400 block mb-2">Discord</span>
                <span className="text-sm font-medium text-white">{user.discordId ? `Linked · @${user.discordTag}` : 'Not linked (optional)'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">Commission a 1-of-1 piece</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Tell us your idea: a private ticket opens with the atelier to follow your project.</p>
                </div>
                <Link href="/custom-orders" className="inline-flex items-center justify-center gap-2 w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full transition-all">
                  Start a custom order <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">Ready-made creations</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Pendants, chains, rings and timepieces, ready to stream on your server.</p>
                </div>
                <Link href="/collections/shop-all" className="inline-flex items-center justify-center gap-2 w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-full border border-white/10 transition-colors">
                  Browse creations <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
        {tab === 'requests' && <TicketList compact />}
        {tab === 'library' && <Library />}
        {tab === 'settings' && <AccountSettings />}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col selection:bg-white selection:text-black font-sans">
      <AlexMossHeader activeRoute="home" />
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-5 sm:px-10 lg:px-14 py-12 lg:py-16">
        <nav className="mb-6 text-[11px] uppercase tracking-[0.08em] text-[#888888]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Account</span>
        </nav>
        {body}
      </main>
      <AlexMossChat />
    </div>
  );
}

export default function AccountPage() {
  return (
    <AuthProvider>
      <CartProvider>
        <AccountPageContent />
      </CartProvider>
    </AuthProvider>
  );
}
