import { lazy, Suspense } from 'react';
import { Lock, Search } from 'lucide-react';
import {
  acquisitionKpis,
  caseStudyMeta,
  inputs,
  metrics,
  roas,
  salesKpis,
  type Kpi,
} from '../../data/caseStudy';
import { useNearViewport } from '../../hooks/useNearViewport';
import { formatEuro, formatMultiple } from '../../lib/format';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Section, SectionHeading } from '../ui/Section';

const BudgetRevenueChart = lazy(() => import('../charts/BudgetRevenueChart'));

export function CaseStudy() {
  return (
    <Section id="etude-de-cas" labelledBy="etude-de-cas-titre" className="border-t border-line">
      <SectionHeading id="etude-de-cas-titre" title="Transformer les clics en chiffre d'affaires." />

      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Contexte de l'étude de cas">
        {caseStudyMeta.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-line-strong px-3 py-1 text-sm text-ink-soft"
          >
            {tag}
          </li>
        ))}
      </ul>

      <p className="mt-5 flex max-w-2xl items-start gap-2 text-sm leading-relaxed text-ink-muted">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {caseStudyMeta.confidentiality}
      </p>

      <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <RoasPanel />
        <BudgetRevenuePanel />
      </div>

      <CampaignResults />
    </Section>
  );
}

function RoasPanel() {
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-navy p-7 text-white sm:p-9">
      <div>
        <p className="text-sm text-blue-soft">Retour sur les dépenses publicitaires</p>
        <p className="mt-3 flex items-baseline gap-3">
          <span className="text-[clamp(5.5rem,4rem+8vw,9rem)] font-semibold leading-[0.9] tracking-[-0.06em]">
            <AnimatedNumber value={metrics.roas} format={(v) => formatMultiple(v)} duration={1600} />
          </span>
          <span className="text-2xl font-medium tracking-tight text-blue-soft sm:text-3xl">ROAS</span>
        </p>
        <p className="mt-6 max-w-sm text-xl leading-snug tracking-tight sm:text-2xl">{roas.sentence}</p>
      </div>

      <div className="mt-9 border-t border-white/15 pt-5 text-sm leading-relaxed text-blue-soft">
        <p className="nums text-white">
          {roas.formula} = {roas.display}, soit {roas.percent}
        </p>
        <p className="mt-2">
          Le ROAS rapporte le chiffre d'affaires aux dépenses publicitaires. Ce n'est pas un bénéfice
          net&nbsp;: les autres coûts de l'entreprise n'y figurent pas.
        </p>
      </div>
    </div>
  );
}

function BudgetRevenuePanel() {
  const { ref, near } = useNearViewport<HTMLDivElement>();

  return (
    <figure className="m-0 flex flex-col rounded-2xl border border-line bg-white p-7 sm:p-9">
      <figcaption>
        <h3 className="text-h3 text-ink">Budget investi et chiffre d'affaires généré</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {formatEuro(inputs.budget)} de publicité, {formatEuro(metrics.revenue)} de chiffre d'affaires
          signé&nbsp;: les deux montants à la même échelle.
        </p>
      </figcaption>

      <div ref={ref} className="mt-6 min-h-[13.5rem] w-full flex-1" aria-hidden="true">
        {near ? (
          <Suspense fallback={<ChartPlaceholder />}>
            <BudgetRevenueChart />
          </Suspense>
        ) : (
          <ChartPlaceholder />
        )}
      </div>

      <div className="sr-only">
        <table>
          <caption>Budget publicitaire investi et chiffre d'affaires généré</caption>
          <tbody>
            <tr>
              <th scope="row">Budget publicitaire investi</th>
              <td>{formatEuro(inputs.budget)}</td>
            </tr>
            <tr>
              <th scope="row">Chiffre d'affaires généré</th>
              <td>{formatEuro(metrics.revenue)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/** Occupe la place du graphique tant que Recharts n'est pas chargé. */
function ChartPlaceholder() {
  return (
    <div className="flex h-full flex-col justify-center gap-9 pb-7">
      <div className="h-6 w-[7%] rounded-r bg-mist" />
      <div className="h-6 w-[80%] rounded-r bg-mist" />
    </div>
  );
}

function CampaignResults() {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-blue-tint text-blue">
            <Search className="size-[1.125rem]" aria-hidden="true" />
          </span>
          <h3 className="text-base font-semibold leading-tight text-ink">
            Résultats de la campagne
            <span className="block text-sm font-normal text-ink-muted">
              {caseStudyMeta.campaign}, {caseStudyMeta.sector.toLowerCase()}, {caseStudyMeta.location}
            </span>
          </h3>
        </div>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-xs text-ink-soft">
          <Lock className="size-3" aria-hidden="true" />
          Données anonymisées
        </p>
      </div>

      <KpiGroup title="Acquisition" subtitle="Ce que la campagne a produit dans Google Ads" kpis={acquisitionKpis} />
      <KpiGroup
        title="Transformation commerciale"
        subtitle="Ce que les formulaires sont devenus"
        kpis={salesKpis}
        highlightId="revenue"
      />

      <p className="border-t border-line bg-mist/60 px-5 py-3 text-xs leading-relaxed text-ink-muted sm:px-7">
        Tableau de bord reconstitué à partir des chiffres de la campagne. Ce n'est pas une capture
        d'écran de l'interface Google Ads.
      </p>
    </div>
  );
}

function KpiGroup({
  title,
  subtitle,
  kpis,
  highlightId,
}: {
  title: string;
  subtitle: string;
  kpis: Kpi[];
  highlightId?: string;
}) {
  return (
    <div className="border-t border-line first:border-t-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 pb-3 pt-5 sm:px-7">
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
        <p className="text-sm text-ink-muted">{subtitle}</p>
      </div>
      <dl className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => {
          const highlighted = kpi.id === highlightId;
          return (
            <div
              key={kpi.id}
              className={`flex flex-col px-5 py-5 sm:px-7 lg:px-5 xl:px-6 ${
                highlighted ? 'bg-green-tint' : 'bg-white'
              }`}
            >
              <dt className="min-h-[2.25rem] text-[0.8125rem] leading-snug text-ink-soft">{kpi.label}</dt>
              <dd
                className={`mt-1 text-[1.625rem] font-semibold leading-tight tracking-tight sm:text-[1.75rem] ${
                  highlighted ? 'text-green-strong' : 'text-ink'
                }`}
              >
                <AnimatedNumber value={kpi.value} format={kpi.format} />
              </dd>
              {kpi.formula ? (
                <dd className="nums mt-1.5 text-xs leading-snug text-ink-muted">{kpi.formula}</dd>
              ) : null}
            </div>
          );
        })}
      </dl>
    </div>
  );
}
