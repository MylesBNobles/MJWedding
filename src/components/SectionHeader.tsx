'use client';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center';
};

export function SectionHeader({ title, subtitle, className = '', align = 'left' }: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className={`mb-8 ${alignClass} ${className}`}>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-fg">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-muted text-base sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
