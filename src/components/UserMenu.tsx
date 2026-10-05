'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  IconBooks,
  IconCirclePlus,
  IconMessageCircle,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import { useAuth } from '../lib/authContext';
import type { UserProfile } from '../lib/usersDb';

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

// Photo du client (envoyée sur le site), sinon sa photo Discord, sinon la première lettre de son pseudo.
export const UserAvatar: React.FC<{ user: Pick<UserProfile, 'pseudo' | 'discordId' | 'avatar' | 'avatarUrl'>; size: number; className?: string }> = ({ user, size, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const src = user.avatarUrl || discordAvatarUrl(user, size * 2);
  if (!src || failed) {
    return (
      <span
        className={`rounded-full bg-white/10 text-white font-semibold flex items-center justify-center ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        {(user.pseudo || '?').trim().charAt(0).toUpperCase() || '?'}
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


const rowClass =
  'flex items-center gap-3 w-full px-5 py-2.5 text-[14px] font-medium text-white hover:bg-white/[0.07] transition-colors text-left';

// Bouton compte de l'en-tête : photo Discord du joueur, menu déroulant au clic.
// Visiteur non connecté : icône classique qui ouvre la connexion.
export const UserMenu: React.FC<{ onOpenAccount?: () => void }> = ({ onOpenAccount }) => {
  const { user, logout } = useAuth();
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
  // Nom affiché + @nom d'utilisateur du site.
  const handle = user.username ? `@${user.username}` : user.discordTag ? `@${user.discordTag}` : '';

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
          className="user-menu-panel absolute right-0 top-[calc(100%+12px)] z-50 w-[280px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[20px] bg-[#1c1c1e]/70 backdrop-blur-xl backdrop-saturate-150 border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.5)] normal-case tracking-normal font-sans"
        >
          <div className="px-5 pt-5 pb-3">
            <p className="text-[15px] font-semibold text-white leading-tight truncate">{user.pseudo}</p>
            {handle && <p className="text-[13px] text-[#a1a1a6] mt-0.5 truncate">{handle}</p>}
          </div>

          <div className="pb-2">
            <Link href="/tickets" onClick={close} className={rowClass} role="menuitem">
              <IconMessageCircle size={18} stroke={1.6} className="text-[#a1a1a6]" />My tickets
            </Link>
            <Link href="/account?tab=library" onClick={close} className={rowClass} role="menuitem">
              <IconBooks size={18} stroke={1.6} className="text-[#a1a1a6]" />Library
            </Link>
            <Link href="/custom-orders" onClick={close} className={rowClass} role="menuitem">
              <IconCirclePlus size={18} stroke={1.6} className="text-[#a1a1a6]" />Request a piece
            </Link>
            <Link href="/account?tab=settings" onClick={close} className={rowClass} role="menuitem">
              <IconSettings size={18} stroke={1.6} className="text-[#a1a1a6]" />Settings
            </Link>
          </div>

          <div className="border-t border-white/[0.08] py-2">
            <button onClick={() => { close(); logout(); }} className={rowClass} role="menuitem">
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
