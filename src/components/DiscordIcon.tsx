'use client';

import React from 'react';
import Image from 'next/image';

interface DiscordIconProps {
  size?: number;
  className?: string;
}

export const DiscordIcon: React.FC<DiscordIconProps> = ({ size = 14, className = '' }) => {
  return (
    <span
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center flex-none rounded-full overflow-hidden leading-none ${className}`}
    >
      <Image
        src="/assets/brand/discord_logo.png"
        alt="Discord"
        width={size}
        height={size}
        className="w-full h-full object-contain block"
        priority
      />
    </span>
  );
};
