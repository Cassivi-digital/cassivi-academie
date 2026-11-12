import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import avatar96 from '../../assets/sitraka-ramamonjisoa-avatar-96.webp';
import avatar192 from '../../assets/sitraka-ramamonjisoa-avatar-192.webp';
import { navLinks, site } from '../../data/site';
import { ButtonLink } from '../ui/ButtonLink';
import { Container } from '../ui/Container';

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <a
          href="#top"
          className="flex min-h-11 min-w-0 items-center gap-2.5"
          aria-label={`${site.name} — haut de la page`}
          onClick={() => setOpen(false)}
        >
          <img
            src={avatar96}
            srcSet={`${avatar96} 1x, ${avatar192} 2x`}
            width={36}
            height={36}
            alt=""
            decoding="async"
            className="size-9 shrink-0 rounded-full object-cover ring-1 ring-line"
          />
          <span className="truncate text-[0.9375rem] font-semibold tracking-tight text-ink">
            {site.name}
          </span>
        </a>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-sm text-ink-soft">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="inline-flex min-h-10 items-center transition-colors hover:text-ink">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden sm:block">
            <ButtonLink href="#devis" size="sm">
              Demander un devis
            </ButtonLink>
          </span>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-[10px] text-ink ring-1 ring-inset ring-line-strong transition-colors hover:bg-mist lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            <span className="sr-only">{open ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
          </button>
        </div>
      </Container>

      <div id="menu-mobile" hidden={!open} className="border-t border-line bg-white lg:hidden">
        <Container className="py-3">
          <nav aria-label="Navigation mobile">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="flex min-h-12 items-center border-b border-line text-base text-ink"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <ButtonLink href="#devis" className="mt-4 w-full" onClick={() => setOpen(false)}>
            Demander un devis
          </ButtonLink>
        </Container>
      </div>
    </header>
  );
}
