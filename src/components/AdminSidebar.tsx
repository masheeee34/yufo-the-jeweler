'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandDiscord,
  IconBuildingStore,
  IconChevronDown,
  IconDiamond,
  IconExternalLink,
  IconLayoutGrid,
  IconLogout,
  IconMessageCircle,
  IconPlus,
  IconRefresh,
  IconShoppingBag,
  IconSparkles,
  IconStar,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { DISCORD_INVITE } from './CustomProjectWizard';

export type AdminTab = 'products' | 'requests' | 'reviews';

type Icon = React.ComponentType<{ size?: number; stroke?: number; className?: string }>;

interface Leaf {
  label: string;
  icon: Icon;
  tab?: AdminTab;
  href?: string;
  onClick?: () => void;
  badge?: number;
  badgeTone?: 'neutral' | 'amber';
  spinning?: boolean;
}

interface Group {
  label: string;
  icon: Icon;
  items: Leaf[];
}

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  productCount: number;
  pendingCount: number;
  reviewCount: number;
  onAddProduct: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

// Barre latérale du panel atelier : onglets principaux, groupes repliables, profil en bas.
// Sur ordinateur elle se réduit en colonne d'icônes ; sur mobile elle s'ouvre en tiroir.
export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  productCount,
  pendingCount,
  reviewCount,
  onAddProduct,
  onRefresh,
  refreshing,
  onLogout,
  mobileOpen,
  onCloseMobile,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ Catalogue: true, Boutique: true, Communauté: true });

  const main: Leaf[] = [
    { label: 'Articles', icon: IconShoppingBag, tab: 'products', badge: productCount },
    { label: 'Demandes', icon: IconMessageCircle, tab: 'requests', badge: pendingCount, badgeTone: 'amber' },
    { label: 'Avis Discord', icon: IconStar, tab: 'reviews', badge: reviewCount },
  ];

  const groups: Group[] = [
    {
      label: 'Catalogue',
      icon: IconDiamond,
      items: [
        { label: 'Nouvel article', icon: IconPlus, onClick: () => { onSelectTab('products'); onAddProduct(); } },
        { label: 'Rafraîchir', icon: IconRefresh, onClick: onRefresh, spinning: refreshing },
      ],
    },
    {
      label: 'Boutique',
      icon: IconBuildingStore,
      items: [
        { label: 'Voir le site', icon: IconExternalLink, href: '/' },
        { label: 'Toutes les créations', icon: IconLayoutGrid, href: '/collections/shop-all' },
        { label: 'Page sur mesure', icon: IconSparkles, href: '/custom-orders' },
      ],
    },
    {
      label: 'Communauté',
      icon: IconUsers,
      items: [{ label: 'Serveur Discord', icon: IconBrandDiscord, href: DISCORD_INVITE }],
    },
  ];

  const renderLeaf = (item: Leaf, nested: boolean, compact: boolean) => {
    const active = item.tab !== undefined && item.tab === activeTab;
    const Ico = item.icon;
    const cls = `admin-nav-item group flex items-center gap-3 w-full rounded-[10px] text-left transition-colors cursor-pointer ${
      compact ? 'h-11 justify-center' : nested ? 'h-10 px-3' : 'h-11 px-3'
    } ${active ? 'bg-white/[0.13] text-white' : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'}`;
    const content = (
      <>
        <Ico size={compact ? 20 : nested ? 19 : 20} stroke={1.6} className={`shrink-0 ${item.spinning ? 'animate-spin' : ''}`} />
        {!compact && <span className={`flex-1 truncate ${nested ? 'text-[15px]' : 'text-[15.5px]'}`}>{item.label}</span>}
        {!compact && !!item.badge && item.badge > 0 && (
          <span
            className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center ${
              item.badgeTone === 'amber' ? 'bg-amber-400 text-black' : 'bg-white/10 text-zinc-300'
            }`}
          >
            {item.badge}
          </span>
        )}
        {compact && !!item.badge && item.badge > 0 && item.badgeTone === 'amber' && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
        )}
      </>
    );
    const title = compact ? item.label : undefined;
    if (item.href) {
      return (
        <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className={`${cls} relative`} title={title} onClick={onCloseMobile}>
          {content}
        </a>
      );
    }
    return (
      <button
        key={item.label}
        type="button"
        title={title}
        className={`${cls} relative`}
        onClick={() => {
          if (item.tab) onSelectTab(item.tab);
          item.onClick?.();
          onCloseMobile();
        }}
      >
        {content}
      </button>
    );
  };

  const panel = (compact: boolean, mobile: boolean) => (
    <div className="flex flex-col h-full">
      {/* Marque */}
      <div className={`flex items-center gap-3 h-[76px] shrink-0 ${compact ? 'justify-center' : 'px-6'}`}>
        <span className="w-9 h-9 rounded-[9px] bg-black border border-white/15 flex items-center justify-center shrink-0"><Image src="/assets/brand/yufo_clean_white.png" alt="YUFO" width={24} height={25} className="object-contain" /></span>
        {!compact && <span className="text-[17px] font-semibold text-white truncate">YUFO Atelier</span>}
        {mobile && (
          <button onClick={onCloseMobile} className="ml-auto w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400" aria-label="Fermer le menu">
            <IconX size={18} />
          </button>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto overscroll-contain pb-4 ${compact ? 'px-3' : 'px-4'}`} aria-label="Navigation du panel">
        <div className="space-y-1 pt-4">{main.map((i) => renderLeaf(i, false, compact))}</div>

        <div className="my-5 h-px bg-white/[0.08]" />

        {compact ? (
          <div className="space-y-1">{groups.flatMap((g) => g.items).map((i) => renderLeaf(i, true, true))}</div>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => {
              const isOpen = openGroups[g.label];
              const GIco = g.icon;
              return (
                <div key={g.label}>
                  <button
                    type="button"
                    onClick={() => setOpenGroups((o) => ({ ...o, [g.label]: !o[g.label] }))}
                    className="flex items-center gap-3 w-full h-11 px-3 rounded-[10px] text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <GIco size={20} stroke={1.6} className="shrink-0" />
                    <span className="flex-1 text-left text-[15.5px] font-semibold">{g.label}</span>
                    <IconChevronDown size={16} stroke={2} className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`admin-group grid transition-[grid-template-rows] duration-200 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <div className="ml-[22px] pl-3 border-l border-white/[0.1] space-y-0.5 py-1">
                        {g.items.map((i) => renderLeaf(i, true, false))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* Profil */}
      <div className={`shrink-0 h-[76px] flex items-center gap-3 border-t border-white/[0.06] ${compact ? 'justify-center' : 'px-6'}`}>
        {!compact && (
          <>
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-500 text-zinc-950 flex items-center justify-center text-sm font-bold shrink-0">A</span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-medium text-white truncate">Administrateur</span>
              <span className="block text-[12px] text-zinc-500 truncate">YUFO The Jeweler</span>
            </span>
          </>
        )}
        <button
          onClick={onLogout}
          title="Se déconnecter"
          aria-label="Se déconnecter"
          className="w-9 h-9 rounded-full hover:bg-rose-500/15 text-zinc-400 hover:text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
        >
          <IconLogout size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Ordinateur */}
      <aside
        className={`admin-sidebar relative hidden lg:block shrink-0 h-full rounded-[20px] bg-[#171717] border border-white/[0.05] transition-[width] duration-300 ${
          collapsed ? 'w-[76px]' : 'w-[300px]'
        }`}
      >
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3.5 top-[22px] z-10 w-8 h-8 rounded-[9px] bg-[#1f1f1f] border border-white/[0.1] text-white flex items-center justify-center hover:bg-[#2a2a2a] transition-colors cursor-pointer"
          aria-label={collapsed ? 'Déplier la barre latérale' : 'Réduire la barre latérale'}
        >
          {collapsed ? <IconArrowRight size={16} /> : <IconArrowLeft size={16} />}
        </button>
        <div className="h-full overflow-hidden">{panel(collapsed, false)}</div>
      </aside>

      {/* Mobile */}
      <div className={`lg:hidden fixed inset-0 z-50 ${mobileOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
        <div
          onClick={onCloseMobile}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[290px] max-w-[85vw] bg-[#171717] border-r border-white/[0.06] transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {panel(false, true)}
        </aside>
      </div>
    </>
  );
};
