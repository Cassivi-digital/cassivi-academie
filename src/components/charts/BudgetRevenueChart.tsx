import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { inputs, metrics } from '../../data/caseStudy';
import { formatEuro, formatNumber } from '../../lib/format';

/**
 * Budget investi face au chiffre d'affaires généré (Recharts).
 * Chargé à la demande, quand la section approche de l'écran.
 */

const data = [
  { name: 'Budget publicitaire investi', value: inputs.budget, color: '#2563eb' },
  { name: "Chiffre d'affaires généré", value: metrics.revenue, color: '#16a34a' },
];

const ticks = [0, metrics.revenue / 3, (2 * metrics.revenue) / 3, metrics.revenue];

type LabelProps = {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: unknown;
};

function NameLabel({ x = 0, y = 0, value }: LabelProps) {
  return (
    <text x={Number(x)} y={Number(y) - 10} fill="#4b5563" fontSize={13}>
      {String(value)}
    </text>
  );
}

function ValueLabel({ x = 0, y = 0, width = 0, height = 0, value }: LabelProps) {
  return (
    <text
      x={Number(x) + Number(width) + 10}
      y={Number(y) + Number(height) / 2}
      dominantBaseline="central"
      fill="#111827"
      fontSize={15}
      fontWeight={600}
    >
      {formatEuro(Number(value))}
    </text>
  );
}

type TooltipContentProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: { name: string; value: number; color: string } }>;
};

function ChartTooltip({ active, payload }: TooltipContentProps) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-panel">
      <p className="nums text-sm font-semibold text-ink">{formatEuro(item.value)}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-ink-soft">
        <span className="size-2 rounded-sm" style={{ background: item.color }} />
        {item.name}
      </p>
    </div>
  );
}

export default function BudgetRevenueChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 26, right: 84, bottom: 0, left: 10 }}
        barCategoryGap={0}
        accessibilityLayer={false}
      >
        <CartesianGrid horizontal={false} stroke="#e5e7eb" strokeDasharray="0" />
        <XAxis
          type="number"
          domain={[0, metrics.revenue]}
          ticks={ticks}
          tickFormatter={(value: number) => (value === 0 ? '0' : `${formatNumber(value)} €`)}
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#d1d5db' }}
          tickMargin={8}
          interval={0}
        />
        <YAxis type="category" dataKey="name" hide />
        <Tooltip
          cursor={{ fill: '#f3f4f6' }}
          content={<ChartTooltip />}
          isAnimationActive={false}
        />
        <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]} animationDuration={900}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
          <LabelList dataKey="name" content={<NameLabel />} />
          <LabelList dataKey="value" content={<ValueLabel />} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
