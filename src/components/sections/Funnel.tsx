import { useState, type ReactNode } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { funnelStages, inputs, metrics, type FunnelStage } from '../../data/caseStudy';
import { useEntrance } from '../../hooks/useEntrance';
import { cn } from '../../lib/cn';
import { formatEuro, formatNumber, formatRate } from '../../lib/format';
import { Section, SectionHeading } from '../ui/Section';

/** Du volume le plus large au résultat final : bleu de plus en plus clair, puis vert. */
const stageColors = ['bg-navy', 'bg-navy-soft', 'bg-blue-strong', 'bg-blue', 'bg-green-strong'];

/**
 * Largeur des barres : échelle logarithmique, ramenée entre 46 % et 100 %.
 * Avec une échelle linéaire, 10 clients sur 1 500 clics seraient invisibles.
 */
const MIN_WIDTH = 46;
const logMin = Math.log(funnelStages[funnelStages.length - 1].value);
const logMax = Math.log(funnelStages[0].value);
const widthOf = (value: number) =>
  Math.round(
    (MIN_WIDTH + (100 - MIN_WIDTH) * ((Math.log(value) - logMin) / (logMax - logMin))) * 10,
  ) / 10;

export function Funnel() {
  const [selectedIndex, setSelectedIndex] = useState(funnelStages.length - 1);
  const { ref, phase } = useEntrance<HTMLOListElement>(0.2);
  const armed = phase === 'armed';
  const selected = funnelStages[selectedIndex];

  return (
    <Section id="funnel" labelledBy="funnel-titre" tone="mist">
      <SectionHeading
        id="funnel-titre"
        title="Du clic au client signé."
        lead="Le parcours commercial complet, avec le taux de passage entre chaque étape. Sélectionnez une étape pour afficher son détail."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-12">
        <ol ref={ref} className="flex flex-col items-center">
          {funnelStages.map((stage, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li key={stage.id} className="flex w-full flex-col items-center">
                {stage.rate ? <RateConnector rate={stage.rate} armed={armed} index={index} /> : null}

                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-controls="funnel-detail"
                  onClick={() => setSelectedIndex(index)}
                  style={{ width: `${widthOf(stage.value)}%`, transitionDelay: `${index * 110}ms` }}
                  className={cn(
                    'flex min-h-[4.5rem] origin-center flex-col items-center justify-center gap-x-3 rounded-xl px-3 py-3 text-white',
                    'transition-[transform,opacity,filter] duration-700 ease-out sm:flex-row',
                    'outline-offset-4 hover:brightness-110',
                    stageColors[index],
                    armed && 'scale-x-0 opacity-0',
                    isSelected && 'ring-2 ring-ink ring-offset-[3px] ring-offset-mist',
                  )}
                >
                  <span className="text-[1.75rem] font-semibold leading-none tracking-tight sm:text-[2rem]">
                    {formatNumber(stage.value)}
                  </span>
                  <span className="mt-1 text-[0.8125rem] font-medium leading-tight text-white/90 sm:mt-0 sm:text-sm">
                    {stage.label}
                  </span>
                </button>

                {/* Sur mobile, le détail s'ouvre juste sous l'étape sélectionnée. */}
                {isSelected ? (
                  <div className="mt-3 w-full rounded-xl border border-line bg-white p-5 lg:hidden">
                    <StageDetail stage={stage} index={index} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>

        <aside
          id="funnel-detail"
          aria-live="polite"
          aria-label="Détail de l'étape sélectionnée"
          className="hidden rounded-2xl border border-line bg-white p-8 lg:sticky lg:top-24 lg:block"
        >
          <StageDetail stage={selected} index={selectedIndex} />
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedIndex((value) => Math.max(0, value - 1))}
              disabled={selectedIndex === 0}
              className="inline-flex h-10 items-center gap-1 rounded-[10px] pl-2 pr-3 text-sm font-medium text-ink ring-1 ring-inset ring-line-strong transition-colors hover:bg-mist disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Étape précédente
            </button>
            <button
              type="button"
              onClick={() => setSelectedIndex((value) => Math.min(funnelStages.length - 1, value + 1))}
              disabled={selectedIndex === funnelStages.length - 1}
              className="inline-flex h-10 items-center gap-1 rounded-[10px] pl-3 pr-2 text-sm font-medium text-ink ring-1 ring-inset ring-line-strong transition-colors hover:bg-mist disabled:opacity-40 disabled:hover:bg-white"
            >
              Étape suivante
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </aside>
      </div>

      <p className="mt-10 max-w-3xl border-l-2 border-green pl-5 text-lg leading-relaxed text-ink">
        Sur {formatNumber(inputs.qualifiedLeads)} leads qualifiés, {formatNumber(inputs.customers)} ont
        signé&nbsp;: un taux clients / leads qualifiés de{' '}
        <strong className="font-semibold">{formatRate(metrics.qualifiedToCustomerRate)}</strong>.
      </p>
    </Section>
  );
}

function RateLabel({ label }: { label: string }) {
  const [before, after] = label.split(' → ');
  if (!after) return <>{label}</>;
  return (
    <>
      {before}
      <ArrowRight className="mx-1 inline size-3 align-[-1px]" aria-hidden="true" />
      <span className="sr-only">vers </span>
      {after}
    </>
  );
}

function RateConnector({
  rate,
  armed,
  index,
}: {
  rate: NonNullable<FunnelStage['rate']>;
  armed: boolean;
  index: number;
}) {
  return (
    <div
      className={cn('flex flex-col items-center transition-opacity duration-500', armed && 'opacity-0')}
      style={{ transitionDelay: `${index * 110 + 200}ms` }}
    >
      <span className="h-3 w-px bg-line-strong" aria-hidden="true" />
      <p className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-soft sm:text-[0.8125rem]">
        <span>
          <RateLabel label={rate.label} />
        </span>
        <strong className="nums font-semibold text-ink">{formatRate(rate.value)}</strong>
      </p>
      <span className="h-3 w-px bg-line-strong" aria-hidden="true" />
    </div>
  );
}

function StageDetail({ stage, index }: { stage: FunnelStage; index: number }) {
  const previous = index > 0 ? funnelStages[index - 1] : null;

  return (
    <div>
      <p className="text-sm text-ink-muted">
        Étape {index + 1} sur {funnelStages.length}
      </p>
      <h3 className="mt-1 flex items-baseline gap-3 text-ink">
        <span className="text-5xl font-semibold leading-none tracking-tight">
          {formatNumber(stage.value)}
        </span>
        <span className="text-h3">{stage.label.toLowerCase()}</span>
      </h3>
      <p className="mt-4 leading-relaxed text-ink-soft">{stage.description}</p>

      <dl className="mt-5 border-t border-line">
        {stage.rate && previous ? (
          <DetailRow
            label={<RateLabel label={stage.rate.label} />}
            value={formatRate(stage.rate.value)}
            formula={`${formatNumber(stage.value)} ÷ ${formatNumber(previous.value)}`}
          />
        ) : null}
        {index > 1 ? (
          <DetailRow
            label="Part des clics de départ"
            value={formatRate(stage.value / inputs.clicks)}
            formula={`${formatNumber(stage.value)} ÷ ${formatNumber(inputs.clicks)}`}
          />
        ) : null}
        {stage.id === 'customers' ? (
          <DetailRow
            label="Taux clients / leads qualifiés"
            value={formatRate(metrics.qualifiedToCustomerRate)}
            formula={`${formatNumber(inputs.customers)} ÷ ${formatNumber(inputs.qualifiedLeads)}`}
          />
        ) : null}
        <DetailRow
          label={stage.unitCost.label}
          value={formatEuro(stage.unitCost.value, stage.unitCost.decimals)}
          formula={`${formatEuro(inputs.budget)} ÷ ${formatNumber(stage.value)}`}
        />
      </dl>
    </div>
  );
}

function DetailRow({
  label,
  value,
  formula,
}: {
  label: ReactNode;
  value: string;
  formula: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3">
      <dt className="text-sm text-ink-soft">
        {label}
        <span className="nums mt-0.5 block text-xs text-ink-muted">{formula}</span>
      </dt>
      <dd className="nums whitespace-nowrap text-lg font-semibold text-ink">{value}</dd>
    </div>
  );
}
