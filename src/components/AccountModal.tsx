'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../lib/authContext';
import {
  User,
  LogOut,
  X,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Package,
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
  onOpenContact?: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onOpenContact,
}) => {
  const { user, startDiscordAuth, logout, updateProfile, inquiries, refreshInquiries } = useAuth();
  const [editFivem, setEditFivem] = useState(user?.fivemId || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveFivem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    await updateProfile({ fivemId: editFivem.trim() });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const avatarUrl = user?.discordId && user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=128`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md select-none font-sans">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-white/10 rounded-2xl p-6 sm:p-8 text-white max-h-[92vh] overflow-y-auto shadow-[0_25px_80px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close account view"
        >
          <X className="w-4 h-4" />
        </button>

        {!user ? (
          /* ============================================================ */
          /* 1. CONNEXION : E-MAIL OU DISCORD (FACULTATIF)                 */
          /* ============================================================ */
          <div className="space-y-6 pt-2 text-center">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-black mx-auto">
              <Image src="/assets/brand/yufo_icon_black.png" alt="YUFO" fill className="object-cover" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-medium block">
                Atelier Client Authentication
              </span>
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                Find your purchases, your library and your custom projects. Discord is optional.
              </p>
            </div>

            {/* Discord est facultatif : e-mail, Discord, ou achat en invité. */}
            <div className="space-y-3 pt-2">
              <Link
                href="/account"
                onClick={onClose}
                className="w-full h-12 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full flex items-center justify-center gap-2.5 transition-all shadow-lg group"
              >
                <span>Sign in with email</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button
                type="button"
                onClick={() => startDiscordAuth()}
                className="w-full h-11 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Continue with Discord</span>
              </button>
              <Link href="/account?signup=1" onClick={onClose} className="block text-center text-xs text-zinc-400 hover:text-white pt-1">
                New here? Create an account
              </Link>
              <p className="text-[11px] text-zinc-500 text-center">No account needed to buy: you can check out as a guest.</p>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* 2. AUTHENTICATED PROFILE & COMMISSIONS VIEW                  */
          /* ============================================================ */
          <div className="space-y-6 pt-2">
            
            {/* User Header Profile */}
            <div className="flex items-center justify-between pb-5 border-b border-white/5">
              <div className="flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-900 border border-white/15 shrink-0 flex items-center justify-center">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={user.pseudo}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-zinc-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-white tracking-tight">
                      {user.pseudo}
                    </h2>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Connected via Discord" />
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">
                    ID: {user.discordId || user.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>

            {/* FiveM CFX Linking */}
            <form onSubmit={handleSaveFivem} className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">FiveM CFX Account</span>
                <span className="text-[11px] text-emerald-400 font-medium">Keymaster Rigging</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editFivem}
                  onChange={(e) => setEditFivem(e.target.value)}
                  placeholder="fivem:username or CFX ID"
                  className="flex-1 h-10 px-3.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors font-mono"
                />
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 h-10 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : savedSuccess ? 'Saved' : 'Link'}
                </button>
              </div>
            </form>

            {/* Active Commissions & Discord Channels */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Active Atelier Orders & Channels ({inquiries.length})
                </h3>
                <button
                  type="button"
                  onClick={refreshInquiries}
                  className="text-[11px] text-zinc-500 hover:text-white transition-colors"
                >
                  Refresh
                </button>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-6 text-center bg-zinc-900/30 border border-white/5 rounded-2xl space-y-3">
                  <Package className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">
                    No active jewelry commission or allocation registered.
                  </p>
                  <Link
                    href="/custom-orders"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs text-white font-medium hover:underline pt-1"
                  >
                    <span>Start a custom project</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{inq.subject}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            inq.status === 'answered'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {inq.status === 'answered' ? 'Staff Replied' : 'Pending 72h Review'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                        <span>Ref: {inq.id}</span>
                        <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                      </div>

                      {inq.discordChannelId && (
                        <a
                          href={`https://discord.com/channels/1449069547876516106/${inq.discordChannelId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full h-9 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl flex items-center justify-center gap-2 font-medium text-xs transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Open Discord Private Channel</span>
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Direct Link to Discord Lounge */}
            <div className="pt-2">
              <a
                href="https://discord.gg/yufothejeweler"
                target="_blank"
                rel="noreferrer"
                className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs rounded-full flex items-center justify-center gap-2 transition-colors"
              >
                <span>Access Yufo Discord Lounge</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
