'use client';

import { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
};

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={`bg-card border border-border rounded-lg shadow-sm ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
