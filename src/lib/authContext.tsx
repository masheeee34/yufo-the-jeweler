'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { UserProfile } from './usersDb';

export interface UserInquiry {
  id: string;
  pseudo: string;
  subject: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'answered' | 'closed';
  discordChannelId?: string;
  project?: { stage?: string };
  order?: { status?: string; paymentStatus?: string; total?: number; items?: { name: string; quantity: number; price: number }[] };
  ticket?: { title?: string; statusId?: string };
  messages: Array<{
    id: string;
    sender: 'client' | 'admin';
    text: string;
    createdAt: string;
  }>;
}

type Result = { success: boolean; error?: string };

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  active: boolean; // adresse vérifiée (ou Discord) et @nom choisi
  mailReady: boolean; // l'envoi d'e-mails est configuré sur le serveur
  inquiries: UserInquiry[];
  setUser: (u: UserProfile | null) => void;
  refreshUser: () => Promise<void>;
  startDiscordAuth: (opts?: { link?: boolean }) => void;
  login: (identifier: string, password: string, remember?: boolean) => Promise<Result>;
  register: (email: string, password: string, remember?: boolean) => Promise<Result & { emailSent?: boolean }>;
  logout: () => void;
  updateProfile: (updates: { pseudo?: string; discordTag?: string; fivemId?: string; phone?: string }) => Promise<Result>;
  updateDiscordTag: (discordTag: string) => Promise<Result>;
  refreshInquiries: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isActive = (u: UserProfile | null) => !!u && !!u.username && (!!u.emailVerified || !!u.discordId);

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mailReady, setMailReady] = useState(true);
  const [inquiries, setInquiries] = useState<UserInquiry[]>([]);

  const setUser = useCallback((u: UserProfile | null) => {
    setUserState(u);
    try {
      if (u) localStorage.setItem('yufo_collector_user', JSON.stringify(u));
      else localStorage.removeItem('yufo_collector_user');
    } catch {}
  }, []);

  const startDiscordAuth = (opts?: { link?: boolean }) => {
    if (typeof window === 'undefined') return;
    try {
      if (opts?.link) sessionStorage.setItem('yufo_discord_link', '1');
      else sessionStorage.removeItem('yufo_discord_link');
    } catch {}
    const clientId = '1551650954007548054';
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/discord/callback`);
    window.location.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=token&scope=identify&redirect_uri=${redirectUri}`;
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setMailReady(data.mailReady !== false);
        setUser(data.user || null);
        return;
      }
      // Serveur injoignable : affichage provisoire du dernier profil connu.
      const saved = localStorage.getItem('yufo_collector_user');
      if (saved) setUserState(JSON.parse(saved));
    } catch (e) {
      console.error('Error restoring session:', e);
    }
  }, [setUser]);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const refreshInquiries = useCallback(async () => {
    if (!user) {
      setInquiries([]);
      return;
    }
    try {
      const res = await fetch('/api/auth/inquiries', { cache: 'no-store' });
      if (res.ok) setInquiries((await res.json()).inquiries || []);
    } catch (e) {
      console.error('Error fetching inquiries:', e);
    }
  }, [user]);

  useEffect(() => {
    if (user) refreshInquiries();
    else setInquiries([]);
  }, [user, refreshInquiries]);

  const login = async (identifier: string, password: string, remember = true) => {
    try {
      const { ok, data } = await post('/api/auth/login', { identifier, password, remember });
      if (!ok || !data.success) return { success: false, error: data.error || 'Invalid email or password.' };
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (email: string, password: string, remember = true) => {
    try {
      const { ok, data } = await post('/api/auth/register', { email, password, remember });
      if (!ok || !data.success) return { success: false, error: data.error || 'Your account could not be created.' };
      setUser(data.user);
      return { success: true, emailSent: data.emailSent };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    setUser(null);
    setInquiries([]);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
  };

  const updateProfile = async (updates: { pseudo?: string; discordTag?: string; fivemId?: string; phone?: string }) => {
    if (!user) return { success: false, error: 'Not signed in' };
    try {
      const res = await fetch('/api/auth/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) return { success: false, error: data.error || 'Update failed' };
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        active: isActive(user),
        mailReady,
        inquiries,
        setUser,
        refreshUser,
        startDiscordAuth,
        login,
        register,
        logout,
        updateProfile,
        updateDiscordTag: (discordTag: string) => updateProfile({ discordTag }),
        refreshInquiries,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    const fail = async () => ({ success: false, error: 'Auth not initialized' });
    return {
      user: null,
      loading: false,
      active: false,
      mailReady: true,
      inquiries: [],
      setUser: () => {},
      refreshUser: async () => {},
      startDiscordAuth: () => {},
      login: fail,
      register: fail,
      logout: () => {},
      updateProfile: fail,
      updateDiscordTag: fail,
      refreshInquiries: async () => {},
    };
  }
  return context;
};
