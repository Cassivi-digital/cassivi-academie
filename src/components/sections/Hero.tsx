import { Fragment, type ReactNode } from 'react';
import { ArrowDown, BadgeCheck, Lock, Search } from 'lucide-react';
import { caseStudyMeta, inputs, metrics } from '../../data/caseStudy';
import { formatEuro, formatMultiple, formatNumber } from '../../lib/format';
import { CumulativeChart } from '../charts/CumulativeChart';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ButtonLink } from '../ui/ButtonLink';
import { Container } from '../ui/Container';

const badge = ['PPC Specialist', 'Google Ads', 'Performance Marketing'];

const dashboardKpis = [
  { label: 'Budget investi', value: inputs.budget, format: (v: number) => formatEuro(v) },
  { label: 'Conversions', value: inputs.forms, format: (v: number) => formatNumber(v) },
  { label: 'Coût par lead', value: metrics.cpl, format: (v: number) => formatEuro(v) },
];

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="bg-white">
      <Container className="grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,1fr)] lg:gap-14 lg:pb-24 lg:pt-20">
        <div>
          <p className="text-caps text-blue-strong sm:inline-flex sm:items-center sm:rounded-full sm:bg-blue-tint sm:px-3.5 sm:py-1.5 sm:ring-1 sm:ring-inset sm:ring-blue-soft">
            {badge.map((part, index) => (
              <Fragment key={part}>
                {/* Chaque mention reste entière : le retour à la ligne se fait entre deux mentions. */}
                <span className="whitespace-nowrap">
                  {part}
                  {index < badge.length - 1 ? (
                    <span aria-hidden="true" className="mx-2 text-blue-soft sm:text-blue/40">
                      |
                    </span>
                  ) : null}
                </span>
                <wbr />
              </Fragment>
            ))}
          </p>

          <h1 id="hero-title" className="text-display mt-5 text-ink sm:mt-6">
            Je transforme Google Ads en un véritable levier d'acquisition rentable.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            J'aide les entreprises à attirer des prospects qualifiés, mesurer leurs performances et
            optimiser leurs investissements publicitaires grâce à une approche orientée données et
            résultats commerciaux.
          </p>

          <div id="hero-actions" className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#etude-de-cas" size="lg">
              Découvrir mon étude de cas
              <ArrowDown className="size-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="#devis" variant="secondary" size="lg">
              Demander un devis
            </ButtonLink>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-6 border-t border-line pt-8 sm:mt-12 sm:flex-nowrap sm:gap-x-0">
            <Indicator value="3 ans" label="d'expérience" />
            <Indicator value={`+${formatEuro(100000)}`} label="de budgets publicitaires gérés" />
            <Indicator
              value="Google Ads"
              label="Certified"
              icon={<BadgeCheck className="size-5 text-green" aria-hidden="true" />}
            />
          </dl>
        </div>

        <HeroDashboard />
      </Container>
    </section>
  );
}

function Indicator({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col-reverse justify-end sm:border-l sm:border-line sm:px-5 sm:first:border-l-0 sm:first:pl-0 xl:px-6">
      <dt className="text-caps mt-1.5 max-w-[10.5rem] text-ink-muted">{label}</dt>
      <dd className="flex items-center gap-1.5 whitespace-nowrap text-[1.375rem] font-semibold uppercase leading-tight tracking-tight text-ink sm:text-2xl">
        {value}
        {icon}
      </dd>
    </div>
  );
}

function HeroDashboard() {
  return (
    <div
      className="animate-rise rounded-2xl border border-line bg-white shadow-float"
      role="group"
      aria-label="Tableau de bord de l'étude de cas"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-blue-tint text-blue">
            <Search className="size-[1.125rem]" aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold leading-tight text-ink">
            {caseStudyMeta.campaign}
            <span className="block font-normal text-ink-muted">
              {caseStudyMeta.sector}, Lyon
            </span>
          </p>
        </div>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-xs text-ink-soft">
          <Lock className="size-3" aria-hidden="true" />
          Données anonymisées
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        {dashboardKpis.map((kpi) => (
          <div key={kpi.label} className="flex flex-col-reverse justify-end bg-white px-5 py-4">
            <dt className="mt-1 text-xs text-ink-muted">{kpi.label}</dt>
            <dd className="text-2xl font-semibold tracking-tight text-ink">
              <AnimatedNumber value={kpi.value} format={kpi.format} />
            </dd>
          </div>
        ))}
        <div className="flex flex-col-reverse justify-end bg-green-tint px-5 py-4">
          <dt className="mt-1 text-xs text-green-strong">ROAS</dt>
          <dd className="text-2xl font-semibold tracking-tight text-green-strong">
            <AnimatedNumber value={metrics.roas} format={(v) => formatMultiple(v)} />
          </dd>
        </div>
      </dl>

      <div className="border-t border-line px-5 pb-5 pt-5 sm:px-6">
        <CumulativeChart />
      </div>

      <p className="rounded-b-2xl border-t border-line bg-mist/60 px-5 py-3 text-xs leading-relaxed text-ink-muted sm:px-6">
        Courbe calculée à partir des moyennes de l'étude de cas&nbsp;: panier moyen de{' '}
        {formatEuro(inputs.averageBasket)} et coût d'acquisition de {formatEuro(metrics.cac)} par client.
      </p>
    </div>
  );
}
