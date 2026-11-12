/**
 * Étude de cas — Google Ads Search, installation de climatisation, Lyon.
 *
 * SOURCE UNIQUE DES CHIFFRES DU SITE.
 * Seules les valeurs de `inputs` sont saisies. Tous les autres indicateurs
 * (CPC, CPL, taux, CAC, chiffre d'affaires, ROAS) sont calculés à partir
 * d'elles, afin qu'aucun chiffre affiché ne puisse contredire un autre.
 * Les calculs sont vérifiés par `caseStudy.test.ts` à chaque build.
 */

import { formatEuro, formatMultiple, formatNumber, formatPercent } from '../lib/format';

export const inputs = {
  budget: 1000,
  clicks: 1500,
  forms: 100,
  qualifiedLeads: 35,
  quotes: 20,
  customers: 10,
  averageBasket: 1500,
} as const;

const { budget, clicks, forms, qualifiedLeads, quotes, customers, averageBasket } = inputs;

export const metrics = {
  /** Coût par clic moyen = budget ÷ clics */
  cpc: budget / clicks,
  /** Taux de conversion = formulaires ÷ clics */
  conversionRate: forms / clicks,
  /** Coût par lead = budget ÷ formulaires */
  cpl: budget / forms,
  /** Taux de qualification = leads qualifiés ÷ formulaires */
  qualificationRate: qualifiedLeads / forms,
  /** Taux de devis = devis ÷ leads qualifiés */
  quoteRate: quotes / qualifiedLeads,
  /** Taux de signature = clients ÷ devis */
  closeRate: customers / quotes,
  /** Clients ÷ leads qualifiés */
  qualifiedToCustomerRate: customers / qualifiedLeads,
  /** Coût d'acquisition client = budget ÷ clients */
  cac: budget / customers,
  /** Chiffre d'affaires = clients × panier moyen */
  revenue: customers * averageBasket,
  /** ROAS = chiffre d'affaires ÷ budget */
  roas: (customers * averageBasket) / budget,
} as const;

export const caseStudyMeta = {
  tags: ['Étude de cas', 'Génération de leads', 'Installation de climatisation', 'Lyon, France'],
  campaign: 'Google Ads Search',
  sector: 'Installation de climatisation',
  location: 'Lyon, France',
  confidentiality:
    'Nom du client et compte publicitaire anonymisés pour préserver la confidentialité commerciale.',
} as const;

export type Kpi = {
  id: string;
  label: string;
  value: number;
  format: (value: number) => string;
  /** Calcul qui produit la valeur, affiché sous l'indicateur quand il est dérivé. */
  formula?: string;
};

export const acquisitionKpis: Kpi[] = [
  { id: 'budget', label: 'Budget publicitaire', value: budget, format: (v) => formatEuro(v) },
  { id: 'clicks', label: 'Clics', value: clicks, format: (v) => formatNumber(v) },
  {
    id: 'cpc',
    label: 'CPC moyen',
    value: metrics.cpc,
    format: (v) => formatEuro(v, 2),
    formula: `${formatEuro(budget)} ÷ ${formatNumber(clicks)} clics`,
  },
  { id: 'forms', label: 'Formulaires reçus', value: forms, format: (v) => formatNumber(v) },
  {
    id: 'conversionRate',
    label: 'Taux de conversion',
    value: metrics.conversionRate,
    format: (v) => formatPercent(v, 1),
    formula: `${formatNumber(forms)} formulaires ÷ ${formatNumber(clicks)} clics`,
  },
  {
    id: 'cpl',
    label: 'Coût par lead',
    value: metrics.cpl,
    format: (v) => formatEuro(v),
    formula: `${formatEuro(budget)} ÷ ${formatNumber(forms)} formulaires`,
  },
];

