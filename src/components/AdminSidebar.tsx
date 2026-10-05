'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBell,
  IconBuildingStore,
  IconCategory,
  IconChevronDown,
  IconCreditCard,
  IconDiamond,
  IconExternalLink,
  IconFolder,
  IconHistory,
  IconLayoutDashboard,
  IconLogout,
  IconMail,
  IconMailForward,
  IconPackage,
  IconSearch,
  IconSettings,
  IconForms,
  IconLayoutBottombar,
  IconMessages,
  IconShieldLock,
  IconTicket,
  IconSparkles,
  IconStar,
  IconUserCircle,
  IconUsers,
  IconUsersGroup,
  IconWorld,
  IconX,
} from '@tabler/icons-react';
import { Permission, useAdmin } from './admin/AdminContext';
import { Avatar } from './admin/ui';

type Icon = React.ComponentType<{ size?: number; stroke?: number; className?: string }>;

interface Leaf {
  label: string;
  icon: Icon;
  href: string;
  perm: Permission;
  badge?: number;
  badgeTone?: 'neutral' | 'amber';
}

interface Group {
  label: string;
  icon: Icon;
  items: Leaf[];
}

const ROLE_LABEL: Record<string, string> = { founder: 'Founder', admin: 'Admin', jeweler: 'Jeweler', support: 'Support', moderator: 'Moderator' };

