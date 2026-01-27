'use client';

import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning';

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-accent/15 text-accent',
  accent: 'bg-accent/25 text-accent',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-[#D4A574]/20 text-[#8B6B47] dark:bg-[#D4A574]/30 dark:text-[#E5B889]',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