export const salesKpis: Kpi[] = [
  {
    id: 'qualifiedLeads',
    label: 'Leads qualifiés',
    value: qualifiedLeads,
    format: (v) => formatNumber(v),
  },
  { id: 'quotes', label: 'Devis envoyés', value: quotes, format: (v) => formatNumber(v) },
  { id: 'customers', label: 'Clients signés', value: customers, format: (v) => formatNumber(v) },
  {
    id: 'cac',
    label: "Coût d'acquisition client",
    value: metrics.cac,
    format: (v) => formatEuro(v),
    formula: `${formatEuro(budget)} ÷ ${formatNumber(customers)} clients`,
  },
  {
    id: 'averageBasket',
    label: 'Panier moyen',
    value: averageBasket,
    format: (v) => formatEuro(v),
  },
  {
    id: 'revenue',
    label: "Chiffre d'affaires",
    value: metrics.revenue,
    format: (v) => formatEuro(v),
    formula: `${formatNumber(customers)} clients × ${formatEuro(averageBasket)}`,
  },
];

export const roas = {
  value: metrics.roas,
  display: formatMultiple(metrics.roas),
  percent: formatPercent(metrics.roas),
  formula: `${formatEuro(metrics.revenue)} ÷ ${formatEuro(budget)}`,
  sentence: `1 € investi en publicité génère ${formatNumber(metrics.roas)} € de chiffre d'affaires.`,
} as const;

export type FunnelStage = {
  id: string;
  label: string;
  value: number;
  /** Ce que représente l'étape. */
  description: string;
  /** Taux de passage depuis l'étape précédente (absent pour la première). */
  rate?: { label: string; value: number };
  /** Coût unitaire à cette étape = budget ÷ volume. */
  unitCost: { label: string; value: number; decimals: number };
};

export const funnelStages: FunnelStage[] = [
  {
    id: 'clicks',
    label: 'Clics',
    value: clicks,
    description:
      "Des internautes qui recherchent une installation de climatisation à Lyon et cliquent sur l'annonce.",
    unitCost: { label: 'Coût par clic', value: metrics.cpc, decimals: 2 },
  },
  {
    id: 'forms',
    label: 'Formulaires',
    value: forms,
    description: 'Les visiteurs qui envoient une demande depuis la landing page.',
    rate: { label: 'Taux clic → formulaire', value: metrics.conversionRate },
    unitCost: { label: 'Coût par lead', value: metrics.cpl, decimals: 0 },
  },
  {
    id: 'qualified',
    label: 'Leads qualifiés',
    value: qualifiedLeads,
    description:
      'Les demandes qui correspondent à un vrai projet, retenues après qualification commerciale.',
    rate: { label: 'Taux de qualification', value: metrics.qualificationRate },
    unitCost: { label: 'Coût par lead qualifié', value: budget / qualifiedLeads, decimals: 2 },
  },
  {
    id: 'quotes',
    label: 'Devis envoyés',
    value: quotes,
    description: 'Les prospects qualifiés qui reçoivent une proposition chiffrée.',
    rate: { label: 'Taux devis / leads qualifiés', value: metrics.quoteRate },
    unitCost: { label: 'Coût par devis', value: budget / quotes, decimals: 0 },
  },
  {
    id: 'customers',
    label: 'Clients signés',
    value: customers,
    description: "Les devis acceptés\u00a0: le seul résultat qui compte pour le chiffre d'affaires.",
    rate: { label: 'Taux clients / devis', value: metrics.closeRate },
    unitCost: { label: "Coût d'acquisition client", value: metrics.cac, decimals: 0 },
  },
];

/**
 * Courbe du tableau de bord : chiffre d'affaires et dépense publicitaire
 * cumulés, client signé après client signé. Construite uniquement à partir
 * des moyennes de l'étude de cas (panier moyen et coût d'acquisition) — aucune
 * répartition dans le temps n'est supposée.
 */
export const cumulativeSeries = Array.from({ length: customers + 1 }, (_, signed) => ({
  customers: signed,
  revenue: signed * averageBasket,
  spend: signed * metrics.cac,
}));
