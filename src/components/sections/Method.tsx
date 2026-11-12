import { methodSteps } from '../../data/expertise';
import { useEntrance } from '../../hooks/useEntrance';
import { cn } from '../../lib/cn';
import { Section, SectionHeading } from '../ui/Section';

export function Method() {
  const { ref, phase } = useEntrance<HTMLOListElement>(0.35);
  const armed = phase === 'armed';

  return (
    <Section id="methode" labelledBy="methode-titre">
      <SectionHeading
        id="methode-titre"
        title="De l'analyse à la croissance&nbsp;: ma méthode de pilotage."
      />

      <ol ref={ref} className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
        {methodSteps.map((step, index) => {
          const isLast = index === methodSteps.length - 1;
          const delay = `${index * 450}ms`;
          return (
            <li key={step.number} className="relative pl-[4.5rem] md:pl-0 md:pt-[4.5rem]">
              {/* Trait de liaison vers l'étape suivante */}
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-10 left-6 top-12 w-px bg-line-strong md:-right-8 md:bottom-auto md:left-12 md:top-6 md:h-px md:w-auto"
                >
                  <span
                    className={cn(
                      'absolute inset-0 origin-top bg-blue transition-transform duration-700 ease-out md:origin-left',
                      armed && 'scale-y-0 md:scale-x-0 md:scale-y-100',
                    )}
                    style={{ transitionDelay: `${index * 450 + 250}ms` }}
                  />
                </span>
              ) : null}

              <span
                aria-hidden="true"
                className={cn(
                  'nums absolute left-0 top-0 flex size-12 items-center justify-center rounded-full text-sm font-semibold',
                  'transition-colors duration-500',
                  armed ? 'bg-white text-ink-muted ring-1 ring-inset ring-line-strong' : 'bg-navy text-white',
                )}
                style={{ transitionDelay: delay }}
              >
                {step.number}
              </span>

              <h3 className="text-2xl font-semibold tracking-tight text-ink">
                <span className="sr-only">Étape {index + 1}&nbsp;: </span>
                {step.title}
              </h3>
              <p className="mt-3 max-w-sm leading-relaxed text-ink-soft">{step.description}</p>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
