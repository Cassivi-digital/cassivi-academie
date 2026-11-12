import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Container } from './Container';

type SectionProps = {
  id: string;
  /** Identifiant du titre, pour relier la section à son intitulé. */
  labelledBy: string;
  tone?: 'white' | 'mist';
  children: ReactNode;
  className?: string;
};

export function Section({ id, labelledBy, tone = 'white', children, className }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'scroll-mt-16 py-16 sm:py-24 lg:py-28',
        tone === 'mist' ? 'bg-mist' : 'bg-white',
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

type SectionHeadingProps = {
  id: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
};

export function SectionHeading({ id, title, lead, className }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-3xl', className)}>
      <h2 id={id} className="text-h2 text-ink">
        {title}
      </h2>
      {lead ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{lead}</p> : null}
    </div>
  );
}
