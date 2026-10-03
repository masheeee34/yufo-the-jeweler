'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from './usersDb';

export interface UserInquiry {
  id: string;
  pseudo: string;
  subject: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'answered' | 'closed';
  discordChannelId?: string;
  project?: { stage?: string };
  order?: { status?: string; paymentStatus?: string };
  messages: Array<{
    id: string;
    sender: 'client' | 'admin';
    text: string;
    createdAt: string;
  }>;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  inquiries: UserInquiry[];
  startDiscordAuth: () => void;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    pseudo: string,
    email: string,
    password: string,
    discordTag?: string,
    fivemId?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: {
    pseudo?: string;
    discordTag?: string;
    fivemId?: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateDiscordTag: (discordTag: string) => Promise<{ success: boolean; error?: string }>;
  refreshInquiries: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<UserInquiry[]>([]);

  const startDiscordAuth = () => {
    if (typeof window === 'undefined') return;
    const clientId = '1551650954007548054';
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/discord/callback`);
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=token&scope=identify&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('yufo_collector_user', JSON.stringify(data.user));
          } else {
            // Le serveur ne reconnaît pas de session : on ne garde pas un faux état connecté.
            localStorage.removeItem('yufo_collector_user');
          }
          return;
        }

        // Serveur injoignable : affichage provisoire du dernier profil connu.
        const saved = localStorage.getItem('yufo_collector_user');
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Error restoring session:', e);
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, []);

  const refreshInquiries = async () => {
    if (!user) {
      setInquiries([]);
      return;
    }
    try {
      const res = await fetch('/api/auth/inquiries');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
      }
    } catch (e) {
      console.error('Error fetching inquiries:', e);
    }
  };

  useEffect(() => {
    if (user) {
      refreshInquiries();
    } else {
      setInquiries([]);
    }
  }, [user]);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid credentials.' };
      }

      setUser(data.user);
      localStorage.setItem('yufo_collector_user', JSON.stringify(data.user));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const register = async (
    pseudo: string,
    email: string,
    password: string,
    discordTag?: string,
    fivemId?: string
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo, email, password, discordTag, fivemId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to create account.' };
      }

      setUser(data.user);
      localStorage.setItem('yufo_collector_user', JSON.stringify(data.user));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const logout = async () => {
    setUser(null);
    setInquiries([]);
    localStorage.removeItem('yufo_collector_user');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
  };

  const updateProfile = async (updates: {
    pseudo?: string;
    discordTag?: string;
    fivemId?: string;
    phone?: string;
  }) => {
    if (!user) return { success: false, error: 'Not signed in' };
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Update failed' };
      }

      setUser(data.user);
      localStorage.setItem('yufo_collector_user', JSON.stringify(data.user));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const updateDiscordTag = async (discordTag: string) => {
    return updateProfile({ discordTag });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        inquiries,
        startDiscordAuth,
        login,
        register,
        logout,
        updateProfile,
        updateDiscordTag,
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
    return {
      user: null,
      loading: false,
      inquiries: [],
      startDiscordAuth: () => {},
      login: async () => ({ success: false, error: 'Auth not initialized' }),
      register: async () => ({ success: false, error: 'Auth not initialized' }),
      logout: () => {},
      updateProfile: async () => ({ success: false, error: 'Auth not initialized' }),
      updateDiscordTag: async () => ({ success: false, error: 'Auth not initialized' }),
      refreshInquiries: async () => {},
    };
  }
  return context;
};
