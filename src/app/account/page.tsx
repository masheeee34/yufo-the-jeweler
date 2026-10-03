'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../lib/authContext';
import { CartProvider } from '../../lib/cartContext';
import { AuthProvider } from '../../lib/authContext';
import { AlexMossHeader } from '../../components/AlexMossHeader';
import { AlexMossChat } from '../../components/AlexMossChat';
import { UserAvatar } from '../../components/UserMenu';
import { LoaderOne } from '../../components/LoaderOne';
import { OrderTracker, trackerLabel } from '../../components/OrderTracker';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Check,
  ArrowRight,
  ShieldCheck,
  Clock,
  Package,
  Settings,
  MessageSquare,
} from 'lucide-react';

// Fichiers achetés ou livrés : téléchargement de la dernière version.
function MyFiles() {
  const [files, setFiles] = useState<{ id: string; name: string; description?: string; version: number; fileName: string; size: number; updatedAt: string }[] | null>(null);
  useEffect(() => {
    fetch('/api/files')
      .then((r) => r.json())
      .then((d) => setFiles(d.files || []))
      .catch(() => setFiles([]));
  }, []);
  const size = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
  if (files === null) return <div className="py-16 flex justify-center"><LoaderOne /></div>;
  if (files.length === 0) {
    return (
      <div className="p-10 bg-zinc-950 border border-white/10 rounded-2xl text-center">
        <p className="text-sm text-zinc-200 font-semibold">No files yet</p>
        <p className="text-xs text-zinc-500 mt-1">Your .ydd / .ytd files appear here as soon as your order is confirmed.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {files.map((f) => (
        <div key={f.id} className="p-5 bg-zinc-950 border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{f.name}</p>
            <p className="text-xs text-zinc-500 mt-0.5 truncate">{f.fileName} · {size(f.size)} · v{f.version} · updated {new Date(f.updatedAt).toLocaleDateString()}</p>
            {f.description && <p className="text-xs text-zinc-400 mt-1">{f.description}</p>}
          </div>
          <a href={`/api/files/${f.id}`} className="shrink-0 h-10 px-5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold flex items-center gap-2 transition-colors">
            Download
          </a>
        </div>
      ))}
    </div>
  );
}

function AccountPageContent() {
  const { user, login, register, logout, updateProfile, inquiries, refreshInquiries } = useAuth();

  // Tab when logged in: 'overview' | 'commissions' | 'settings'
  const [activeTab, setActiveTab] = useState<'overview' | 'commissions' | 'files' | 'settings'>('overview');

  // Ouvre directement l'onglet demandé depuis le menu du compte (/account?tab=settings)
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab === 'commissions' || tab === 'settings' || tab === 'overview' || tab === 'files') setActiveTab(tab);
  }, []);

  // Auth form state when logged out
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [fivemId, setFivemId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Settings form state
  const [editPseudo, setEditPseudo] = useState('');
  const [editDiscord, setEditDiscord] = useState('');
  const [editFivem, setEditFivem] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(identifier, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Invalid email or password.');
    } else {
      setIdentifier('');
      setPassword('');
      setErrorMsg('');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await register(pseudo, email, password, discordTag, fivemId);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to create account.');
    } else {
      setPseudo('');
      setEmail('');
      setPassword('');
      setDiscordTag('');
      setFivemId('');
      setErrorMsg('');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const res = await updateProfile({
      pseudo: editPseudo || undefined,
      discordTag: editDiscord || undefined,
      fivemId: editFivem || undefined,
    });
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 2500);
    } else {
      setErrorMsg(res.error || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between selection:bg-white selection:text-black font-sans">
      {/* Top Header Navigation */}
      <AlexMossHeader activeRoute="home" />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-5 sm:px-10 lg:px-14 py-12 lg:py-16">
        
        {/* Breadcrumb */}
        <nav className="mb-6 text-[11px] uppercase tracking-[0.08em] text-[#888888]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Member Account</span>
        </nav>

        {user ? (
          /* ========================================================= */
          /* LOGGED IN: FULL NIKE-STYLE MEMBER DASHBOARD               */
          /* ========================================================= */
          <div className="space-y-10 max-w-5xl">
            
            {/* Profile Hero Header */}
            <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <UserAvatar user={user} size={64} className="border border-white/10" />
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                      {user.pseudo}
                    </h1>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 font-medium">
                      {user.vipTier || 'Atelier Member'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">
                    {user.email && !user.email.endsWith('@discord.user') ? user.email : user.discordTag ? `@${user.discordTag}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="self-start sm:self-center flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-zinc-300 hover:text-white hover:border-white/30 text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>

            {/* Segmented Navigation */}
            <div className="flex p-1.5 bg-zinc-950 border border-white/10 rounded-2xl max-w-lg">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => {
                  setActiveTab('commissions');
                  setErrorMsg('');
                  refreshInquiries();
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'commissions'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Commissions</span>
                {inquiries.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-zinc-950 text-[10px] font-bold flex items-center justify-center">
                    {inquiries.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('files');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'files'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                My files
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setErrorMsg('');
                  setEditPseudo(user.pseudo || '');
                  setEditDiscord(user.discordTag || '');
                  setEditFivem(user.fivemId || '');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Settings
              </button>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center gap-2 max-w-md">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl">
                    <span className="text-xs text-zinc-400 block mb-2">
                      Active 3D commissions
                    </span>
                    <span className="text-3xl font-semibold text-white block">
                      {inquiries.length}
                    </span>
                    <span className="text-xs text-zinc-500 block mt-2">
                      72h Concierge channel
                    </span>
                  </div>

                  <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl">
                    <span className="text-xs text-zinc-400 block mb-2">
                      FiveM rigging license
                    </span>
                    <span className="text-3xl font-semibold text-emerald-400 flex items-center gap-2">
                      <ShieldCheck className="w-7 h-7" />
                      <span>Active</span>
                    </span>
                    <span className="text-xs text-zinc-500 block mt-2">
                      Universal freemode (.ydd / .ytd)
                    </span>
                  </div>

                  <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl">
                    <span className="text-xs text-zinc-400 block mb-2">
                      Linked Discord / FiveM
                    </span>
                    <span className="text-sm font-medium text-white block truncate">
                      {user.discordTag || user.fivemId || 'Not connected'}
                    </span>
                    <span className="text-xs text-zinc-500 block mt-2">
                      Priority dispatch line
                    </span>
                  </div>
                </div>

                {/* Quick Action Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        Commission a 1-of-1 Piece
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Sculpt high-density 3D CAD medallions, cuban chains, or iced timepieces weighted directly to FiveM skeletons.
                      </p>
                    </div>
                    <Link
                      href="/custom-orders"
                      className="inline-flex items-center justify-center gap-2 w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full transition-all"
                    >
                      <span>Start custom order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        Creations Archive
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Explore our curated master collection of pendants, chains, rings, and timepieces sculpted for GTA V freemode.
                      </p>
                    </div>
                    <Link
                      href="/collections/shop-all"
                      className="inline-flex items-center justify-center gap-2 w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-full border border-white/10 transition-colors"
                    >
                      <span>Browse creations</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COMMISSIONS */}
            {activeTab === 'commissions' && (
              <div className="space-y-4">
                {inquiries.length === 0 ? (
                  <div className="p-12 text-center bg-zinc-950 border border-white/10 rounded-2xl">
                    <Package className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                    <p className="text-sm text-zinc-200 font-semibold">No active commissions yet</p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                      Submit a bespoke inquiry to track its 72-hour progress, 3D renders, and FiveM asset delivery here.
                    </p>
                    <Link
                      href="/custom-orders"
                      className="inline-flex items-center gap-2 text-xs text-white hover:underline mt-6 font-medium"
                    >
                      <span>Start a custom inquiry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inquiries.map((inq) => {
                      const isPending = inq.status === 'pending';
                      return (
                        <div
                          key={inq.id}
                          className="p-6 bg-zinc-950 border border-white/10 rounded-2xl space-y-3 hover:border-white/20 transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-zinc-400 text-xs">
                              {inq.id}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                              {inq.project || inq.order || inq.id.startsWith('YUF-ORD') ? trackerLabel(inq) : isPending ? 'Waiting for our reply' : inq.status}
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-white">
                            {inq.subject}
                          </p>

                          {(inq.project || inq.order || inq.id.startsWith('YUF-ORD')) && (
                            <div className="pt-2">
                              <OrderTracker inquiry={inq} />
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                            <span>
                              Submitted {new Date(inq.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            <button
                              onClick={() => {
                                localStorage.setItem('yufo_active_request_id', inq.id);
                                window.location.href = '/custom-orders';
                              }}
                              className="text-xs text-white hover:underline flex items-center gap-1.5 cursor-pointer font-medium"
                            >
                              <span>Open custom desk</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB : MY FILES */}
            {activeTab === 'files' && <MyFiles />}

            {/* TAB 3: SETTINGS */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl space-y-6 max-w-xl">
                <div>
                  <label htmlFor="page-settings-pseudo" className="block text-xs font-medium text-zinc-300 mb-2">
                    Display name
                  </label>
                  <input
                    id="page-settings-pseudo"
                    type="text"
                    required
                    value={editPseudo}
                    onChange={(e) => setEditPseudo(e.target.value)}
                    className="w-full h-11 px-4 bg-zinc-900/60 border border-white/10 focus:border-white/30 rounded-xl text-sm text-white placeholder:text-zinc-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="page-settings-discord" className="block text-xs font-medium text-zinc-300 mb-2">
                    Discord handle
                  </label>
                  <input
                    id="page-settings-discord"
                    type="text"
                    value={editDiscord}
                    onChange={(e) => setEditDiscord(e.target.value)}
                    placeholder="e.g. collector#0001"
                    className="w-full h-11 px-4 bg-zinc-900/60 border border-white/10 focus:border-white/30 rounded-xl text-sm text-white placeholder:text-zinc-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="page-settings-fivem" className="block text-xs font-medium text-zinc-300 mb-2">
                    CFX / FiveM identifier
                  </label>
                  <input
                    id="page-settings-fivem"
                    type="text"
                    value={editFivem}
                    onChange={(e) => setEditFivem(e.target.value)}
                    placeholder="e.g. steam:110000100000000"
                    className="w-full h-11 px-4 bg-zinc-900/60 border border-white/10 focus:border-white/30 rounded-xl text-sm text-white placeholder:text-zinc-500 outline-none transition-colors"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-400">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Saving changes...' : 'Save changes'}</span>
                </button>
              </form>
            )}

          </div>
        ) : (
          /* ========================================================= */
          /* LOGGED OUT: CENTERED NIKE-STYLE AUTH CARD                 */
          /* ========================================================= */
          <div className="max-w-md mx-auto p-6 sm:p-10 bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] space-y-6">
            
            {/* Header */}
            <div className="text-left">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-black shrink-0 mb-4">
                <Image
                  src="/assets/brand/yufo_icon_black.png"
                  alt="YUFO Atelier"
                  fill
                  className="object-cover"
                />
              </div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">
                {authMode === 'signin' ? 'Sign in to your YUFO account' : 'Join the YUFO Atelier'}
              </h1>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                {authMode === 'signin'
                  ? 'Access your 1-of-1 bespoke commissions and FiveM digital assets.'
                  : 'Create an account to track custom 3D commissions and concierge lines.'}
              </p>
            </div>

            {/* Segmented Auth Switcher */}
            <div className="flex p-1.5 bg-zinc-900/60 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Create account
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {authMode === 'signin' ? (
              /* --- SIGN IN FORM --- */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="page-signin-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Email address or username
                  </label>
                  <input
                    id="page-signin-email"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@domain.com or handle"
                    className="w-full h-11 px-4 bg-zinc-900/60 border border-white/10 focus:border-white/30 rounded-xl text-xs text-white placeholder:text-zinc-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="page-signin-password" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="page-signin-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-11 px-4 pr-11 bg-zinc-900/60 border border-white/10 focus:border-white/30 rounded-xl text-xs text-white placeholder:text-zinc-500 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-zinc-900 border border-white/20 accent-white cursor-pointer"
                    />
                    <span className="text-zinc-400">Keep me signed in</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 mt-2"
                >
                  <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              /* --- CREATE ACCOUNT FORM --- */
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="page-reg-pseudo" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Display name
                  </label>
                  <input
                    id="page-reg-pseudo"
                    type="text"
                    required
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full h-11 px-4 bg-zinc-900/60 border border-white/10 focus:border-white/30 rounded-xl text-xs text-white placeholder:text-zinc-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="page-reg-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="page-reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full h-11 px-4 bg-zinc-900/60 border border-white/10 focus:border-white/30 rounded-xl text-xs text-white placeholder:text-zinc-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="page-reg-discord" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Discord or FiveM handle <span className="text-zinc-500 font-normal">(optional)</span>
                  </label>
                  <input
                    id="page-reg-discord"
                    type="text"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                    placeholder="e.g. collector#0001"
                    className="w-full h-11 px-4 bg-zinc-900/60 border border-white/10 focus:border-white/30 rounded-xl text-xs text-white placeholder:text-zinc-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="page-reg-password" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Password <span className="text-zinc-500 font-normal">(minimum 6 characters)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="page-reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full h-11 px-4 pr-11 bg-zinc-900/60 border border-white/10 focus:border-white/30 rounded-xl text-xs text-white placeholder:text-zinc-500 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 mt-2"
                >
                  <span>{loading ? 'Creating account...' : 'Create account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Terms notice */}
            <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
              By continuing, you agree to YUFO Atelier&apos;s <Link href="/legal#terms" className="underline hover:text-white">Terms of sale</Link> and <Link href="/legal#privacy" className="underline hover:text-white">Privacy policy</Link>.
            </p>

          </div>
        )}

      </main>

      {/* 72H Concierge Chat Widget */}
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
