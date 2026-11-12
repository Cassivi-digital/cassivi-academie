import { ChartNoAxesCombined, Check, MousePointerClick, TrendingUp, type LucideIcon } from 'lucide-react';
import { aiPrinciple, pillars, type Pillar } from '../../data/expertise';
import { Section, SectionHeading } from '../ui/Section';

const icons: Record<Pillar['id'], LucideIcon> = {
  acquisition: MousePointerClick,
  tracking: ChartNoAxesCombined,
  scaling: TrendingUp,
};

export function Pillars() {
  return (
    <Section id="expertise" labelledBy="expertise-titre" tone="mist">
      <SectionHeading
        id="expertise-titre"
        title="Mes trois piliers d'expertise."
        lead="Attirer la bonne audience, mesurer ce qu'elle devient, puis investir là où les résultats sont prouvés."
      />

      <ul className="mt-12 grid gap-5 lg:grid-cols-3">
        {pillars.map((pillar) => {
          const Icon = icons[pillar.id];
          return (
            <li key={pillar.id} className="flex flex-col rounded-2xl border border-line bg-white p-7 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-xl bg-navy text-white">
                  <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="text-caps text-ink-muted">Pilier {pillar.number}</span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-ink">{pillar.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{pillar.summary}</p>
              <ul className="mt-6 flex flex-col gap-2.5 border-t border-line pt-6">
                {pillar.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] leading-snug text-ink">
                    <Check className="mt-0.5 size-4 shrink-0 text-green" strokeWidth={2.5} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <p className="mt-10 max-w-3xl border-l-2 border-blue pl-5 text-xl leading-snug tracking-tight text-ink sm:text-2xl">
        {aiPrinciple}
      </p>
    </Section>
  );
}
