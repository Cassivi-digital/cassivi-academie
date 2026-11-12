import type { ReactNode } from 'react';
import { Mail } from 'lucide-react';
import portrait320 from '../../assets/sitraka-ramamonjisoa-portrait-320.webp';
import portrait480 from '../../assets/sitraka-ramamonjisoa-portrait-480.webp';
import portrait640 from '../../assets/sitraka-ramamonjisoa-portrait-640.webp';
import { mailtoUrl, site, whatsappUrl } from '../../data/site';
import { LinkedInIcon, WhatsAppIcon } from '../ui/BrandIcons';
import { Section, SectionHeading } from '../ui/Section';
import { QuoteForm } from './QuoteForm';

export function QuoteSection() {
  return (
    <Section id="devis" labelledBy="devis-titre">
      <SectionHeading
        id="devis-titre"
        title="Vous avez un objectif d'acquisition&nbsp;? Construisons votre stratégie."
        lead="Présentez-moi votre projet et vos objectifs. Je vous recontacterai pour échanger sur les solutions adaptées à votre activité."
      />

      <div className="mt-12 grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr]">
        <figure className="m-0 flex items-center gap-5 lg:col-start-1 lg:row-start-1 lg:block">
          <img
            src={portrait480}
            srcSet={`${portrait320} 320w, ${portrait480} 480w, ${portrait640} 640w`}
            sizes="(min-width: 1024px) 352px, (min-width: 640px) 144px, 112px"
            width={640}
            height={800}
            loading="lazy"
            decoding="async"
            alt={`Portrait de ${site.name}, ${site.role}`}
            className="aspect-[4/5] w-28 shrink-0 rounded-2xl object-cover sm:w-36 lg:w-full lg:max-w-[22rem]"
          />
          <figcaption className="lg:mt-5">
            <p className="text-lg font-semibold tracking-tight text-ink">{site.name}</p>
            <p className="text-sm text-ink-muted">{site.role}, certifié Google Ads</p>
            <p className="mt-2 max-w-xs text-[0.9375rem] leading-relaxed text-ink-soft">
              Vous échangez directement avec moi, du premier message au suivi des campagnes.
            </p>
          </figcaption>
        </figure>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <QuoteForm />
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <h3 className="text-base font-semibold text-ink">Vous préférez un contact direct&nbsp;?</h3>
          <ul className="mt-3 flex flex-col border-t border-line">
            <ContactRow
              href={whatsappUrl}
              external
              icon={<WhatsAppIcon className="size-5" />}
              label="WhatsApp"
              value={site.whatsappDisplay}
            />
            <ContactRow
              href={mailtoUrl}
              icon={<Mail className="size-5" strokeWidth={1.75} aria-hidden="true" />}
              label="E-mail"
              value={site.email}
            />
            <ContactRow
              href={site.linkedinUrl}
              external
              icon={<LinkedInIcon className="size-5" />}
              label="LinkedIn"
              value="Voir mon profil"
            />
          </ul>
        </div>
      </div>
    </Section>
  );
}

function ContactRow({
  href,
  icon,
  label,
  value,
  external = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <li className="border-b border-line">
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group flex min-h-14 items-center gap-3.5 py-2 text-ink transition-colors hover:text-blue-strong"
      >
        <span className="text-ink-soft transition-colors group-hover:text-blue-strong">{icon}</span>
        <span className="w-20 shrink-0 text-sm text-ink-muted">{label}</span>
        <span className="min-w-0 truncate font-medium">{value}</span>
        {external ? <span className="sr-only">(nouvel onglet)</span> : null}
      </a>
    </li>
  );
}