// Barre latérale du back-office (même structure que le modèle « grouped sidebar »).
// Sur ordinateur elle se réduit en colonne d'icônes ; sur mobile elle s'ouvre en tiroir.
export const AdminSidebar: React.FC<{ mobileOpen: boolean; onCloseMobile: () => void; onSearch: () => void; onLogout: () => void }> = ({
  mobileOpen,
  onCloseMobile,
  onSearch,
  onLogout,
}) => {
  const { me, can } = useAdmin();
  const pathname = usePathname() || '/admin';
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ Store: true, Customers: true, Team: true, Settings: true, Admin: true });

  // Préférences d'affichage gardées d'une visite à l'autre.
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem('yufo_admin_collapsed') === '1');
      const g = localStorage.getItem('yufo_admin_groups');
      if (g) setOpenGroups((o) => ({ ...o, ...JSON.parse(g) }));
    } catch {}
  }, []);
  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try { localStorage.setItem('yufo_admin_collapsed', c ? '0' : '1'); } catch {}
      return !c;
    });
  };
  const toggleGroup = (label: string) =>
    setOpenGroups((o) => {
      const next = { ...o, [label]: !o[label] };
      try { localStorage.setItem('yufo_admin_groups', JSON.stringify(next)); } catch {}
      return next;
    });

  const main: Leaf[] = [
    { label: 'Dashboard', icon: IconLayoutDashboard, href: '/admin', perm: 'dashboard' },
    { label: 'Orders', icon: IconPackage, href: '/admin/orders', perm: 'orders', badge: me.counts.orders },
    { label: 'Custom projects', icon: IconSparkles, href: '/admin/projects', perm: 'projects', badge: me.counts.projects, badgeTone: 'amber' },
    { label: 'Messages', icon: IconMail, href: '/admin/messages', perm: 'messages', badge: me.counts.messages, badgeTone: 'amber' },
    { label: 'Tickets', icon: IconMessages, href: '/tickets', perm: 'messages' },
    { label: 'Notifications', icon: IconBell, href: '/admin/notifications', perm: 'dashboard', badge: me.counts.notifications },
  ];

  const groups: Group[] = (
    [
    {
      label: 'Store',
      icon: IconBuildingStore,
      items: [
        { label: 'Creations', icon: IconDiamond, href: '/admin/creations', perm: 'store' },
        { label: 'Categories', icon: IconCategory, href: '/admin/categories', perm: 'store' },
        { label: 'Files', icon: IconFolder, href: '/admin/files', perm: 'store' },
        { label: 'Reviews', icon: IconStar, href: '/admin/reviews', perm: 'reviews' },
      ],
    },
    {
      label: 'Customers',
      icon: IconUserCircle,
      items: [{ label: 'Customers', icon: IconUsers, href: '/admin/customers', perm: 'customers' }],
    },
    {
      label: 'Team',
      icon: IconUsersGroup,
      items: [
        { label: 'Members', icon: IconUsers, href: '/admin/team/members', perm: 'team' },
        { label: 'Invitations', icon: IconMailForward, href: '/admin/team/invitations', perm: 'team' },
      ],
    },
    {
      label: 'Settings',
      icon: IconSettings,
      items: [
        { label: 'General', icon: IconSettings, href: '/admin/settings/general', perm: 'settings' },
        { label: 'Website', icon: IconWorld, href: '/admin/settings/website', perm: 'settings' },
        { label: 'Custom orders', icon: IconSparkles, href: '/admin/settings/custom-orders', perm: 'settings' },
        { label: 'Custom form', icon: IconForms, href: '/admin/settings/custom-form', perm: 'settings' },
        { label: 'Tickets', icon: IconTicket, href: '/admin/settings/tickets', perm: 'settings' },
        { label: 'Footer', icon: IconLayoutBottombar, href: '/admin/settings/footer', perm: 'settings' },
        { label: 'Payments', icon: IconCreditCard, href: '/admin/settings/payments', perm: 'payments' },
        { label: 'Security', icon: IconShieldLock, href: '/admin/settings/security', perm: 'security' },
      ],
    },
    {
      label: 'Admin',
      icon: IconHistory,
      items: [{ label: 'Activity logs', icon: IconHistory, href: '/admin/logs', perm: 'logs' }],
    },
    ] as Group[]
  )
    .map((g) => ({ ...g, items: g.items.filter((i) => can(i.perm)) }))
    .filter((g) => g.items.length > 0);

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(href + '/'));

  const renderLeaf = (item: Leaf, nested: boolean, compact: boolean) => {
    const active = isActive(item.href);
    const Ico = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        title={compact ? item.label : undefined}
        onClick={onCloseMobile}
        className={`admin-nav-item relative flex items-center gap-3 w-full rounded-[10px] transition-all duration-200 ${
          compact ? 'h-11 justify-center' : nested ? 'h-10 px-3' : 'h-11 px-3'
        } ${active ? 'bg-white/[0.13] text-white' : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'}`}
      >
        {active && !compact && <span className="adm-active-bar absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full bg-white" />}
        <Ico size={nested ? 19 : 20} stroke={1.6} className="shrink-0" />
        {!compact && <span className={`flex-1 truncate ${nested ? 'text-[15px]' : 'text-[15.5px]'}`}>{item.label}</span>}
        {!compact && !!item.badge && item.badge > 0 && (
          <span key={item.badge} className={`adm-pop min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center ${item.badgeTone === 'amber' ? 'bg-amber-400 text-black' : 'bg-white/10 text-zinc-300'}`}>
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
        {compact && !!item.badge && item.badge > 0 && <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${item.badgeTone === 'amber' ? 'bg-amber-400' : 'bg-white/60'}`} />}
      </Link>
    );
  };

  const panel = (compact: boolean, mobile: boolean) => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 h-[76px] shrink-0 ${compact ? 'justify-center' : 'px-6'}`}>
        <span className="w-9 h-9 rounded-[9px] bg-black border border-white/15 flex items-center justify-center shrink-0">
          <Image src="/assets/brand/yufo_clean_white.png" alt="YUFO" width={24} height={25} className="object-contain" />
        </span>
        {!compact && <span className="text-[17px] font-semibold text-white truncate">YUFO Management</span>}
        {mobile && (
          <button onClick={onCloseMobile} className="ml-auto w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400" aria-label="Fermer le menu">
            <IconX size={18} />
          </button>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto overscroll-contain pb-4 ${compact ? 'px-3' : 'px-4'}`} aria-label="Navigation du back-office">
        <button
          onClick={() => { onCloseMobile(); onSearch(); }}
          title={compact ? 'Rechercher (Ctrl K)' : undefined}
          className={`mt-2 mb-3 flex items-center gap-2.5 w-full h-10 rounded-[10px] bg-black/25 border border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/15 transition-colors ${compact ? 'justify-center' : 'px-3'}`}
        >
          <IconSearch size={17} />
          {!compact && (
            <>
              <span className="flex-1 text-left text-[13px]">Rechercher…</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-zinc-500">Ctrl K</kbd>
            </>
          )}
        </button>

        <div className="space-y-1">{main.filter((i) => can(i.perm)).map((i) => renderLeaf(i, false, compact))}</div>

        <div className="my-5 h-px bg-white/[0.08]" />

        {compact ? (
          <div className="space-y-1">{groups.flatMap((g) => g.items).map((i) => renderLeaf(i, true, true))}</div>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => {
              const isOpen = openGroups[g.label] !== false;
              const GIco = g.icon;
              return (
                <div key={g.label}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(g.label)}
                    className="flex items-center gap-3 w-full h-11 px-3 rounded-[10px] text-white hover:bg-white/[0.06] transition-colors"
                    aria-expanded={isOpen}
                  >
                    <GIco size={20} stroke={1.6} className="shrink-0" />
                    <span className="flex-1 text-left text-[15.5px] font-semibold">{g.label}</span>
                    <IconChevronDown size={16} stroke={2} className={`text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="ml-[22px] pl-3 border-l border-white/[0.1] space-y-0.5 py-1">{g.items.map((i) => renderLeaf(i, true, false))}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          title={compact ? 'Voir le site' : undefined}
          className={`mt-4 flex items-center gap-3 h-10 rounded-[10px] text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors ${compact ? 'justify-center' : 'px-3'}`}
        >
          <IconExternalLink size={18} stroke={1.6} />
          {!compact && <span className="text-[14px]">Voir le site</span>}
        </a>
      </nav>

      <div className={`shrink-0 h-[76px] flex items-center gap-3 border-t border-white/[0.06] ${compact ? 'justify-center' : 'px-5'}`}>
        {!compact && (
          <>
            <Avatar user={me.user} size={36} />
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-medium text-white truncate">{me.user.pseudo}</span>
              <span className="block text-[12px] text-zinc-500 truncate">{ROLE_LABEL[me.role]}</span>
            </span>
          </>
        )}
        <button onClick={onLogout} title="Se déconnecter" aria-label="Se déconnecter" className="w-9 h-9 rounded-full hover:bg-rose-500/15 text-zinc-400 hover:text-rose-300 flex items-center justify-center transition-colors">
          <IconLogout size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={`admin-sidebar relative hidden lg:block shrink-0 h-full rounded-[20px] bg-[#171717] border border-white/[0.05] transition-[width] duration-300 ease-out ${collapsed ? 'w-[76px]' : 'w-[300px]'}`}>
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3.5 top-[22px] z-10 w-8 h-8 rounded-[9px] bg-[#1f1f1f] border border-white/[0.1] text-white flex items-center justify-center hover:bg-[#2a2a2a] transition-colors"
          aria-label={collapsed ? 'Déplier la barre latérale' : 'Réduire la barre latérale'}
        >
          {collapsed ? <IconArrowRight size={16} /> : <IconArrowLeft size={16} />}
        </button>
        <div className="h-full overflow-hidden">{panel(collapsed, false)}</div>
      </aside>

      <div className={`lg:hidden fixed inset-0 z-50 ${mobileOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
        <div onClick={onCloseMobile} className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`} />
        <aside className={`absolute inset-y-0 left-0 w-[290px] max-w-[85vw] bg-[#171717] border-r border-white/[0.06] transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {panel(false, true)}
        </aside>
      </div>
    </>
  );
};
