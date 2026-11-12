import { useState, type PointerEvent } from 'react';
import { cumulativeSeries, inputs, metrics } from '../../data/caseStudy';
import { formatEuro, formatNumber } from '../../lib/format';

/**
 * Courbe du tableau de bord : chiffre d'affaires cumulé (en escalier, un palier
 * par client signé) face à la dépense publicitaire cumulée.
 *
 * Graphique dessiné en SVG natif plutôt qu'avec Recharts : il est visible dès
 * l'ouverture de la page, il doit donc s'afficher sans attendre de bibliothèque.
 * Les tracés sont en pourcentage de la zone, les textes en HTML : tout reste
 * lisible quelle que soit la largeur de l'écran.
 */

const COLOR_REVENUE = '#16a34a';
const COLOR_SPEND = '#2563eb';

const lastIndex = cumulativeSeries.length - 1;
const maxY = metrics.revenue;
const yTicks = [0, maxY / 3, (2 * maxY) / 3, maxY];
const xTicks = cumulativeSeries.map((point) => point.customers).filter((n) => n % 2 === 0);

const xPct = (index: number) => (index / lastIndex) * 100;
const yPct = (value: number) => 100 - (value / maxY) * 100;

const revenueLine =
  'M0,100' +
  cumulativeSeries
    .slice(1)
    .map((point, index) => ` H${xPct(index + 1)} V${yPct(point.revenue)}`)
    .join('');
const revenueArea = `${revenueLine} V100 H0 Z`;
const spendLine = `M0,100 L100,${yPct(inputs.budget)}`;

export function CumulativeChart() {
  const [active, setActive] = useState<number | null>(null);

  const handlePointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    setActive(Math.min(lastIndex, Math.max(0, Math.round(ratio * lastIndex))));
  };

  const point = active === null ? null : cumulativeSeries[active];

  return (
    <figure className="m-0">
      <figcaption className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <span className="text-sm font-medium text-ink">
          Chiffre d'affaires et dépense cumulés
          <span className="block text-xs font-normal text-ink-muted">Client signé après client signé</span>
        </span>
        <span className="flex flex-wrap gap-x-4 gap-y-1 whitespace-nowrap text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ background: COLOR_REVENUE }} aria-hidden="true" />
            Chiffre d'affaires
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ background: COLOR_SPEND }} aria-hidden="true" />
            Dépense publicitaire
          </span>
        </span>
      </figcaption>

      <div className="relative mt-4 h-44 pb-6 pl-12 pr-16 pt-2 sm:h-52" aria-hidden="true">
        {/* Graduations verticales */}
        <div className="pointer-events-none absolute bottom-6 left-0 top-2 w-10">
          {yTicks.map((tick) => (
            <span
              key={tick}
              className="nums absolute right-0 -translate-y-1/2 text-[0.6875rem] text-ink-muted"
              style={{ top: `${yPct(tick)}%` }}
            >
              {tick === 0 ? '0' : formatNumber(tick)}
            </span>
          ))}
        </div>

        {/* Zone de tracé */}
        <div
          className="relative h-full w-full touch-pan-y"
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
          onPointerLeave={() => setActive(null)}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            {yTicks.map((tick) => (
              <line
                key={tick}
                x1="0"
                x2="100"
                y1={yPct(tick)}
                y2={yPct(tick)}
                stroke="#e5e7eb"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="chart-wipe absolute inset-0 h-full w-full overflow-visible"
          >
            <path d={revenueArea} fill={COLOR_REVENUE} fillOpacity="0.1" />
            <path
              d={spendLine}
              fill="none"
              stroke={COLOR_SPEND}
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={revenueLine}
              fill="none"
              stroke={COLOR_REVENUE}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Points et valeurs de fin de série */}
          <EndLabel top={yPct(metrics.revenue)} color={COLOR_REVENUE} label={formatEuro(metrics.revenue)} />
          <EndLabel top={yPct(inputs.budget)} color={COLOR_SPEND} label={formatEuro(inputs.budget)} />

          {/* Lecture au survol */}
          {point ? (
            <>
              <span
                className="pointer-events-none absolute bottom-0 top-0 w-px bg-ink-muted/50"
                style={{ left: `${xPct(point.customers)}%` }}
              />
              <HoverDot left={xPct(point.customers)} top={yPct(point.revenue)} color={COLOR_REVENUE} />
              <HoverDot left={xPct(point.customers)} top={yPct(point.spend)} color={COLOR_SPEND} />
              <div
                className="pointer-events-none absolute top-0 z-10 w-max rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-panel"
                style={
                  point.customers > lastIndex / 2
                    ? { right: `calc(${100 - xPct(point.customers)}% + 10px)` }
                    : { left: `calc(${xPct(point.customers)}% + 10px)` }
                }
              >
                <p className="font-medium text-ink">
                  {point.customers} {point.customers > 1 ? 'clients signés' : 'client signé'}
                </p>
                <p className="mt-1.5 flex items-center gap-2 text-ink-soft">
                  <span className="h-0.5 w-3 rounded-full" style={{ background: COLOR_REVENUE }} />
                  <span className="nums font-semibold text-ink">{formatEuro(point.revenue)}</span>
                  chiffre d'affaires
                </p>
                <p className="mt-1 flex items-center gap-2 text-ink-soft">
                  <span className="h-0.5 w-3 rounded-full" style={{ background: COLOR_SPEND }} />
                  <span className="nums font-semibold text-ink">{formatEuro(point.spend)}</span>
                  dépense
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Graduations horizontales */}
        <div className="pointer-events-none absolute bottom-0 left-12 right-16 h-5">
          {xTicks.map((tick) => (
            <span
              key={tick}
              className="nums absolute top-1 -translate-x-1/2 text-[0.6875rem] text-ink-muted"
              style={{ left: `${xPct(tick)}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
      </div>

      <p className="text-right text-[0.6875rem] text-ink-muted" aria-hidden="true">
        Nombre de clients signés
      </p>

      {/* Équivalent accessible du graphique */}
      <div className="sr-only">
        <table>
          <caption>
            Chiffre d'affaires cumulé et dépense publicitaire cumulée selon le nombre de clients signés
          </caption>
          <thead>
            <tr>
              <th scope="col">Clients signés</th>
              <th scope="col">Chiffre d'affaires cumulé</th>
              <th scope="col">Dépense publicitaire cumulée</th>
            </tr>
          </thead>
          <tbody>
            {cumulativeSeries.map((row) => (
              <tr key={row.customers}>
                <th scope="row">{row.customers}</th>
                <td>{formatEuro(row.revenue)}</td>
                <td>{formatEuro(row.spend)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

function EndLabel({ top, color, label }: { top: number; color: string; label: string }) {
  return (
    <span
      className="chart-end pointer-events-none absolute left-full flex -translate-y-1/2 items-center"
      style={{ top: `${top}%` }}
    >
      <span
        className="size-2.5 -translate-x-1/2 rounded-full ring-2 ring-white"
        style={{ background: color }}
      />
      <span className="nums ml-0.5 whitespace-nowrap text-xs font-semibold text-ink">{label}</span>
    </span>
  );
}

function HoverDot({ left, top, color }: { left: number; top: number; color: string }) {
  return (
    <span
      className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
      style={{ left: `${left}%`, top: `${top}%`, background: color }}
    />
  );
}
