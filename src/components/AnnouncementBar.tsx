'use client';

import React, { useEffect, useState } from 'react';

// Bandeau d'annonce en haut du site, réglé dans le back-office (Settings › General).
export const AnnouncementBar: React.FC = () => {
  const [a, setA] = useState<{ text: string; link: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => d.general?.announcement && setA({ text: d.general.announcement, link: d.general.announcementLink || '' }))
      .catch(() => {});
  }, []);

  if (!a) return null;
  const inner = <span className="block truncate">{a.text}</span>;
  return (
    <div className="w-full bg-white text-zinc-950 text-[12px] font-medium text-center px-4 py-2">
      {a.link ? (
        <a href={a.link} className="hover:underline underline-offset-2">{inner}</a>
      ) : (
        inner
      )}
    </div>
  );
};
