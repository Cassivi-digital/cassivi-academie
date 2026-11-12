import { Check } from 'lucide-react';
import {
  statusLabels,
  trackingSteps,
  trackingTools,
  type TrackingStatus,
} from '../../data/tracking';
import { useInViewport } from '../../hooks/useInViewport';
import { cn } from '../../lib/cn';
import { Section, SectionHeading } from '../ui/Section';

/** Durée d'un cycle complet de l'animation : le signal descend, puis remonte vers Google Ads. */
const CYCLE_SECONDS = 4.8;
const SLOT = 0.12;

export function Tracking() {
  // Les animations en boucle ne tournent que lorsque le schéma est à l'écran.
  const { ref, inViewport } = useInViewport<HTMLElement>();

  return (
    <Section id="tracking" labelledBy="tracking-titre">
      <SectionHeading
        id="tracking-titre"
        title="Je ne mesure pas seulement les formulaires. Je mesure leur qualité."
        lead="Un formulaire envoyé n'est pas encore un client. Cette architecture relie chaque clic publicitaire à ce qu'il devient&nbsp;: un lead qualifié, un devis, une signature."
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-14">
        <figure
          ref={ref}
          className={cn(
            'tracking-flow m-0 rounded-2xl border border-line bg-white p-5 sm:p-8',
            inViewport && 'is-active',
          )}
        >
          <figcaption className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line pb-5">
            <h3 className="text-base font-semibold text-ink">Du clic à la conversion qualifiée</h3>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft" aria-label="Légende">
              {(Object.keys(statusLabels) as TrackingStatus[]).map((status) => (
                <li key={status} className="inline-flex items-center gap-2">
                  <StatusNode status={status} small />
                  {statusLabels[status]}
                </li>
              ))}
            </ul>
          </figcaption>

          <ol className="mt-6">
            {trackingSteps.map((step, index) => {
              const isFirst = index === 0;
              const isLast = index === trackingSteps.length - 1;
              return (
                <li
                  key={step.id}
                  className="grid grid-cols-[1.25rem_2.5rem_minmax(0,1fr)] sm:grid-cols-[1.75rem_2.75rem_minmax(0,1fr)]"
                >
                  {/* Boucle de retour vers Google Ads */}
                  <div className="relative" aria-hidden="true">
                    <span
                      className={cn(
                        'loop-rail absolute left-1/2 w-0.5 -translate-x-1/2',
                        isFirst && 'bottom-0 top-7',
                        isLast && 'top-0 h-7',
                        !isFirst && !isLast && 'inset-y-0',
                      )}
                    />
                    {isFirst || isLast ? (
                      <span className="loop-stub absolute -right-2 left-1/2 top-7 h-0.5 -translate-y-1/2" />
                    ) : null}
                    {isFirst ? (
                      <span className="absolute -right-2.5 top-7 size-0 -translate-y-1/2 border-y-[5px] border-l-[7px] border-y-transparent border-l-blue" />
                    ) : null}
                  </div>

                  {/* Fil principal */}
                  <div className="relative flex justify-center" aria-hidden="true">
                    {!isFirst ? <span className="absolute top-0 h-7 w-px bg-line-strong" /> : null}
                    {!isLast ? <span className="absolute bottom-0 top-7 w-px bg-line-strong" /> : null}
                    {!isLast ? (
                      <span
                        className="flow-pulse absolute bottom-0 top-7 w-2"
                        style={{
                          animationDuration: `${CYCLE_SECONDS}s`,
                          animationDelay: `${(index * SLOT * CYCLE_SECONDS).toFixed(2)}s`,
                        }}
                      >
                        <span className="block size-2 -translate-y-1/2 rounded-full bg-blue" />
                      </span>
                    ) : null}
                    <span className="relative z-10 mt-3.5">
                      <StatusNode status={step.status} />
                    </span>
                  </div>

                  <div className={cn('pl-2 pt-3', !isLast && 'pb-6')}>
                    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="font-semibold leading-snug text-ink">{step.title}</span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
                          step.status === 'realise'
                            ? 'bg-green-tint text-green-strong'
                            : 'bg-blue-tint text-blue-strong',
                        )}
                      >
                        {step.status === 'realise' ? 'Réalisé' : 'Recommandé'}
                      </span>
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.caption}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </figure>

        <div>
          <h3 className="text-h3 text-ink">Le rôle de chaque outil</h3>
          <dl className="mt-5 border-t border-line">
            {trackingTools.map((tool) => (
              <div
                key={tool.id}
                className="grid gap-x-6 gap-y-1 border-b border-line py-4 sm:grid-cols-[9.5rem_minmax(0,1fr)]"
              >
                <dt className="font-semibold text-ink">{tool.name}</dt>
                <dd className="leading-relaxed text-ink-soft">{tool.role}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 rounded-xl bg-mist p-5 sm:p-6">
            <h3 className="text-base font-semibold text-ink">Ce qui est réalisé, ce qui est recommandé</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Sur le cas client présenté plus haut, la chaîne va de l'annonce Google Ads jusqu'à la
              conversion mesurée. La centralisation des prospects dans HubSpot et le renvoi des
              conversions qualifiées vers Google Ads décrivent l'architecture que je recommande pour
              l'étape suivante&nbsp;: ils ne sont pas présentés comme déployés chez ce client.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function StatusNode({ status, small = false }: { status: TrackingStatus; small?: boolean }) {
  const size = small ? 'size-4' : 'size-7';
  if (status === 'realise') {
    return (
      <span className={cn('flex items-center justify-center rounded-full bg-green text-white', size)}>
        <Check className={small ? 'size-2.5' : 'size-4'} strokeWidth={3} aria-hidden="true" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-full border-2 border-dashed border-blue bg-white',
        size,
      )}
    >
      <span className={cn('rounded-full bg-blue', small ? 'size-1' : 'size-2')} />
    </span>
  );
}
