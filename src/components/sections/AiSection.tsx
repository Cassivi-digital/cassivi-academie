import { CodeXml, PenLine, Plug, ScanSearch, Workflow, type LucideIcon } from 'lucide-react';
import { aiUsages, type AiUsage } from '../../data/expertise';
import { Section, SectionHeading } from '../ui/Section';

const icons: Record<AiUsage['id'], LucideIcon> = {
  analysis: ScanSearch,
  skills: Plug,
  code: CodeXml,
  content: PenLine,
  automation: Workflow,
};

export function AiSection() {
  return (
    <Section id="ia" labelledBy="ia-titre" tone="mist">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <div>
          <SectionHeading
            id="ia-titre"
            title="L'intelligence artificielle au service de la performance marketing."
          />
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            L'IA me fait gagner du temps sur l'analyse, la production et les tâches répétitives. C'est
            un outil d'accélération&nbsp;: elle ne remplace ni l'analyse humaine, ni la décision.
          </p>
        </div>

        <ul className="rounded-2xl border border-line bg-white px-6 sm:px-8">
          {aiUsages.map((usage) => {
            const Icon = icons[usage.id];
            return (
              <li key={usage.id} className="flex gap-4 border-b border-line py-5 last:border-b-0 sm:gap-5 sm:py-6">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-tint text-blue">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold leading-snug text-ink">{usage.title}</h3>
                  <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-soft">{usage.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
