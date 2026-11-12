import { describe, expect, it } from 'vitest';
import {
  acquisitionKpis,
  cumulativeSeries,
  funnelStages,
  inputs,
  metrics,
  roas,
  salesKpis,
} from './caseStudy';
import { formatEuro, formatNumber, formatPercent, formatRate } from '../lib/format';

/** Retire les espaces insécables pour comparer à des chaînes lisibles. */
const plain = (text: string) => text.replace(/[  ]/g, ' ');

describe("étude de cas — données d'entrée", () => {
  it('reprend exactement les chiffres fournis', () => {
    expect(inputs).toEqual({
      budget: 1000,
      clicks: 1500,
      forms: 100,
      qualifiedLeads: 35,
      quotes: 20,
      customers: 10,
      averageBasket: 1500,
    });
  });
});

describe('étude de cas — calculs financiers', () => {
  it('CPC moyen : 0,67 €', () => {
    expect(plain(formatEuro(metrics.cpc, 2))).toBe('0,67 €');
  });

  it('taux de conversion : 6,7 % (6,67 % au centième)', () => {
    expect(plain(formatPercent(metrics.conversionRate, 1))).toBe('6,7 %');
    expect(plain(formatPercent(metrics.conversionRate, 2))).toBe('6,67 %');
  });

  it('coût par lead : 10 €', () => {
    expect(metrics.cpl).toBe(10);
  });

  it('taux de qualification : 35 %', () => {
    expect(plain(formatPercent(metrics.qualificationRate, 0))).toBe('35 %');
  });

  it('taux devis / leads qualifiés : 57,14 %', () => {
    expect(plain(formatPercent(metrics.quoteRate, 2))).toBe('57,14 %');
  });

  it('taux clients / devis : 50 %', () => {
    expect(metrics.closeRate).toBe(0.5);
  });

  it('taux clients / leads qualifiés : 28,57 %', () => {
    expect(plain(formatPercent(metrics.qualifiedToCustomerRate, 2))).toBe('28,57 %');
  });

  it("coût d'acquisition client : 100 €", () => {
    expect(metrics.cac).toBe(100);
  });

  it("chiffre d'affaires : 15 000 €", () => {
    expect(metrics.revenue).toBe(15000);
    expect(plain(formatEuro(metrics.revenue))).toBe('15 000 €');
  });

  it('ROAS : 15x, soit 1 500 %', () => {
    expect(metrics.roas).toBe(15);
    expect(roas.display).toBe('15x');
    expect(plain(roas.percent)).toBe('1 500 %');
  });
});

describe('étude de cas — cohérence des éléments affichés', () => {
  it('les cartes KPI affichent les valeurs attendues', () => {
    const shown = Object.fromEntries(
      [...acquisitionKpis, ...salesKpis].map((kpi) => [kpi.id, plain(kpi.format(kpi.value))]),
    );
    expect(shown).toEqual({
      budget: '1 000 €',
      clicks: '1 500',
      cpc: '0,67 €',
      forms: '100',
      conversionRate: '6,7 %',
      cpl: '10 €',
      qualifiedLeads: '35',
      quotes: '20',
      customers: '10',
      cac: '100 €',
      averageBasket: '1 500 €',
      revenue: '15 000 €',
    });
  });

  it("le funnel suit l'ordre et les volumes du parcours commercial", () => {
    expect(funnelStages.map((stage) => stage.value)).toEqual([1500, 100, 35, 20, 10]);
    expect(funnelStages.map((stage) => stage.label)).toEqual([
      'Clics',
      'Formulaires',
      'Leads qualifiés',
      'Devis envoyés',
      'Clients signés',
    ]);
  });

  it('chaque taux de passage vaut volume ÷ volume précédent', () => {
    funnelStages.slice(1).forEach((stage, index) => {
      expect(stage.rate?.value).toBeCloseTo(stage.value / funnelStages[index].value, 10);
    });
    const rates = funnelStages.slice(1).map((stage) => plain(formatPercent(stage.rate!.value, 2)));
    expect(rates).toEqual(['6,67 %', '35,00 %', '57,14 %', '50,00 %']);
  });

  it('chaque coût unitaire vaut budget ÷ volume', () => {
    funnelStages.forEach((stage) => {
      expect(stage.unitCost.value).toBeCloseTo(inputs.budget / stage.value, 10);
    });
  });

  it('la courbe cumulée aboutit au budget et au chiffre d\'affaires de la campagne', () => {
    const last = cumulativeSeries.at(-1)!;
    expect(cumulativeSeries).toHaveLength(inputs.customers + 1);
    expect(cumulativeSeries[0]).toEqual({ customers: 0, revenue: 0, spend: 0 });
    expect(last.revenue).toBe(metrics.revenue);
    expect(last.spend).toBe(inputs.budget);
  });
});

describe('formatage', () => {
  it('affiche les taux de passage comme attendu', () => {
    const rates = funnelStages.slice(1).map((stage) => plain(formatRate(stage.rate!.value)));
    expect(rates).toEqual(['6,67 %', '35 %', '57,14 %', '50 %']);
    expect(plain(formatRate(metrics.qualifiedToCustomerRate))).toBe('28,57 %');
    expect(plain(formatRate(1))).toBe('100 %');
    expect(plain(formatRate(0.1))).toBe('10 %');
  });

  it('sépare les milliers et utilise la virgule décimale', () => {
    expect(plain(formatNumber(1500))).toBe('1 500');
    expect(plain(formatNumber(100000))).toBe('100 000');
    expect(formatNumber(0.6667, 2)).toBe('0,67');
  });
});
