'use client';

import React from 'react';

// Avatars qui se chevauchent + compteur (« 99+ collectors trust YUFO »), réglable dans Management.
export function AvatarCircles({ avatars, count, label, show }: { avatars: string[]; count: string; label: string; show: number }) {
  const list = avatars.slice(0, show);
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      <div className="flex -space-x-3">
        {list.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src + i}
            src={src}
            alt=""
            width={44}
            height={44}
            className="avatar-pop w-11 h-11 rounded-full border-2 border-[#070709] object-cover bg-zinc-800"
            style={{ animationDelay: `${i * 70}ms` }}
          />
        ))}
        <span
          className="avatar-pop w-11 h-11 rounded-full border-2 border-[#070709] bg-white text-black text-[12px] font-bold flex items-center justify-center"
          style={{ animationDelay: `${list.length * 70}ms` }}
        >
          +{count}
        </span>
      </div>
      {label && <p className="text-sm text-zinc-300">{label}</p>}
    </div>
  );
}
