import { useEffect, useState } from 'react';
import { whatsappUrl } from '../../data/site';
import { cn } from '../../lib/cn';
import { WhatsAppIcon } from '../ui/BrandIcons';
import { ButtonLink } from '../ui/ButtonLink';

/**
 * Barre d'action fixe, sur mobile et tablette uniquement. Elle apparaît quand
 * les boutons du haut de page ne sont plus visibles et s'efface dès que le
 * formulaire ou le pied de page sont à l'écran, pour ne jamais les recouvrir.
 */
export function MobileCtaBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('hero-actions');
    const form = document.getElementById('devis');
    const footer = document.getElementById('contact');
    if (!hero || !form || !footer || typeof IntersectionObserver === 'undefined') return;

    const state = { pastHero: false, form: false, footer: false };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) {
          state.pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        } else if (entry.target === form) {
          state.form = entry.isIntersecting;
        } else {
          state.footer = entry.isIntersecting;
        }
      }
      setVisible(state.pastHero && !state.form && !state.footer);
    });
    [hero, form, footer].forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      inert={!visible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pt-3 backdrop-blur-md transition-transform duration-300 lg:hidden',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      <div className="mx-auto flex max-w-xl gap-2.5">
        <ButtonLink href="#devis" className="flex-1">
          Demander un devis
        </ButtonLink>
        <ButtonLink
          href={whatsappUrl}
          external
          variant="secondary"
          size="icon"
          aria-label="Écrire sur WhatsApp (nouvel onglet)"
        >
          <WhatsAppIcon className="size-5" />
        </ButtonLink>
      </div>
    </div>
  );
}
