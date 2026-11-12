import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'onDark';
type Size = 'sm' | 'md' | 'lg' | 'icon';
type Align = 'center' | 'start';

const variants: Record<Variant, string> = {
  primary: 'bg-blue text-white hover:bg-blue-strong active:bg-navy-soft',
  secondary:
    'bg-white text-ink ring-1 ring-inset ring-line-strong hover:bg-mist hover:ring-ink-muted',
  onDark: 'bg-white/10 text-white ring-1 ring-inset ring-white/25 hover:bg-white/20',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-[0.9375rem]',
  lg: 'h-13 px-6 text-base',
  icon: 'size-12 shrink-0',
};

const alignments: Record<Align, string> = {
  center: 'justify-center gap-2',
  start: 'justify-start gap-3',
};

/**
 * Classes d'un bouton. Chaque propriété CSS n'est définie qu'une fois (taille,
 * alignement, couleur) : `extra` sert à ajouter, jamais à remplacer.
 */
export const buttonClasses = (
  variant: Variant = 'primary',
  size: Size = 'md',
  extra?: string,
  align: Align = 'center',
) =>
  cn(
    'inline-flex items-center rounded-[10px] font-medium whitespace-nowrap',
    'transition-colors duration-150 select-none',
    variants[variant],
    sizes[size],
    alignments[align],
    extra,
  );

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  size?: Size;
  align?: Align;
  external?: boolean;
  children: ReactNode;
};

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  align = 'center',
  external = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={buttonClasses(variant, size, className, align)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
    </a>
  );
}
