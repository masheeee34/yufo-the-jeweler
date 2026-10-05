'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DEFAULT_FOOTER, FooterSettings } from '../lib/footerDefaults';

const isExternal = (href: string) => /^(https?:|mailto:)/i.test(href);

// Pied de page, tel que réglé dans Management › Footer. Sert aussi d'aperçu en direct dans le back-office.
export function FooterView({ footer, preview = false }: { footer: FooterSettings; preview?: boolean }) {
  const year = new Date().getFullYear();
  const copyright = footer.copyright.replace(/\{year\}/g, String(year));
  const LinkTag = ({ href, children }: { href: string; children: React.ReactNode }) =>
    preview ? (
      <span className="cursor-default">{children}</span>
    ) : isExternal(href) ? (
      <a href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer" className="hover:text-white transition-colors">
        {children}
      </a>
    ) : (
      <Link href={href} className="hover:text-white transition-colors">
        {children}
      </Link>
    );

  return (
    <footer className="bg-[#0a0a0b] border-t border-white/[0.06] overflow-hidden select-none" aria-label="Site footer">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 pt-16 sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-12">
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center gap-3">
              {footer.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={footer.logo} alt="" className="w-8 h-8 rounded-lg border border-white/15 object-cover bg-black" />
              )}
              {footer.brandName && <span className="text-[15px] font-semibold text-white">{footer.brandName}</span>}
            </div>
            {copyright && <p className="text-sm text-zinc-400">{copyright}</p>}
            {footer.disclaimer && <p className="text-xs text-zinc-600 leading-relaxed">{footer.disclaimer}</p>}
          </div>
          {footer.columns.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {footer.columns.map((col, i) => (
                <div key={`${col.title}-${i}`}>
                  <p className="text-sm font-semibold text-white mb-4">{col.title}</p>
                  <ul className="space-y-3 text-sm text-zinc-400">
                    {col.links.map((l, j) => (
                      <li key={`${l.label}-${j}`}>
                        <LinkTag href={l.href}>{l.label}</LinkTag>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {footer.showBigText && footer.bigText && (
        <p className="text-center font-bold leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 to-neutral-950 text-[28vw] lg:text-[19rem] mt-14 -mb-[0.12em]" aria-hidden="true">
          {footer.bigText}
        </p>
      )}
      {(!footer.showBigText || !footer.bigText) && <div className="h-16" />}
    </footer>
  );
}

export function Footer() {
  const [footer, setFooter] = useState<FooterSettings>(DEFAULT_FOOTER);
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => d.footer && setFooter({ ...DEFAULT_FOOTER, ...d.footer }))
      .catch(() => {});
  }, []);
  return <FooterView footer={footer} />;
}
