import type { ReactNode } from 'react';
import { Mail } from 'lucide-react';
import { mailtoUrl, navLinks, site, whatsappUrl } from '../../data/site';
import { LinkedInIcon, WhatsAppIcon } from '../ui/BrandIcons';
import { ButtonLink } from '../ui/ButtonLink';
import { Container } from '../ui/Container';

export function Footer() {
  return (
    <footer id="contact" className="scroll-mt-16 bg-navy text-white">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
          <div>
            <h2 className="text-h2">{site.name}</h2>
            <p className="mt-4 text-lg text-blue-soft">{site.tagline}.</p>
            <p className="mt-8 max-w-md leading-relaxed text-white/80">
              Un projet d'acquisition, un compte Google Ads à reprendre ou un poste à pourvoir&nbsp;? Écrivez-moi
              par le canal qui vous convient.
            </p>
          </div>

          <ul className="flex flex-col gap-3" aria-label="Me contacter">
            <li>
              <ButtonLink href={mailtoUrl} variant="onDark" size="lg" align="start" className="w-full">
                <Mail className="size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span className="sr-only">E-mail&nbsp;: </span>
                <span className="truncate">{site.email}</span>
              </ButtonLink>
            </li>
            <li>
              <ButtonLink
                href={whatsappUrl}
                external
                variant="onDark"
                size="lg"
                align="start"
                className="w-full"
              >
                <WhatsAppIcon className="size-5 shrink-0" />
                <span>
                  WhatsApp <span className="text-white/70">{site.whatsappDisplay}</span>
                </span>
                <span className="sr-only">(nouvel onglet)</span>
              </ButtonLink>
            </li>
            <li>
              <ButtonLink
                href={site.linkedinUrl}
                external
                variant="onDark"
                size="lg"
                align="start"
                className="w-full"
              >
                <LinkedInIcon className="size-5 shrink-0" />
                LinkedIn
                <span className="sr-only">(nouvel onglet)</span>
              </ButtonLink>
            </li>
          </ul>
        </div>

        <details
          id="confidentialite"
          className="group mt-14 scroll-mt-20 rounded-xl border border-white/15 open:bg-white/5"
        >
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 text-sm font-medium [&::-webkit-details-marker]:hidden">
            Politique de confidentialité
            <span
              aria-hidden="true"
              className="text-lg leading-none text-blue-soft transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="grid gap-x-10 gap-y-5 px-5 pb-6 pt-1 text-sm leading-relaxed text-white/80 sm:grid-cols-2">
            <PolicyItem title="Responsable du traitement">
              {site.name}. Contact&nbsp;: {site.email}.
            </PolicyItem>
            <PolicyItem title="Données collectées">
              Uniquement celles que vous saisissez dans le formulaire de demande de devis&nbsp;: identité,
              coordonnées, entreprise et description du projet.
            </PolicyItem>
            <PolicyItem title="Finalité et base légale">
              Traiter votre demande et vous recontacter au sujet de votre projet. Le traitement repose
              sur votre consentement, donné en cochant la case du formulaire.
            </PolicyItem>
            <PolicyItem title="Destinataires">
              Vos données me sont destinées. Elles transitent par Netlify, qui héberge le site et
              enregistre les envois du formulaire. Elles ne sont ni vendues, ni cédées.
            </PolicyItem>
            <PolicyItem title="Durée de conservation">
              Le temps nécessaire au traitement de votre demande, puis trois ans au maximum après notre
              dernier échange.
            </PolicyItem>
            <PolicyItem title="Vos droits">
              Accès, rectification, effacement et retrait du consentement à tout moment, sur simple
              demande par e-mail.
            </PolicyItem>
            <PolicyItem title="Cookies et mesure d'audience">
              Ce site ne dépose aucun cookie de suivi et n'utilise aucun outil de mesure d'audience. Les
              polices sont hébergées sur le site&nbsp;: aucune requête n'est envoyée à un service tiers.
            </PolicyItem>
          </div>
        </details>

        <div className="mt-8 flex flex-col gap-5 border-t border-white/15 pt-8 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <p>
            © {site.name}. {site.role}, Google Ads.
          </p>
          <nav aria-label="Navigation de pied de page">
            <ul className="flex flex-wrap gap-x-6">
              {navLinks
                .filter((link) => link.href !== '#contact')
                .map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="inline-flex min-h-10 items-center transition-colors hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              <li>
                <a href="#devis" className="inline-flex min-h-10 items-center transition-colors hover:text-white">
                  Demander un devis
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}

function PolicyItem({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1">{children}</p>
    </div>
  );
}
