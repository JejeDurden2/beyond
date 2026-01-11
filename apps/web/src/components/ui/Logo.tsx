'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export type LogoVariant = 'full' | 'symbol' | 'text';

interface LogoProps {
  className?: string;
  variant?: LogoVariant;
}

export function Logo({ className, variant = 'full' }: LogoProps): React.ReactElement {
  // All variants now use the same PNG logo with different sizes
  const sizes = {
    symbol: { height: 40, width: 40 },
    text: { height: 32, width: 120 },
    full: { height: 48, width: 180 },
  };

  const { height, width } = sizes[variant];

  return (
    <Image
      src="/logo.png"
      alt="Beyond"
      width={width}
      height={height}
      className={cn('h-auto w-auto object-contain', className)}
      priority
    />
  );
}
