'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  IconArrowUpRight,
  IconCirclePlus,
  IconDiamond,
  IconMessageCircle,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import { useAuth } from '../lib/authContext';
import { useCart } from '../lib/cartContext';
import type { UserProfile } from '../lib/usersDb';
import { DISCORD_INVITE } from './CustomProjectWizard';

// Photo de profil Discord du joueur (hash enregistré à la connexion), sinon l'avatar Discord par défaut.
export function discordAvatarUrl(user: Pick<UserProfile, 'discordId' | 'avatar'>, size = 128): string | null {
  if (!user.discordId) return null;
  if (user.avatar) {
    const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.${ext}?size=${size}`;
  }
  try {
    return `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(user.discordId) >> BigInt(22)) % BigInt(6))}.png`;
  } catch {
    return null;
  }
}

export const UserAvatar: React.FC<{ user: UserProfile; size: number; className?: string }> = ({ user, size, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const src = discordAvatarUrl(user, size * 2);
  if (!src || failed) {
    return (
      <span
        className={`rounded-full bg-white/10 text-white font-semibold flex items-center justify-center ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        {user.pseudo.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

const DiscordGlyph: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const rowClass =
  'flex items-center justify-between w-full px-6 py-[9px] text-[17px] font-semibold text-white hover:bg-white/[0.06] transition-colors text-left';

// Bouton compte de l'en-tête : photo Discord du joueur, menu déroulant au clic.
// Visiteur non connecté : icône classique qui ouvre la connexion.
export const UserMenu: React.FC<{ onOpenAccount?: () => void }> = ({ onOpenAccount }) => {
  const { user, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) {
    const icon = <IconUser size={18} stroke={1.5} />;
    return onOpenAccount ? (
      <button onClick={onOpenAccount} className="hover:text-white transition-all p-1 cursor-pointer" aria-label="Sign in">
        {icon}
      </button>
    ) : (
      <Link href="/account" className="hover:text-white transition-all p-1" aria-label="Sign in">
        {icon}
      </Link>
    );
  }

  const close = () => setOpen(false);
  // Les comptes Discord sans email reçoivent une adresse technique « …@discord.user » : on affiche le pseudo Discord à la place.
  const realEmail = user.email && !user.email.endsWith('@discord.user') ? user.email : '';
  const subtitle = realEmail || (user.discordTag ? `@${user.discordTag}` : '');

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`block rounded-full transition-all cursor-pointer ring-2 ${open ? 'ring-white/40' : 'ring-transparent hover:ring-white/20'}`}
        aria-label="Open account menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar user={user} size={40} />
      </button>

      {open && (
        <div
          role="menu"
          className="user-menu-panel absolute right-0 top-[calc(100%+14px)] z-50 w-[360px] max-w-[calc(100vw-32px)] max-h-[calc(100dvh-96px)] overflow-y-auto overscroll-contain rounded-[24px] bg-[#262528] border border-white/[0.06] shadow-[0_24px_60px_rgba(0,0,0,0.55)] normal-case tracking-normal font-sans"
        >
          <div className="px-6 pt-6 pb-4">
            <p className="text-[18px] font-semibold text-white leading-tight truncate">{user.pseudo}</p>
            {subtitle && <p className="text-[15px] text-[#a1a1a6] mt-1 truncate">{subtitle}</p>}
            <Link
              href="/account?tab=settings"
              onClick={close}
              className="mt-4 flex items-center justify-center h-[52px] w-full rounded-full bg-white/[0.08] hover:bg-white/[0.13] text-[16px] font-semibold text-white transition-colors"
            >
              Set up profile
            </Link>
          </div>

          <div className="pb-3">
            <Link href="/account?tab=commissions" onClick={close} className={rowClass} role="menuitem">
              <span className="flex items-center gap-3"><IconMessageCircle size={22} stroke={1.6} className="text-[#a1a1a6]" />My requests</span>
            </Link>
            <Link href="/custom-orders" onClick={close} className={rowClass} role="menuitem">
              <span className="flex items-center gap-3"><IconCirclePlus size={22} stroke={1.6} className="text-[#a1a1a6]" />Request a piece</span>
            </Link>
            <Link href="/account?tab=settings" onClick={close} className={rowClass} role="menuitem">
              <span className="flex items-center gap-3"><IconSettings size={22} stroke={1.6} className="text-[#a1a1a6]" />Settings</span>
            </Link>
          </div>

          <div className="border-t border-white/[0.08] px-6 py-4 flex items-center justify-between">
            <span className="text-[17px] font-semibold text-white">Tier</span>
            <span className="flex items-center gap-2 h-10 pl-3 pr-4 rounded-full bg-black/25 text-[14px] font-semibold text-white">
              <IconDiamond size={18} stroke={1.6} />
              {user.vipTier || 'Standard'}
            </span>
          </div>

          <div className="border-t border-white/[0.08] py-3">
            <Link href="/collections/shop-all" onClick={close} className={rowClass} role="menuitem">Shop all</Link>
            <Link href="/bespoke" onClick={close} className={rowClass} role="menuitem">Bespoke</Link>
            <button
              onClick={() => { close(); setIsCartOpen(true); }}
              className={rowClass}
              role="menuitem"
            >
              <span className="flex items-center gap-3">
                Cart
                {totalItems > 0 && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.14] text-[13px] font-semibold">{totalItems}</span>
                )}
              </span>
            </button>
            <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" onClick={close} className={rowClass} role="menuitem">
              Discord <IconArrowUpRight size={20} stroke={1.6} className="text-[#a1a1a6]" />
            </a>
            <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" onClick={close} className={rowClass} role="menuitem">
              Support <IconArrowUpRight size={20} stroke={1.6} className="text-[#a1a1a6]" />
            </a>
            <button onClick={() => { close(); logout(); }} className={rowClass} role="menuitem">
              Log out
            </button>
          </div>

          <div className="border-t border-white/[0.08] px-6 py-4 flex items-center justify-between text-[13px] text-[#8e8e93]">
            <span className="flex gap-3">
              <Link href="/collections/shop-all" onClick={close} className="hover:text-white transition-colors">Shop</Link>
              <Link href="/custom-orders" onClick={close} className="hover:text-white transition-colors">Custom</Link>
              <span>© {new Date().getFullYear()} YUFO</span>
            </span>
            <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="YUFO Discord">
              <DiscordGlyph />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
