'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

type Props = {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<'a'>, 'href'>;

export function SmartLink({ href, className, style, children, ...rest }: Props) {
  // Default true (new tab) for SSR — switches to false on mobile after hydration
  const [newTab, setNewTab] = useState(true);

  useEffect(() => {
    setNewTab(window.matchMedia('(pointer: fine)').matches);
  }, []);

  const tabProps = newTab
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  const isExternal = href.startsWith('http') || href.startsWith('mailto');

  if (isExternal) {
    return (
      <a href={href} className={className} style={style} {...tabProps} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style} {...tabProps} {...rest}>
      {children}
    </Link>
  );
}
